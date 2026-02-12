import { computed, type Ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useQuery } from '@tanstack/vue-query'

import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';

import { useWeatherService } from '#modules/weather/presentation/compositions/useWeatherService';

export const useWeatherDataset = <T extends WeatherAggregation>(filters: Ref<WeatherFilters<T> | undefined>) => {
  const toast = useToast();

  const { service } = useWeatherService();

  const enabled = computed(() => {
    return !!filters.value;
  });

  const queryKey = computed(() => {
    if (!filters.value) {
      return ['weather-dataset'];
    }

    const {
      aggregation,
      aggregationMetric,
      location,
      timeframe,
    } = filters.value;

    return [
      'weather-dataset',
      aggregation,
      aggregationMetric,
      location.latitude,
      location.longitude,
      timeframe.startDate,
      timeframe.endDate,
    ];
  });

  const queryFn = async () => {
    if (!filters.value) {
      return;
    }

    const result = await service.getWeatherDataset(filters.value);

    if (!result.success) {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: result.error,
        life: 3000,
      });
    }

    return result;
  };

  return useQuery({
    queryKey,
    queryFn,
    enabled,
  });
}