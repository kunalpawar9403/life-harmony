# Production Playwright QA Automation Setup Guide

This guide details the complete configuration and operating procedure for orchestrating automated Playwright end-to-end tests across **n8n Cloud**, **GitHub Actions**, and **Antigravity Desktop**.

---

## 1. System Architecture & Topology

```
+-----------------------------------------------------------------------------------+
|                                     TRIGGERS                                      |
|  - External Webhook (PR, Release, CI trigger)                                      |
|  - Manual Execution in n8n Cloud Canvas                                           |
+-----------------------------------------+-----------------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                             n8n CLOUD ORCHESTRATOR                                |
| 1. Input Validation & Correlation ID Generation (qa_corr_<timestamp>_<rand>)      |
| 2. Immediate 202 Webhook ACK (prevents client timeout)                            |
| 3. Set GitHub Commit Status -> PENDING                                            |
| 4. Dispatch GitHub Actions Workflow (`qa-execute.yml`) via GitHub REST API        |
| 5. Bounded Polling Loop (Max 30 polls x 15s = 7.5 min timeout guardrail)          |
| 6. Strict Verification: actual Run ID, Commit SHA matching, Conclusion check      |
+--------------------+---------------------------------------------+----------------+
                     |                                             |
                     | SUCCESS                                     | FAILURE / TIMEOUT
                     v                                             v
       +----------------------------+               +-------------------------------+
       | Set Status -> SUCCESS      |               | Set Status -> FAILURE/ERROR   |
       | Send Pass Notification     |               | Fetch Failing Jobs & Steps    |
       +----------------------------+               | Send Fail Notification Alert  |
                                                    | Secure Agent Handoff (GitHub) |
                                                    +-------------------------------+
                                                                   |
                                                                   v
                                                    +-------------------------------+
                                                    |     ANTIGRAVITY DESKTOP       |
                                                    | Local reproduction & fix via  |
                                                    | exact commit SHA & CI traces  |
                                                    +-------------------------------+
```

---

## 2. Cloud-to-Desktop Network Boundary & Secure Agent Handoff

### The Challenge
**n8n Cloud** runs inside a multi-tenant cloud environment (AWS/GCP) on public IPs. **Antigravity Desktop** runs locally on your workstation.
- n8n Cloud **CANNOT** connect directly to `http://localhost`, `127.0.0.1`, or local private network IPs (RFC 1918 addresses like `192.168.x.x` or `10.x.x.x`).
- Attempting to call local IPs from n8n Cloud will result in `ECONNREFUSED` or timeout errors.

### Implemented Solutions & Supported Handoff Alternatives

#### Option 1: Asynchronous GitHub-Mediated Agent Handoff (Implemented in Workflow)
Instead of attempting a direct TCP connection from cloud to desktop, n8n Cloud uses GitHub's public API as a secure intermediary:
1. When a test fails, the node `Secure Agent Handoff / Issue Creation` automatically opens a GitHub Issue (or updates a PR comment) labeled `qa-failure` and `automated-triage`.
2. The payload contains:
   - Full correlation ID for audit tracing.
   - The exact commit SHA to checkout: `git checkout <commit_sha>`.
   - Direct link to download Playwright trace artifacts from GitHub Actions.
   - Summaries of the failing test steps.
3. Antigravity Desktop or the local engineer queries git/GitHub, reproduces the failure in the exact environment, and pushes the fix.

#### Option 2: Human-in-the-Loop Webhook / Wait-for-Approval Alternative
If manual or agent review is required before continuing subsequent deployment stages:
- n8n Cloud includes a `Wait` node or n8n Form trigger where a human or desktop agent opens an authenticated cloud URL, reviews the test logs, and clicks "Approve / Reject" or enters triage notes.

#### Option 3: Secure Inbound Tunnel (Optional Advanced Setup)
If real-time programmatic dispatch from n8n Cloud to a local daemon is ever required:
- Deploy **Cloudflare Tunnel (`cloudflared`)** or **ngrok** with mutual TLS / token authentication.
- Point the n8n HTTP Request node to your public tunnel domain (`https://agent.yourdomain.com/webhook`) with a pre-shared secret header (`X-Agent-Secret`).

