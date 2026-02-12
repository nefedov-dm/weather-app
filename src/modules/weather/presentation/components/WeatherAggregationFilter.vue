<template>
  <Select
    class="weather-aggregation-filter"
    :model-value="modelValue"
    :options="options"
    option-label="label"
    option-value="value"
    placeholder="Select an aggregation type"
    @update:model-value="$emit('update:model-value', $event as WeatherAggregation)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Select from 'primevue/select';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

defineProps<{
  modelValue: WeatherAggregation | undefined,
}>();

defineEmits<{
  'update:model-value': [WeatherAggregation],
}>();

const options = ref([
  {
    label: 'Daily',
    value: WeatherAggregation.daily,
  },
  {
    label: 'Hourly',
    value: WeatherAggregation.hourly,
  },
]);
</script>

<style scoped>
.weather-aggregation-filter {
  width: 255px;
}
</style>