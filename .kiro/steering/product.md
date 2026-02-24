# Product Overview

Exeros Panel is a fleet management web application by Vidematics. It provides a dashboard for monitoring, managing, and analyzing vehicles, drivers, and companies within fleets.

## Key Modules

- Dashboard: Fleet-level KPIs (driving time, accidents, alerts)
- Vehicles: Per-vehicle details, trips, alarms, events, checks, accidents, live feed
- Drivers: Driver profiles, activity, performance
- Events: Auto-detected or manual events with escalation, false-positive marking, location/speed data
- Stream / Playbacks: Live multi-camera video, recorded trip playback, clip sharing, downloads
- Reports: Driver performance ratings, mileage, event reports with export
- Map View: Geospatial vehicle tracking with time-range filters and custom areas
- Leaderboard: Driver/fleet rankings
- Settings: User profiles, notifications, fleet/role/permission assignment, score weights, admin tools
- Guide: In-app documentation/help content

## Sub-Applications

The workspace contains multiple Angular applications sharing the same source root:

- `exeros-panel` (main app, port 4200)
- `exeros-panel-parent` (wrapper/shell for embedded deployments, port 4201)
- `exeros-panel-player` (standalone video trip player, port 4202)
- `exeros-panel-iframe-api-docs` (iframe API documentation viewer, port 4203)

## Domain Concepts

- Fleet: A group of vehicles managed together
- Vehicle: A tracked vehicle with cameras, GPS, telematics
- Driver: A person assigned to drive vehicles in a fleet
- Trip: A recorded journey with telemetry data
- Event: An incident (accident, alarm, speeding, etc.) detected by the system
- Live Feed: Real-time GPS and camera data from a vehicle's device
- Playback: Recorded video/telemetry review of a past trip
