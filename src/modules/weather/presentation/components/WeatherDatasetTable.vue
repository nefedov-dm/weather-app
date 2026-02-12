<template>
  <Fieldset
    legend="Table"
  >
    <DataTable
      :value="data"
      :loading="loading"
      :sort-order="-1"
      sort-field="date"
    >
      <Column field="date" header="Date" sortable></Column>
      <Column field="value" header="Value"></Column>
      <Column field="type" header="Type"></Column>
    </DataTable>
  </Fieldset>
</template>

<script lang="ts" setup generic="T extends WeatherAggregation">
import { computed, ref } from 'vue';
import Fieldset from 'primevue/fieldset';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';  

import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

const props = defineProps<{
  dataSet: WeatherDataset<T> | undefined;
  loading?: boolean;
}>();

const data = computed(() => {
  if (!props.dataSet) {
    return [];
  }

  const {
    forecastData,
    historicalData,
  } = props.dataSet;

  return [
    ...historicalData.map((data) => ({
      ...data,
      value: `${data.value} ${data.unit}`,
      type: 'Historical data'
    })),
    ...forecastData.map((data) => ({
      ...data,
      value: `${data.value} ${data.unit}`,
      type: 'Forecast'
    })),
  ];
});
</script>
  
<style scoped>
.weather-dataset-table {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 2/1;
}

.weather-dataset-table__plot {
  width: 100%;
  height: 100%;
}
</style>
