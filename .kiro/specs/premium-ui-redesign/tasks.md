# Implementation Plan: Premium UI Redesign

## Overview

Incremental implementation of the Exeros Panel premium UI redesign. Foundation tokens and global styles are built first, then shared components, then screen-by-screen migrations. Each task builds on the previous so there is no orphaned code.

## Tasks

- [x] 1. Design System Foundation — Tokens, Typography, Spacing
  - [x] 1.1 Create the CSS custom properties token file with all color, surface, elevation, animation, and spacing tokens
    - Create `src/assets/styles/_tokens.scss` defining `:root` block with brand scale (50–900), neutral scale (0–950), semantic colors (success/error/warning/info 50+500), surface tokens, elevation tokens, animation duration/easing tokens, and spacing scale (space-1 through space-12)
    - Add `.dark` class block with dark-mode overrides for neutral, surface, and elevation tokens
    - Import `_tokens.scss` in `src/styles.scss`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 3.1, 3.3, 27.7_

  - [x] 1.2 Create typography token definitions and utility classes
    - Add typography CSS custom properties (--text-display through --text-overline) to `_tokens.scss`
    - Create `src/assets/styles/_typography.scss` with utility classes (.text-display, .text-heading-lg, etc.)
    - Consolidate Google Fonts import to a single `@import` for Poppins at weights 400, 500, 600 in `src/styles.scss`, removing duplicates
    - Import `_typography.scss` in `src/styles.scss`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.3 Update `tailwind.config.js` with new token mappings
    - Replace color config with `var()` references to CSS custom properties for brand, neutral, semantic, and surface tokens
    - Map spacing scale to `var(--space-N)` values
    - Map boxShadow to elevation token references
    - Add fontSize entries for the typography scale in `extend`
    - Set `darkMode: 'class'`
    - _Requirements: 2.5, 3.2, 4.1, 4.5_

  - [x] 1.4 Update Angular Material custom theme to use new token palette
    - Modify the Material theme SCSS to define primary palette from brand scale, warn palette from error tokens, accent palette from info tokens
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 1.5 Create global animation keyframes and utility classes
    - Add `src/assets/styles/_animations.scss` with `@keyframes shimmer` (1.5s infinite), `@keyframes spin` (0.75s linear infinite), and fade/scale keyframes
    - Define `.skeleton` base class with shimmer pseudo-element
    - Define `.btn-spinner` class with size variants
    - Import in `src/styles.scss`
    - _Requirements: 27.7, 28.1, 28.2, 28.4, 29.2_

- [x] 2. Checkpoint — Foundation tokens compile and Tailwind utilities work
  - Ensure the app compiles with the new token file, Tailwind config, Material theme, and animation SCSS. Ask the user if questions arise.

- [ ] 3. Legacy Color Migration
  - [ ] 3.1 Replace legacy color names with new semantic tokens across the codebase
    - Using the Legacy Color Migration Map from the design document, find and replace all occurrences of legacy color names (cultured, manatee, arsenic, chinese-silver, etc.) with their new semantic token equivalents in all SCSS, HTML, and TS files
    - Remove old color variable definitions from any existing SCSS variable files
    - _Requirements: 1.9, 31.1, 31.6_

  - [ ]* 3.2 Write unit tests verifying legacy color references are fully removed
    - Grep-based or snapshot test confirming zero occurrences of legacy color names in src/
    - _Requirements: 1.9_

- [ ] 4. Skeleton Loader Component
  - [ ] 4.1 Create SkeletonLoaderComponent with variants: card, table-row, chart, text-block
    - Create `src/app/shared/component/skeleton-loader/` with component, module, SCSS
    - Implement variant-specific placeholder shapes using the `.skeleton` base class and shimmer animation
    - Card variant: header block + body block + footer block; table-row variant: horizontal column blocks; chart variant: tall rectangular block; text-block variant: stacked line blocks
    - Use `OnPush` change detection
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 28.1, 28.2, 28.3, 28.4_

  - [ ]* 4.2 Write unit tests for SkeletonLoaderComponent
    - Test that each variant renders the correct placeholder structure
    - Test that shimmer animation class is applied
    - _Requirements: 9.1, 9.3_

