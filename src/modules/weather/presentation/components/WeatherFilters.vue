<template>
  <Fieldset legend="Filters">
    <section class="weather-filters">
      <WeatherLocationFilter
        v-model="locationFilter"
      />
      
      <WeatherTimeframeFilter
        v-model="timeframeFilter"
      />
  
      <WeatherAggregationFilter
        v-model="aggregationFilter"
      />
  
      <WeatherAggregationMetricFilter
        v-model="aggregationMetricFilter"
        :aggregation="aggregationFilter"
      />
  
      <Button
        class="weather-filters__apply-button"
        :disabled="!filters"
        @click="onApply"
      >
        Apply
      </Button>
    </section>
  </Fieldset>
</template>

<script lang="ts" setup generic="T extends WeatherAggregation">
import { computed, ref } from 'vue';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';

import WeatherLocationFilter from '#modules/weather/presentation/components/WeatherLocationFilter.vue';
import WeatherTimeframeFilter from '#modules/weather/presentation/components/WeatherTimeframeFilter.vue';
import WeatherAggregationFilter from '#modules/weather/presentation/components/WeatherAggregationFilter.vue';
import WeatherAggregationMetricFilter from '#modules/weather/presentation/components/WeatherAggregationMetricFilter.vue';

import type { WeatherLocation } from '#modules/weather/domain/entities/WeatherLocation';
import type { WeatherTimeframe } from '#modules/weather/domain/entities/WeatherTimeframe';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherAggregationMetric } from '#modules/weather/domain/entities/WeatherAggregationMetric';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';

const props = defineProps<{
  modelValue: WeatherFilters<T> | undefined,
}>();

const emit = defineEmits<{
  'update:model-value': [WeatherFilters<T> | undefined],
}>();

const locationFilter = ref<Partial<WeatherLocation> | undefined>(props.modelValue?.location);
const timeframeFilter = ref<Partial<WeatherTimeframe> | undefined>(props.modelValue?.timeframe);
const aggregationFilter = ref<T | undefined>(props.modelValue?.aggregation);
const aggregationMetricFilter = ref<WeatherAggregationMetric<T> | undefined>(props.modelValue?.aggregationMetric);

const filters = computed<WeatherFilters<T> | undefined>(() => {
  const location = locationFilter.value;
  const timeframe = timeframeFilter.value;
  const aggregation = aggregationFilter.value;
  const aggregationMetric = aggregationMetricFilter.value;

  if (!aggregation || !aggregationMetric || !location?.latitude || !location?.longitude || !timeframe?.startDate || !timeframe?.endDate) {
    return undefined;
  }

  return {
    location,
    timeframe,
    aggregation,
    aggregationMetric,
  } as WeatherFilters<T>;
});

const onApply = () => {
  if (!filters.value) {
    return;
  }

  emit('update:model-value', { ...filters.value });
};
</script>
  
<style scoped>
.weather-filters {
  display: flex;
  gap: 12px;
}

.weather-filters__apply-button {
  width: 225px;
}
</style>
