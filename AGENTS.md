# Front-end architecture
- Build public exam discovery from `PAPERS` through `examPresentation`; the same four groups must drive homepage and navigation so all sixteen exams retain canonical destinations.
- Use `Layout` route classes for marketing versus study surfaces; shared tokens and controls connect both without ornamental effects in learning or admin interfaces.
- Keep sales readiness and enrolment decisions in existing hooks/handlers; redesign presentation only, never infer access from marketing catalogue membership.
- Marketing Button `trace` uses a measured decorative SVG inside the existing Slot child; preserve forwarded refs and a single interactive element so links and buttons share an accurately rounded perimeter.
- Keep initial content visible and use native scrolling; route transitions must respect reduced motion and never hide content captured for prerendering.
- Keep homepage section composition independent of theme and business logic; structural references may reorder reusable sections without replacing visual tokens, catalogue data or guarded actions.
