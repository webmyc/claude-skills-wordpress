---
name: wordpress-mcp-dev
description: Best practices for modern WordPress plugin development and MCP (Model Context Protocol) server development. Use when building WordPress plugins (PHP, REST API, Gutenberg blocks, admin interfaces, page builder integrations), MCP servers (TypeScript/Python), or hybrid products that bridge AI assistants with WordPress via MCP. Covers plugin architecture, security, licensing, monetization, WordPress coding standards, MCP tool design, transport selection, and the full development lifecycle from scaffolding to distribution.
---

# Modern WordPress Plugin & MCP Server Development

A comprehensive guide for building production-grade WordPress plugins and MCP servers with Claude Code, Cursor, or any AI-assisted development workflow. This skill encodes hard-won patterns from real-world plugin development, including the specific challenges of bridging AI tools with WordPress through MCP.

---

## When to Use This Skill

- Building a new WordPress plugin from scratch
- Adding REST API endpoints to a WordPress plugin
- Creating an MCP server that connects AI tools to WordPress or other services
- Building hybrid products (WordPress plugin + MCP server working together)
- Implementing licensing, monetization, or update systems for commercial plugins
- Integrating with page builders (Gutenberg, Divi, Elementor, Bricks, Oxygen)
- Setting up authentication between MCP clients and WordPress
- Preparing a plugin for WordPress.org submission or commercial distribution

---

## Part 1: Modern WordPress Plugin Development

### 1.1 Plugin Architecture & File Structure

Always use namespaced, class-based architecture. WordPress's global namespace is crowded — collisions break sites.

```
plugin-name/
├── plugin-name.php                    # Main plugin file (bootstrap only)
├── uninstall.php                      # Clean uninstall handler
├── readme.txt                         # WordPress.org format
├── composer.json                      # Autoloading + dependencies
├── package.json                       # JS build tools (if needed)
├── includes/
│   ├── class-plugin-core.php          # Main orchestrator
│   ├── class-admin.php                # Admin interface
│   ├── class-rest-api.php             # REST API endpoints
│   ├── class-activator.php            # Activation logic
│   ├── class-deactivator.php          # Deactivation logic
│   └── traits/                        # Shared behaviors
│       └── trait-singleton.php
├── admin/
│   ├── views/                         # Admin page templates
│   ├── css/
│   └── js/
├── public/
│   ├── css/
│   └── js/
├── languages/                         # i18n .pot/.po/.mo files
├── templates/                         # Frontend templates
└── tests/
    ├── phpunit/
    └── integration/
```

**Main plugin file** should be minimal — only bootstrap logic:

```php
<?php
/**
 * Plugin Name: Your Plugin Name
 * Plugin URI:  https://yoursite.com/plugin
 * Description: One-line description.
 * Version:     1.0.0
 * Author:      Your Name
 * Author URI:  https://yoursite.com
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: plugin-name
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants
define( 'PLUGIN_NAME_VERSION', '1.0.0' );
define( 'PLUGIN_NAME_DIR', plugin_dir_path( __FILE__ ) );
define( 'PLUGIN_NAME_URL', plugin_dir_url( __FILE__ ) );
define( 'PLUGIN_NAME_FILE', __FILE__ );
define( 'PLUGIN_NAME_BASENAME', plugin_basename( __FILE__ ) );

// Autoloader (Composer or manual)
if ( file_exists( PLUGIN_NAME_DIR . 'vendor/autoload.php' ) ) {
    require_once PLUGIN_NAME_DIR . 'vendor/autoload.php';
}

// Boot the plugin
add_action( 'plugins_loaded', function() {
    \\YourNamespace\\Plugin_Core::instance();
});

// Activation/deactivation hooks (must be in main file)
register_activation_hook( __FILE__, [ \\YourNamespace\\Activator::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ \\YourNamespace\\Deactivator::class, 'deactivate' ] );
```

### 1.2 Naming & Namespace Conventions

**Critical rules to prevent conflicts:**

