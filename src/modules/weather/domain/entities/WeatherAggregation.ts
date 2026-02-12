export const WeatherAggregation = {
  daily: 'daily',
  hourly: 'hourly',
} as const;

export type WeatherAggregation = typeof WeatherAggregation[keyof typeof WeatherAggregation];
