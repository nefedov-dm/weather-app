<template>
  <DatePicker
    class="weather-timeframe-filter"
    v-model="dateRange"
    selection-mode="range"
    :max-date="maxDate"
    placeholder="Date range"
    @update:model-value="onUpdateDateRange"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import DatePicker from 'primevue/datepicker';

import type { WeatherTimeframe } from '#modules/weather/domain/entities/WeatherTimeframe';

const props = defineProps<{
  modelValue: Partial<WeatherTimeframe> | undefined,
}>();

const emit = defineEmits<{
  'update:model-value': [Partial<WeatherTimeframe>],
}>();

const dateRange = ref<(Date | null)[]>([]);

const maxDate = computed(() => {
  const now = new Date();
 
  now.setDate(now.getDate() + 14);

  return now;
});

const onUpdateDateRange = (value: (Date | null)[] | Date | null | undefined) => {
  if (!Array.isArray(value)) {
    return;
  }

  dateRange.value = value;

  emit('update:model-value', { startDate: value[0]?.toISOString(), endDate: value[1]?.toISOString() });
}

watch(
  () => props.modelValue,
  (value) => {
    if (!value?.startDate) {
      dateRange.value = [];
    } else if (!value?.endDate) {
      dateRange.value = [new Date(value.startDate)];
    } else {
      dateRange.value = [new Date(value.startDate), new Date(value.endDate)];
    }
  },
  {
    immediate: true,
  },
);
</script>

  
<style scoped>
.weather-timeframe-filter {
  width: 225px;
}
</style>
