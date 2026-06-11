# From Shadow MCP to Sanctioned MCP: Building an Enterprise Agent Governance Program

**MCP Dev Summit Mumbai — Mon June 15, 2026, 12:00–12:25pm IST, Lotus 3**
Navin Pai (StackGen) & Archana Rajkumar (SentinelOne)
20 min talk + 5 min Q&A — 10 slides, ~2 min/slide

**Positioning:** Two orgs on opposite ends of the spectrum — a lean startup building
the future of Agentic Ops, and a massive AI-native public company in one of the most
scrutinized industries on earth — facing the same critical question: *how should we
think about securing and governing what agents do, and what they're allowed to do?*
Spoiler: the governance primitives both converged on are shockingly similar.

**This is NOT a tool talk.** Tools appear only as evidence of convergence. The talk
sells a way of *thinking* about governance of MCP specifically and agents in general.

**Narrative arc:** Problem → Why it's harder than you think → A way to think about it
(maturity model) → Proof it works (two-org convergence) → How to start Monday.

---

## Slide 1 — Cold open: "You already have an MCP problem" (2 min, both)

- No agenda slide. Open with the two-ends-of-the-spectrum framing: Navin (lean
  startup, AgenticOps, velocity is existential) + Archana (AI-native public security
  company, among the most scrutinized industries on earth).
- Landing stat: ~2,000 MCP servers found on the public internet; every sampled one
  answered `tools/list` with zero auth (Knostic, 2025). 79% of IT leaders have found
  agents deployed by non-IT staff.
- Line: "We're not here to scare you with demos. We both had to answer the same
  question for very different bosses: *what are our agents allowed to do, and how do
  we know?*"

## Slide 2 — The 2025–26 incident reel: not hypothetical anymore (2 min)

Rapid-fire timeline, one line each:
- Asana MCP cross-tenant leak — ~1,000 customers (Jun 2025)
- mcp-remote RCE, CVE-2025-6514 — 437k downloads (Jul 2025)
- postmark-mcp — first malicious MCP server in the wild; one line of code BCC'd
  every email (Sep 2025)
- OpenClaw — 21,000+ internet-exposed agent instances (Jan–Feb 2026)
- NSA publishes an MCP security advisory (May 2026)

Pivot line: **every one of these passed auth.** Valid tokens, "approved" servers.

## Slide 3 — Thesis: auth + policy checks are necessary but not sufficient (2 min)

- Why per-call enforcement isn't governance: rug pulls (tool definitions mutate
  *after* approval), confused deputy, instructions-vs-data indistinguishable to
  LLMs, multi-agent chains with no cross-agent visibility (only ~24% of orgs know
  which agents talk to each other — Gravitee 2026).
- The mental shift: stop asking "*is this tool call allowed?*" → start asking
  "*do we have a system that knows what's running, what it can do, and what it
  did?*" Governance is a **program**, not a checkpoint.

## Slide 4 — We've seen this movie before (2 min)

- Shadow MCP is shadow IT / shadow SaaS replayed — and that playbook is known:
  discover → catalog → broker → monitor (the CASB arc). Same for API sprawl →
  gateways + catalogs.
- What's *genuinely new* with agents (don't oversell the analogy):
  non-deterministic callers; capabilities that mutate at runtime; identity that is
  neither user nor service; blast radius of natural-language input.
- Earns trust with skeptics: "you don't need a new religion, you need to adapt one
  you already practice."

## Slide 5 — The maturity model (3 min — core artifact, give it room)

Five stages, each defined by the *question you can answer*:

| Stage | Name | The question you can answer |
|-------|------|------------------------------|
| 0 | **Shadow** | "We have no idea what's running." (anti-pattern: denial) |
| 1 | **Visibility** | "We know every agent, MCP server, and connection." Inventory first, always. |
| 2 | **Identity** | "Every agent and tool call is attributable." Agents get their own identity — not a borrowed human token, not a shared service account. |
| 3 | **Policy** | "Every tool call passes a deterministic check." One policy source of truth; allowlists/registries; scoped grants; approval for high-blast-radius actions — enforced at every boundary, not at one box. |
| 4 | **Audit & assurance** | "We can prove to anyone — auditor, regulator, incident responder — what any agent did and why it was allowed." |

Honest caveat: stages overlap; you never "finish" Stage 1.

## Slide 6 — View from the startup (Navin, 2.5 min)

- Constraint: zero dedicated security headcount; governance can't cost velocity —
  "if sanctioned takes weeks, developers route around it; if it takes 5 minutes,
  they use it."
- What worked at the lean end:
  - Defaults over gates — a curated internal registry as the *easy path*.
  - One place where policy is *defined* (config, not code) — even when enforcement
    lives in several places (gateway for remote servers, managed client config for
    local ones).
  - Audit logging from day one — retrofitting is the expensive part.
- [TODO: real StackGen war story / numbers — e.g., what the first scan found]

## Slide 7 — View from the enterprise (Archana, 2.5 min)

- Constraint: scrutiny — customers, auditors, regulators. An AI-native security
  company is both the defender and the most attractive target. Forrester 2026:
  a major breach will be attributed to an AI agent.
- What worked at the heavy end:
  - Tiering agents by blast radius — Gartner explicitly warns one-size-fits-all
    agent governance backfires.
  - Breakglass paths so governance survives incidents.
  - Mapping the program to frameworks (OWASP Agentic Top 10, NIST AI RMF) so
    compliance comes for free.
- [TODO: SentinelOne-side specifics from Archana]

## Slide 8 — The spoiler: we converged ⚡ (2 min, both)

