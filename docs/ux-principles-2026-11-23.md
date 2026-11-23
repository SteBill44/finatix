# Finatix UX/UI psychology pass — 23 Nov 2026

## Audit summary
- Homepage had grown to 12 sections with overlapping messages (Why Finatix, Course includes, Platform) and placed the 16-exam directory sixth.
- An unused "Our Approach" component remained in the codebase.
- Dashboard greeting used gradient text and a generic "keep it up" line.
- Dashboard already resumes the last lesson, shows real progress and recent results; catalogue already groups four levels × four exams.

## Changes
- Homepage reordered: hero → facts → all 16 exams → where to start → what each course includes → platform → CIMA explainer → pillars → how it works → FAQ → final CTA.
- Removed the duplicate "Why Finatix" section; deleted the unused "Our Approach" component.
- Dashboard greeting: brand orange instead of gradient; points students to the resume card.

## Principles matrix
| # | Principle | Status | Where / what |
|---|---|---|---|
| 1 | Aesthetic-usability | Partly implemented | Fewer, consistent homepage sections; shared tokens kept |
| 2 | Proximity | Already satisfied | Exam directory groups each level with its four exams |
| 3 | Von Restorff | Already satisfied | One orange primary CTA per section; trace border on hover |
| 4 | Zeigarnik | Already satisfied | Dashboard "Current course" card resumes next lesson |
| 5 | Tesler's law | Already satisfied | Last lesson restored automatically; URL filters preserved |
| 6 | Prägnanz | Implemented | 4 levels × 4 exams surfaced early on homepage |
| 7 | Serial position | Implemented | Exam discovery moved to the top; CTA kept at the end |
| 8 | Progressive disclosure | Implemented | CIMA explainer/pillars moved below exam discovery; FAQ accordion |
| 9 | Common region | Already satisfied | Level groups and dashboard cards use shared containers |
| 10 | Goal-gradient | Already satisfied | Real lesson/quiz counts; no invented readiness % |
| 11 | Similarity | Already satisfied | Case studies styled like other exams |
| 12 | Recognition over recall | Already satisfied | Exam codes visible; recent results on dashboard |
| 13 | Pareto | Implemented | Finding an exam is now the first action after the hero |
| 14 | Occam's razor | Implemented | Removed duplicate section and dead "Our Approach" code |
| 15 | Parkinson's law | Not applied | No timers or deadlines added by design |
| 16 | Uniform connectedness | Already satisfied | Level rows connect levels to exams |
| 17 | Active user | Already satisfied | Free Certificate courses open without onboarding |
| 18 | Cognitive load | Implemented | One fewer section, less repeated copy |
| 19 | Default effect | Already satisfied | Theme and filters remembered; nothing paid preselected |
| 20 | Peak-end | Not changed this pass | Quiz results screen left as is |

## Validation
Unit tests and build run after changes (see commit). Not checked: full visual review of every page.

## Remaining opportunities
- Quiz results screen: clearer next action (peak-end).
- Per-course progress bars on the dashboard for goal-gradient.
- Breadcrumbs on lesson and quiz pages.
- Real study-time estimates once timing data exists.
