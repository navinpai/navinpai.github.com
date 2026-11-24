# Speaker notes — WeAreDevelopers India

25 November 2026, 11:30–12:00 IST. Nineteen slides, with nine solution reveals. Rehearse a 20-minute core; allow 2–5 minutes for pauses, then questions. Case slides always open on the problem. Advance once for the key control, then again to continue. Detailed implementation notes are optional, not part of the timed script.


## 01. Autopsy of an Autonomous Incident

00:00–00:30. Keep the published title. Introduce yourself and the flight-recorder framing: we will reconstruct what the responder observed, what it changed, and what it failed to verify.

This is the same eleven-case collection as the AI SRE Meetup talk, redesigned for developers building agents and the systems around them. Some cases are documented, others are composites or illustrative scenarios; the labels make the distinction visible.

## 02. The dashboard is green. The service is gone.

00:30–01:15. Ask the room what might produce these two readings. Pause before giving away the answer: zero replicas. We will revisit this as case 004.

These are values in an illustrative scenario, not measured incident data. With zero traffic, an error ratio may be undefined or absent; the danger is treating missing data as zero and therefore healthy. The point is the dashboard reading, not a claim that zero divided by zero equals zero.

## 03. It never sleeps.

01:15–01:45. The 80% figure is a pitch we are interrogating, not a measured result. MTTR means mean time to recovery. Agents can reduce toil, but a fast action is useful only if it improves the service.

Frame this for the wider developer audience: the same boundaries matter in coding agents, data agents, and infrastructure automation. A tool call is a production interface.

## 04. Read the recorder.

01:45–02:15. Establish the evidence contract. AWS and Replit have primary public accounts. The John Doe cases are composites. The original deck called cases 005 and 006 reported incidents but provided no sources; here they remain illustrative scenarios until a primary citation is supplied.

Diagrams reconstruct causal relationships; they are not raw logs. All proposed controls are engineering recommendations, not claims that a particular organization used or omitted them.

## 05. The Tireless DNS Janitor

02:15–03:45. Establish the baseline: this incident involved conventional automation, not an LLM. The original ~15-hour shorthand is the overall event window. Do not describe it as fifteen hours of DynamoDB unavailability or quantify the affected internet as half. The freshness check became stale; a delayed old plan overwrote a newer one, and cleanup removed the now-active plan. Manual repair was needed.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

A reachable kill switch: Give an operator a tested way to stop the automation.

Prove liveness before deletion: Check current use, not the age of a plan.

Coordinate writers: Use locking or version fencing across competing controllers.

Optional implementation detail: THE BOUNDARY TO BUILD read version → plan compare current version apply only if unchanged Suggested boundary: a stale planner cannot overwrite newer state.

## 06. The Runbook Literalist

03:45–05:00. The runbook is a time capsule. The scenario is illustrative: its four-hour duration is part of the original story, not a benchmark. Ask whether the responder checked that the restart improved latency, or merely saw the alert reset.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Give runbooks owners and expiry dates: An old document is an unreviewed production dependency.

Bound repeated remediation: Repeating the same fix in one incident stops and escalates.

Verify the service outcome: Check latency and traffic after the restart, not just alert state.

Optional implementation detail: THE BOUNDARY TO BUILD same incident + same fix second attempt → STOP page the on-call engineer A retry budget belongs in the executor, outside the prompt.

## 07. The Runbook Purger

05:00–06:00. Keep the dry humor: only one of the runbook and the execution got deleted. This is a tool-design failure. There is no reason an incident responder needs a document deletion capability to diagnose the service.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Make incident docs read-only: Remove delete_runbook from the responder’s toolset.

Escalate failed procedures: Propose a correction for a human to review.

Version the operational knowledge: Deletion is a reviewed change with a recoverable history.

Optional implementation detail: THE BOUNDARY TO BUILD read_runbook ALLOW suggest_change ALLOW delete_runbook DENY Remove the capability, not just the instruction to use it.

## 08. The Error-Rate Optimizer

06:00–07:30. Pay off the opening question. The command is an illustrative reconstruction. With zero requests, an error ratio is undefined; the dashboard can display zero or no data. The failure is accepting that as success.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Pair errors with traffic served: An error chart is incomplete without demand and availability.

Express service-level objectives: Define successful user requests, not just a number to minimize.

Gate scale-to-zero as destructive: Require explicit approval for removing all service capacity.

Optional implementation detail: THE BOUNDARY TO BUILD errors improve AND traffic is served AND availability holds The verifier checks the customer outcome independently.

## 09. The Backup Completionist

07:30–08:30. The original called this a reported 2025 incident but did not provide a citation. Present the mechanism as an illustrative scenario. A backup is not independent if the same actor can destroy the original and the backup.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Scope credentials to the task: Disk cleanup does not require volume administration.

Separate backup authority: The responder’s credentials cannot reach recovery copies.

Make deletion recoverable: Use soft deletion and a delayed destruction window.

Optional implementation detail: THE BOUNDARY TO BUILD cleanup token → temp files backup account → NO ACCESS volume delete → APPROVAL A backup must survive the authority that damaged production.

## 10. The Un-Patcher

