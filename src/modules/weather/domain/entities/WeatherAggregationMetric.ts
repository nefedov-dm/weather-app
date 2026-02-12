import { WeatherAggregation } from './WeatherAggregation';

export const WeatherAggregationMetrics = {
  [WeatherAggregation.daily]: ['temperature_max', 'temperature_min', 'rain'] as const,
  [WeatherAggregation.hourly]: ['temperature', 'humidity', 'rain', 'wind_speed'] as const,
};

export type WeatherAggregationMetric<T extends WeatherAggregation> =
  T extends 'daily' ? typeof WeatherAggregationMetrics.daily[number] :
  T extends 'hourly' ? typeof WeatherAggregationMetrics.hourly[number] :
  never;
