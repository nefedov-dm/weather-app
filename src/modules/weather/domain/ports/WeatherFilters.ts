import type { WeatherLocation } from '#modules/weather/domain/entities/WeatherLocation';
import type { WeatherTimeframe } from '#modules/weather/domain/entities/WeatherTimeframe';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherAggregationMetric } from '#modules/weather/domain/entities/WeatherAggregationMetric';

export type WeatherFilters<T extends WeatherAggregation> = {
  aggregation: T;
  aggregationMetric: WeatherAggregationMetric<T>;
  location: WeatherLocation;
  timeframe: WeatherTimeframe;
};
