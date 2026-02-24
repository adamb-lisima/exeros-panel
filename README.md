# Vidematics - Exeros-panel

**Exeros Panel** is the client-side interface of a fleet management system designed to help users monitor, manage, and analyze vehicles, drivers, and companies within a given fleet. It provides a rich set of features aimed at improving operational efficiency, safety, and visibility over vehicle-related activities.

- [Project Overview](#about-the-project)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Testing & Linting](#testing--linting)
- [CI/CD environments](#cicd-environments)

---

## Project Overview

The application is organized into several modules:

- **Dashboard** – Displays key metrics for each fleet such as driving time, accident data, and alerts.
- **Fleet**
  - **Vehicles** – Provides detailed information about each vehicle in the fleet.
  - **Drivers** – Displays driver profiles, activities, and performance.
- **Analytics** – Offers visual insights and statistics based on fleet data using interactive charts.
- **Play / Playback**
  - **Play** – Live view of vehicle trips, including multi-camera support and real-time telematics data.
  - **Playback** – Allows reviewing recorded trips, downloading video segments, sharing clips (with optional password protection), and tagging events.
- **Events** – Lists automatically detected or manually created events. Users can escalate, mark as false positives, or review detailed event data including location and speed.
- **Reports** – Generate detailed reports on driver performance (including star-based ratings), mileage, events, and other metrics.
- **Map View** – Enables geospatial tracking of vehicles based on time range and location filters. Users can define custom areas on the map.
- **Settings**
  - Manage user profile, notifications, and access rights.
  - Assign users to fleets, roles, and permissions.
  - Manage drivers, score weightings, and auto-generated reports.
  - Admin tools for sending notices and managing shared clip email recipients.

---

## Tech Stack

This project uses the following technologies and tools:

- **Framework:** Angular 15
- **Language:** TypeScript
- **State Management:** NgRx
- **Styling:** Tailwind CSS, SCSS
- **Charts:** ApexCharts, D3.js
- **Real-Time:** Pusher, ngx-socket-io
- **Maps:** Google Maps API
- **Build Tool:** Angular CLI
- **Linting:** ESLint + Prettier
- **Testing:** Jasmine, Karma

---

## Requirements

Before you begin, make sure your system has:

- **Node.js** >= 18.x
- **npm** (or **Yarn**)
- **Angular CLI** (optional, recommended):
  Install globally if needed:
  ```bash
  node -v
  npm -v
  git --version
  ng version
  ```

For installation instructions, see the Getting Started
section.

---

## Configuration

### Basic Environment Setup

Environment variables are stored in:

```bash
  src/environments/
```

Available files:

- **environment.ts** – for local development

- **environment.staging.ts** – for staging

- **environment.prod.ts** – for production

Each file defines values like API_URL, feature flags, or third-party service keys.

### Build Commands

To build the project for different environments or modules:

Build Main Application (default)

```bash
  npm run build
```

Builds the main panel with the default development environment.

### Build for Production

```bash
  npm run build_prod
```

Build for Staging
npm run build_staging

Builds exeros-panel using the staging environment file and configuration.

### Build API Documentation Module

```bash
  npm run build:iframe-api-docs
```

Builds the iframe-based API documentation viewer.
Output: dist/exeros-panel-iframe-api-docs

### Build Parent Panel (optional)

```bash
  npm run build:parent
```

Builds the auxiliary parent shell used in some legacy or embedded scenarios.
Output: dist/exeros-panel-parent

### Build Standalone Player (optional)

```bash
  npm run build:player
```

Builds the video trip player for standalone use cases.
Output: dist/exeros-panel-player

Builds exeros-panel using the production configuration.
Optimized for deployment.

---

## Getting Started

### Run Main Application

To start the main app:

```bash
  npm run start
```

App will be available at:

http://localhost:4200

### Run API Documentation Module (iframe-based)

```bash
  npm run start:iframe-api-docs  # http://localhost:4203
```

Available at: http://localhost:4203

### Run Parent Panel (optional)

An auxiliary wrapper or shell around the main panel (used in some deployments):

```bash
  npm run start:parent
```

Available at: http://localhost:4201

### Run Standalone Player (optional)

Standalone video trip player – can be used outside main UI:

```bash
  npm run start:player
```
---

## Testing & Linting

### Unit tests

To run unit tests:

```bash
  npm run test
```

Runs tests using Karma and Jasmine.

### Linting

#### Run ESLint

To check your code for syntax and style issues:
Run ESLint:

```bash
  npm run lint
```

This uses ESLint with Angular-specific rules and plugins, including RxJS best practices.

#### Format Code with Prettier

To automatically format the codebase (according to Prettier config):

```bash
  npx prettier --write .
```

This will scan all project files and fix formatting issues such as indentation, spacing, quotes, etc.

## CI/CD environments:

The following scripts are used in CI/CD pipelines to prepare the environment before building the project:

```bash
  npm run ci:environemnt
```

This script generates a src/environments/environment.json file from environment variables passed via the CI environment (e.g. from GitHub Actions or GitLab CI).
It’s useful for injecting secrets or runtime config during automated builds.
