import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import WeatherLocationFilter from './WeatherLocationFilter.vue';

const createStubs = () => {
  const InputNumberStub = {
    name: 'InputNumber',
    template: '<div class="inputnumber-stub"></div>',
    props: ['modelValue', 'min', 'max', 'placeholder'],
  };

  return {
    stubs: { InputNumber: InputNumberStub },
  };
};

describe('Weather | Components | WeatherLocationFilter', () => {
  it('renders section with weather-location-filter class and two InputNumber components', () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    expect(wrapper.find('.weather-location-filter').exists()).toBe(true);
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    expect(inputs).toHaveLength(2);
  });

  it('emits update:model-value with latitude when first input changes', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[0]?.vm.$emit('update:model-value', 55.75);
    expect(wrapper.emitted('update:model-value')).toHaveLength(1);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([{ latitude: 55.75 }]);
  });

  it('emits update:model-value with longitude when second input changes', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[1]?.vm.$emit('update:model-value', 37.62);
    expect(wrapper.emitted('update:model-value')).toHaveLength(1);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([{ longitude: 37.62 }]);
  });

  it('merges new latitude with existing modelValue', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: { latitude: 10, longitude: 20 } },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[0]?.vm.$emit('update:model-value', 55.75);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([{ latitude: 55.75, longitude: 20 }]);
  });

  it('merges new longitude with existing modelValue', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: { latitude: 10, longitude: 20 } },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[1]?.vm.$emit('update:model-value', 37.62);
    expect(wrapper.emitted('update:model-value')![0]).toEqual([{ latitude: 10, longitude: 37.62 }]);
  });

  it('does not emit when first input emits null', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[0]?.vm.$emit('update:model-value', null);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
  });

  it('does not emit when second input emits null', async () => {
    const wrapper = mount(WeatherLocationFilter, {
      props: { modelValue: undefined },
      global: createStubs(),
    });
    const inputs = wrapper.findAllComponents({ name: 'InputNumber' });
    await inputs[1]?.vm.$emit('update:model-value', null);
    expect(wrapper.emitted('update:model-value')).toBeUndefined();
  });
});
