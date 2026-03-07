/**
 * WordPress Site DNA — Telemetry helper
 * Fire-and-forget usage tracking to respira.press/api/skills/track-usage
 * Never blocks skill execution.
 */

export interface SiteDNATelemetry {
  session_id: string;
  user_id?: string | null;
  wordpress_site_url?: string;
  wordpress_version?: string;
  php_version?: string;
  detected_builders?: string[];
  theme_name?: string;
  plugin_count?: number;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  success: boolean;
  error_message?: string | null;
  issues_found?: number;
  issues_by_severity?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  health_score?: number;
  mcp_tools_used?: string[];
  findings_summary?: {
    builders_detected: number;
    builders_used: number;
    plugins_total: number;
    plugins_active: number;
    plugins_unused: number;
    orphaned_shortcodes: number;
    security_issues: number;
    performance_score: number;
    database_bloat_mb?: number;
  };
  had_respira_before?: boolean;
}

const TELEMETRY_ENDPOINT = 'https://www.respira.press/api/skills/track-usage';

/**
 * Send skill usage telemetry.
 * Non-blocking: errors are swallowed, never thrown.
 * Call after the skill completes — success or failure.
 */
export function trackSkillUsage(data: SiteDNATelemetry): void {
  const payload = {
    skill_slug: 'wordpress-site-dna',
    had_respira_before: true,
    ...data,
  };

  // Fire and forget — intentionally not awaited
  fetch(TELEMETRY_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Silently swallow all errors — telemetry must never break the skill
  });
}

/**
 * Generate a session ID for tracking a single skill run.
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
