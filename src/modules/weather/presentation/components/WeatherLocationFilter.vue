<template>
  <section class="weather-location-filter">
    <InputNumber
      class="weather-location-filter__input"
      :model-value="modelValue?.latitude"
      :min="-90"
      :max="90"
      :use-grouping="false"
      :max-fraction-digits="2"
      placeholder="Latitude"
      fluid
      @update:model-value="onUpdateLatitude"
    />

    <InputNumber
      class="weather-location-filter__input"
      :model-value="modelValue?.longitude"
      :min="-180"
      :max="180"
      :use-grouping="false"
      :max-fraction-digits="2"
      placeholder="Longitude"
      fluid
      @update:model-value="onUpdateLongitude"
    />
  </section>
</template>

<script lang="ts" setup>
import InputNumber from 'primevue/inputnumber';

import type { WeatherLocation } from '#modules/weather/domain/entities/WeatherLocation';

const props = defineProps<{
  modelValue: Partial<WeatherLocation> | undefined,
}>();

const emit = defineEmits<{
  'update:model-value': [Partial<WeatherLocation>],
}>();

const onUpdateLatitude = (value: number | null) => {
  if (value === null) {
    return;
  }
  emit('update:model-value', { ...(props.modelValue || {}), latitude: value });
};

const onUpdateLongitude = (value: number | null) => {
  if (value === null) {
    return;
  }
  emit('update:model-value', { ...(props.modelValue || {}), longitude: value });
};
</script>

<style scoped>
.weather-location-filter {
  display: flex;
  gap: 12px;
}

.weather-location-filter__input {
  width: 100px;
}
</style>
