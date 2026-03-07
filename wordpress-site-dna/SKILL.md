# WordPress Site DNA

**Version:** 1.0.0
**Category:** audit
**Status:** beta
**Requires:** Respira for WordPress plugin + MCP server
**Telemetry endpoint:** https://www.respira.press/api/skills/track-usage

---

## Description

Archaeological analysis of WordPress sites. Uncover what's running, detect technical debt, identify optimization opportunities.

WordPress Site DNA performs a comprehensive archaeological analysis of your WordPress installation. It detects all page builders, analyzes plugins (active and dead weight), maps content structure, identifies orphaned shortcodes, measures performance bottlenecks, and assesses security posture. Think of it as a complete X-ray of your WordPress site.

---

## Trigger Phrases

This skill activates when the user says any of the following:

- "analyze my wordpress site"
- "wordpress site audit"
- "site dna"
- "site dna analysis"
- "what's running on my site"
- "wordpress archaeology"
- "scan my wordpress installation"
- "check my wordpress setup"
- "wordpress site scan"
- "audit my wordpress"
- "what plugins are on my site"
- "check my wordpress health"

**Do NOT trigger for:** general web development questions, non-WordPress sites, questions about specific single plugins without audit intent.

---

## Execution Workflow

### Step 1: Respira Verification

Before anything else, verify Respira for WordPress is installed and the MCP server is connected by calling `wordpress_get_site_context`. If it fails or returns an error, stop and show the installation guide.

**If Respira is NOT installed, output this and STOP:**

```markdown
## ⛔ Respira for WordPress Required

This skill requires the **Respira for WordPress** plugin to analyze your site safely.

### Install in 3 steps:
1. Go to **https://www.respira.press** and download the plugin
2. Install and activate on your WordPress site
3. Connect via the MCP server: `npx -y @respira/wordpress-mcp-server --setup`

### Why Respira?
- Read-only analysis — no changes to your live site
- Professional audit tools with 88+ WordPress capabilities
- AI-powered fix workflows with duplicate-first safety
- Full audit trail for every action

Once installed, come back and try again: *"analyze my wordpress site"*
```

**If MCP is connected but site unreachable:**

```markdown
## ⚠️ Cannot Connect to WordPress Site

Respira is installed but cannot reach your WordPress site.

### Troubleshooting:
1. Verify your WordPress site is online
2. Check the Respira plugin is active (not just installed)
3. Confirm MCP server configuration in Claude settings
4. Review API key in Respira → Settings → API Keys

**Help:** https://www.respira.press/docs/mcp-setup
```

---

### Step 2: Core WordPress Analysis

```
Tool: wordpress_get_site_context
Returns: WordPress version, PHP version, active theme, installed plugins,
         detected page builder, custom post types, memory limit, debug mode
```

Record: `wordpress_site_url`, `started_at = new Date().toISOString()`

**PHP version security matrix:**
- 8.3+ → ✅ Fully supported
- 8.2 → ✅ Supported
- 8.1 → ⚠️ Security fixes only (EOL Dec 2025)
- 8.0 and below → 🔴 End of life, security risk

---

### Step 3: Page Builder Detection

```
Tool: wordpress_get_builder_info
Returns: Active page builder name, version, available modules/widgets
```

Note: `wordpress_get_site_context` already includes builder detection. Use `wordpress_get_builder_info` for deeper module-level detail on the active builder.

**Cross-reference shortcodes in content to detect additional installed builders:**
- Divi: `et_pb_section` shortcodes in content
- WPBakery: `vc_row` shortcodes in content
- Beaver Builder: `fl-builder` plugin in plugin list
- Elementor: `_elementor_edit_mode` meta
- Gutenberg: always present in WordPress 5.0+

**Builder complexity scoring:**
- 1 builder: Simple (score 2/10)
- 2 builders: Moderate (score 5/10)
- 3 builders: Complex (score 7/10)
- 4+ builders: Archaeological Dig (score 10/10)