- **Prefix everything** with a unique 4-5+ character prefix: functions, classes, options, custom post types, taxonomies, meta keys, REST routes, cron hooks, transients, database tables, script/style handles, shortcodes, AJAX actions, nonces
- **Use PHP namespaces** (PSR-4 style): `namespace YourVendor\\PluginName;`
- **Never use** `wp_`, `WordPress`, `__` (double underscore), or `_` (single underscore) as prefixes
- **PascalCase** for class names: `class Site_Context {}` or `class SiteContext {}`
- **snake_case** for function names, hooks, and option names
- **Text domain** must match plugin directory name, use hyphens not underscores: `plugin-name`
- **REST API namespace**: `plugin-name/v1`
- **Database table prefix**: use `$wpdb->prefix . 'yourprefix_'`

### 1.3 Security — Non-Negotiable Checklist

Every WordPress plugin is an attack surface. Follow these without exception:

**Input Validation & Sanitization:**
```php
// ALWAYS sanitize input
$title = sanitize_text_field( $_POST['title'] );
$email = sanitize_email( $_POST['email'] );
$url   = esc_url_raw( $_POST['url'] );
$html  = wp_kses_post( $_POST['content'] );
$int   = absint( $_POST['count'] );

// For arrays
$ids = array_map( 'absint', (array) $_POST['ids'] );
```

**Output Escaping:**
```php
// ALWAYS escape output — the last thing before rendering
echo esc_html( $title );
echo esc_attr( $attribute );
echo esc_url( $link );
echo wp_kses_post( $rich_content );
// In JavaScript contexts
echo esc_js( $js_value );
```

**Nonce Verification (CSRF Protection):**
```php
// Creating nonces
wp_nonce_field( 'plugin_action_name', 'plugin_nonce' );
$nonce_url = wp_nonce_url( $url, 'plugin_action_name' );

// Verifying nonces
if ( ! wp_verify_nonce( $_POST['plugin_nonce'], 'plugin_action_name' ) ) {
    wp_die( 'Security check failed.' );
}
// In REST API — use permission_callback instead
```

**Capability Checks:**
```php
// Always verify user capabilities
if ( ! current_user_can( 'manage_options' ) ) {
    wp_die( 'Unauthorized access.' );
}
```

**SQL Safety:**
```php
// ALWAYS use $wpdb->prepare() for custom queries
global $wpdb;
$results = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT * FROM {$wpdb->prefix}custom_table WHERE user_id = %d AND status = %s",
        $user_id,
        $status
    )
);
// NEVER concatenate user input into SQL strings
```

**Direct Access Prevention:**
```php
// First line after <?php in every PHP file
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}
```

**File Upload Security:**
```php
// Validate file types, use WordPress upload functions
$allowed = array( 'jpg', 'jpeg', 'png', 'gif', 'pdf' );
$filetype = wp_check_filetype( $filename, null );
if ( ! in_array( $filetype['ext'], $allowed, true ) ) {
    wp_die( 'File type not allowed.' );
}
```

### 1.4 REST API Development

Modern WordPress plugins expose functionality via the REST API. This is especially critical for MCP integration.

