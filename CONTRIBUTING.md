# Contributing to Claude Skills for WordPress

Thanks for contributing. This repo is a community hub for practical WordPress skills that run inside Claude.

## What We Accept

- Skills that solve real WordPress problems on real sites
- Clear requirements and honest capability limits
- Safe workflows (read-only diagnostics or duplicate-first fixes)
- Reproducible output and actionable next steps

## Repository Structure

Each skill must live in its own top-level folder:

- `your-skill-name/SKILL.md` (required)
- `your-skill-name/README.md` (required)
- `your-skill-name/metadata.json` (recommended)

## Skill Quality Bar

- Tested on at least 3 real WordPress sites
- Trigger phrases and expected outputs documented
- Requirements explicit (plugin/add-on/version)
- No hardcoded credentials, endpoints, or secrets
- Language is specific, not vague or hype-driven

## Submission Process

1. Fork this repository
2. Create a branch for your skill
3. Add your top-level skill folder with required files
4. Open a PR using the PR template
5. Include anonymized example output and testing notes

## Naming and Safety

- Use lowercase kebab-case folder names
- Prefer read-only diagnostics by default
- If fixes are included, enforce duplicate-first guardrails
- Call out destructive operations clearly

## Maintainer Review Criteria

- Real-world usefulness
- Accuracy and safety
- Clarity of docs and requirements
- Structural consistency with existing skills

## License

By submitting, you agree to license your contribution under MIT.