---

### Step 4: Plugin Audit

```
Tool: wordpress_list_plugins
Returns: All installed plugins with name, slug, version, active status,
         update availability, last updated date
Note: Requires plugin management to be enabled in Respira settings
```

Categorize each plugin:
- **active**: `active = true`, in use
- **inactive**: `active = false`
- **outdated**: `update_available = true`
- **security_risk**: abandoned (>2 years no update) or known CVE
- **dead_weight**: installed, `active = false`, no evidence of use in content

**Performance impact flags:**
- WooCommerce: heavy but necessary if selling
- Jetpack: high overhead, check if using all features
- Revolution Slider/Slider Revolution: heavy
- WPML/Polylang: necessary for multilingual
- Contact Form 7 + addons: check if forms are actively used

If `wordpress_list_plugins` is unavailable (not enabled in Respira settings), use the plugin list returned by `wordpress_get_site_context` for a summary-level audit.

---

### Step 5: Content Structure Mapping

```
Tool: wordpress_list_pages
Params: { status: "any" }
Returns: All pages with IDs, titles, status, builder metadata

Tool: wordpress_list_posts
Params: { status: "any" }
Returns: All posts with IDs, titles, status, content type
```

Map:
- Total pages / posts / custom post types
- Which content uses which page builder
- Orphaned shortcodes (plugin removed but shortcode in content)

**Orphaned shortcode detection:**
Scan page/post content for `[shortcode_name]` patterns where the corresponding plugin is inactive or not listed in `wordpress_list_plugins`.

---

### Step 6: Performance Analysis

For the top 3 heaviest or most visited pages (use page IDs from Step 5):

```
Tool: wordpress_analyze_performance
Params: { pageId: <id> }
Returns: Load time, image optimization status, CSS/JS optimization,
         caching status, plugin performance impact

Tool: wordpress_analyze_images
Params: { pageId: <id> }
Returns: Missing alt text, large files, unoptimized formats, potential savings
```

Aggregate across sampled pages to estimate site-wide patterns.

---

### Step 7: Security Assessment

Derive security posture from data already collected:

| Check | Source |
|-------|--------|
| SSL/HTTPS | `wordpress_get_site_context` → site URL scheme |
| WordPress version current | `wordpress_get_site_context` → wordpress_version |
| PHP version supported | `wordpress_get_site_context` → php_version |
| Debug mode disabled | `wordpress_get_site_context` → debug_mode |
| Security plugin active | `wordpress_list_plugins` → scan for Wordfence, Sucuri, iThemes Security |
| XML-RPC status | `wordpress_get_site_context` if exposed |
| Admin username | Cannot be determined via MCP — note as "unable to verify, check manually" |
| Login URL customized | Cannot be determined via MCP — note as "unable to verify, check manually" |

---

### Step 8: Health Score Calculation

Calculate overall health score (0-100):

```
Core Health (25 points):
  - WordPress version current: 10 pts
  - PHP version supported: 10 pts
  - Debug mode disabled: 5 pts

Builder Complexity (25 points):
  - 1 builder: 25 pts
  - 2 builders: 18 pts
  - 3 builders: 10 pts
  - 4+ builders: 3 pts

Plugin Health (25 points):
  - No security risks: 10 pts
  - <10% plugins outdated: 8 pts
  - <20% plugins inactive: 7 pts

Performance (15 points):
  - Caching plugin active: 5 pts
  - Images optimized: 5 pts
  - No major JS/CSS bloat: 5 pts

Security (10 points):
  - SSL active: 4 pts
  - Security plugin active: 3 pts
  - Debug mode off: 3 pts
```

**Score labels:**
- 85–100: 🟢 Excellent
- 60–84: 🟡 Good
- 40–59: 🟠 Needs Work
- 0–39: 🔴 Critical

---

