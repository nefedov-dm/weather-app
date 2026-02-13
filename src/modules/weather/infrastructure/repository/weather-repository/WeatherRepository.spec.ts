import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Unit } from '@openmeteo/sdk/unit';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';

import { WeatherRepository } from './WeatherRepository';

const mockFetchWeatherApi = vi.fn();

vi.mock('openmeteo', () => ({
  fetchWeatherApi: (...args: unknown[]) => mockFetchWeatherApi(...args),
}));

const FIXED_NOW = new Date('2025-02-05T12:00:00.000Z');

function createMockApiResponse(opts: {
  aggregation: 'daily' | 'hourly';
  unixTimeStart: number;
  intervalSeconds: number;
  count: number;
  values: number[];
  unit?: Unit;
}) {
  const { aggregation, unixTimeStart, intervalSeconds, count, values, unit = Unit.celsius } = opts;
  const timeEnd = unixTimeStart + count * intervalSeconds;

  const variablesWithTime = {
    time: () => BigInt(unixTimeStart),
    timeEnd: () => BigInt(timeEnd),
    interval: () => intervalSeconds,
    variables: (index: number) =>
      index === 0
        ? {
            valuesArray: () => new Float32Array(values),
            unit: () => unit,
          }
        : null,
  };

  return {
    daily: () => (aggregation === 'daily' ? variablesWithTime : null),
    hourly: () => (aggregation === 'hourly' ? variablesWithTime : null),
  };
}