- [ ] 5. Card Component
  - [ ] 5.1 Create CardComponent with variants: default, metric, chart, media
    - Create `src/app/shared/component/card/` with component, module, SCSS, and template
    - Implement `ng-content` projection slots for header, body, footer using `select` attributes
    - Apply `surface-raised` background and `elevation-sm` shadow by default
    - Implement hover state: elevation-md + translateY(-1px) over 200ms transition
    - Implement `loading` input that swaps projected content for SkeletonLoaderComponent
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 26.1_

  - [ ] 5.2 Create CardMetricComponent for the metric variant
    - Create sub-component in the card directory for displaying value, label, trend indicator (up/down arrow + percentage), and optional sparkline
    - _Requirements: 5.6_

  - [ ]* 5.3 Write unit tests for CardComponent
    - Test content projection slots render correctly
    - Test loading input shows skeleton loader
    - Test hover class application
    - _Requirements: 5.1, 5.3, 5.5_

- [ ] 6. Button Component
  - [ ] 6.1 Create ButtonComponent with variants: primary, secondary, ghost, destructive, icon-only
    - Create `src/app/shared/component/button/` with component, module, SCSS, and template
    - Implement size inputs: sm (32px), md (40px), lg (48px)
    - Primary variant: brand-500 background, white text; destructive: error-500 background; ghost: transparent background, brand-500 text; secondary: neutral-100 background, neutral-700 text
    - Implement loading state: inline spinner replacing text, pointer-events none, opacity 0.7, maintain width
    - Implement focus-visible ring: 2px solid brand-500 with 2px offset
    - Implement hover state: 10% darker background
    - Icon-only variant: square button with required `ariaLabel` input mapped to `aria-label`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 26.2, 26.3, 29.1, 29.2, 29.3, 29.4, 30.3_

  - [ ]* 6.2 Write unit tests for ButtonComponent
    - Test each variant renders correct styles
    - Test loading state shows spinner and disables pointer events
    - Test icon-only variant has aria-label
    - _Requirements: 6.1, 6.6, 6.8, 30.3_

- [ ] 7. Toast Component
  - [ ] 7.1 Create ToastComponent with variants: success, error, warning, info
    - Create `src/app/shared/component/toast/` with component, module, SCSS, and template
    - Implement variant-specific icons (checkmark, X-circle, triangle, info-circle) and semantic color backgrounds (e.g., success-50 bg + success-500 accent)
    - Implement auto-dismiss with configurable duration (default 5000ms) and progress bar showing remaining time
    - Implement slide-in animation (300ms from right) and slide-out (200ms to right) using `@angular/animations`
    - Implement manual close button
    - Set `role="status"` for info/success/warning and `role="alert"` for error variant
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 30.6_

  - [ ]* 7.2 Write unit tests for ToastComponent
    - Test auto-dismiss timer
    - Test manual close emits dismissed event
    - Test correct ARIA role per variant
    - _Requirements: 7.3, 7.7, 30.6_

- [ ] 8. Dialog Component
  - [ ] 8.1 Create DialogWrapperComponent with variants: informational, destructive
    - Create `src/app/shared/component/dialog-wrapper/` with component, module, SCSS, and template
    - Implement backdrop with blur(4px) effect
    - Implement scale-in (95%→100% over 200ms) and scale-out (100%→95% over 150ms) animations
    - Implement focus trap using CDK `cdkTrapFocus`
    - Implement Escape key close handler
    - Destructive variant: primary action button uses error-500; informational: brand-500
    - Set `aria-modal="true"`, manage focus to first focusable element on open, return focus to trigger on close
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 30.5_

  - [ ]* 8.2 Write unit tests for DialogWrapperComponent
    - Test focus trap is active when open
    - Test Escape key closes dialog
    - Test aria-modal attribute
    - _Requirements: 8.5, 8.6, 30.5_

- [ ] 9. Checkpoint — Shared components compile and render in isolation
  - Ensure all shared components (Skeleton, Card, Button, Toast, Dialog) compile without errors. Ask the user if questions arise.

