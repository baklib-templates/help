import { test } from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { Application } from "@hotwired/stimulus";
import { renderMarkdown } from "../safe_markdown.js";
import TocController, { buildToc } from "../controllers/toc_controller.js";
import AiSearchController from "../controllers/ai_search_controller.js";
import HelpUiController from "../controllers/help_ui_controller.js";
import ImagesViewerController from "../controllers/images_viewer_controller.js";

async function withControllers(html, controllers, run) {
  const dom = new JSDOM(html, { url: "https://help.example.test/", pretendToBeVisual: true });
  const names = ["window", "document", "MutationObserver", "Node", "Element", "HTMLElement", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent", "localStorage", "requestAnimationFrame", "cancelAnimationFrame"];
  const previous = new Map(names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));
  for (const name of names) Object.defineProperty(globalThis, name, { configurable: true, writable: true, value: name === "window" ? dom.window : dom.window[name] });
  const application = Application.start();
  for (const [name, controller] of Object.entries(controllers)) application.register(name, controller);
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  try {
    await tick();
    await run({ dom, document: dom.window.document, tick });
  } finally {
    dom.window.document.querySelectorAll("[data-controller]").forEach((element) => element.removeAttribute("data-controller"));
    await tick();
    application.stop();
    dom.window.close();
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
}

test("AI answers retain readable Markdown and safe references without executable HTML", () => {
  const { document } = new JSDOM("", { url: "https://help.example.test/" }).window;
  const output = document.createElement("div");
  output.append(renderMarkdown("## Answer\n\n- **Useful** guidance\n\n[Source](https://docs.example.test/a)\n\n[Unsafe](javascript:alert(1))\n\n<script>alert(1)</script><img src=x onerror=alert(1)><svg onload=alert(1)></svg><a href='data:text/html,hello' onclick='alert(1)'>Bad</a>", document));
  assert.equal(output.querySelector("h2").textContent, "Answer");
  assert.equal(output.querySelector("li strong").textContent, "Useful");
  const source = output.querySelector('a[href="https://docs.example.test/a"]');
  assert.equal(source.rel, "noopener noreferrer");
  assert.equal(source.target, "_blank");
  assert.equal(output.querySelectorAll("script,img,svg,[onclick],[onerror],[onload]").length, 0);
  assert.equal(output.querySelectorAll("a[href]").length, 1);
  assert.ok(output.textContent.includes("Unsafe"));
});

test("TOC supports non-Latin and repeated headings while preserving existing anchors", () => {
  const { document } = new JSDOM('<div id="入门"></div><article><h2>入门</h2><h3>入门</h3><h2 id="existing">Existing section</h2><h3 id="existing">Repeated source anchor</h3><h2></h2></article><ol></ol>').window;
  const content = document.querySelector("article");
  const list = document.querySelector("ol");
  const headings = buildToc(content, list);
  assert.deepEqual(headings.map((heading) => heading.id), ["入门-2", "入门-3", "existing", "existing-2"]);
  assert.equal(list.children.length, 4);
  assert.equal(list.querySelectorAll('[data-level="3"]').length, 2);
  const anchors = [...list.querySelectorAll("a")].map((link) => link.getAttribute("href"));
  buildToc(content, list);
  assert.deepEqual([...list.querySelectorAll("a")].map((link) => link.getAttribute("href")), anchors);
});

test("desktop and mobile TOCs both render and follow the same article position", async () => {
  await withControllers('<section data-controller="toc"><article data-toc-target="content"><h2>First section</h2><h3>Next section</h3></article><details data-toc-target="panel" hidden><summary>On this page</summary><ol data-toc-target="list"></ol></details><aside data-toc-target="panel" hidden><ol data-toc-target="list"></ol></aside></section>', { toc: TocController }, async ({ dom, document }) => {
    const lists = [...document.querySelectorAll('[data-toc-target="list"]')];
    const panels = [...document.querySelectorAll('[data-toc-target="panel"]')];
    const headings = [...document.querySelectorAll("h2,h3")];
    assert.deepEqual(lists.map((list) => list.children.length), [2, 2]);
    assert.deepEqual(panels.map((panel) => panel.hidden), [false, false]);
    assert.deepEqual([...lists[0].querySelectorAll("a")].map((link) => link.hash), [...lists[1].querySelectorAll("a")].map((link) => link.hash));
    let secondTop = 700;
    headings[0].getBoundingClientRect = () => ({ top: -100 });
    headings[1].getBoundingClientRect = () => ({ top: secondTop });
    const scroll = async () => {
      dom.window.dispatchEvent(new dom.window.Event("scroll"));
      await new Promise((resolve) => dom.window.requestAnimationFrame(resolve));
    };
    await scroll();
    assert.deepEqual(lists.map((list) => list.querySelector('[aria-current="location"]').textContent), ["First section", "First section"]);
    secondTop = 100;
    await scroll();
    assert.deepEqual(lists.map((list) => list.querySelector('[aria-current="location"]').textContent), ["Next section", "Next section"]);
    assert.deepEqual(lists.map((list) => list.querySelectorAll('[aria-current="location"]').length), [1, 1]);
  });
});

test("AI retries replace the active stream, ignore stale messages, and close on navigation", async () => {
  const dom = new JSDOM('<section data-controller="ai-search" data-ai-search-url-value="/workspace/-/ai-search-completion" data-ai-search-thinking-value="Thinking" data-ai-search-error-value="Try again" data-ai-search-completed-value="Done"><form data-action="submit->ai-search#submit"><input data-ai-search-target="input" value="How do I start?"><button data-ai-search-target="submit">Ask</button></form><div data-ai-search-target="status"></div><div data-ai-search-target="output"></div></section>', { url: "https://help.example.test/workspace/", pretendToBeVisual: true });
  const names = ["window", "document", "MutationObserver", "Node", "Element", "HTMLElement", "Event", "CustomEvent", "KeyboardEvent", "MouseEvent"];
  const previous = new Map(names.map((name) => [name, globalThis[name]]));
  for (const name of names) globalThis[name] = name === "window" ? dom.window : dom.window[name];
  const streams = [];
  const originalSource = globalThis.EventSource;
  globalThis.EventSource = class {
    constructor(url) { this.url = url; streams.push(this); }
    close() { this.closed = true; }
    receive(data) { this.onmessage?.({ data: JSON.stringify(data) }); }
  };
  const application = Application.start();
  application.register("ai-search", AiSearchController);
  const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
  try {
    await tick();
    const form = document.querySelector("form");
    const output = document.querySelector('[data-ai-search-target="output"]');
    const status = document.querySelector('[data-ai-search-target="status"]');
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    assert.equal(new URL(streams[0].url).pathname, "/workspace/-/ai-search-completion");
    assert.equal(new URL(streams[0].url).searchParams.get("message"), "How do I start?");
    streams[0].receive({ status: "streaming", message: "First response" });
    assert.match(output.textContent, /First response/);
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    assert.equal(streams[0].closed, true);
    streams[0].receive({ status: "completed", message: "Stale response" });
    assert.doesNotMatch(output.textContent, /Stale/);
    streams[1].receive({ status: "streaming", message: "Second " });
    streams[1].receive({ status: "completed", message: "response" });
    assert.equal(streams[1].closed, true);
    assert.equal(output.textContent.trim(), "Second response");
    assert.equal(status.textContent, "Done");
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    streams[2].receive({ status: "streaming", message: "Partial answer" });
    streams[2].onerror();
    assert.equal(status.textContent, "Try again");
    assert.equal(output.textContent.trim(), "Partial answer");
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    streams[3].receive(null);
    assert.equal(streams[3].closed, true);
    assert.equal(status.textContent, "Try again");
    assert.equal(output.getAttribute("aria-busy"), "false");
    form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
    document.dispatchEvent(new dom.window.Event("turbo:before-cache"));
    assert.equal(streams[4].closed, true);
    assert.equal(status.textContent, "");
    document.querySelector("section").remove();
    await tick();
  } finally {
    application.stop();
    for (const [name, value] of previous) {
      if (value === undefined) delete globalThis[name];
      else globalThis[name] = value;
    }
    if (originalSource === undefined) delete globalThis.EventSource;
    else globalThis.EventSource = originalSource;
    dom.window.close();
  }
});

test("shell persists theme choice and dismisses menus accessibly", async () => {
  await withControllers('<body data-controller="help-ui"><button id="theme" data-action="help-ui#toggleTheme" data-help-ui-target="themeToggle">Theme</button><details data-help-menu open><summary>Menu</summary><a href="/article">Article</a></details><button id="outside">Outside</button></body>', { "help-ui": HelpUiController }, async ({ dom, document }) => {
    document.documentElement.dataset.theme = "light";
    document.querySelector("#theme").click();
    assert.equal(document.documentElement.dataset.theme, "dark");
    assert.equal(localStorage.getItem("help-theme"), "dark");
    assert.equal(document.querySelector("#theme").getAttribute("aria-pressed"), "true");
    const menu = document.querySelector("details");
    menu.open = true;
    document.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    assert.equal(menu.open, false);
    assert.equal(document.activeElement, menu.querySelector("summary"));
    menu.open = true;
    document.querySelector("#outside").click();
    assert.equal(menu.open, false);
    menu.open = true;
    document.dispatchEvent(new dom.window.Event("turbo:before-cache"));
    assert.equal(menu.open, false);
  });
});

test("article images open with the keyboard and restore focus when the dialog closes", async () => {
  await withControllers('<body data-help-ui-image-open-value="View image" data-help-ui-image-close-value="Close"><article data-controller="images-viewer"><img id="preview" src="/image.png" alt="Settings screen"><a href="/original.png"><img id="linked" src="/linked.png" alt="Linked image"></a></article></body>', { "images-viewer": ImagesViewerController }, async ({ dom, document }) => {
    dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; this.querySelector("button").focus(); };
    dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; this.dispatchEvent(new dom.window.Event("close")); };
    const image = document.querySelector("#preview");
    assert.equal(image.getAttribute("role"), "button");
    assert.equal(image.tabIndex, 0);
    assert.equal(image.getAttribute("aria-label"), "View image: Settings screen");
    assert.equal(document.querySelector("#linked").hasAttribute("tabindex"), false);
    image.focus();
    image.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
    const dialog = document.querySelector("dialog");
    assert.equal(dialog.open, true);
    assert.equal(dialog.querySelector("img").alt, "Settings screen");
    dialog.querySelector("button").click();
    assert.equal(document.querySelector("dialog"), null);
    assert.equal(document.activeElement, image);
    image.dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }));
    document.dispatchEvent(new dom.window.Event("turbo:before-cache"));
    assert.equal(document.querySelector("dialog"), null);
  });
});