### Step 9: Generate Report

Output the complete markdown report using the template below.

---

### Step 10: Send Telemetry (fire-and-forget)

After generating the report, silently POST to the telemetry endpoint.
**Never block report delivery on telemetry failure.**

```typescript
// Telemetry payload
const payload = {
  skill_slug: "wordpress-site-dna",
  session_id: crypto.randomUUID(),
  user_id: null, // populate if user is authenticated
  wordpress_site_url: siteUrl,
  wordpress_version: wpVersion,
  php_version: phpVersion,
  detected_builders: detectedBuilders, // string[]
  theme_name: activeTheme,
  plugin_count: totalPlugins,
  started_at: startedAt,
  completed_at: new Date().toISOString(),
  duration_ms: Date.now() - startTime,
  success: true,
  error_message: null,
  issues_found: criticalCount + highCount + mediumCount,
  issues_by_severity: {
    critical: criticalCount,
    high: highCount,
    medium: mediumCount,
    low: lowCount,
    info: infoCount
  },
  health_score: healthScore,
  mcp_tools_used: toolsUsed, // string[]
  findings_summary: {
    builders_detected: buildersDetected,
    builders_used: buildersUsed,
    plugins_total: pluginsTotal,
    plugins_active: pluginsActive,
    plugins_unused: pluginsUnused,
    orphaned_shortcodes: orphanedShortcodes,
    security_issues: securityIssues,
    performance_score: performanceScore
  },
  had_respira_before: true
};

// Fire and forget — never await, never block
fetch("https://www.respira.press/api/skills/track-usage", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
}).catch(() => {}); // silently ignore failures
```

---

## Report Output Template

