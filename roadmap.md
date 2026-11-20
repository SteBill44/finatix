# Quick Wins Roadmap

## ArcX structure, Finatix styling (November 2026)
- [x] Adapt homepage ordering from the current ArcX reference without copying its design or claims.
- [x] Preserve April styling, unified exam links and existing functionality; verify both themes and mobile (1440/390; 201 tests passed).

## Unified platform redesign (November 2026)
- [ ] Audit public, account and learning interfaces and record findings.
- [ ] Establish new typography, neutral surfaces and refined shared controls.
- [ ] Rebuild homepage and navigation around the unified 16-exam catalogue.
- [ ] Redesign catalogue, exam shells, pricing and supporting pages.
- [ ] Carry identity through authentication, dashboard, practice and account screens without logic changes.
- [ ] Verify routes, filters, themes, motion, responsive layouts and existing tests; document limitations.

1. **Polish empty states**
   - Create shared `EmptyState` component
   - Apply to Dashboard, Certificates, Notifications, Flashcards, Referrals, Achievements, MasteryRadar, DashboardRedesigned

2. **Improve course discovery**
   - Add Case Study toggle, Free/Paid filter, Sort dropdown to Courses page
   - Add debounce to search input
   - Keep all filtering client-side (small catalog)

3. **Speed up purchase flow**
   - Add sticky mobile buy bar on CourseDetail
   - Add clearer value props above price
   - Keep existing desktop pricing card
4. **Theme embedded checkout** to match site (orange/charcoal)
5. **VAT inclusive pricing** - shown price is the final price, VAT inside

## Editorial redesign (Oct 2026)
- [x] Ethnocare-inspired editorial homepage rebuild (hero motif, levels journey, benefits, approach, case studies, FAQ, CTA)
- [x] Reusable animated perimeter-trace border for marketing buttons (CSS, asChild-safe, reduced-motion, focus, touch)
- [x] Extend type/button language to About, Start, Pricing, catalogue header
- [x] Verify 1920/1440/1024/390, light/dark, reduced motion, button states; tests/build
