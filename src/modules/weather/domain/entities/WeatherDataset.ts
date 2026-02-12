import type { WeatherData } from './WeatherData';
import type { WeatherLocation } from './WeatherLocation';
import type { WeatherTimeframe } from './WeatherTimeframe';
import type { WeatherAggregation } from './WeatherAggregation';
import type { WeatherAggregationMetric } from './WeatherAggregationMetric';

export type WeatherDataset<T extends WeatherAggregation> = {
  aggregation: T;
  aggregationMetric: WeatherAggregationMetric<T>;
  location: WeatherLocation;
  timeframe: WeatherTimeframe;
  forecastData: WeatherData[];
  historicalData: WeatherData[];
};
