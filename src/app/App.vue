<template>
  <main class="app">
    <WeatherFilters
      v-model="filters"
    />
  
    <WeatherDatasetChart
      :data-set="dataSet"
      :loading="isLoading"
    />
  
    <WeatherDatasetTable
      :data-set="dataSet"
      :loading="isLoading"
    />
  </main>
</template>
  
<script setup lang="ts" generic="T extends WeatherAggregation">
import { computed, ref, watch } from 'vue';

import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters as WeatherFiltersType } from '#modules/weather/domain/ports/WeatherFilters';

import WeatherFilters from '#modules/weather/presentation/components/WeatherFilters.vue';
import WeatherDatasetTable from '#modules/weather/presentation/components/WeatherDatasetTable.vue';
import WeatherDatasetChart from '#modules/weather/presentation/components/WeatherDatasetChart.vue';

import { useWeatherDataset } from '#modules/weather/presentation/compositions/useWeatherDataset';

const filters = ref<WeatherFiltersType<T> | undefined>();

const {
  data,
  isLoading,
} = useWeatherDataset(filters);

const dataSet = computed(() => {
  if (!data.value?.success) {
    return undefined;
  }

  return data.value.payload;
});

watch(
  filters,
  (v) => {
    console.log(v);
  },
);
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 1280px;
  margin: auto;
}
</style>