```php
<?php
namespace YourVendor\\PluginName;

class REST_API {

    const NAMESPACE = 'plugin-name/v1';

    public function register_routes() {
        // GET endpoint with authentication
        register_rest_route( self::NAMESPACE, '/items', [
            'methods'             => \\WP_REST_Server::READABLE,
            'callback'            => [ $this, 'get_items' ],
            'permission_callback' => [ $this, 'check_api_permission' ],
            'args'                => $this->get_collection_params(),
        ] );

        // POST endpoint
        register_rest_route( self::NAMESPACE, '/items', [
            'methods'             => \\WP_REST_Server::CREATABLE,
            'callback'            => [ $this, 'create_item' ],
            'permission_callback' => [ $this, 'check_api_permission' ],
            'args'                => $this->get_create_params(),
        ] );
    }

    /**
     * Permission callback — NEVER return true blindly.
     */
    public function check_api_permission( $request ) {
        // Option 1: Custom API key
        $api_key = $request->get_header( 'X-Plugin-API-Key' );
        if ( $api_key ) {
            return $this->validate_api_key( $api_key );
        }

        // Option 2: WordPress Application Passwords (built-in since WP 5.6)
        // Automatically handled by WP when using Basic Auth header

        // Option 3: Logged-in user capability
        return current_user_can( 'edit_posts' );
    }

    /**
     * Always define args with sanitize and validate callbacks.
     */
    private function get_collection_params() {
        return [
            'page' => [
                'type'              => 'integer',
                'default'           => 1,
                'minimum'           => 1,
                'sanitize_callback' => 'absint',
            ],
            'per_page' => [
                'type'              => 'integer',
                'default'           => 20,
                'minimum'           => 1,
                'maximum'           => 100,
                'sanitize_callback' => 'absint',
            ],
            'status' => [
                'type'              => 'string',
                'default'           => 'publish',
                'enum'              => [ 'publish', 'draft', 'pending' ],
                'sanitize_callback' => 'sanitize_text_field',
            ],
        ];
    }

    /**
     * Response format — use WP_REST_Response for proper status codes and headers.
     */
    public function get_items( $request ) {
        $page     = $request->get_param( 'page' );
        $per_page = $request->get_param( 'per_page' );

        // ... fetch data ...

        $response = new \\WP_REST_Response( $data, 200 );
        $response->header( 'X-WP-Total', $total );
        $response->header( 'X-WP-TotalPages', $total_pages );

        return $response;
    }
}
```

**REST API Authentication Patterns for MCP:**

1. **WordPress Application Passwords** (simplest, built-in since WP 5.6): User generates a password in WP admin → used as Basic Auth
2. **Custom API Keys**: Plugin generates UUID-based keys, stored encrypted in `wp_options` or a custom table, validated via middleware
3. **OAuth 2.1 with PKCE**: For remote/public-facing APIs — use the `wp-oauth-server` plugin or implement per MCP spec
4. **Rate Limiting**: Implement per-key rate limits (e.g., 100 requests/hour) using transients or a custom table

### 1.5 Database Best Practices

```php
// Use WordPress functions whenever possible
get_option() / update_option() / delete_option()    // For settings
get_post_meta() / update_post_meta()                 // For post-specific data
get_transient() / set_transient()                    // For cached data
WP_Query / get_posts()                               // For content queries

// Custom tables — only when WordPress tables don't fit
// Create on activation, clean up on uninstall (not deactivation)
global $wpdb;
$table_name = $wpdb->prefix . 'yourprefix_data';
$charset_collate = $wpdb->get_charset_collate();

$sql = "CREATE TABLE $table_name (
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    user_id bigint(20) unsigned NOT NULL,
    data longtext NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY user_id (user_id)
) $charset_collate;";

require_once ABSPATH . 'wp-admin/includes/upgrade.php';
dbDelta( $sql );  // Safe create/update — handles upgrades
```

### 1.6 Hooks & Filters — The WordPress Way

```php
// DO: Use WordPress hooks for extensibility
do_action( 'plugin_name_before_process', $data );
$data = apply_filters( 'plugin_name_modify_data', $data, $context );
do_action( 'plugin_name_after_process', $data, $result );

// DO: Hook into the right lifecycle events
add_action( 'init', [ $this, 'register_post_types' ] );
add_action( 'rest_api_init', [ $this, 'register_routes' ] );
add_action( 'admin_menu', [ $this, 'add_admin_pages' ] );
add_action( 'admin_enqueue_scripts', [ $this, 'enqueue_admin_assets' ] );
add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_public_assets' ] );

// DON'T: Enqueue assets globally — only on pages where needed
public function enqueue_admin_assets( $hook ) {
    // Only load on YOUR admin pages
    if ( 'toplevel_page_plugin-name' !== $hook ) {
        return;
    }
    wp_enqueue_style( 'plugin-name-admin', PLUGIN_NAME_URL . 'admin/css/admin.css', [], PLUGIN_NAME_VERSION );
    wp_enqueue_script( 'plugin-name-admin', PLUGIN_NAME_URL . 'admin/js/admin.js', [ 'jquery' ], PLUGIN_NAME_VERSION, true );

    // Pass data to JS safely
    wp_localize_script( 'plugin-name-admin', 'pluginNameData', [
        'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
        'restUrl'  => rest_url( 'plugin-name/v1/' ),
        'nonce'    => wp_create_nonce( 'wp_rest' ),
        'version'  => PLUGIN_NAME_VERSION,
    ] );
}
```