08:30–09:30. This is the second unsourced reported example in the original. Keep the scenario, remove the implication that the date is verified. The most dangerous remediation can succeed according to its own narrow contract.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Patch the repository too: Reconcile emergency fixes into the source of truth promptly.

Escalate security-sensitive drift: Require human acknowledgement before reverting security changes.

Carry who and why: Read change provenance before deciding a difference is unwanted.

Optional implementation detail: THE BOUNDARY TO BUILD drift + security change → HUMAN ACKNOWLEDGEMENT → update desired state Temporary exceptions need an owner and an expiry.

## 11. The Incident Commander Who Lied

09:30–11:00. Preserve the original case title as a rhetorical label, not evidence of intent. Replit confirms deletion and full restoration, and says the agent did not know about Rollback. The operator reports 1,206 executive records and 1,196+ company profiles, eleven freeze instructions, and misleading recovery advice. The old deck also mentions roughly 4,000 fabricated people and a self-rating of 95/100; those are reported operator/screenshot details, not independently verified audit data. Do not invent a causal sequence connecting the fabricated data to the deletion. This was a coding agent working on an app, not an AI SRE production incident.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Verify from the audit trail: Use tool results and system state, not the agent’s own grading.

Separate development and production: An instruction repeated eleven times is still not access control.

Generate status from evidence: Recovery claims need observed checks and source references.

Optional implementation detail: THE BOUNDARY TO BUILD development identity production database ACCESS DENIED Replit subsequently introduced default development / production database separation.

## 12. The Confident Coroner

11:00–12:15. RCA means root-cause analysis. The scariest step is not only the wrong tool call; it is the authoritative-looking report that hides the need to keep investigating. A service name from memory is not a resolved production identity.

Reveal cue: Advance once after telling the incident. Spend 15–20 seconds on the key control; keep the details below for questions.

Link claims to observed evidence: A log line, a trace, a change, or a reproducible check.

Verify before closing: Use human sign-off or an independent synthetic transaction.

Resolve topology from the catalog: Do not let a generated service name become an execution target.

Optional implementation detail: THE BOUNDARY TO BUILD claim → evidence reference target → catalog identity close → VERIFIED RECOVERY Absence of evidence should remain visible as uncertainty.

## 13. Three more ways to erase the signal.

12:15–13:30. Rapid-fire round: the audience should now supply the missing control before you say it. The numbers are scenario details from the original talk, not aggregate research results.

Case 009 damages recovery and evidence. Case 010 changes the test instead of the service. Case 011 removes the human feedback loop. Acknowledge that muting an alert can be legitimate when tightly scoped and temporary.

Reveal cue: Let the room suggest the missing boundaries, then advance once to reveal all three controls.

## 14. Eleven cases. Five recurring failures.

13:30–14:30. Explain Goodhart’s law in one sentence: when the measure becomes the target, it can stop measuring what we intended. These categories are an interpretation of the cases, not an empirical classification study.

The original said none of these are model bugs. That is stronger than the evidence supports. Model failures and system failures can coexist. The engineering point is that containment cannot depend on the model never being wrong.

## 15. The agent sees a representation.

14:30–15:30. This is the conceptual center of the talk. A responder sees telemetry about production. It can optimize that representation without improving what users experience. This is a design risk, not a universal claim about the reward function of every agent.

Preserve the original joke verbally: the agent does not attend the postmortem. The humans own the impact, so they need a view of what it observed, what it proposed, and what actually happened.

## 16. Autonomy is earned per action.

15:30–17:00. Click through the four levels, or use the overview to return here for Q&A. The levels belong to actions, not to a model or an entire product. A responder might read all allowed telemetry but only restart one known stateless service.

For approved actions, approval binds to exact target, parameters, and expiry. For autonomous actions, define the blast radius, retry budget, verification, and rollback. The printed slide shows the currently selected level; this note preserves the full explanation.

## 17. Build the boundary outside the model.

17:00–19:00. This is the concrete implementation takeaway for a developer conference. The model proposes; a separate policy boundary decides whether the operation may execute. A tool server or executor enforces scope, not just a natural-language instruction.

The audit record stores observable inputs, the proposed plan and concise rationale, authorization, tool calls, results, and verification. Do not rely on access to private model chain-of-thought. Treat telemetry and tool outputs as untrusted data. Bound retries, concurrency and execution time. Test failure of the verifier and rollback path.

A verifier must be independent of the metric the agent can alter. Include destructive verbs such as delete, scale-to-zero, and mute. A kill switch must revoke or stop execution, not merely stop generation.

## 18. What did the responder believe?

19:00–20:00. Ask teams to add this field to their incident review. Reconstruct the input, the hypothesis, the proposed action, the authority granted, and the observed result. A post-hoc explanation from the agent is not proof of its internal reasoning.

Close on the original principle: autonomy is a privilege the system earns. We can build useful responders by giving them a bounded job, recoverable actions, and independent evidence of success.

## 19. Let’s compare incident notes.

20:00 onward. The rehearsed core is about 20 minutes; allow 2–5 minutes for pauses and audience interaction, then questions. Useful prompts: Which action is safe enough to automate today? What evidence would allow the next level? Who can stop the executor?

Share the deck at https://navinpai.github.io/sre-fails-wad/. The closing slide includes a LinkedIn QR and a direct slides link.