describe('Weather | Infrastructure | WeatherRepository', () => {
  const location = { latitude: 55.75, longitude: 37.62 };

  beforeEach(() => {
    vi.useFakeTimers({ now: FIXED_NOW });
    mockFetchWeatherApi.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('when timeframe is entirely in the past, calls only historical API and returns success', async () => {
    const filters: WeatherFilters<typeof WeatherAggregation.daily> = {
      aggregation: WeatherAggregation.daily,
      aggregationMetric: 'temperature_max',
      location,
      timeframe: { startDate: '2025-02-01', endDate: '2025-02-04' },
    };

    const unixStart = Math.floor(new Date('2025-02-01').getTime() / 1000);
    mockFetchWeatherApi.mockResolvedValue([
      createMockApiResponse({
        aggregation: 'daily',
        unixTimeStart: unixStart,
        intervalSeconds: 86400,
        count: 1,
        values: [5],
      }),
    ]);

    const repo = new WeatherRepository();
    const result = await repo.getDataset(filters);

    expect(result.success).toBe(true);
    expect(mockFetchWeatherApi).toHaveBeenCalledTimes(1);
    expect(mockFetchWeatherApi).toHaveBeenCalledWith(
      'https://historical-forecast-api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        latitude: location.latitude,
        longitude: location.longitude,
        start_date: '2025-02-01',
        end_date: '2025-02-04',
      }),
    );
    if (result.success) {
      expect(result.payload.historicalData.length).toBeGreaterThan(0);
      expect(result.payload.forecastData).toEqual([]);
    }
  });

  it('when timeframe is entirely in the future, calls only forecast API and returns success', async () => {
    const filters: WeatherFilters<typeof WeatherAggregation.daily> = {
      aggregation: WeatherAggregation.daily,
      aggregationMetric: 'temperature_max',
      location,
      timeframe: { startDate: '2025-02-06', endDate: '2025-02-10' },
    };

    const unixStart = Math.floor(new Date('2025-02-06').getTime() / 1000);
    mockFetchWeatherApi.mockResolvedValue([
      createMockApiResponse({
        aggregation: 'daily',
        unixTimeStart: unixStart,
        intervalSeconds: 86400,
        count: 1,
        values: [8],
      }),
    ]);

    const repo = new WeatherRepository();
    const result = await repo.getDataset(filters);

    expect(result.success).toBe(true);
    expect(mockFetchWeatherApi).toHaveBeenCalledTimes(1);
    expect(mockFetchWeatherApi).toHaveBeenCalledWith(
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        latitude: location.latitude,
        longitude: location.longitude,
        start_date: '2025-02-06',
        end_date: '2025-02-10',
      }),
    );
    if (result.success) {
      expect(result.payload.forecastData.length).toBeGreaterThan(0);
      expect(result.payload.historicalData).toEqual([]);
    }
  });

  it('when timeframe spans "now", calls both APIs and returns historical + forecast', async () => {
    const filters: WeatherFilters<typeof WeatherAggregation.daily> = {
      aggregation: WeatherAggregation.daily,
      aggregationMetric: 'temperature_max',
      location,
      timeframe: { startDate: '2025-02-01', endDate: '2025-02-10' },
    };

    const historicalUnix = Math.floor(new Date('2025-02-01').getTime() / 1000);
    const forecastUnix = Math.floor(FIXED_NOW.getTime() / 1000);
    mockFetchWeatherApi
      .mockResolvedValueOnce([
        createMockApiResponse({
          aggregation: 'daily',
          unixTimeStart: historicalUnix,
          intervalSeconds: 86400,
          count: 1,
          values: [3],
        }),
      ])
      .mockResolvedValueOnce([
        createMockApiResponse({
          aggregation: 'daily',
          unixTimeStart: forecastUnix,
          intervalSeconds: 86400,
          count: 1,
          values: [7],
        }),
      ]);

    const repo = new WeatherRepository();
    const result = await repo.getDataset(filters);

    expect(result.success).toBe(true);
    expect(mockFetchWeatherApi).toHaveBeenCalledTimes(2);
    expect(mockFetchWeatherApi).toHaveBeenNthCalledWith(
      1,
      'https://api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        start_date: '2025-02-05',
        end_date: '2025-02-10',
      }),
    );
    expect(mockFetchWeatherApi).toHaveBeenNthCalledWith(
      2,
      'https://historical-forecast-api.open-meteo.com/v1/forecast',
      expect.objectContaining({
        start_date: '2025-02-01',
        end_date: '2025-02-04',
      }),
    );
    if (result.success) {
      expect(result.payload.historicalData.length).toBeGreaterThan(0);
      expect(result.payload.forecastData.length).toBeGreaterThan(0);
    }
  });

  it('maps API response to WeatherData (date, value, unit)', async () => {
    const filters: WeatherFilters<typeof WeatherAggregation.daily> = {
      aggregation: WeatherAggregation.daily,
      aggregationMetric: 'temperature_max',
      location,
      timeframe: { startDate: '2025-02-06', endDate: '2025-02-07' },
    };

    const unixTime = Math.floor(new Date('2025-02-06T12:00:00.000Z').getTime() / 1000);
    mockFetchWeatherApi.mockResolvedValue([
      createMockApiResponse({
        aggregation: 'daily',
        unixTimeStart: unixTime,
        intervalSeconds: 86400,
        count: 1,
        values: [12],
        unit: Unit.celsius,
      }),
    ]);

    const repo = new WeatherRepository();
    const result = await repo.getDataset(filters);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.forecastData).toHaveLength(1);
      expect(result.payload.forecastData[0]).toEqual({
        date: new Date(unixTime * 1000).toISOString(),
        value: 12,
        unit: '°C',
      });
    }
  });

  it('returns Result.error when fetchWeatherApi throws', async () => {
    const filters: WeatherFilters<typeof WeatherAggregation.daily> = {
      aggregation: WeatherAggregation.daily,
      aggregationMetric: 'temperature_max',
      location,
      timeframe: { startDate: '2025-02-06', endDate: '2025-02-10' },
    };

    mockFetchWeatherApi.mockRejectedValue(new Error('Network error'));

    const repo = new WeatherRepository();
    const result = await repo.getDataset(filters);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Network error');
    }
  });
});
