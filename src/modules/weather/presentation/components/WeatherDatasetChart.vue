<template>
  <Fieldset
    legend="Plot"
  >
    <section class="weather-dataset-chart">
      <template v-if="loading">
        <Skeleton width="100%" height="100%" />
      </template>
      <template v-else>
        <Chart
          v-if="dataSet && (!!dataSet.forecastData.length || !!dataSet.historicalData.length)"
          class="weather-dataset-chart__plot"
          type="line"
          :data="data"
          :options="options"
        />
  
        <div v-else-if="!dataSet">
          Please select filters and click the Apply button
        </div>
  
        <div v-else-if="!!dataSet.forecastData.length && !!dataSet.historicalData.length">
          No data found
        </div>
      </template>
    </section>
  </Fieldset>
</template>

<script lang="ts" setup generic="T extends WeatherAggregation">
import { computed } from 'vue';
import Fieldset from 'primevue/fieldset';
import Chart from 'primevue/chart';
import Skeleton from 'primevue/skeleton';

import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

const props = defineProps<{
  dataSet: WeatherDataset<T> | undefined;
  loading?: boolean;
}>();

const data = computed(() => {
  if (!props.dataSet) {
    return undefined;
  }

  const {
    forecastData,
    historicalData,
  } = props.dataSet;

  return {
    datasets: [
      {
        label: 'Historical data',
        data: historicalData.map((data) => ({
          x: data.date,
          y: data.value,
        })) ?? [],
      },
      {
        label: 'Forecast data',
        data: forecastData.map((data) => ({
          x: data.date,
          y: data.value,
        })) ?? [],
      },
    ],
  };
});

const options = {
  scales: {
    x: {
      ticks: {
        autoSkip: true,
        maxTicksLimit: 6,
      },
    },
  },
};
</script>
  
<style scoped>
.weather-dataset-chart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 2/1;
}

.weather-dataset-chart__plot {
  width: 100%;
  height: 100%;
}
</style>
