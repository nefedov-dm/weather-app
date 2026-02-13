<template>
  <Fieldset legend="Filters">
    <Form class="weather-filters">
      <WeatherLocationFilter
        :model-value="form.values.location"
        @update:model-value="form.setFieldValue('location', $event)"
      />
      
      <WeatherTimeframeFilter
        :model-value="form.values.timeframe"
        @update:model-value="form.setFieldValue('timeframe', $event)"
      />
  
      <WeatherAggregationFilter
        :model-value="form.values.aggregation"
        @update:model-value="form.setFieldValue('aggregation', $event)"
      />
  
      <WeatherAggregationMetricFilter
        :model-value="form.values.aggregationMetric"
        :aggregation="form.values.aggregation"
        @update:model-value="form.setFieldValue('aggregationMetric', $event)"
      />
  
      <Button
        class="weather-filters__apply-button"
        :disabled="!form.meta.value.valid"
        @click="onApply"
      >
        Apply
      </Button>
    </Form>
  </Fieldset>
</template>

<script lang="ts" setup generic="T extends WeatherAggregation">
import { Form } from 'vee-validate';
import Button from 'primevue/button';
import Fieldset from 'primevue/fieldset';

import WeatherLocationFilter from '#modules/weather/presentation/components/WeatherLocationFilter.vue';
import WeatherTimeframeFilter from '#modules/weather/presentation/components/WeatherTimeframeFilter.vue';
import WeatherAggregationFilter from '#modules/weather/presentation/components/WeatherAggregationFilter.vue';
import WeatherAggregationMetricFilter from '#modules/weather/presentation/components/WeatherAggregationMetricFilter.vue';
import { useWeatherFiltersForm } from '#modules/weather/presentation/compositions/useWeatherFiltersForm';

import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';

const props = defineProps<{
  modelValue: WeatherFilters<T> | undefined,
}>();

const emit = defineEmits<{
  'update:model-value': [WeatherFilters<T>],
}>();

const form = useWeatherFiltersForm<T>(props.modelValue);

const onApply = form.handleSubmit((values) => {
  emit('update:model-value', { ...values } as WeatherFilters<T>);
});
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