Side-by-side: two wildly different orgs, same five primitives:

1. **One control plane: centralized policy, distributed enforcement.** A single
   source of policy truth — enforced at every boundary: network gateway for remote
   MCP servers, managed client config for IDE/desktop agents, sandbox/container
   wrappers for local stdio servers, sidecars in k8s.
2. **Deterministic policy at the tool-call boundary** — checks are code/config,
   never prompts.
3. **First-class agent identity** — short-lived, scoped, attributable.
4. **Append-only audit tied to identity + policy decision.**
5. **A curated registry / allowlist** as the paved road.

**The 20-second inoculation beat (deliver head-on):** "When we say centralize, we
mean centralize *policy*, not *traffic*. We've all seen the ESB movie — the gateway
that sees everything is also the gateway that breaks everything. This is the same
resolution service mesh and zero trust reached: one control plane, many enforcement
points. And for MCP it's not even optional — stdio servers run as local subprocesses
inside IDEs; no network gateway will ever see them." (Callback to slide 4.)

External validation: PolicyLayer, Microsoft's agent-governance-toolkit, Cloudflare,
Kong, IBM ContextForge, LiteLLM — all *federated* enforcement around a central
registry/policy store, not one mega-proxy. "When a startup, a public security
company, Microsoft, and a half-dozen vendors independently build the same
architecture, it's not coincidence — it's the shape of the problem."

## Slide 9 — What's still unsolved (1.5 min)

- No cryptographic signing in the MCP spec — allowlists are name-based; registry
  signing/attestation is the next frontier.
- Agent-to-agent chains; sampling-based injection (Unit 42, 2026).
- Standards still catching up: NIST agent interoperability profile due Q4 2026;
  India's lightweight AI Governance Guidelines (MeitY, Nov 2025) — local hook;
  EU AI Act high-risk deadlines slipping to Dec 2027.
- Thinking point: "Buy or build, your *model* has to outlive your tools."

## Slide 10 — Start Monday + CTA (1.5 min)

- Crawl-walk-run, one line per stage:
  - **This week** — inventory (scan configs; you'll find surprises).
  - **This month** — registry + allowlist as the paved road.
  - **This quarter** — control plane + agent identity.
  - **This year** — audit you'd show a regulator.
- Maturity model as downloadable one-pager / QR code.
- "If you're in the same boat and want to share notes, come find us." → 5 min Q&A.

---

## Open items

1. Speaker split: alternating slides 6/7 vs. more interleaving throughout?
2. Real StackGen war story + numbers for slide 6; SentinelOne specifics for slide 7.
3. Name the maturity model? Candidate: "Shadow → Seen → Named → Governed → Proven."

## Key sources (for citations / further digging)

- Knostic — Mapping MCP servers: https://www.knostic.ai/blog/mapping-mcp-servers-study
- Asana MCP leak: https://www.bleepingcomputer.com/news/security/asana-warns-mcp-ai-feature-exposed-customer-data-to-other-orgs/
- CVE-2025-6514 (mcp-remote RCE): https://jfrog.com/blog/2025-6514-critical-mcp-remote-rce-vulnerability/
- postmark-mcp backdoor: https://www.koi.ai/blog/postmark-mcp-npm-malicious-backdoor-email-theft
- OpenClaw exposure: https://www.kaspersky.com/blog/openclaw-vulnerabilities-exposed/55263/
- NSA CSI on MCP Security (May 2026): https://www.nsa.gov/Portals/75/documents/Cybersecurity/CSI_MCP_SECURITY.pdf
- Supabase "lethal trifecta": https://simonwillison.net/2025/Jul/6/supabase-mcp-lethal-trifecta/
- Invariant Labs — GitHub MCP toxic agent flow: https://invariantlabs.ai/blog/mcp-github-vulnerability
- Unit 42 — MCP sampling attack vectors: https://unit42.paloaltonetworks.com/model-context-protocol-attack-vectors/
- PolicyLayer: https://policylayer.com/
- Microsoft agent-governance-toolkit: https://github.com/microsoft/agent-governance-toolkit
- Microsoft Agentic AI Maturity Model (Governance & Security): https://learn.microsoft.com/en-us/agents/adoption-maturity-model/maturity-model-security-governance
- OWASP Top 10 for Agentic Applications 2026: https://genai.owasp.org/2025/12/09/owasp-genai-security-project-releases-top-10-risks-and-mitigations-for-agentic-ai-security/
- OWASP MCP Top 10: https://owasp.org/www-project-mcp-top-10/
- CSA MAESTRO: https://cloudsecurityalliance.org/blog/2025/02/06/agentic-ai-threat-modeling-framework-maestro
- Cloudflare MCP Server Portals: https://blog.cloudflare.com/zero-trust-mcp-server-portals/
- Claude Code managed MCP: https://code.claude.com/docs/en/managed-mcp
- ToolHive (Stacklok): https://github.com/stacklok/toolhive
- GitHub internal MCP registry/allowlist: https://github.blog/changelog/2025-09-12-internal-mcp-registry-and-allowlist-controls-for-vs-code-insiders/
- India AI Governance Guidelines (MeitY, Nov 2025): https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc2025115685601.pdf
- OTel GenAI/MCP semantic conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/mcp/
- Gartner Agentic AI Hype Cycle 2026: https://www.gartner.com/en/articles/hype-cycle-for-agentic-ai
- Qualys — MCP Servers: The New Shadow IT: https://blog.qualys.com/product-tech/2026/03/19/mcp-servers-shadow-it-ai-qualys-totalai-2026