- [ ] 10. Empty State Component
  - [ ] 10.1 Create EmptyStateComponent
    - Create `src/app/shared/component/empty-state/` with component, module, and template
    - Accept inputs: illustration (SVG/image path), heading, description, optional ctaLabel with ctaClick output
    - Use neutral-400 for heading, neutral-300 for description
    - Render primary ButtonComponent for CTA when ctaLabel is provided
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ]* 10.2 Write unit tests for EmptyStateComponent
    - Test CTA button renders only when ctaLabel is provided
    - Test ctaClick emits on button click
    - _Requirements: 10.1, 10.4_

- [ ] 11. Badge, Tag, and Count Badge Components
  - [ ] 11.1 Create BadgeComponent with status variants: online, offline, warning
    - Create `src/app/shared/component/badge/` with component and module
    - Render 8px colored dot + text label; online=success-500, offline=neutral-400, warning=warning-500
    - _Requirements: 11.1, 11.2, 11.5, 30.2_

  - [ ] 11.2 Create TagComponent for category labels
    - Create `src/app/shared/component/tag/` with component and module
    - Render as rounded pill with tinted background and matching text color, accepting a `color` input
    - _Requirements: 11.3_

  - [ ] 11.3 Create CountBadgeComponent for numeric indicators
    - Create `src/app/shared/component/count-badge/` with component and module
    - Render numeric value in a small circle
    - _Requirements: 11.4_

  - [ ]* 11.4 Write unit tests for Badge, Tag, and CountBadge
    - Test Badge renders dot + label for each status
    - Test Tag renders pill with custom color
    - Test CountBadge displays count value
    - _Requirements: 11.1, 11.3, 11.4_

- [ ] 12. Tabs Component
  - [ ] 12.1 Create TabsComponent with underline and pill variants
    - Create `src/app/shared/component/tabs/` with component, module, SCSS, and template
    - Underline variant: bottom border indicator on active tab using brand-500
    - Pill variant: rounded pill shape, active tab uses brand-50 background + brand-500 text
    - Support optional CountBadgeComponent on each tab label
    - Implement content crossfade animation (200ms) on tab change
    - Implement keyboard navigation: arrow keys to move, Enter/Space to activate
    - Set `role="tablist"` on container, `role="tab"` on each tab with `aria-selected`, `role="tabpanel"` on content
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 30.4_

  - [ ]* 12.2 Write unit tests for TabsComponent
    - Test keyboard navigation (arrow keys, Enter/Space)
    - Test ARIA roles and aria-selected state
    - Test tab change emits tabChange event
    - _Requirements: 12.6, 30.4_

- [ ] 13. Checkpoint — All shared components complete
  - Ensure Skeleton, Card, Button, Toast, Dialog, EmptyState, Badge, Tag, CountBadge, and Tabs components all compile and their modules export correctly. Ask the user if questions arise.

- [ ] 14. Navigation Sidebar Redesign
  - [ ] 14.1 Restructure the navigation sidebar in `authenticated-container`
    - Update the sidebar component in `src/app/core/authenticated-container/` to support collapsed (64px) and expanded (240px) states with 250ms ease-in-out width animation
    - Group navigation items into sections: Overview (Dashboard), Fleet Operations (Fleets, Live Stream), Safety & Events (Events), Analytics & Reports (Analytics, Reports, Leaderboard), Monitoring (Map View)
    - Display section group headers and visual dividers when expanded
    - Show only icons with tooltip labels when collapsed
    - Pin Settings, User Profile, and Logout at the bottom, separated from main groups
    - Rename "Play" label to "Live Stream" and clarify "Analytics" vs "Fleets" labels
    - Add collapse/expand toggle button (min 32px × 32px)
    - Set `nav` landmark with `aria-label="Main navigation"`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 13.10, 30.7_

  - [ ]* 14.2 Write unit tests for navigation sidebar
    - Test collapsed/expanded state toggling
    - Test section grouping renders correct items
    - Test aria-label on nav element
    - _Requirements: 13.1, 13.2, 30.7_

