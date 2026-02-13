import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters as WeatherFiltersType } from '#modules/weather/domain/ports/WeatherFilters';

import WeatherFilters from './WeatherFilters.vue';

const createStubs = () => {
  const FieldsetStub = {
    name: 'Fieldset',
    template: '<div class="fieldset-stub"><slot /></div>',
    props: ['legend'],
  };
  const ButtonStub = {
    name: 'Button',
    template: '<button class="button-stub" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
    props: ['disabled'],
  };

  return {
    stubs: {
      Fieldset: FieldsetStub,
      Button: ButtonStub,
      WeatherLocationFilter: true,
      WeatherTimeframeFilter: true,
      WeatherAggregationFilter: true,
      WeatherAggregationMetricFilter: true,
    },
  };
};

const fullFilters: WeatherFiltersType<typeof WeatherAggregation.daily> = {
  location: { latitude: 55.75, longitude: 37.62 },
  timeframe: { startDate: '2025-02-01', endDate: '2025-02-10' },
  aggregation: WeatherAggregation.daily,
  aggregationMetric: 'temperature_max',
};

describe('Weather | Components | WeatherFilters', () => {
  it('renders Fieldset with legend Filters and Apply button', () => {
    const wrapper = mount(WeatherFilters, {
      props: { modelValue: undefined },
      global: createStubs(),
    });

    const fieldset = wrapper.findComponent({ name: 'Fieldset' });
    expect(fieldset.exists()).toBe(true);
    expect(fieldset.props('legend')).toBe('Filters');
    const button = wrapper.findComponent({ name: 'Button' });
    expect(button.exists()).toBe(true);
    expect(button.text()).toBe('Apply');
  });

  it('enables Apply button when form is prefilled and valid', () => {
    const wrapper = mount(WeatherFilters, {
      props: { modelValue: fullFilters },
      global: createStubs(),
    });

    const button = wrapper.findComponent({ name: 'Button' });
    expect(button.props('disabled')).toBe(false);
  });

  it('renders WeatherLocationFilter, WeatherTimeframeFilter, WeatherAggregationFilter, WeatherAggregationMetricFilter', () => {
    const wrapper = mount(WeatherFilters, {
      props: { modelValue: undefined },
      global: createStubs(),
    });

    expect(wrapper.findComponent({ name: 'WeatherLocationFilter' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'WeatherTimeframeFilter' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'WeatherAggregationFilter' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'WeatherAggregationMetricFilter' }).exists()).toBe(true);
  });
});
