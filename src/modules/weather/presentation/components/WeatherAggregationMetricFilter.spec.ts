import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import WeatherAggregationMetricFilter from './WeatherAggregationMetricFilter.vue';

const createStubs = () => {
  const SelectStub = {
    name: 'Select',
    template: '<div class="select-stub"></div>',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'disabled'],
  };

  return {
    stubs: { Select: SelectStub },
  };
};

describe('Weather | Components | WeatherAggregationMetricFilter', () => {
  it('emits update:model-value when selection changes', async () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: undefined, aggregation: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    await select.vm.$emit('update:model-value', 'temperature_max');
    expect(wrapper.emitted('update:model-value')).toHaveLength(1);
    expect(wrapper.emitted('update:model-value')![0]).toEqual(['temperature_max']);
  });

  it('passes modelValue to Select so it is displayed correctly', () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: 'temperature_max', aggregation: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('modelValue')).toBe('temperature_max');
  });

  it('passes correct options for daily aggregation', () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: undefined, aggregation: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('options')).toEqual([
      { label: 'Temperature (max)', value: 'temperature_max' },
      { label: 'Temperature (min)', value: 'temperature_min' },
      { label: 'Rain (sum)', value: 'rain' },
    ]);
  });

  it('passes correct options for hourly aggregation', () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: undefined, aggregation: WeatherAggregation.hourly },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('options')).toEqual([
      { label: 'Temperature', value: 'temperature' },
      { label: 'Humidity', value: 'humidity' },
      { label: 'Rain', value: 'rain' },
      { label: 'Wind speed', value: 'wind_speed' },
    ]);
  });

  it('disables Select when aggregation is undefined', () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: undefined, aggregation: undefined },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('disabled')).toBe(true);
  });

  it('enables Select when aggregation is set', () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: undefined, aggregation: WeatherAggregation.daily },
      global: createStubs(),
    });
    const select = wrapper.findComponent({ name: 'Select' });
    expect(select.props('disabled')).toBe(false);
  });

  it('emits update:model-value with undefined when aggregation changes', async () => {
    const wrapper = mount(WeatherAggregationMetricFilter, {
      props: { modelValue: 'temperature_max', aggregation: WeatherAggregation.daily },
      global: createStubs(),
    });
    await wrapper.setProps({ aggregation: WeatherAggregation.hourly });
    expect(wrapper.emitted('update:model-value')).toBeDefined();
    expect(wrapper.emitted('update:model-value')!.some((payload) => payload[0] === undefined)).toBe(true);
  });
});