- [ ] 15. Global Focus Ring and Interaction State Styles
  - [ ] 15.1 Add global `:focus-visible` styles for all interactive elements
    - Add a global SCSS rule in `src/assets/styles/_interactions.scss` applying 2px solid brand-500 outline with 2px offset on `:focus-visible` for buttons, links, inputs, tabs, and nav items
    - Ensure `:focus:not(:focus-visible)` removes the outline so mouse clicks don't show the ring
    - Import in `src/styles.scss`
    - _Requirements: 26.3, 26.4, 30.8_

  - [ ] 15.2 Add global hover state utilities
    - Define hover transition utilities for card elevation lift and button background darkening in `_interactions.scss`
    - _Requirements: 26.1, 26.2_

  - [ ] 15.3 Add route transition fade-in animation
    - Add a fade-in animation (200ms) on route changes in the main router outlet area of `authenticated-container`
    - _Requirements: 27.1_

  - [ ] 15.4 Add staggered card fade-in animation utility
    - Create a CSS utility class for staggered fade-in with 50ms delay between siblings, usable on card grid containers
    - _Requirements: 27.3_

- [ ] 16. Checkpoint — Navigation and interaction states complete
  - Ensure the sidebar restructure compiles, focus ring styles apply globally, and route transitions work. Ask the user if questions arise.

- [ ] 17. Login Screen Redesign
  - [ ] 17.1 Update the login screen layout in `unauthenticated-container`
    - Modify `src/app/core/unauthenticated-container/` to use a full-width split layout: brand visual panel (left) + login form (right)
    - Brand panel: display Exeros/Vidematics branding with brand color scale background
    - Center the login form vertically and horizontally in its half
    - Use the redesigned ButtonComponent for the submit action
    - Apply focus-visible ring on form inputs
    - Display inline error message below fields using error-500 on failed login
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 24.1, 31.5_

- [ ] 18. Dashboard Screen Redesign
  - [ ] 18.1 Update the dashboard screen to use new Card and Skeleton components
    - Modify `src/app/screen/dashboard/` core component to use a responsive CSS grid layout (remove fixed pixel heights like h-[340px], h-[550px], h-[696px])
    - Replace existing KPI display with CardComponent metric variant + CardMetricComponent (value, label, trend, sparkline)
    - Add optional time-range selector dropdown in card headers
    - Use CardComponent chart variant for chart sections with aspect-ratio-based sizing
    - Replace loading spinners with SkeletonLoaderComponent (card and chart variants)
    - Apply staggered card fade-in animation
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 23.1, 31.2_

  - [ ]* 18.2 Write unit tests for dashboard screen redesign
    - Test that skeleton loaders display during loading state
    - Test that KPI cards render metric variant with correct data bindings
    - _Requirements: 15.2, 15.5_

- [ ] 19. Vehicle List Screen Redesign
  - [ ] 19.1 Update the vehicle list screen with card-style rows and status badges
    - Modify `src/app/screen/vehicles/` list component to render each vehicle as a card-style row with BadgeComponent (online/offline/warning)
    - Add sort dropdown (name, status, last activity)
    - Refine filter bar with styled filter chips
    - Replace loading state with SkeletonLoaderComponent table-row variant
    - Show EmptyStateComponent when no vehicles match filters, with a clear-filters CTA
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 23.1_

- [ ] 20. Vehicle Detail Screen Redesign
  - [ ] 20.1 Update the vehicle detail screen layout
    - Modify `src/app/screen/vehicles/` detail component to use responsive layout (remove fixed pixel widths for side panels)
    - Add full-width hero section with vehicle name, status Badge, and key metadata
    - Enlarge the live camera feed viewport area
    - Wrap each content section (trips, alarms, events, checks) in CardComponent
    - Replace loading state with SkeletonLoaderComponent matching section layouts
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 23.1_

- [ ] 21. Events Screen Redesign
  - [ ] 21.1 Update the events screen with status badges and expandable rows
    - Modify `src/app/screen/events/` core component to render events table with BadgeComponent for severity/state
    - Implement collapsible inline detail sections with 200ms expand animation
    - Replace loading state with SkeletonLoaderComponent table-row variant
    - Show EmptyStateComponent when no events match filters
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 23.1_

- [ ] 22. Stream Screen Redesign
  - [ ] 22.1 Update the stream screen with floating search panel and slide-in vehicle panel
    - Modify `src/app/screen/stream/` (or equivalent playback/live screen) to add a floating frosted-glass search panel with backdrop-filter blur(8px) and semi-transparent background
    - Implement slide-in vehicle detail panel from right edge (300ms animation) on vehicle selection
    - Rename any "Play" labels to "Live Stream"
    - Replace loading state with SkeletonLoaderComponent for the video area
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 23.1_

