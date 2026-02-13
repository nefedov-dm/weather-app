import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import WeatherAggregationFilter from './WeatherAggregationFilter.vue';

const createStubs = () => {
  const SelectStub = {
    name: 'Select',
    template: '<div class="select-stub"></div>',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder'],
  };

  return {
    stubs: { Select: SelectStub },
  };
};

describe('Weather | Components | WeatherAggregationFilter', () => {
  it('emits update:model-value when selection changes', async () => {
    const wrapper = mount(WeatherAggregationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    await select.vm.$emit('update:model-value', WeatherAggregation.daily);
    expect(wrapper.emitted('update:model-value')).toHaveLength(1);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([WeatherAggregation.daily]);
  });

  it('emits update:model-value with hourly when hourly is selected', async () => {
    const wrapper = mount(WeatherAggregationFilter, {
      props: { modelValue: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    await select.vm.$emit('update:model-value', WeatherAggregation.hourly);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([WeatherAggregation.hourly]);
  });

  it('passes modelValue to Select so it is displayed correctly', () => {
    const wrapper = mount(WeatherAggregationFilter, {
      props: { modelValue: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('modelValue')).toBe(WeatherAggregation.daily);
  });

  it('passes correct options to Select (Daily and Hourly)', () => {
    const wrapper = mount(WeatherAggregationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('options')).toEqual([
      { label: 'Daily', value: WeatherAggregation.daily },
      { label: 'Hourly', value: WeatherAggregation.hourly },
    ]);
  });
});
