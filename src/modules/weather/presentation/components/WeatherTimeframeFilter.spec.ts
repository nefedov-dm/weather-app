import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import WeatherTimeframeFilter from './WeatherTimeframeFilter.vue';

const createStubs = () => {
  const DatePickerStub = {
    name: 'DatePicker',
    template: '<div class="datepicker-stub"></div>',
    props: ['modelValue', 'selectionMode', 'maxDate', 'placeholder'],
  };

  return {
    stubs: { DatePicker: DatePickerStub },
  };
};

describe('Weather | Components | WeatherTimeframeFilter', () => {
  it('renders DatePicker with weather-timeframe-filter class', () => {
    const wrapper = mount(WeatherTimeframeFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    expect(wrapper.find('.weather-timeframe-filter').exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'DatePicker' }).exists()).toBe(true);
  });

  it('emits update:model-value with startDate and endDate when date range is selected', async () => {
    const wrapper = mount(WeatherTimeframeFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const start = new Date('2025-02-01');
    const end = new Date('2025-02-10');
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    await datePicker.vm.$emit('update:model-value', [start, end]);
    expect(wrapper.emitted('update:model-value')).toHaveLength(1);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([
      { startDate: start.toISOString(), endDate: end.toISOString() },
    ]);
  });

  it('does not emit when value is not an array', async () => {
    const wrapper = mount(WeatherTimeframeFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    await datePicker.vm.$emit('update:model-value', new Date());
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
  });

  it('syncs dateRange from modelValue prop', async () => {
    const wrapper = mount(WeatherTimeframeFilter, {
      props: {
        modelValue: {
          startDate: '2025-02-01T00:00:00.000Z',
          endDate: '2025-02-10T00:00:00.000Z',
        },
      },
      global: createStubs(),
    });
    await wrapper.vm.$nextTick();
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    expect(datePicker.props('modelValue')).toEqual([
      new Date('2025-02-01T00:00:00.000Z'),
      new Date('2025-02-10T00:00:00.000Z'),
    ]);
  });
});