- [ ] 23. Reports Screen Redesign
  - [ ] 23.1 Update the reports screen with consistent chart cards and responsive grid
    - Modify `src/app/screen/reports/` (or equivalent) to use CardComponent chart variant for all chart sections with aspect-ratio-based heights
    - Add date range picker in each card header
    - Use responsive grid layout
    - Replace loading state with SkeletonLoaderComponent chart variant
    - Show EmptyStateComponent within card body when no data for selected range
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 23.1_

- [ ] 24. Map View Screen Redesign
  - [ ] 24.1 Update the map view with full-bleed layout and floating toolbar
    - Modify `src/app/screen/map/` (or equivalent) to render map as full-bleed element occupying all available viewport space
    - Add floating vertical toolbar on left side with map controls (zoom, layers, areas) using surface-overlay background + elevation-md shadow
    - Remove fixed-width left panels constraining the map
    - Implement compact info card overlay near marker on vehicle marker click
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5_

- [ ] 25. Checkpoint — Screen migrations complete
  - Ensure all migrated screens (Login, Dashboard, Vehicles, Events, Stream, Reports, Map) compile and render with new components. Ask the user if questions arise.

- [ ] 26. Settings Screen Redesign
  - [ ] 26.1 Update the settings screen with two-column layout and grouped sidebar
    - Modify `src/app/screen/settings/` to replace horizontal scrolling tab bar with a two-column layout: left sidebar listing section groups (Account, Fleet Management, Notifications, Administration) + right content area
    - Highlight active section with brand-50 background
    - On section group selection, display corresponding settings content in right area
    - _Requirements: 22.1, 22.2, 22.3, 22.4, 22.5_

- [ ] 27. Error and Success Interaction States
  - [ ] 27.1 Implement global error and success feedback patterns
    - Wire API error responses to display error ToastComponent (auto-dismiss 5s) via the existing alert/notification store
    - Wire successful actions to display success ToastComponent with checkmark icon
    - Implement inline form field error messages using error-500 color
    - Create a full-page error illustration component for 404/500 states with heading, description, and retry/home CTA using EmptyStateComponent pattern
    - Implement success flash: brief success-50 background tint (600ms) on saved elements
    - _Requirements: 24.1, 24.2, 24.3, 24.4, 25.1, 25.2_

- [ ] 28. Legacy Loading Spinner Removal
  - [ ] 28.1 Remove the legacy gray overlay spinning-dots loader
    - Find and remove all CSS related to the legacy spinning-dots loader across the codebase
    - Replace all usages with the appropriate SkeletonLoaderComponent variant
    - _Requirements: 9.6, 23.3, 23.4_

- [ ] 29. Visual Consistency and Polish Pass
  - [ ] 29.1 Audit and normalize border radii, shadows, and spacing across all components and screens
    - Ensure all components use consistent border-radius values (from token system), shadow depths (elevation tokens), and spacing (space tokens)
    - Verify brand color is used sparingly for emphasis/CTAs while neutral tones dominate content areas
    - Ensure all iconography and typography follow the single visual style from the design system
    - Verify all interaction states (loading, empty, error, success) are styled — no raw/unstyled states remain
    - _Requirements: 31.1, 31.2, 31.3, 31.4, 31.6, 31.7, 31.8_

  - [ ] 29.2 Verify accessibility compliance across all new components
    - Confirm all text-on-background combinations meet WCAG 2.1 AA contrast minimums (4.5:1 normal, 3:1 large)
    - Confirm color is never the sole means of conveying information (all badges have text labels, all status indicators have icons)
    - Verify aria-label on all icon-only buttons, aria roles on tabs/dialogs/toasts/nav
    - _Requirements: 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8_

- [ ] 30. Final Checkpoint — Full build and visual review
  - Ensure the full application compiles (`npm run build`), all tests pass (`npm run test`), and no legacy color names or spinning-dots references remain. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation after each major phase
- Foundation tokens (tasks 1–2) must be completed before any component or screen work
- Shared components (tasks 4–13) must be completed before screen migrations (tasks 17–26)
- The legacy color migration (task 3) can run in parallel with component creation