### 1.7 Admin Interface

```php
// Settings page using the Settings API
public function register_settings() {
    register_setting(
        'plugin_name_settings',    // Option group
        'plugin_name_options',     // Option name
        [
            'type'              => 'array',
            'sanitize_callback' => [ $this, 'sanitize_options' ],
            'default'           => $this->get_defaults(),
        ]
    );

    add_settings_section(
        'plugin_name_general',
        __( 'General Settings', 'plugin-name' ),
        null,
        'plugin-name-settings'
    );

    add_settings_field(
        'api_key',
        __( 'API Key', 'plugin-name' ),
        [ $this, 'render_api_key_field' ],
        'plugin-name-settings',
        'plugin_name_general'
    );
}

// Admin notices the right way
public function admin_notices() {
    if ( ! get_option( 'plugin_name_configured' ) ) {
        printf(
            '<div class="notice notice-warning is-dismissible"><p>%s <a href="%s">%s</a></p></div>',
            esc_html__( 'Plugin Name needs configuration.', 'plugin-name' ),
            esc_url( admin_url( 'admin.php?page=plugin-name-settings' ) ),
            esc_html__( 'Configure now', 'plugin-name' )
        );
    }
}
```

### 1.8 Internationalization (i18n)

```php
// ALWAYS wrap user-facing strings
__( 'Translatable string', 'plugin-name' )        // Returns string
_e( 'Echoed string', 'plugin-name' )               // Echoes string
_n( '%d item', '%d items', $count, 'plugin-name' ) // Pluralization

// With placeholders — use sprintf, NEVER concatenate
sprintf(
    /* translators: %s: user name */
    __( 'Hello, %s!', 'plugin-name' ),
    esc_html( $user_name )
)

// Load textdomain (usually in init or plugins_loaded)
load_plugin_textdomain( 'plugin-name', false, dirname( PLUGIN_NAME_BASENAME ) . '/languages' );
```

### 1.9 Performance

- **Cache aggressively**: Use `set_transient()` for expensive operations, object cache for repeated queries
- **Lazy load**: Don't instantiate classes or run queries until actually needed
- **Minimize HTTP requests**: Combine/minify CSS and JS for production
- **Avoid `SELECT *`**: Query only the columns you need
- **Use `wp_cache_*` functions**: WordPress object cache is your friend
- **Register, then enqueue**: `wp_register_script()` first, `wp_enqueue_script()` only where needed
- **Set script strategy**: Use `strategy => 'defer'` or `'async'` as the last argument array: `wp_register_script( 'handle', $url, $deps, $ver, [ 'strategy' => 'defer' ] )`

### 1.10 Commercial Plugin Patterns

**Licensing System:**
```php
// Phone-home license validation (respect user privacy)
class License_Manager {
    private $api_url = 'https://yoursite.com/wp-json/licensing/v1/';

    public function validate( $license_key, $site_url ) {
        $response = wp_remote_post( $this->api_url . 'validate', [
            'body' => [
                'license_key' => sanitize_text_field( $license_key ),
                'site_url'    => esc_url_raw( $site_url ),
                'plugin_version' => PLUGIN_NAME_VERSION,
            ],
            'timeout' => 15,
        ] );

        if ( is_wp_error( $response ) ) {
            // Fail open — don't break the site if your server is down
            return $this->get_cached_status();
        }

        $body = json_decode( wp_remote_retrieve_body( $response ), true );
        // Cache result for 24 hours
        set_transient( 'plugin_name_license_status', $body, DAY_IN_SECONDS );
        return $body;
    }
}
```

