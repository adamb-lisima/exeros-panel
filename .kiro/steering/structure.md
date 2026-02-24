# Project Structure

## Top-Level Layout

```
src/
├── app/                    # Main application source
├── assets/                 # Static assets (SVGs, styles, audio, JS libs)
├── environments/           # Environment configs (dev, staging, prod)
├── iframe-api-docs/        # Iframe API docs sub-application
├── parent/                 # Parent shell sub-application
├── player/                 # Standalone player sub-application
├── types/                  # Global TypeScript type declarations
├── styles.scss             # Global styles entry point
└── polyfills.ts            # Browser polyfills
```

## Main Application (`src/app/`)

```
app/
├── const/                  # App-wide constants (routes, auth, dates, ranges)
├── core/                   # Core module: layout containers, interceptors, alerts
│   ├── alert/              # Global alert component
│   ├── authenticated-container/   # Layout shell for logged-in users (nav bar, top bar)
│   ├── unauthenticated-container/ # Layout shell for login/reset screens
│   └── interceptor/        # HTTP interceptors (auth, error, fleet-auth)
├── guard/                  # Route guards (AuthorizedGuard, UnauthorizedGuard)
├── model/                  # Shared TypeScript interfaces/types
├── screen/                 # Feature modules (one per route/page)
├── service/                # Application services
│   ├── http/               # Base HTTP service + domain-specific HTTP services
│   ├── iframe/             # Iframe communication service
│   ├── parent-communication/ # Parent window messaging
│   ├── theme/              # Theme loading service
│   ├── validation-errors/  # Form validation error handling
│   ├── version/            # App version service
│   └── web-socket/         # WebSocket service
├── shared/                 # Shared module: reusable components, directives, pipes
│   ├── component/          # Reusable UI components (buttons, charts, dialogs, controls, maps, video, etc.)
│   ├── directive/          # Custom directives
│   └── pipe/               # Custom pipes
├── store/                  # Global NgRx store modules
│   ├── alert/              # Alert state
│   ├── application/        # App-wide loading state
│   ├── auth/               # Authentication state
│   ├── common-objects/     # Shared domain objects (fleets tree, etc.)
│   ├── config/             # App configuration state
│   ├── download-task/      # Download task tracking
│   ├── iframe/             # Iframe state
│   ├── notification/       # Notification state
│   └── web-socket/         # WebSocket event state
└── util/                   # Utility functions (array, color, map, RxJS operators, routing, etc.)
```

## Feature Module Pattern (`src/app/screen/{feature}/`)

Each feature module follows a consistent structure:

```
{feature}/
├── {feature}-core/         # Main content area component(s)
├── {feature}-left/         # Left sidebar/panel component(s) (if applicable)
├── {feature}-top/          # Top bar component(s)
├── {feature}.actions.ts    # NgRx actions (object literal of createAction calls)
├── {feature}.effects.ts    # NgRx effects (Injectable class)
├── {feature}.guard.ts      # Route guard (handles init, data fetching, cleanup)
├── {feature}.model.ts      # Feature-specific TypeScript interfaces
├── {feature}.module.ts     # Angular module declaration
├── {feature}.reducer.ts    # NgRx reducer + state interface + initial state + FEATURE_KEY
├── {feature}.routing.ts    # Route definitions (exported as array)
├── {feature}.selectors.ts  # NgRx selectors (object literal of createSelector calls)
└── {feature}.service.ts    # HTTP service for the feature's API calls
```

## Key Architecture Patterns

- NgRx actions are defined as object literals (e.g., `VehiclesActions = { ... }`) not action classes
- NgRx selectors are defined as object literals (e.g., `VehiclesSelectors = { ... }`)
- Feature state is registered with `StoreModule.forFeature(FEATURE_KEY, reducer)` and `EffectsModule.forFeature([Effects])`
- Route guards handle data initialization on activate and cleanup on deactivate via Subscription management
- The layout uses named router outlets: default (core content), `left-menu`, `top-menu`
- HTTP services extend a base `HttpService` that wraps Angular's `HttpClient` with environment-aware URL resolution
- Services use `providedIn: 'root'` for singleton injection
- Shared components each have their own module (per-component module pattern)
- Effects use `concat` + `of()` pattern for loading state management (set loading true → fetch → set loading false)
- RxJS subscriptions must use `takeUntil` or `untilDestroyed` (enforced by ESLint)
