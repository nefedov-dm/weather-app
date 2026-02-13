import { z } from 'zod';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';
import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import { WeatherAggregationMetrics } from '#modules/weather/domain/entities/WeatherAggregationMetric';

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

const timeframeSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const schema = z.union([
  z.object({
    location: locationSchema.optional(),
    timeframe: timeframeSchema.optional(),
    aggregation: z.literal(WeatherAggregation.daily).optional(),
    aggregationMetric: z.enum(WeatherAggregationMetrics[WeatherAggregation.daily]).optional(),
  }),
  z.object({
    location: locationSchema.optional(),
    timeframe: timeframeSchema.optional(),
    aggregation: z.literal(WeatherAggregation.hourly).optional(),
    aggregationMetric: z.enum(WeatherAggregationMetrics[WeatherAggregation.hourly]).optional(),
  }),
])
.refine((v) => v.aggregation !== undefined, {
  path: ['aggregation'],
})
.refine((v) => v.aggregationMetric !== undefined, {
  path: ['aggregationMetric'],
})
.refine((v) => v.location?.latitude !== undefined && v.location?.longitude !== undefined, {
  path: ['location'],
})
.refine((v) => v.timeframe?.startDate !== undefined && v.timeframe?.endDate !== undefined, {
  path: ['timeframe'],
});

export type FormValues = z.infer<typeof schema>;

export const useWeatherFiltersForm = <T extends WeatherAggregation>(initialValues?: WeatherFilters<T>) => {
  return useForm<FormValues>({
    validationSchema: toTypedSchema(schema),
    initialValues: initialValues
      ? {
          location: initialValues.location,
          timeframe: initialValues.timeframe,
          aggregation: initialValues.aggregation,
          aggregationMetric: initialValues.aggregationMetric,
        } as FormValues
      : undefined,
  });
};
