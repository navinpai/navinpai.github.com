# Autopsy of an Autonomous Incident — WeAreDevelopers India

**When the Agent Made It Worse** · Navin Pai, Director of Engineering, StackGen.

Nineteen slides with progressive solution reveals, eleven cases, five failure patterns, and a practical argument for earned autonomy.

## Event research

Checked against the organizer’s website on **24 November 2026**:

| Detail | Confirmed information |
| --- | --- |
| Event | WeAreDevelopers Conference India |
| Conference dates | 25–26 November 2026 |
| Venue | Bangalore International Exhibition Centre (BIEC), Bengaluru |
| Session | Autopsy of an Autonomous Incident: When the Agent Made It Worse |
| Speaker | Navin Pai · Director of Engineering · StackGen |
| Slot | Wednesday, 25 November, 11:30–12:00 IST |
| Room | Stage 1 — powered by IBM |
| Format | 30 minutes including Q&A |
| Audience | Developers, AI builders, platform engineers, and technical leaders |

Primary sources: [event](https://www.wearedevelopers.com/conference-india), [session](https://www.wearedevelopers.com/conference-india/agenda/sessions/autopsy-of-an-autonomous-incident-when-the-agent-made-it-worse-1294504), [schedule](https://www.wearedevelopers.com/conference-india/agenda/schedule), and [venue](https://www.wearedevelopers.com/conference-india/venue).

The published session promises a forensic walkthrough and concrete design changes. This adaptation makes each debrief a review of a boundary that developers can implement.

## Theme and talk plan

**The incident flight recorder.** Warm paper, charcoal, safety orange, large Geist typography, instrument labels, and custom diagrams. Case slides reconstruct observations, decisions, and consequences. Each case opens with its incident diagram. Advancing replaces the diagram with a dark solution panel: one key principle and three brief controls. Full debriefs and conceptual execution rules remain in speaker notes. Orange slides mark the opening promise and closing question. The recorder illustration and diagrams are SVG/CSS; fonts are local. This is a custom talk design, not an official organizer template.

| Slides | Narrative | Approximate time |
| --- | --- | --- |
| 1–4 | Opening question, the promise, and how to read the evidence | 2¼ minutes |
| 5–12 | Eight cases: problem first, then a concise solution reveal | 10 minutes |
| 13 | Three rapid-fire cases, then reveal their controls together | 1¼ minutes |
| 14–15 | Five patterns and the gap between telemetry and reality | 2 minutes |
| 16–17 | Autonomy levels and an enforceable execution architecture | 3½ minutes |
| 18–19 | Closing question and discussion | 1 minute, then Q&A |

Rehearse a **20-minute core**, allowing 2–5 minutes for pauses and audience participation. There are 19 numbered slides and 28 presentation steps: eight main case reveals plus one rapid-fire reveal. The shorter delivery comes from concise on-screen controls and treating the full debrief as optional discussion material, not simply from changing the slide count. [SPEAKER_NOTES.md](SPEAKER_NOTES.md) includes the revised timings and full explanations.

## Run and present

No build step or runtime dependency is needed. Open `index.html` directly, or serve the folder to synchronize a presenter window:

```sh
python3 -m http.server 3046 --bind 127.0.0.1 --directory sre-fails-wad
```

Then open `http://localhost:3046/`. Keep the slide window on the projector and press **P** to open a separate presenter window with notes, the next title, and a manually started timer. Navigation synchronizes between windows using `BroadcastChannel`. Use HTTP for dependable cross-window synchronization; `file:` origin restrictions vary by browser.

| Control | Action |
| --- | --- |
| Arrow keys, Space, Page Up/Down | Reveal a solution, then advance; going back first hides the solution |
| Home / End | First / last slide |
| G | Slide overview |
| P | Separate presenter window |
| F | Fullscreen |
| B / Escape | Blackout / restore |
| ? | Keyboard help |
| Horizontal swipe | Reveal / advance or hide / return |
| Click on the slide | Reveal / advance (links and interactive controls are excluded) |
| PDF button in the ? menu | Print 19 pages with solutions visible |

Each case starts on the problem with the solution hidden, including after a reload, an overview jump, or returning from another slide. The first advance reveals the control; the second moves to the next slide. Reveal state synchronizes between the audience and presenter windows. The slide view has no footer, navigation bar, or progress strip. Press **?** to open navigation and presentation actions; this menu includes the current slide and reveal state.

The autonomy diagram on slide 16 is interactive. All four buttons describe the permitted action and its required boundary; selection synchronizes with the presenter window. Hash links such as `#slide-17` open a particular slide. `?export` remains available for screenshots. Browser printing uses 16:9 pages and displays every solution, replacing the case diagram with its control panel. Enable background graphics and disable browser headers/footers.

## Evidence decisions

- **001 — AWS DNS:** checked against the [AWS post-event summary](https://aws.amazon.com/message/101925/). It was conventional automation, with a race between DNS enactors and cleanup. The approximately fifteen-hour duration describes the overall event; DynamoDB impact was roughly three hours.
- **002–004, 008–011:** retain their composite status and scenario details. Their numbers are story parameters, not production measurements or research statistics.
- **005 — backups, 006 — un-patching:** illustrative scenarios without a public incident attribution.
- **007 — Replit:** [Replit acknowledges deletion and full recovery](https://replit.com/blog/doubling-down-on-our-commitment-to-secure-vibe-coding). [Jason Lemkin’s account](https://www.saastr.com/replits-new-release-address-most-of-the-challenges-we-hit-vibe-coding-but-is-prosumer-vibe-coding-really-ready-for-commercial-apps-yet/) supplies record counts and the repeated code-freeze instructions. It was a coding-agent incident. The case title does not establish the agent’s intent. Details about fabricated records and self-rating remain qualified in the speaker notes, without asserting they followed the deletion in a verified sequence.
- Model failures can coexist with system failures; containment is a system design responsibility.
- Diagrams and policy snippets are explanatory reconstructions. They are not raw transcripts or executable policies. Suggested controls are the speaker’s recommendations. The audit record concerns observations, plans, authorization, tool actions, and outcomes, without depending on private model reasoning.

## Files and publication

- `index.html`: slide content, diagrams, source links, embedded notes.
- `deck.css`: theme, responsive scaling, presentation and print layouts.
- `deck.js`: navigation, overview, presenter synchronization, timer, and autonomy interaction.
- `assets/`: local fonts and their OFL licenses, existing LinkedIn QR, favicon.
- `SPEAKER_NOTES.md`: readable rehearsal notes.
- `slides.pdf`: exported 19-page deck for sharing or a presentation backup. Re-export after editing the HTML.

Validation covers hidden-first solutions, reveal/advance/back behavior, reload and overview resets, presenter reveal synchronization, responsive layouts, touch navigation, and PDF export with all controls visible. The LinkedIn QR was decoded and verified as `https://www.linkedin.com/in/navinpai/`.

Public deck URL: https://navinpai.github.io/sre-fails-wad/. GitHub Pages publishes this folder from the repository’s `master` branch.