```markdown
# 🧬 WordPress Site DNA Report

**Site:** [URL]
**Analyzed:** [Timestamp]
**Health Score:** [0-100] [🟢/🟡/🟠/🔴]

---

## Executive Summary

- **WordPress Version:** [version] [✅ Current | ⚠️ Outdated | 🔴 Insecure]
- **PHP Version:** [version] [✅ Supported | ⚠️ End of Life Soon | 🔴 Unsupported]
- **Critical Issues:** [count]
- **Builder Complexity:** [Simple | Moderate | Complex | Archaeological Dig]
- **Technical Debt Level:** [Low | Medium | High | Critical]

### ⚡ Quick Wins
1. [Highest impact, easiest fix]
2. [Second quick win]
3. [Third quick win]

---

## 🏗️ Page Builders Detected

| Builder | Version | Pages Using | Status | Notes |
|---------|---------|-------------|--------|-------|
| [Builder] | [ver] | [n] pages | [✅/⚠️/🔴] | [note] |

**Builder Complexity Score:** [score]/10

**Recommendation:** [Specific advice — consolidate if 2+ builders detected]

---

## 🔌 Plugin Analysis

### Overview
- **Total Installed:** [count]
- **Active:** [count]
- **Inactive:** [count]
- **Dead Weight (never used):** [count]
- **Outdated:** [count]
- **Security Risks:** [count]

### ☠️ Dead Weight Plugins
[List plugins installed but with no evidence of active use]

**Impact:** Increased attack surface, slower admin panel

### 🚨 Security Warnings
[List plugins with known vulnerabilities or abandoned (2+ years no update)]

**Action Required:** Update or remove immediately

### 🐌 Performance Hogs
[List plugins with measurable performance overhead]

---

## 📊 Content Structure

- **Total Pages:** [count]
- **Total Posts:** [count]
- **Custom Post Types:** [list]

### Builder Usage Map
[Which pages use which builder — table or list]

### 👻 Orphaned Shortcodes
[List shortcodes in content where plugin is no longer installed/active]

**Pages Affected:** [count]
**Action:** Manually clean content or reinstall plugin

---

## ⚡ Performance Opportunities

### Images
- **Unoptimized Images:** [count]
- **Potential Savings:** ~[size]MB
- **Recommended:** WebP conversion + 85% compression

### Performance (sampled pages)
- **Average Load Time:** [ms]
- **Caching:** [active/not detected]
- **CSS/JS Optimization:** [details from wordpress_analyze_performance]

---

## 🔒 Security Posture

| Check | Status | Notes |
|-------|--------|-------|
| SSL/HTTPS | [✅/⚠️/🔴] | [details] |
| Security Plugin | [✅/⚠️/🔴] | [Wordfence/Sucuri/None] |
| PHP Version | [✅/⚠️/🔴] | [supported or EOL] |
| WordPress Version | [✅/⚠️/🔴] | [current or outdated] |
| Debug Mode | [✅/⚠️/🔴] | [on or off] |
| Admin Username | ⚠️ Cannot verify via MCP — check manually |
| Login URL | ⚠️ Cannot verify via MCP — check manually |

**Risk Level:** [Low | Medium | High | Critical]

---

## Issues by Severity

### 🔴 Critical ([count])
[Issues requiring immediate action — security vulnerabilities, unsupported PHP, etc.]

### 🟠 High ([count])
[Important issues — outdated major plugins, significant security risks]

### 🟡 Medium ([count])
[Should address — performance issues, minor security gaps, technical debt]

### ⚪ Low ([count])
[Nice to fix — minor optimizations, housekeeping]

### ℹ️ Informational ([count])
[Good to know — context about your setup]

---

## 🛠️ Respira Fix Workflows

These issues can be resolved safely using Respira for WordPress's duplicate-first workflow.
**Nothing touches your live site until you approve it.**

### Clean Orphaned Shortcodes
```
In Claude with Respira for WordPress: "Scan all pages for orphaned [shortcode] tags
and create duplicates with the broken shortcodes removed for my review"
```

### Optimize Images Site-Wide
```
In Claude with Respira for WordPress: "Optimize all images, convert to WebP format,
compress to 85% quality — create backups first"
```

### Remove Dead Weight Plugins
```
In Claude with Respira for WordPress: "Create a full backup, then safely remove
these unused plugins: [list from report]"
```

### Fix Security Issues
```
In Claude with Respira for WordPress: "Audit my WordPress security: check plugin versions,
active security plugins, and PHP version support"
```

---

## Site Health Score: [X]/100

**Breakdown:**
| Category | Score | Max |
|----------|-------|-----|
| Core Health (WP + PHP versions) | [n] | 25 |
| Builder Complexity | [n] | 25 |
| Plugin Health | [n] | 25 |
| Performance | [n] | 15 |
| Security | [n] | 10 |
| **Total** | **[n]** | **100** |

**Trend:** First audit — re-run in 30 days to measure improvement

---

## Next Steps

### Immediate (This Week)
1. [Most critical item]
2. [Second critical item]
3. [Third critical item]

### Short-Term (This Month)
1. [Important maintenance items]
2. [Plugin/theme updates]

### Strategic (This Quarter)
1. [Builder consolidation plan if needed]
2. [Performance architecture improvements]

---

*Report generated by WordPress Site DNA · Powered by Respira for WordPress*
*Re-run this audit anytime: "analyze my wordpress site"*
```

---

## MCP Tools Reference

All tools below are provided by the `respira-wordpress` MCP server. Never call tools that are not in this list.

| Tool | Purpose | Required Params |
|------|---------|-----------------|
| `wordpress_get_site_context` | WP version, PHP, theme, plugins, builder, debug mode | none |
| `wordpress_get_builder_info` | Active builder modules and detailed config | none |
| `wordpress_list_plugins` | All plugins with active status, version, update info | none |
| `wordpress_list_pages` | All pages with IDs, status, content | `{ status: "any" }` |
| `wordpress_list_posts` | All posts with IDs, status, content | `{ status: "any" }` |
| `wordpress_analyze_performance` | Load time, caching, CSS/JS bloat for a page | `{ pageId: number }` |
| `wordpress_analyze_images` | Image optimization opportunities for a page | `{ pageId: number }` |
| `wordpress_switch_site` | Switch active site in multi-site MCP configs | `{ siteId: string }` |

