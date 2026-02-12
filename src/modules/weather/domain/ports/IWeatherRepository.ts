import type { Result } from '#modules/core/domain/result';

import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import type { WeatherFilters } from './WeatherFilters';

export interface IWeatherRepository {
  getDataset: <T extends WeatherAggregation>(filters: WeatherFilters<T>) => Promise<Result<WeatherDataset<T>>>;
};