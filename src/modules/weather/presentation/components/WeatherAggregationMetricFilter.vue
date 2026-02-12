<template>
  <Select
    class="weather-aggregation-metric-filter"
    :model-value="modelValue"
    :options="options"
    :disabled="!aggregation"
    option-label="label"
    option-value="value"
    placeholder="Select an metric"
    @update:model-value="$emit('update:model-value', $event as WeatherAggregationMetric<T>)"
  />
</template>

<script setup lang="ts" generic="T extends WeatherAggregation">
import { computed, watch } from 'vue';
import Select from 'primevue/select';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherAggregationMetric } from '#modules/weather/domain/entities/WeatherAggregationMetric';

const metricsMap: {
  [T in WeatherAggregation]: {
    [M in WeatherAggregationMetric<T>]: string
  }
} = {
  [WeatherAggregation.hourly]: {
    temperature: 'Temperature',
    humidity: 'Humidity',
    rain: 'Rain',
    wind_speed: 'Wind speed',
  },
  [WeatherAggregation.daily]: {
    temperature_max: 'Temperature (max)',
    temperature_min: 'Temperature (min)',
    rain: 'Rain (sum)',
  },
} as const;

const props = defineProps<{
  modelValue?: WeatherAggregationMetric<T>;
  aggregation?: T;
}>();

const emit = defineEmits<{
  'update:model-value': [WeatherAggregationMetric<T> | undefined],
}>();

const options = computed(() => {
  if (!props.aggregation) {
    return [];
  }

  const metrics = metricsMap[props.aggregation];

  return Object.entries(metrics).map(([value, label]) => ({ value, label }));
});

watch(
  () => props.aggregation,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      emit('update:model-value', undefined);
    }
  },
);
</script>

<style scoped>
.weather-aggregation-metric-filter {
  width: 255px;
}
</style>
