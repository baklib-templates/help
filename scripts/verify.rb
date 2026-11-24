# Run without Rails boot or a database: bundle exec ruby themes/wiki/help/scripts/verify.rb
# Optional full DynamicForm validation: bundle exec rails runner themes/wiki/help/scripts/verify.rb
# Uses real Liquid and locale files; Rails runner also validates DynamicForm schemas.
# Platform I/O is replaced with
# in-memory fixtures; this deliberately does not claim browser or backend acceptance.
require 'json'
require 'yaml'
require 'nokogiri'

unless defined?(ThemeEngine::Liquid::TemplateRenderer)
  require 'rails'
  require 'active_record'
  require 'active_support/all'
  require 'action_view'
  require 'colorize'
  require 'theme_engine'
  require 'i18n/backend/key_value'
  require 'pagy/extras/standalone'
  require 'pagy/extras/overflow'
  Rails.logger = Logger.new(File::NULL)
  I18n.available_locales = [:en, :'zh-CN']
end

module HelpVerification
  ROOT = Pathname.new(ENV.fetch('HELP_THEME_ROOT', File.expand_path('..', __dir__)))

  # Homepage variants, their fixed snippet mode, and the article/category layout
  # each one selects when the global settings stay on auto.
  HOME_STYLES = %w[help_center faqs support].freeze
  HOME_MODES = {'help_center' => 'collections', 'faqs' => 'faqs', 'support' => 'support'}.freeze
  AUTOMATIC_READING = {'help_center' => 'reader', 'faqs' => 'reader', 'support' => 'support'}.freeze
  CATEGORY_MODES = {'help_center' => %w[cards cards], 'faqs' => %w[faq faq], 'support' => %w[list list]}.freeze

  # Only the platform form endpoint and access decision are fixtures. The templates,
  # snippets, pagination, filters, schema validation and translations remain real.
  class FormFixture < Liquid::Block
    def render(context)
      context.stack do
        context['form'] = {'keywords_field_name' => 'q', 'feedback_emoji_field_name' => 'feedback[useful_type]', 'feedback_message_field_name' => 'feedback[message]'}
        "<form>#{@body.render(context)}</form>"
      end
    end
  end

  module AccessFixture
    def can_access?(page) = page && page['accessible'] == true
  end

  class PrivateSettings < Liquid::Drop
    def content = raise('Restricted or category content was read')
    def description = raise('Restricted or category description was read')
  end

  class FileSystem < ThemeEngine::Liquid::FileSystems::LocalFileSystem
    def shared? = false
  end

  RequestFixture = Struct.new(:path, :query) do
    def GET = query
  end
  ViewFixture = Struct.new(:params, :request)

  class Runner
    def initialize
      @checks = 0
      @schemas = {}
      @file_system = FileSystem.new(ROOT, fallback: false)
      @filters = ThemeEngine::Liquid::TemplateRenderer.allocate.send(:default_filters) + [AccessFixture]
    end

    def check(message)
      raise message unless yield
      @checks += 1
    end

    def valid!(validator, label)
      valid = validator.valid?
      check("#{label}: #{validator.errors.full_messages.join(', ')}") { valid }
    end

    def render(path, variables = {}, site: fixture_site, params: {})
      parser = ThemeEngine::Liquid::Parsers::TemplateParser.new.parse(ROOT.join(path).read, error_mode: :strict)
      context = Liquid::Context.build(environments: [variables], static_environments: {'site' => site, 'params' => params, 'script_name' => ''}, rethrow_errors: true)
      request = RequestFixture.new(variables.dig('page', 'path') || '/', params)
      html = parser.render(context, filters: @filters, strict_filters: true, registers: {file_system: @file_system, locale: 'en', view_context: ViewFixture.new(params, request)})
      check("#{path}: #{parser.liquid_template.errors.map(&:message).join(', ')}") { parser.liquid_template.errors.empty? }
      html
    end

    def fixture_page(overrides = {})
      {'id' => 2, 'path' => '/guide', 'link_text' => 'Guide', 'accessible' => true, 'settings' => {'title' => 'Guide', 'content' => '<h2>Real article body</h2><p>ARTICLE_BODY</p>'}, 'children_in_list' => [], 'breadcrumb' => [], 'author' => {'name' => 'AUTHOR_SENTINEL'}, 'published_at' => '2026-01-02', 'parent' => {'path' => '/'}}.merge(overrides)
    end

    def fixture_site(settings = {}, pages = {}, home_style: 'help_center')
      home = fixture_page('id' => 1, 'path' => '/', 'link_text' => 'Help', 'settings' => {}, 'template_name' => 'index', 'template_style' => home_style)
      {'index_path' => '/', 'index_page' => home, 'search_path' => '/-/search', 'name' => 'Help', 'settings' => settings, 'pages' => {'/' => home}.merge(pages), 'plugins' => {'feedback' => {'useful_types' => []}}}
    end

    def home_template(style) = "templates/index.#{style}.liquid"

    def schemas_and_translations
      settings_body = ROOT.join('config/settings_schema.json').read
      platform_validation = Rails.application.present?
      valid!(ThemeEngine::Validators::SettingsSchema.new(settings_body), 'settings_schema') if platform_validation
      @site_fields = JSON.parse(settings_body).flat_map { |group| group.fetch('settings', []) }.to_h { |field| [field['id'], field] }
      files = Dir[ROOT.join('{layout,templates,snippets,statics}/**/*.liquid')]
      runtime_keys = []
      schema_keys = settings_body.scan(/["']t:([a-zA-Z0-9_.]+)["']/).flatten
      files.each do |file|
        source = File.read(file)
        parser = ThemeEngine::Liquid::Parsers::TemplateParser.new.parse(source, error_mode: :strict)
        schema = parser.schema
        if schema
          if platform_validation
            valid!(ThemeEngine::Validators::TemplateSchema.new(schema), file)
            schema.fetch('settings', []).each { |field| valid!(ThemeEngine::Validators::SettingSchema.new(field), "#{file}:#{field['id']}") }
          end
          @schemas[File.basename(file, '.liquid')] = schema
        end
        source.scan(/{%\s*render\s+['"]([^'"]+)['"]/).flatten.each do |snippet|
          check("Missing snippet #{snippet} from #{file}") { @file_system.exist?("snippets/_#{snippet}.liquid") }
        end
        runtime_keys.concat(source.scan(/['"]([a-zA-Z0-9_.]+)['"]\s*\|\s*t\b/).flatten)
        schema_keys.concat(source.scan(/["']t:([a-zA-Z0-9_.]+)["']/).flatten)
      end
      %w[en zh-CN].each do |locale|
        runtime = JSON.parse(ROOT.join("locales/#{locale}.json").read)
        schema = JSON.parse(ROOT.join("locales/#{locale}.schema.json").read)
        (runtime_keys.uniq + schema_keys.uniq).each do |key|
          tree = key.start_with?('schema.') ? schema : runtime
          parts = key.delete_prefix('schema.').split('.')
          value = parts.reduce(tree) { |memo, part| memo.is_a?(Hash) ? memo[part] : nil }
          check("Missing #{locale} translation: #{key}") { value.is_a?(String) && !value.empty? }
        end
      end
      (HOME_STYLES.map { |style| "index.#{style}" } + %w[page]).each do |name|
        %w[title content].each { |id| check("#{name}.#{id} must be readonly") { @schemas.fetch(name).fetch('settings').any? { |f| f['id'] == id && f['readonly'] == true } } }
      end
      puts "PASS #{files.size} Liquid files, snippet references and both locales#{' with platform schema validation' if platform_validation}"
    end

    def manifest
      data = YAML.safe_load_file(ROOT.join('docs/skill/manifest.yml')).fetch('skill')
      data.fetch('site_fields').each { |id| check("Manifest site field #{id} is not real") { @site_fields.key?(id) } }
      data.fetch('page_types').each do |type|
        name = type.fetch('template')
        check("Manifest template #{name} missing") { ROOT.join("templates/#{name}.liquid").file? }
        fields = @schemas.fetch(name, {}).fetch('settings', []).to_h { |field| [field['id'], field] }
        type.fetch('writable').each { |id| check("Manifest cannot write #{name}.#{id}") { fields.key?(id) && fields[id]['readonly'] != true } }
      end
      home = data.fetch('home')
      home_fields = @schemas.fetch(home.fetch('template')).fetch('settings').map { |field| field['id'] }
      home.fetch('hero_fields').each { |id| check("Manifest home field #{id} missing") { home_fields.include?(id) } }
      check('One source content model required') { data.dig('content_model', 'hierarchy') == ['page'] && data['writer'] == 'wiki_space' }
      puts 'PASS manifest references real settings and only writable presentation fields'
    end

    def layouts
      HOME_STYLES.each do |style|
        automatic = AUTOMATIC_READING.fetch(style)
        site = fixture_site({}, {}, home_style: style)
        home_html = render(home_template(style), {'page' => site['index_page']}, site: site)
        home_doc = Nokogiri::HTML.fragment(home_html)
        check("Homepage #{style} not rendered") { home_doc.at_css("[data-home-style='#{style}']") }
        check("#{style}: homepage uses its fixed mode") { home_doc.at_css("[data-home-layout='#{HOME_MODES.fetch(style)}']") }
        %w[auto tree reader support].each do |global|
          %w[inherit tree reader support].each do |override|
            site['settings']['article_layout'] = {'value' => global}
            page = fixture_page
            page['settings']['reading_layout'] = {'value' => override}
            html = render('templates/page.liquid', {'page' => page}, site: site)
            expected_layout = override == 'inherit' ? (global == 'auto' ? automatic : global) : override
            doc = Nokogiri::HTML.fragment(html)
            check("Article #{style}/#{global}/#{override} route") { doc.at_css("[data-reading-layout='#{expected_layout}']") }
            check('Article content must survive every layout') { doc.at_css('#article-content')&.text&.include?('ARTICLE_BODY') }
            check('Every layout needs an inline TOC for smaller screens') { doc.css("article [data-toc-target='list']").length == 1 }
            if expected_layout == 'tree'
              check('Tree keeps its desktop TOC') { doc.css("aside [data-toc-target='list']").length == 1 }
              check('Tree inline TOC must disappear at xl') { doc.css('article > div').any? { |node| node['class'].to_s.split.include?('xl:hidden') && node.at_css("[data-toc-target='list']") } }
              check('Tree mobile topics must use a native disclosure') { doc.css('aside > details').any? { |node| node['class'].split.include?('lg:hidden') && node.at_css('summary') && node.at_css('nav') } }
            else
              check('Reader/support keep exactly one TOC') { doc.css("[data-toc-target='list']").length == 1 }
            end
          end
        end
      end
      html = render('templates/page.liquid', {'page' => fixture_page})
      check('Default must follow help_center/reader') { html.include?('data-reading-layout="reader"') }
      puts "PASS #{HOME_STYLES.size * 16} article combinations, page overrides and native mobile navigation/TOC structure"
    end

    def homepages
      leaf = fixture_page('id' => 4, 'path' => '/product/answer', 'link_text' => 'Answer destination', 'settings' => {'content' => '<p>FAQ_ANSWER</p>'})
      category = fixture_page('id' => 3, 'path' => '/product', 'link_text' => 'Product destination', 'children_in_list' => [leaf])
      inaccessible = fixture_page('id' => 5, 'path' => '/restricted', 'accessible' => false, 'settings' => PrivateSettings.new)
      HOME_STYLES.each do |style|
        mode = HOME_MODES.fetch(style)
        site = fixture_site({'support_email' => 'support@example.test'}, {'/product' => category, leaf['path'] => leaf, '/restricted' => inaccessible}, home_style: style)
        home = site['index_page']
        home['children_in_list'] = [category]
        home['settings'] = {'hero_title' => 'REAL_SITE_TITLE', 'content' => '<p>SOURCE_HOME_BODY</p>', 'hero_image' => {'url' => '/dam/hero.png'},
          'show_featured' => true, 'featured_pages' => "/missing\n/restricted\n/\n#{leaf['path']}", 'faq_source' => category['path'], 'show_faqs' => true}
        doc = Nokogiri::HTML.fragment(render(home_template(style), {'page' => home}, site: site))
        check("#{style}: one real homepage title") { doc.css('h1').length == 1 && doc.at_css('h1').text.strip == 'REAL_SITE_TITLE' }
        check("#{style}: source homepage body survives") { doc.text.include?('SOURCE_HOME_BODY') }
        check("#{style}: category is reachable") { doc.at_css("a[href='/product']") }
        check("#{style}: configured hero image survives") { doc.at_css("img[src='/dam/hero.png']") }
        search = doc.at_css("input[type='search'][name='q']")
        check("#{style}: usable search input and label") { search && doc.at_css("label[for='#{search['id']}']") }
        check("#{style}: invalid and restricted featured destinations are omitted") { doc.css("a[href='/missing'], a[href='/restricted'], a[href='/']").empty? }
        check("#{style}: explicit FAQ source exposes the permitted answer") { doc.at_css('details summary') && doc.text.include?('FAQ_ANSWER') && doc.at_css("a[href='#{leaf['path']}']") }
        check("#{style}: configured support action survives") { doc.at_css("a[href='mailto:support@example.test']") }
        check("#{style}: only the support homepage uses a contact sidebar") { doc.css('aside').length == (style == 'support' ? 1 : 0) }
        ids = doc.css('[id]').map { _1['id'] }
        check("#{style}: no duplicate IDs") { ids == ids.uniq }

        empty_site = fixture_site({}, {}, home_style: style)
        empty = Nokogiri::HTML.fragment(render(home_template(style), {'page' => empty_site['index_page']}, site: empty_site))
        check("#{style}: empty categories have an honest empty state") { empty.text.include?(translation('home.empty_title')) }
        check("#{style}: empty data creates no fake links or support sidebar") { empty.css('a, aside').empty? }
        check("#{style}: optional featured content is omitted") { empty.at_css('#home-featured-title').nil? }
        check("#{style}: FAQ homepage displays its empty state") { style != 'faqs' || empty.text.include?(translation('home.faq_empty_title')) }
      end
      card_site = fixture_site({}, {}, home_style: 'card')
      card_home = card_site['index_page']
      card_topic = fixture_page('id' => 6, 'path' => '/product', 'link_text' => 'Card topic', 'children_in_list' => [fixture_page('id' => 7, 'path' => '/product/answer', 'link_text' => 'Card answer')])
      card_home['children_in_nav_menu'] = [card_topic]
      card_home['settings'] = {'hero_title' => 'CARD_TITLE', 'content' => '<p>CARD_BODY</p>', 'show_channels_section' => true}
      card_doc = Nokogiri::HTML.fragment(render('templates/index.card.liquid', {'page' => card_home}, site: card_site))
      check('Card homepage keeps its title, source body and topic card') { card_doc.css('h1').length == 1 && card_doc.at_css('h1').text.strip == 'CARD_TITLE' && card_doc.text.include?('CARD_BODY') && card_doc.at_css("a[href='/product']") && card_doc.at_css("[data-home-style='card']") }
      puts "PASS #{HOME_STYLES.size * 2} populated/empty homepage cases, configured FAQ sources, support actions and the card homepage"
    end

    def categories
      cases = 0
      HOME_STYLES.each do |style|
        reading = AUTOMATIC_READING.fetch(style)
        root_mode, deeper_mode = CATEGORY_MODES.fetch(style)
        %w[auto cards list faq].product(['/', '/product', '/product/section'], ['', '<p>CATEGORY_SOURCE_BODY</p>']).each do |global, parent_path, content|
          child = fixture_page('id' => 3, 'path' => '/category/child', 'settings' => {'content' => '<p>CHILD_ANSWER</p>'})
          page = fixture_page('parent' => {'path' => parent_path}, 'children_in_list' => [child], 'settings' => {'content' => content})
          site = fixture_site({'category_layout' => {'value' => global}}, {}, home_style: style)
          doc = Nokogiri::HTML.fragment(render('templates/page.liquid', {'page' => page}, site: site))
          expected = global == 'auto' ? (parent_path == '/' ? root_mode : deeper_mode) : global
          section = doc.at_css('#category-content')
          check("#{style}/#{global}/#{parent_path}: category mode") { section && section['data-category-layout'] == expected }
          check("#{style}/#{global}/#{parent_path}: article auto is independent of category") { doc.at_css("[data-reading-layout='#{reading}']") }
          check('Category children must remain navigable') { section.at_css("a[href='/category/child']") }
          check('A category without its own body is not an empty article') { !doc.text.include?(translation('reading.empty_article')) }
          check('Category source content must survive every mode') { doc.at_css('#article-content').text.include?('CATEGORY_SOURCE_BODY') == content.present? }
          check('Only FAQ categories disclose the child answer') { !!section.at_css('details > summary') == (expected == 'faq') && section.text.include?('CHILD_ANSWER') == (expected == 'faq') }
          check('Product overview badge is gone with the retired products mode') { !doc.css('article > header').text.include?(translation('reading.product_overview')) }
          check('Multi-column category grids start above phone widths') { section.css('[class]').none? { _1['class'].split.any? { |token| token.match?(/\Agrid-cols-/) } } }
          cases += 1
        end
      end
      %w[tree reader support].each do |mode|
        page = fixture_page('settings' => {'reading_layout' => {'value' => mode}})
        doc = Nokogiri::HTML.fragment(render('templates/page.liquid', {'page' => page}))
        check("#{mode}: empty leaf has no category and shows its empty state") { doc.at_css('#category-content').nil? && doc.text.include?(translation('reading.empty_article')) }
      end
      puts "PASS #{cases} category combinations across #{HOME_STYLES.size} homepage styles, 3 depths, source body preservation and empty leaves"
    end

    def pagination
      children = (1..37).map { |id| fixture_page('id' => id + 10, 'path' => "/guide/item-#{id}") }
      %w[cards list faq].each do |mode|
        page = fixture_page('children_in_list' => children)
        rendered_paths = []
        (1..3).each do |number|
          html = render('templates/page.liquid', {'page' => page}, site: fixture_site({'category_layout' => {'value' => mode}}), params: {'_page' => number.to_s, 'source' => 'preview'})
          section = Nokogiri::HTML.fragment(html).at_css('#category-content')
          paths = section.css('a[href]').map { _1['href'] }.select { _1.start_with?('/guide/item-') }
          check("#{mode}: page #{number} has only its own records") { paths == children.slice((number - 1) * 18, 18).map { _1['path'] } }
          rendered_paths.concat(paths)
          links = section.css("nav a[href]").map { _1['href'] }
          check("#{mode}: pagination keeps the category path and query") { links.all? { _1.start_with?('/guide?') && _1.include?('source=preview') } }
          check("#{mode}: page #{number} has the next-page link when needed") { links.any? { _1.include?("_page=#{number + 1}") } == (number < 3) }
        end
        check("#{mode}: all 37 children remain reachable without duplication") { rendered_paths == children.map { _1['path'] } }
      end
      puts 'PASS cards/list/FAQ pagination reaches all 37 articles and preserves path/query'
    end

    def translation(key)
      @file_system.translator.translate(:en, key)
    end

    def permissions_and_settings
      [false, true].each do |allowed|
        [false, true].each do |has_children|
          settings = allowed && !has_children ? {'content' => '<p>PUBLIC_ANSWER</p>'} : PrivateSettings.new
          child = fixture_page('accessible' => allowed, 'settings' => settings, 'children_in_list' => has_children ? [{}] : [])
          html = render('snippets/_category_faq_item.liquid', {'child' => child})
          doc = Nokogiri::HTML.fragment(html)
          check('FAQ must always retain a real destination') { doc.at_css("a[href='/guide']") }
          check('Only permitted leaf may expose an FAQ answer') { html.include?('PUBLIC_ANSWER') == (allowed && !has_children) }
          html = render('snippets/_home_faqs.liquid', {'home' => {'settings' => {}}, 'root' => {'id' => 1, 'children_in_list' => [child]}})
          check('Homepage FAQ uses the same permission boundary') { html.include?('PUBLIC_ANSWER') == (allowed && !has_children) }
        end
      end
      page = fixture_page
      [false, true].product([false, true]).each do |show_author, show_date|
        site = fixture_site({'show_author' => show_author, 'show_published_at' => show_date})
        html = render('snippets/_article_header.liquid', {'page' => page}, site: site)
        check('Author checkbox must independently control author output') { html.include?('AUTHOR_SENTINEL') == show_author }
        check('Date checkbox must independently control publication output') { html.include?('2026-01-02') == show_date }
      end
      [false, true].each do |enabled|
        site = fixture_site({'show_related_articles' => enabled})
        site['pages']['/related'] = fixture_page('path' => '/related', 'link_text' => 'RELATED_SENTINEL')
        page['settings']['related_pages'] = '/related'
        html = render('snippets/_related_articles.liquid', {'page' => page}, site: site)
        check('Related checkbox must control related output') { html.include?('RELATED_SENTINEL') == enabled }
        site = fixture_site({'show_feedback_form' => enabled})
        html = render('snippets/_feedback_form.liquid', {'page' => page}, site: site)
        check('Feedback checkbox must control the feedback form') { html.include?('help-feedback-') == enabled }
        site = fixture_site({'show_primary_nav' => enabled})
        site['index_page']['children_in_nav_menu'] = [fixture_page('path' => '/product', 'link_text' => 'NAV_SENTINEL')]
        html = render('snippets/_header.liquid', {'page' => page}, site: site)
        check('Primary nav checkbox must control top-level links') { html.include?('NAV_SENTINEL') == enabled }
        site['settings']['article_layout'] = {'value' => 'support'}
        site['settings']['support_email'] = enabled ? 'support@example.test' : ''
        html = render('templates/page.liquid', {'page' => page}, site: site)
        check('Support aside exists only with a configured contact') { !!Nokogiri::HTML.fragment(html).at_css('aside') == enabled }
      end
      puts 'PASS FAQ protected-content read guards and author/date/related/contact settings'
    end

    def escaped_content
      escaped = 'R&amp;D &lt;Help&gt;'
      label = 'R&D <Help>'
      site = fixture_site({'support_email' => 'support@example.test', 'support_title' => escaped, 'support_description' => escaped,
        'support_url' => 'https://example.test/help?a=1&amp;b=2', 'header_link_url' => 'https://example.test/help?a=1&amp;b=2',
        'header_link_label' => escaped, 'footer_text' => escaped})
      child = fixture_page('link_text' => escaped, 'settings' => {'title' => escaped, 'description' => escaped, 'content' => '<p>Real answer</p>'})
      site['index_page']['children_in_list'] = [child]
      site['pages'][child['path']] = child
      site['index_page']['settings'] = {'hero_title' => escaped, 'hero_description' => escaped, 'show_featured' => true, 'featured_title' => escaped, 'featured_pages' => child['path'], 'show_faqs' => true}
      HOME_STYLES.each do |style|
        site['index_page']['template_style'] = style
        doc = Nokogiri::HTML.fragment(render(home_template(style), {'page' => site['index_page']}, site: site))
        check("#{style}: preescaped title must display once") { doc.at_css('h1').text.strip == label }
        check("#{style}: PageDrop/DynamicForm text must not show HTML entities") { !doc.text.include?('R&amp;D') && !doc.text.include?('&lt;Help&gt;') }
        check("#{style}: escaped text must not become HTML") { doc.css('help').empty? }
        check("#{style}: configured contact URL preserves its query") { doc.at_css("a[href='https://example.test/help?a=1&b=2']") }
      end
      %w[header footer].each do |snippet|
        doc = Nokogiri::HTML.fragment(render("snippets/_#{snippet}.liquid", {}, site:))
        check("#{snippet}: configured text displays once without creating HTML") { doc.text.include?(label) && !doc.text.include?('R&amp;D') && doc.css('help').empty? }
        check('Header URL preserves its query') { snippet != 'header' || doc.at_css("a[href='https://example.test/help?a=1&b=2']") }
      end
      puts "PASS PageDrop and DynamicForm escaped text across all #{HOME_STYLES.size} homepage variants"
    end

    def run
      Liquid::Template.with_thread_safe do
        Liquid::Template.register_tag('form_tag', FormFixture)
        schemas_and_translations
        manifest
        layouts
        homepages
        categories
        pagination
        permissions_and_settings
        escaped_content
      end
      puts "PASS #{@checks} checks. No application model queries or writes in this verifier. Browser/backend acceptance is separate."
    end
  end
end

ActiveSupport::Notifications.subscribed(->(*) { raise 'Verifier attempted a database query' }, 'sql.active_record') do
  HelpVerification::Runner.new.run
end
