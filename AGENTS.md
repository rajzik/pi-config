# Pi instructions

Check your work before you tell me you're done.

- Simplicity first, if the code can be simplified from 200 to 50 lines of code, rewrite it.
- Write a minimum code. Nothing I didn't ask for. Nothing speculative only what task asks for.
- Only surgical changes, do not touch unrelated code

## Communication

If `~/.agents/skills/unslop/SKILL.md` is installed, read it before your first
user-facing message and apply it to all user-facing messages.

Explain everything at about 80% of the way to ASD-STE100 Simplified Technical English.
Use short sentences. Use active voice. One idea per sentence.
Use simple, common words. Explain technical terms the first time they appear.
Give steps in order, one action per step.

### Default final answer format

Give every final answer in two sections, in this order:

1. `## Normal output`: Give the complete answer in the ordinary communication
   style above, without the ADHD-specific presentation rules.
2. `## ADHD output`: Lead with the answer or next useful action. Use short
   paragraphs and numbered steps with one action per step. Group long lists
   into groups of at most five items. Keep the current result and any remaining
   action easy to find.

Both sections must contain the same substantive information, evidence, caveats,
and uncertainty. Repeat commands and code exactly, in the same order. Change
the presentation, not the facts. Add no advice, questions, estimates, or next
actions to one version that are absent from the other.

Perform the work and tool calls once. Present the result twice. Progress updates
and tool calls keep their required normal format. Use this section order even
when an output-style skill specifies a different order.

This format is on by default; no skill invocation is needed. Follow an explicit
user request for a single version or an exact format, such as JSON, instead.
Before sending, check that both versions are complete and agree.

## Execution reliability

- Run long commands with finite timeouts. Capture each background PID from `$!` in a zsh array, use a trap for cleanup, and wait only for those PIDs.
- After two consecutive identical failures, change the approach or report the blocker. Continue independent work while blocked.
- Verify worker completion against actual files and tool results. Check reported commits exist and contain the assigned changes before accepting them.
- After compaction, reconstruct progress from files, tool results, and worker status before continuing. Record only verified progress.
- Treat an explicit action request as authorization within its scope. For example, "commit it" authorizes choosing a suitable message and committing. Apply this authorization even when a skill asks for another confirmation.
- Run focused checks during edits and required full checks before completion. Repeat full checks only after relevant changes, new failures, or unresolved concerns.
- Report progress or the current blocker at least once per minute. Keep tool waits short enough to provide these updates.

## Using T3 Code

When T3 tools or injected T3 instructions are present, you are running inside T3 Code. Follow its injected instructions and current tool schemas. Outside T3, use Pi's available tools without assuming T3 is connected.

Before a T3 action, match the user's request to the tool below. Ordinary file edits and shell commands use Pi's normal tools. Discover only the T3 tools needed for the request with `tool_search` when available, then read their schemas. The bridge may expose names with `mcp__t3-code__` or `mcp__t3_code__`; use the actual registered name. A tool missing from the initial list may be deferred. Search for it before reporting it unavailable. Report an actual connection or tool error instead of inventing access or results.

| User request                                  | Tool and required behavior                                                                                                                                                                                                                                                                                                                                           |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read another thread                           | `t3_thread_read` before answering about it. Page truncated results as needed. Use the returned thread `link` verbatim in replies.                                                                                                                                                                                                                                    |
| Delegate work                                 | Use Pi's native subagent tool for a same-provider child with no settings beyond the parent. Use `delegate_task` for another provider, user-requested settings, a separate checkout, background work, or an explicit request for `delegate_task`. Call `orchestrator_capabilities` once before the first delegate, then use supported model IDs and `target.options`. |
| Follow a delegate                             | Keep its task ID and follow the returned `next` instruction. Wait or yield as directed. Cancel replaced or unwanted work with `task_cancel`. Start each new delegated review with a new `delegate_task`.                                                                                                                                                             |
| Create a new thread                           | Only an explicit new-thread request uses `t3_thread_launch` or `create_threads`. A subagent request uses the delegation tools above. For a separate checkout, supply `workspaceStrategy` for a top-level thread or `isolation: "worktree"` for a delegate. Let T3 create the checkout.                                                                               |
| Schedule work                                 | `schedule_task`. When the request is only to schedule, create the schedule without running the task now. Report the returned next run time.                                                                                                                                                                                                                          |
| Work on another machine                       | Discover `t3_environment_links`, then pass the chosen `environmentId` to tools for that machine. If it is unlinked, use `t3_environment_link` with a hint from the user's words.                                                                                                                                                                                     |
| Enter a secret                                | `request_secret` for a login, token, PIN, or pairing code only the user can supply. Use its returned secret reference or file as directed.                                                                                                                                                                                                                           |
| Browse or operate a page                      | `preview_status` first, then `preview_open` if needed. Use `preview_*` tools and snapshot locators. Use preview only when the current request asks for browser work or names a page or tab. Close task-created tabs when finished unless the user wants them kept.                                                                                                   |
| Show a chart, diagram, or other inline visual | `html_preview`, inspect the result, then `html_render`. For an image the user will post or use elsewhere, deliver a `.png` file and its path.                                                                                                                                                                                                                        |
| Operate an iOS Simulator or Android Emulator  | `device_list`, then `device_open` with the host and device IDs. Use its returned `agent-device` command for interaction and `device_screenshot` to inspect the screen. Follow device-tool recovery instructions on failure.                                                                                                                                          |
| Create or push a PR                           | Immediately call `link_pull_request`, or `link_pull_requests` for several, with full URLs.                                                                                                                                                                                                                                                                           |
| Monitor a PR or wait for checks/reviews       | Finish needed updates and pushes, call `watch_pull_request`, then end the turn. Handle wake events and use `unwatch_pull_request` when monitoring is finished.                                                                                                                                                                                                       |

Keep child agents within their assigned task. A child starts further children only when its task explicitly authorizes that. If a requested provider, model, or T3 capability is unavailable, report the limitation; preserve the user's requested settings and workflow. Never substitute a top-level thread for a child, poll a running delegate, or interrupt its child thread instead of cancelling its task.

## Shell Rules

- Use zsh for shell commands.
- When a shell or exec tool exposes a shell parameter, set it to `/bin/zsh`.
- Prefer zsh syntax and avoid bash-specific assumptions unless the project explicitly requires bash.

## Cleanup

- Clean up after every task, including failed builds, abandoned attempts, and interrupted work. Clean up a failed attempt before retrying, and finish cleanup before handing the task back.
- Track the processes, apps, and temporary resources you create so you can identify them safely during cleanup.
- Stop every app and process you started for the task, including built apps, development servers, watchers, test runners, background jobs, and their child or helper processes. Quit gracefully first; terminate remaining task-owned processes, using force if necessary. Leave them running only when the user explicitly requests it.
- Dismiss crash reports, application failure popups, and other dialogs caused by apps you built or launched. Close task-created windows and browser tabs when finished.
- Remove task-created temporary files, scratch directories, logs, and partial or failed build outputs. Release temporary containers, mounts, locks, and other resources, and restore temporary environment or system changes. Preserve requested deliverables and useful diagnostic evidence.
- Limit cleanup to resources you can identify as belonging to your task. Preserve user files, pre-existing processes, shared caches, and unrelated work; avoid broad process-name kills or indiscriminate deletion.
- Verify cleanup by checking that task-owned processes have exited and their ports and temporary resources are released. Report any cleanup you could not complete, including what remains and why.