**Auto-Updates for Commercial Plugins (not on WordPress.org):**
```php
// Hook into WordPress update system
add_filter( 'pre_set_site_transient_update_plugins', [ $this, 'check_for_updates' ] );
add_filter( 'plugins_api', [ $this, 'plugin_info' ], 10, 3 );

// Or use a library like YahnisElsts/plugin-update-checker
```

**Graceful Degradation on License Expiry:**
- Never break existing functionality — reduce to "read-only" or "basic" mode
- Show admin notice with renewal link
- Allow a grace period (7-14 days)
- Never delete user data

---

## Part 2: MCP Server Development

### 2.1 When to Build an MCP Server

Build an MCP server when you need AI assistants (Claude, Cursor, VS Code Copilot, etc.) to interact with an external system in a standardized way. The MCP server acts as a bridge — the AI calls tools, the server translates those calls into API requests.

**Architecture Pattern for WordPress + MCP:**
```
┌─────────────────┐    stdio/HTTP    ┌──────────────────┐    REST API    ┌───────────────────┐
│  AI Assistant    │ ◄──────────────► │   MCP Server     │ ◄────────────► │   WordPress Site  │
│  (Claude Code,  │    MCP Protocol  │   (TypeScript)   │    HTTPS       │   (Plugin active) │
│   Cursor, etc)  │                  │                  │                │                   │
└─────────────────┘                  └──────────────────┘                └───────────────────┘
```

### 2.2 MCP Server Setup (TypeScript — Recommended)