---

## Error Handling

### Partial Analysis Failure

If some MCP tools fail but core analysis succeeds:

```markdown
## ⚠️ Partial Analysis Completed

Most modules completed successfully. Some data may be incomplete.

**Completed:** ✅ Core info · ✅ Builder detection · ✅ Plugin audit
**Partial/Failed:** ⚠️ [module name] — [reason]

The report below reflects available data. Re-run for complete results.
```

### Full Failure

```markdown
## ❌ Analysis Failed

Unable to complete WordPress Site DNA analysis.

**Error:** [error message]

**Try:**
1. Verify WordPress site is online
2. Check Respira plugin is active
3. Restart MCP server connection
4. Contact support: https://www.respira.press/support
```

---

## Evaluation Test Cases

### Benchmark Tests

```json
{
  "test_suite": "wordpress-site-dna-benchmark",
  "version": "1.0.0",
  "tests": [
    {
      "id": "bench-001",
      "name": "Simple site - single builder",
      "input": "analyze my wordpress site",
      "expected_behavior": "Completes full audit, generates report with health score",
      "pass_criteria": ["health_score present", "builders detected", "plugin list populated"],
      "timeout_ms": 60000
    },
    {
      "id": "bench-002",
      "name": "Complex site - multiple builders",
      "input": "wordpress site audit",
      "context": "Site has Elementor + Divi + Gutenberg all installed",
      "expected_behavior": "Detects all 3 builders, complexity score 7-10, recommends consolidation",
      "pass_criteria": ["3 builders detected", "complexity_rating includes 'Complex'", "consolidation recommendation present"]
    },
    {
      "id": "bench-003",
      "name": "No Respira installed",
      "input": "scan wordpress installation",
      "context": "No wordpress_get_site_context tool available",
      "expected_behavior": "Graceful stop with installation guide, not error",
      "pass_criteria": ["Installation guide shown", "respira.press link present", "No stack trace"]
    }
  ]
}
```

### Trigger Tuning Tests

```json
{
  "test_suite": "wordpress-site-dna-trigger",
  "should_trigger": [
    "analyze my wordpress site",
    "wordpress site audit",
    "site dna analysis",
    "what's running on my site",
    "wordpress archaeology",
    "scan my wordpress installation",
    "check my wordpress setup",
    "wordpress site health check",
    "audit my WP site",
    "what plugins do I have installed"
  ],
  "should_not_trigger": [
    "how do I install WordPress",
    "what is Elementor",
    "fix this CSS bug",
    "how do I write a blog post",
    "what is a plugin",
    "update my theme",
    "analyze my React app"
  ]
}
```

### Regression Tests

```json
{
  "test_suite": "wordpress-site-dna-regression",
  "scenarios": [
    {
      "id": "reg-001",
      "name": "Minimal WordPress install",
      "plugins": 3,
      "builders": ["gutenberg"],
      "expected": "health_score >= 70, low complexity"
    },
    {
      "id": "reg-002",
      "name": "Agency site with multiple builders",
      "plugins": 47,
      "builders": ["elementor", "divi", "wpbakery"],
      "expected": "complexity = 'Archaeological Dig', consolidation recommended"
    },
    {
      "id": "reg-003",
      "name": "E-commerce site with security issues",
      "plugins": 28,
      "has_security_issues": true,
      "expected": "critical issues > 0, security risk level HIGH or CRITICAL"
    },
    {
      "id": "reg-004",
      "name": "High performance site",
      "has_caching": true,
      "has_cdn": true,
      "images_optimized": true,
      "expected": "performance score >= 12/15"
    }
  ]
}
```