---

## 3. Node-by-Node Explanation (`n8n/playwright_qa_workflow.json`)

The imported workflow contains 24 nodes divided into functional stages:

| # | Node Name | Type | Purpose & Configuration |
|---|---|---|---|
| 1 | **Webhook Trigger (QA Dispatch)** | `webhook` | Listens at `POST /webhook/playwright-qa-dispatch` for trigger payloads containing `repo_owner`, `repo_name`, `ref`, and `commit_sha`. |
| 2 | **Manual Execution Trigger** | `manualTrigger` | Allows one-click dry-runs and pipeline testing directly from the n8n canvas. |
| 3 | **Normalize & Validate Input** | `code` | Normalizes inputs, validates required repo fields, initializes `poll_count = 0`, sets `max_polls = 30`, and generates a unique `correlation_id` (`qa_corr_<timestamp>_<random>`). |
| 4 | **Immediate Webhook ACK (202)** | `respondToWebhook` | Returns HTTP 202 Accepted within milliseconds so the calling webhook (e.g. GitHub or CI caller) never times out. |
| 5 | **Set GitHub Status (Pending)** | `httpRequest` | Calls `POST /repos/{owner}/{repo}/statuses/{sha}` with `state: pending` and context `n8n/playwright-qa`. |
| 6 | **Dispatch GitHub Action** | `httpRequest` | Calls `POST /repos/{owner}/{repo}/actions/workflows/qa-execute.yml/dispatches` with target `ref` and input payload. Retries twice on transient errors. |
| 7 | **Initial Wait for GitHub Registration** | `wait` | Waits 15 seconds to allow GitHub Actions scheduler to register and allocate the workflow run. |
| 8 | **Fetch Workflow Runs** | `httpRequest` | Calls `GET /repos/{owner}/{repo}/actions/workflows/qa-execute.yml/runs?event=workflow_dispatch&per_page=10` using GitHub API. |
| 9 | **Evaluate Run & Bounded Counter** | `code` | Matches the active run by commit SHA or trigger timestamp, increments `poll_count`, checks if run status is `completed`, and flags timeout if `poll_count >= max_polls`. |
| 10 | **Is Run Completed?** | `if` | Branches: TRUE if GitHub Actions run is completed; FALSE if still queued or running. |
| 11 | **Is Polling Timed Out?** | `if` | Evaluates if the retry limit (30 polls) was exceeded. If TRUE, transitions to timeout; if FALSE, routes to retry wait. |
| 12 | **Wait Before Next Poll** | `wait` | Pauses for 15 seconds before re-querying GitHub Actions runs. |
| 13 | **Set GitHub Status (Timeout)** | `httpRequest` | Sets commit status to `error` if the pipeline exceeded maximum wait time, preventing hanging statuses. |
| 14 | **Verify Run Conclusion & SHA** | `code` | Strict validation guard: verifies `run_id` exists, confirms `head_sha` matches expected commit, and checks `conclusion === 'success'`. |
| 15 | **Is Verified Pass?** | `if` | Branches: TRUE if strictly verified passed; FALSE on failure, cancellation, or mismatch. |
| 16 | **Set GitHub Status (Success)** | `httpRequest` | Updates commit status to `success` with run link. |
| 17 | **Send Pass Notification** | `httpRequest` | Dispatches structured JSON notification to Slack/Teams/Discord/webhook with run details and duration. |
| 18 | **Set GitHub Status (Failure)** | `httpRequest` | Updates commit status to `failure` with run link. |
| 19 | **Fetch Failed Jobs & Step Details** | `httpRequest` | Queries `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs` to extract exact failing step names and logs. |
| 20 | **Send Fail Notification** | `httpRequest` | Sends urgent alert with failing job information, GitHub run link, and correlation ID. |
| 21 | **Secure Agent Handoff / Issue Creation** | `httpRequest` | Creates a tracked GitHub Issue with complete triage instructions for the Antigravity desktop environment. |
| 22 | **Global Workflow Error Trigger** | `errorTrigger` | Catches unhandled node crashes, network drops, or n8n internal errors. |
| 23 | **Format Global Error Details** | `code` | Formats execution ID, failed node name, and stack trace. |
| 24 | **Send Global Error Alert** | `httpRequest` | Sends high-priority alert to incident webhook. |