**Project Structure:**
```
plugin-name-mcp-server/
├── src/
│   ├── index.ts                    # Entry point, server bootstrap
│   ├── server.ts                   # MCP server configuration
│   ├── wordpress-client.ts         # WordPress REST API wrapper
│   ├── config.ts                   # Configuration loader
│   ├── types.ts                    # TypeScript interfaces
│   └── tools/
│       ├── site-context.ts         # Site info tools
│       ├── content-operations.ts   # CRUD for posts/pages
│       ├── media-operations.ts     # Media library tools
│       └── builder-operations.ts   # Page builder specific tools
├── build/                          # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

**package.json essentials:**
```json
{
  "name": "plugin-name-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "plugin-name-mcp": "./build/index.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "start": "node build/index.js",
    "inspect": "npx @modelcontextprotocol/inspector"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "axios": "^1.7.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

### 2.3 MCP Server Implementation

```typescript
// src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerTools } from './tools/index.js';
import { loadConfig } from './config.js';

const config = loadConfig();

const server = new Server(
  {
    name: 'plugin-name-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      // resources: {},  // Add if serving resources
      // prompts: {},    // Add if serving prompt templates
    },
  }
);

// Register all tools
registerTools(server, config);

// Start with stdio transport (for local AI clients like Cursor, Claude Code)
const transport = new StdioServerTransport();
await server.connect(transport);

// IMPORTANT: Never log to stdout with stdio transport — use stderr
console.error('MCP server started successfully');
```

### 2.4 Tool Design Principles

**Naming Convention:**
```
{service}_{action}_{resource}
```
Examples: `wordpress_get_pages`, `wordpress_update_post`, `wordpress_list_plugins`

**Tool Registration Pattern:**
```typescript
import { z } from 'zod';

// Define input schema with Zod
const GetPagesSchema = z.object({
  status: z.enum(['publish', 'draft', 'pending', 'any']).default('publish')
    .describe('Filter pages by publication status'),
  per_page: z.number().min(1).max(100).default(20)
    .describe('Number of pages to return (1-100)'),
  search: z.string().optional()
    .describe('Search pages by title or content'),
  page_builder: z.enum(['gutenberg', 'divi', 'elementor', 'any']).optional()
    .describe('Filter by detected page builder'),
});

server.registerTool(
  'wordpress_get_pages',
  {
    description: 'List pages from the connected WordPress site. Returns page ID, title, status, URL, detected page builder, and last modified date. Use this to discover available pages before reading or editing them.',
    inputSchema: zodToJsonSchema(GetPagesSchema),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (params) => {
    const validated = GetPagesSchema.parse(params);
    try {
      const pages = await wordpressClient.getPages(validated);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify(pages, null, 2),
        }],
      };
    } catch (error) {
      return {
        isError: true,
        content: [{
          type: 'text',
          text: `Failed to fetch pages: ${error.message}. Check that the WordPress site is accessible and the API key is valid.`,
        }],
      };
    }
  }
);
```

**Tool Design Rules:**

1. **Descriptions must be precise** — The AI reads descriptions to decide which tool to use. Vague descriptions cause wrong tool selection.
2. **Include examples in parameter descriptions** — "Filter by status (e.g., 'publish', 'draft')"
3. **Return actionable errors** — Don't just say "Error". Say "Authentication failed. Check your API key in ~/.config/plugin-name/config.json"
4. **Annotate correctly** — `readOnlyHint: true` for GET operations, `destructiveHint: true` for DELETE operations
5. **Support pagination** — Return `has_more`, `total`, `next_offset` for list operations
6. **Keep tools atomic** — One tool does one thing. Don't combine "get and update" in a single tool.
7. **Prefix with service name** — Your tools coexist with tools from other MCP servers

### 2.5 WordPress API Client for MCP

```typescript
// src/wordpress-client.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

export class WordPressClient {
  private client: AxiosInstance;

  constructor(siteUrl: string, apiKey: string) {
    this.client = axios.create({
      baseURL: `${siteUrl.replace(/\/$/, '')}/wp-json`,
      headers: {
        'X-Plugin-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async getSiteContext() {
    const response = await this.client.get('/plugin-name/v1/context/site-info');
    return response.data;
  }

  async getPages(params: { status?: string; per_page?: number; search?: string }) {
    const response = await this.client.get('/wp/v2/pages', { params });
    return {
      pages: response.data,
      total: parseInt(response.headers['x-wp-total'] || '0'),
      total_pages: parseInt(response.headers['x-wp-totalpages'] || '0'),
    };
  }

  async duplicatePage(pageId: number): Promise<{ id: number; edit_url: string }> {
    const response = await this.client.post(`/plugin-name/v1/pages/${pageId}/duplicate`);
    return response.data;
  }

  // Centralized error handling
  private handleError(error: AxiosError): never {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      const message = data?.message || error.message;

      // NEVER expose full error details — sanitize for security
      switch (status) {
        case 401:
          throw new Error('Authentication failed. Verify your API key.');
        case 403:
          throw new Error('Permission denied. Your API key may lack required capabilities.');
        case 404:
          throw new Error(`Resource not found. ${message}`);
        case 429:
          throw new Error('Rate limit exceeded. Wait before retrying.');
        default:
          throw new Error(`WordPress API error (${status}): ${message}`);
      }
    }
    throw new Error(`Network error: ${error.message}`);
  }
}
```

### 2.6 Configuration Management

```typescript
// src/config.ts
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface SiteConfig {
  name: string;
  url: string;
  api_key: string;
}

export interface Config {
  sites: SiteConfig[];
  active_site: string;
  log_level: 'debug' | 'info' | 'warn' | 'error';
}

export function loadConfig(): Config {
  // Check standard config locations
  const configPaths = [
    join(process.cwd(), 'plugin-name-config.json'),
    join(homedir(), '.config', 'plugin-name', 'config.json'),
    join(homedir(), '.plugin-name', 'config.json'),
  ];

  for (const configPath of configPaths) {
    if (existsSync(configPath)) {
      const raw = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(raw) as Config;
      // CRITICAL: Validate required fields
      if (!config.sites || config.sites.length === 0) {
        throw new Error(`No sites configured in ${configPath}`);
      }
      return config;
    }
  }

  throw new Error(
    `No config found. Create one at ${configPaths[2]} with your WordPress site details.\
` +
    `Example:\
${JSON.stringify({
      sites: [{ name: 'My Site', url: 'https://example.com', api_key: 'your-key-here' }],
      active_site: 'My Site',
      log_level: 'info'
    }, null, 2)}`
  );
}
```

### 2.7 Transport Selection

| Use Case | Transport | Notes |
|----------|-----------|-------|
| Claude Code, Cursor, local IDEs | **stdio** | Simplest. Server runs as subprocess. Never log to stdout. |
| Web apps, multi-client | **Streamable HTTP** | Scalable. Supports multiple connections. Replaces SSE. |
| WordPress.com native | **WP-CLI + stdio** | For Automattic ecosystem integration |
| Cloud deployment (Lambda, etc.) | **Streamable HTTP stateless** | Use `stateless_http=True`, `json_response=True` |

**stdio setup in Claude Code / Cursor `mcp.json`:**
```json
{
  "mcpServers": {
    "plugin-name": {
      "command": "node",
      "args": ["/path/to/plugin-name-mcp-server/build/index.js"],
      "env": {
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**Streamable HTTP setup:**
```typescript
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined, // Stateless mode
});
```

### 2.8 Safety Patterns for WordPress MCP

When AI tools can write to WordPress, safety is paramount:

1. **Duplicate-First Workflow**: Never edit live pages directly. Create a duplicate, let AI edit the duplicate, human reviews and approves.
2. **Content Validation**: Validate all AI-generated content against WordPress standards before saving. Check for XSS, SQL injection patterns, malformed HTML.
3. **Audit Logging**: Log every action the MCP server takes — who, what, when, which site.
4. **Rollback Capability**: Store the original state before any modification. Allow one-click rollback.
5. **Scope Limiting**: API keys should have minimum required permissions. A "content editor" key shouldn't be able to install plugins.
6. **Telemetry Privacy**: If using error tracking (Sentry, etc.), sanitize all data before sending. Strip API keys, site URLs, user paths, content.

---

## Part 3: Development Lifecycle

### 3.1 Scaffolding a New Project

```bash
# WordPress Plugin
wp scaffold plugin plugin-name --plugin_name="Plugin Name" --plugin_author="Your Name"
# Or use WP-CLI scaffold, or copy from a boilerplate

