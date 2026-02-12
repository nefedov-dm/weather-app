# Weather App

A Vue 3 application for viewing weather data (historical and forecast) with a **Domain-Driven Design (DDD)** structure. Built with Vite, TypeScript, PrimeVue, and the Open-Meteo API.

---

## Architecture Overview

The project is organized around **modules** and follows a **layered DDD-style** layout: **domain** (entities, ports, services), **infrastructure** (implementations of ports), and **presentation** (UI components and compositions). The domain layer has no dependency on frameworks or external APIs; infrastructure and presentation depend on the domain.

### High-Level Structure

```
src/
├── app/                    # App shell, router
├── modules/
│   ├── core/               # Shared domain primitives
│   │   └── domain/result/  # Result type for error handling
│   └── weather/            # Weather feature module
│       ├── domain/         # Pure business logic
│       ├── infrastructure/ # External concerns (API, persistence)
│       └── presentation/   # Vue components and compositions
```

---

## Domain Layer

The **domain** is the heart of the module. It defines what the weather feature *is* and *does*, without referencing HTTP, Vue, or any specific UI or infrastructure.

### Entities (`domain/entities/`)

- **WeatherLocation** — latitude and longitude.
- **WeatherTimeframe** — start and end dates (ISO strings).
- **WeatherAggregation** — `daily` | `hourly`.
- **WeatherAggregationMetric** — metric per aggregation (e.g. `temperature_max`, `rain` for daily; `temperature`, `humidity`, `rain`, `wind_speed` for hourly).
- **WeatherData** — a single data point: date, value, unit.
- **WeatherDataset** — full dataset: aggregation, metric, location, timeframe, plus `historicalData` and `forecastData` arrays of `WeatherData`.

### Ports (`domain/ports/`)

- **IWeatherRepository** — port for fetching a weather dataset. It returns `Promise<Result<WeatherDataset<T>>>`, so success/error is explicit and type-safe.
- **WeatherFilters** — type describing the query: location, timeframe, aggregation, and aggregation metric (generic over aggregation type).

### Domain Service (`domain/service/`)

- **WeatherService** — application service that orchestrates use cases. It depends only on `IWeatherRepository` and delegates `getWeatherDataset` to the repository. All side effects (HTTP, etc.) stay behind the port.

### Result Pattern (`core/domain/result/`)

The **Result** type is used instead of throwing for expected failures:

- **Success**: `{ success: true, payload: P }`
- **Error**: `{ success: false, error: E }`

The repository returns `Result<WeatherDataset<T>>`; the presentation layer checks `result.success` and either uses `payload` or handles `error` (e.g. toast). This keeps error handling explicit and type-safe.

---

## Infrastructure Layer

Infrastructure implements domain ports and deals with external systems.

### WeatherRepository (`infrastructure/repository/weather-repository/`)

- Implements **IWeatherRepository**.
- Uses the **Open-Meteo** SDK to call:
  - Forecast API for future dates.
  - Historical Forecast API for past dates.
- Splits the requested timeframe into “historical” and “forecast” segments relative to “now”, then fetches both in parallel when needed.
- Maps API responses into domain entities (`WeatherData`, units, etc.) and returns `Result.success(dataset)` or `Result.error(message)` on failure.

All API and SDK details are confined to this layer; the domain only sees `WeatherFilters` and `WeatherDataset`.

---

## Presentation Layer

Presentation is the Vue 3 UI: components and composables that depend on the domain (and optionally on infrastructure for wiring).

### Compositions (`presentation/compositions/`)

- **useWeatherRepository** — creates the concrete `WeatherRepository` instance (wiring point; could be replaced with DI or a factory).
- **useWeatherService** — builds `WeatherService` with the repository from `useWeatherRepository` and exposes the service.
- **useWeatherDataset** — uses `useWeatherService()` and `@tanstack/vue-query` to:
  - Run `service.getWeatherDataset(filters)` when filters are defined.
  - Expose loading state and query result.
  - On `Result` error, show a PrimeVue toast; on success, the component uses `payload` as the dataset.

So: **domain** defines the contract and types; **infrastructure** implements the repository; **presentation** composes service + repository and connects them to the UI.

### Components (`presentation/components/`)

- **WeatherFilters** — location (lat/lon), timeframe (date range), aggregation (daily/hourly), aggregation metric. Emits a single `WeatherFilters` value when the user applies; the Apply button is disabled until the form is complete.
- **WeatherLocationFilter** — latitude/longitude inputs (v-model with `Partial<WeatherLocation>`).
- **WeatherTimeframeFilter** — date range picker; syncs with `WeatherTimeframe` (start/end dates).
- **WeatherAggregationFilter** — daily/hourly select.
- **WeatherAggregationMetricFilter** — metric select; options depend on aggregation and are disabled when aggregation is missing.
- **WeatherDatasetChart** — line chart (PrimeVue Chart) for historical + forecast series; shows skeleton when loading, placeholder when no filters/data.
- **WeatherDatasetTable** — table of the same dataset (date, value, type: historical/forecast).

The app composes these in **App.vue**: filters drive `useWeatherDataset`; the chart and table receive the same dataset and loading state.

---

## Data Flow Summary

1. User sets **WeatherFilters** in the UI and clicks Apply.
2. **App.vue** (or parent) holds the filters ref and passes it to **useWeatherDataset**.
3. **useWeatherDataset** calls **WeatherService.getWeatherDataset(filters)**.
4. **WeatherService** calls **IWeatherRepository.getDataset(filters)**.
5. **WeatherRepository** (infrastructure) calls Open-Meteo, maps to domain types, returns **Result&lt;WeatherDataset&gt;**.
6. **useWeatherDataset** handles the Result (toast on error, payload on success) and exposes the result to Vue Query.
7. **WeatherDatasetChart** and **WeatherDatasetTable** receive the dataset and loading flag and render.

Dependencies point **inward**: presentation → domain ← infrastructure. The domain does not import from infrastructure or presentation.

---

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 7**, **TypeScript**
- **PrimeVue 4** (UI components)
- **Vue Query (TanStack)** for server state
- **Open-Meteo** (forecast + historical forecast APIs)
- **Vitest** + **Vue Test Utils** for component tests

---

## Scripts

| Command       | Description                |
|--------------|----------------------------|
| `yarn dev`   | Start dev server           |
| `yarn build` | Type-check and production build |
| `yarn test`  | Run tests in watch mode    |
| `yarn test:run` | Run tests once          |
| `yarn test:ui`  | Open Vitest UI          |

---

## Notes from the Author (Test Assignment)

In this test assignment I did not cover a few things:

1. **Schema-based form validation for input** — I did not add Zod validation and PrimeVue Form, as there are some typing issues there and I did not want to spend time on it, the assignment being more about architecture. If required, I can implement a schema-validated form in `WeatherFilters.vue`.

2. **Error handling** is implemented in a formal way — mainly to demonstrate how the **Result** pattern works (repository returns `Result`, composition checks `success` and shows a toast on error). It is not a full error-handling strategy (e.g. retries, granular messages).

3. **Unit selection for aggregation metric** — I did not implement it to save time. That implementation would be similar to `WeatherAggregationMetric`: a list of available units per metric (e.g. °C vs °F for temperature, mm vs in for rain).

4. **Unit tests** — I have not implemented them yet, as the assignment was more about architecture. If required, I can add unit tests.

**P.S.** Some patterns and interfaces were intentionally simplified for this test assignment.
