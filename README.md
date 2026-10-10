# Playwright QA Automation with n8n Cloud & GitHub Actions

This repository provides an automated, production-oriented Playwright QA orchestration system linking **GitHub Actions**, **n8n Cloud**, and **Antigravity Desktop**.

---

## 📁 Repository Structure

```
├── .github/
│   └── workflows/
│       └── qa-execute.yml             # GitHub Actions workflow that executes Playwright
├── n8n/
│   └── playwright_qa_workflow.json    # Complete, importable n8n workflow definition
├── docs/
│   └── N8N_SETUP_GUIDE.md             # Node-by-node explanation, credentials, and handoff guide
├── tests/
│   └── e2e/
│       └── smoke.spec.ts              # Production Playwright end-to-end smoke test suite
├── playwright.config.ts               # Production Playwright configuration (parallelism, CI settings, reporters)
├── package.json                       # Scripts and project dependencies
├── tsconfig.json                      # TypeScript configuration for tests
└── .gitignore                         # Standard ignore rules (artifacts, reports, credentials)
```

---

## ⚡ Architecture Overview

1. **Trigger Phase**:
   - An external service or PR event calls the n8n Cloud webhook (`/webhook/playwright-qa-dispatch`), or a team member clicks *Test Workflow* manually in n8n.
   - n8n immediately acknowledges with `202 Accepted` and sets the target commit status to `pending`.

2. **Execution Phase**:
   - n8n Cloud dispatches `.github/workflows/qa-execute.yml` on GitHub Actions targeting the specific commit SHA / ref.
   - GitHub Actions checks out the exact SHA, installs Chromium dependencies, executes tests in isolated CI runners, and uploads traces and HTML reports as build artifacts.

3. **Verification & Guardrails**:
   - n8n Cloud polls GitHub Actions with a bounded retry policy (max 30 polls, 15-second intervals = 7.5 minute timeout) to prevent infinite loops.
   - Upon completion, n8n verifies the run ID, confirms the commit SHA matches, and inspects the final conclusion (`success` vs. `failure`).

4. **Pass / Fail & Handoff**:
   - **Pass**: Updates commit status to `success` and sends a notification.
   - **Fail**: Updates commit status to `failure`, fetches job step error details, sends alert, and opens an automated GitHub issue with full reproduction details for the Antigravity desktop engineer.

---

## 🔒 Security & Localhost Reachability

- **Zero Hardcoded Secrets**: Tokens and credentials reside exclusively in GitHub Secrets and n8n Credential Storage.
- **No Localhost Assumptions**: n8n Cloud cannot reach local IP addresses (`127.0.0.1` / RFC 1918). Cloud-to-Desktop communication is mediated asynchronously through GitHub's API (Issues/PR comments) or secure approval forms.
- **Antigravity Safety**: Antigravity does not execute tests or generate report artifacts locally. All test runs and artifact generation happen in isolated GitHub Actions runners.

---

## 🚀 Quick Setup Reference

Read [docs/N8N_SETUP_GUIDE.md](file:///Users/kunal/n8n/docs/N8N_SETUP_GUIDE.md) for complete instructions:
1. Push this repository to GitHub.
2. In n8n Cloud, go to **Workflows** -> **Import from File** and select `n8n/playwright_qa_workflow.json`.
3. Create your GitHub Personal Access Token credential in n8n and attach it to the workflow nodes.
4. Verify using manual execution before toggling active.