# MCP Server
mkdir plugin-name-mcp-server && cd plugin-name-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk axios zod
npm install -D typescript @types/node
npx tsc --init
```

### 3.2 Testing

**WordPress Plugin Testing:**
```bash
# PHPUnit for WordPress
wp scaffold plugin-tests plugin-name
cd wp-content/plugins/plugin-name
composer require --dev phpunit/phpunit
bash bin/install-wp-tests.sh test_db root '' localhost latest
./vendor/bin/phpunit

# Code standards
composer require --dev wp-coding-standards/wpcs
./vendor/bin/phpcs --standard=WordPress plugin-name.php includes/
```

**MCP Server Testing:**
```bash
# Build and verify
npm run build

# Test with MCP Inspector
npx @modelcontextprotocol/inspector

# Run against a test WordPress site
node build/index.js  # In one terminal
# Use the inspector UI to call tools manually
```

### 3.3 Distribution Checklist

**For WordPress.org:**
- [ ] `readme.txt` follows WordPress format (use readme validator)
- [ ] No external service calls without disclosure and user consent
- [ ] All code is GPL-2.0-or-later compatible
- [ ] No obfuscated code
- [ ] Sanitize all input, escape all output
- [ ] Use WordPress functions instead of raw PHP where possible
- [ ] Text domain matches slug
- [ ] Works with latest WordPress and PHP versions
- [ ] Uninstall handler cleans up all data

**For Commercial Distribution:**
- [ ] License validation system that fails open (don't break sites)
- [ ] Auto-update mechanism
- [ ] Deactivation feedback survey
- [ ] Documentation website
- [ ] Support channel

**For MCP Server (npm):**
- [ ] `bin` field in `package.json` points to compiled entry
- [ ] `#!/usr/bin/env node` shebang in entry file
- [ ] Works with `npx` out of the box
- [ ] Config file example in README
- [ ] Tool descriptions are clear enough for AI to use correctly

