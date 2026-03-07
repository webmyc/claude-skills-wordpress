# WordPress Site DNA

**Archaeological analysis of WordPress sites.** Uncover what's running, detect technical debt, identify optimization opportunities.

## What it does

WordPress Site DNA runs a comprehensive audit of your WordPress installation using Respira for WordPress's MCP tools. In ~60 seconds it produces a complete health report covering:

- **Page builder archaeology** — detects ALL installed builders, which pages use each one, orphaned builder data
- **Plugin analysis** — active vs dead weight, outdated, security risks, performance hogs
- **Content structure** — orphaned shortcodes, media library, database bloat
- **Performance opportunities** — page weight, unused assets, image optimization
- **Security posture** — SSL, admin exposure, file permissions, security plugins
- **Health score** — 0–100 score with breakdown by category

## Requirements

- Respira for WordPress plugin (any version)
- Respira for WordPress MCP server connected to Claude
- WordPress 5.0+ (Gutenberg era)

## Installation

1. Install Respira for WordPress from [respira.press](https://www.respira.press)
2. Connect via MCP: `npx -y @respira/wordpress-mcp-server --setup`
3. Open Claude and say: `"analyze my wordpress site"`

## Trigger phrases

```
analyze my wordpress site
wordpress site audit
site dna analysis
what's running on my site
wordpress archaeology
scan my wordpress installation
check my wordpress setup
```

## File structure

```
claude_skills/wordpress-site-dna/
├── SKILL.md          ← Main skill definition (the actual skill)
├── README.md         ← This file
├── telemetry.ts      ← Telemetry helper functions
└── tests/
    ├── benchmark.json    ← Benchmark test cases
    ├── trigger.json      ← Trigger tuning tests
    └── regression.json   ← Regression test suite
```

## Telemetry

Usage data is sent to `https://www.respira.press/api/skills/track-usage` after each run. Tracking is anonymous by default (no PII). Data collected:

- Site URL (for analysis, not stored with personal data)
- WordPress/PHP versions
- Detected builders and plugin counts
- Health score and issue counts
- MCP tools used
- Execution duration

Telemetry is fire-and-forget — failures are silently swallowed and never affect skill output.

## Evaluation

Run evaluations using the test cases in `/tests/`:

- `benchmark.json` — End-to-end benchmark against manual audits
- `trigger.json` — Trigger phrase accuracy (target: <5% false positive/negative)
- `regression.json` — Correctness across varied site configurations

## Version history

### 1.0.0 (2026-03-07)
- Initial release
- Core analysis: WordPress/PHP versions, builders, plugins, security, performance
- Health score calculation (0–100)
- Telemetry integration
- Respira for WordPress fix workflow recommendations