---

## 4. Preventing Failure Modes & Production Guardrails

| Risk | Cause | Implemented Prevention Mechanism |
|---|---|---|
| **Infinite Retry Loops** | GitHub Actions job hangs or never transitions to completed status. | Bounded poll counter in `Evaluate Run & Bounded Counter` and `Is Polling Timed Out?`. Hard capped at `max_polls = 30` (7.5 minutes total). Automatically transitions to failure/timeout path. |
| **Recursive Workflow Triggers** | Workflows triggering commits or events that re-trigger the workflow infinitely. | Workflow runs solely on `workflow_dispatch` and `repository_dispatch` with strict `concurrency` grouping. It does not push back commits to trigger itself. |
| **Duplicate Pull Requests** | QA runs generating multiple competing PRs or comments. | The workflow updates GitHub Commit Statuses in-place (`n8n/playwright-qa`) tied to the exact commit SHA rather than creating duplicate PRs. |
| **False Success Notifications** | Exit code 0 returned when test runner errored out, or polling matches wrong previous run. | 1. CI step `Enforce Strict Pipeline Conclusion` fails the GitHub Actions job (`exit 1`) if test step did not succeed.<br>2. `Verify Run Conclusion & SHA` requires both `conclusion === 'success'` AND exact `head_sha` match. |

---

## 5. Credential Configuration in n8n Cloud

No secrets or tokens are hardcoded. Configure the following credentials inside your n8n Cloud instance:

### Credential 1: GitHub API Authentication
- **Location in n8n**: `Settings` -> `Credentials` -> `Add Credential` -> `Header Auth` (or `GitHub API`).
- **Credential Name**: `GitHub Personal Access Token`
- **Name Header**: `Authorization`
- **Value**: `Bearer ghp_YourPersonalAccessTokenWithRepoScope`
- **Required GitHub Scopes**:
  - `repo:status` (to update commit statuses)
  - `actions:write` (to dispatch workflows and read run status)
  - `issues:write` (to create handoff issues upon failure)

### Credential 2: Webhook Trigger Authorization (Optional but Recommended)
- **Location in n8n**: `Settings` -> `Credentials` -> `Header Auth`.
- **Credential Name**: `QA Webhook Dispatch Secret`
- **Name Header**: `X-QA-Token`
- **Value**: Any cryptographically generated secret string (e.g. `openssl rand -hex 24`).

### Credential 3: Notification Destination
- Configured in the `notification_webhook` property or by replacing the HTTP Request nodes with native n8n **Slack**, **Discord**, or **Microsoft Teams** nodes.

---

## 6. Pre-Activation Checklist

Complete every item before turning the workflow active:

- [ ] **Repository Pushed**: Ensure this repository is pushed to your remote GitHub account (`origin`).
- [ ] **Workflow File on Default Branch**: Verify `.github/workflows/qa-execute.yml` is present on your default GitHub branch (`main`) so GitHub Actions discovers the `workflow_dispatch` trigger.
- [ ] **GitHub Token Created**: Create a Personal Access Token (classic or fine-grained) with `actions:write`, `repo:status`, and `issues:write` permissions.
- [ ] **n8n Workflow Imported**: In n8n Cloud, click **Workflows** -> **Import from File** -> select `n8n/playwright_qa_workflow.json`.
- [ ] **Credentials Linked in n8n**: Open the HTTP Request nodes (`Set GitHub Status`, `Dispatch GitHub Action`, `Fetch Workflow Runs`, etc.) and attach your created Header Auth / GitHub credential.
- [ ] **Verify Repository Name**: In the `Normalize & Validate Input` code node, ensure default `repo_owner` and `repo_name` match your repository.
- [ ] **Test Manual Run**: Click **Test workflow** in n8n with `Manual Execution Trigger` to verify end-to-end communication with GitHub Actions before enabling the Webhook.
- [ ] **Activate Workflow**: Once verified, toggle the workflow switch to **Active**.