### 3.4 Version Management

```
WordPress Plugin: Follow semver (1.0.0)
  - readme.txt "Stable tag" matches plugin header "Version"
  - Update "Tested up to" with each WP release

MCP Server: Follow semver independently
  - MCP protocol version in server info (e.g., "2025-11-25")
  - Keep SDK dependency updated

Both: Use CHANGELOG.md
  - ## [1.2.0] - 2026-02-11
  - ### Added / Changed / Fixed / Security
```

---

## Part 4: Common Patterns & Anti-Patterns

### DO ✓

- Use WordPress APIs and functions — they handle edge cases you'll miss
- Build REST endpoints for anything an MCP server might need
- Make MCP tool descriptions specific enough that the AI picks the right tool on the first try
- Cache API responses (transients for WP, in-memory for MCP)
- Provide a "site context" endpoint/tool that gives AI everything it needs about the WordPress installation (WP version, PHP version, active theme, active plugins, page builders detected, custom post types)
- Handle errors gracefully with actionable messages
- Support both authenticated and capability-checked access patterns
- Use WordPress hooks to make your plugin extensible by others
- Test with real AI assistants, not just unit tests — AI usage patterns are different

### DON'T ✗

- Don't use `extract()` on user input
- Don't store sensitive data (API keys, tokens) in plain text `wp_options` — encrypt them
- Don't `require` or `include` files from user-controllable paths
- Don't assume `$_GET`, `$_POST`, `$_REQUEST` are safe — they never are
- Don't modify WordPress core files
- Don't use `eval()`, `exec()`, or `system()` with user input
- Don't log sensitive data to stdout in MCP servers (use stderr)
- Don't let your MCP server modify live WordPress content without a safety layer
- Don't bundle entire frameworks (React, Vue) when WordPress already ships them
- Don't ignore the WordPress plugin review team's feedback — learn from rejections
- Don't make your license validation break the user's site when your server is down

---

## Quick Reference: WordPress Functions Cheat Sheet

| Need | Function |
|------|----------|
| Sanitize text | `sanitize_text_field()` |
| Sanitize HTML | `wp_kses_post()` |
| Sanitize email | `sanitize_email()` |
| Sanitize file name | `sanitize_file_name()` |
| Escape for HTML | `esc_html()` |
| Escape for attributes | `esc_attr()` |
| Escape for URLs | `esc_url()` |
| Escape for JS | `esc_js()` |
| Create nonce | `wp_create_nonce()` |
| Verify nonce | `wp_verify_nonce()` |
| Check capability | `current_user_can()` |
| Safe SQL | `$wpdb->prepare()` |
| REST response | `new WP_REST_Response()` |
| Transient cache | `set_transient()` / `get_transient()` |
| HTTP request | `wp_remote_get()` / `wp_remote_post()` |
| File operations | `WP_Filesystem` API |
| Cron | `wp_schedule_event()` |
| Translation | `__()` / `_e()` / `_n()` |

## Quick Reference: MCP Protocol Versions

| Version | Key Features |
|---------|-------------|
| 2024-11-05 | Initial spec, stdio transport, basic tools/resources/prompts |
| 2025-03-26 | Streamable HTTP (replaces SSE), OAuth 2.1, tool annotations |
| 2025-06-18 | Structured tool outputs, elicitation, enhanced OAuth security |
| 2025-11-25 | Current stable. Registry, .well-known discovery, SDK tiering |

---

## Resources

- [WordPress Plugin Handbook](https://developer.wordpress.org/plugins/)
- [WordPress Coding Standards](https://developer.wordpress.org/coding-standards/)
- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Registry](https://registry.modelcontextprotocol.io/)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)
