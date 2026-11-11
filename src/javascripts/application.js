import { Application } from "@hotwired/stimulus";
import HelpUiController from "./controllers/help_ui_controller.js";
import TocController from "./controllers/toc_controller.js";
import ImagesViewerController from "./controllers/images_viewer_controller.js";
import LinkTargetController from "./controllers/link_target_controller.js";
import AiSearchController from "./controllers/ai_search_controller.js";

const application = window.Stimulus || Application.start();
window.Stimulus = application;
application.register("help-ui", HelpUiController);
application.register("toc", TocController);
application.register("images-viewer", ImagesViewerController);
application.register("link-target", LinkTargetController);
application.register("ai-search", AiSearchController);
