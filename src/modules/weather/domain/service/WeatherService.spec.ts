import { describe, it, expect, vi, beforeEach } from 'vitest';

import { Result } from '#modules/core/domain/result';
import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import type { IWeatherRepository } from '#modules/weather/domain/ports/IWeatherRepository';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';

import { WeatherService } from './WeatherService';

describe('Weather | Domain | WeatherService', () => {
  let mockRepo: IWeatherRepository;

  const filtersDaily: WeatherFilters<typeof WeatherAggregation.daily> = {
    location: { latitude: 55.75, longitude: 37.62 },
    timeframe: { startDate: '2025-02-01', endDate: '2025-02-10' },
    aggregation: WeatherAggregation.daily,
    aggregationMetric: 'temperature_max',
  };

  const successDataset: WeatherDataset<typeof WeatherAggregation.daily> = {
    ...filtersDaily,
    historicalData: [{ date: '2025-02-01', value: 5, unit: '°C' }],
    forecastData: [{ date: '2025-02-02', value: 6, unit: '°C' }],
  };

  beforeEach(() => {
    mockRepo = {
      getDataset: vi.fn(),
    };
  });

  it('calls repository getDataset with passed filters', async () => {
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(successDataset));

    const service = new WeatherService(mockRepo);
    await service.getWeatherDataset(filtersDaily);

    expect(mockRepo.getDataset).toHaveBeenCalledTimes(1);
    expect(mockRepo.getDataset).toHaveBeenCalledWith(filtersDaily);
  });

  it('returns success result with normalized dataset (sorted, historical before forecast)', async () => {
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(successDataset));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData).toEqual(successDataset.historicalData);
      expect(result.payload.forecastData).toEqual(successDataset.forecastData);
    }
  });

  it('returns error result from repository', async () => {
    const errorMessage = 'Network error';
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.error(errorMessage));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(errorMessage);
    }
  });

  it('sorts historicalData and forecastData by date', async () => {
    const unsortedDataset: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [
        { date: '2025-02-03', value: 3, unit: '°C' },
        { date: '2025-02-01', value: 1, unit: '°C' },
        { date: '2025-02-02', value: 2, unit: '°C' },
      ],
      forecastData: [
        { date: '2025-02-05', value: 5, unit: '°C' },
        { date: '2025-02-04', value: 4, unit: '°C' },
      ],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(unsortedDataset));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData.map((d) => d.date)).toEqual(['2025-02-01', '2025-02-02', '2025-02-03']);
      expect(result.payload.forecastData.map((d) => d.date)).toEqual(['2025-02-04', '2025-02-05']);
    }
  });

  it('drops historicalData entries that are not strictly before first forecast date', async () => {
    const datasetWithOverlap: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [
        { date: '2025-02-01', value: 1, unit: '°C' },
        { date: '2025-02-02', value: 2, unit: '°C' },
        { date: '2025-02-03', value: 3, unit: '°C' },
      ],
      forecastData: [
        { date: '2025-02-03', value: 3, unit: '°C' },
        { date: '2025-02-04', value: 4, unit: '°C' },
      ],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(datasetWithOverlap));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData.map((d) => d.date)).toEqual(['2025-02-01', '2025-02-02']);
      expect(result.payload.forecastData.map((d) => d.date)).toEqual(['2025-02-03', '2025-02-04']);
    }
  });

  it('keeps all historicalData when forecastData is empty', async () => {
    const datasetNoForecast: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [
        { date: '2025-02-03', value: 3, unit: '°C' },
        { date: '2025-02-01', value: 1, unit: '°C' },
        { date: '2025-02-02', value: 2, unit: '°C' },
      ],
      forecastData: [],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(datasetNoForecast));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData.map((d) => d.date)).toEqual(['2025-02-01', '2025-02-02', '2025-02-03']);
      expect(result.payload.forecastData).toHaveLength(0);
    }
  });

  it('returns empty historicalData when all historical dates are >= first forecast date', async () => {
    const datasetAllHistoricalAfterForecast: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [
        { date: '2025-02-03', value: 3, unit: '°C' },
        { date: '2025-02-04', value: 4, unit: '°C' },
      ],
      forecastData: [
        { date: '2025-02-02', value: 2, unit: '°C' },
        { date: '2025-02-05', value: 5, unit: '°C' },
      ],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(datasetAllHistoricalAfterForecast));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData).toHaveLength(0);
      expect(result.payload.forecastData.map((d) => d.date)).toEqual(['2025-02-02', '2025-02-05']);
    }
  });

  it('returns empty arrays when both historicalData and forecastData are empty', async () => {
    const emptyDataset: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [],
      forecastData: [],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(emptyDataset));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData).toEqual([]);
      expect(result.payload.forecastData).toEqual([]);
    }
  });

  it('drops historical entry with same date as first forecast (strictly less)', async () => {
    const sameDate = '2025-02-02T12:00:00.000Z';
    const datasetSameDate: WeatherDataset<typeof WeatherAggregation.daily> = {
      ...filtersDaily,
      historicalData: [
        { date: '2025-02-01', value: 1, unit: '°C' },
        { date: sameDate, value: 2, unit: '°C' },
      ],
      forecastData: [
        { date: sameDate, value: 2, unit: '°C' },
        { date: '2025-02-03', value: 3, unit: '°C' },
      ],
    };
    vi.mocked(mockRepo.getDataset).mockResolvedValue(Result.success(datasetSameDate));

    const service = new WeatherService(mockRepo);
    const result = await service.getWeatherDataset(filtersDaily);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.payload.historicalData.map((d) => d.date)).toEqual(['2025-02-01']);
      expect(result.payload.forecastData.map((d) => d.date)).toEqual([sameDate, '2025-02-03']);
    }
  });
});
