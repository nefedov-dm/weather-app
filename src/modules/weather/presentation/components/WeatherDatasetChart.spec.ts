import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import WeatherDatasetChart from './WeatherDatasetChart.vue';

const createStubs = () => {
  const FieldsetStub = {
    name: 'Fieldset',
    template: '<div class="fieldset-stub"><slot /></div>',
    props: ['legend'],
  };
  const ChartStub = {
    name: 'Chart',
    template: '<div class="chart-stub"></div>',
    props: ['data', 'options', 'type', 'class'],
  };
  const SkeletonStub = {
    name: 'Skeleton',
    template: '<div class="skeleton-stub"></div>',
    props: ['width', 'height'],
  };

  return {
    stubs: {
      Fieldset: FieldsetStub,
      Chart: ChartStub,
      Skeleton: SkeletonStub,
    },
  };
};

const createDataSet = (overrides: {
  historicalData?: Array<{ date: string; value: number; unit: string }>;
  forecastData?: Array<{ date: string; value: number; unit: string }>;
} = {}): WeatherDataset<typeof WeatherAggregation.daily> => ({
  aggregation: WeatherAggregation.daily,
  aggregationMetric: 'temperature_max',
  location: { latitude: 55.75, longitude: 37.62 },
  timeframe: { startDate: '2025-02-01', endDate: '2025-02-10' },
  historicalData: overrides.historicalData ?? [],
  forecastData: overrides.forecastData ?? [],
});

describe('Weather | Components | WeatherDatasetChart', () => {
  it('renders Fieldset with legend Plot and section with weather-dataset-chart class', () => {
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet: undefined, loading: false },
      global: createStubs(),
    });
    const fieldset = wrapper.findComponent({ name: 'Fieldset' });
    expect(fieldset.exists()).toBe(true);
    expect(fieldset.props('legend')).toBe('Plot');
    expect(wrapper.find('.weather-dataset-chart').exists()).toBe(true);
  });

  it('shows Skeleton when loading is true', () => {
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet: undefined, loading: true },
      global: createStubs(),
    });
    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Chart' }).exists()).toBe(false);
  });

  it('shows message when dataSet is undefined and not loading', () => {
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet: undefined, loading: false },
      global: createStubs(),
    });
    expect(wrapper.text()).toContain('Please select filters and click the Apply button');
    expect(wrapper.findComponent({ name: 'Chart' }).exists()).toBe(false);
  });

  it('shows Chart when dataSet has forecastData or historicalData', () => {
    const dataSet = createDataSet({
      historicalData: [{ date: '2025-02-01', value: 5, unit: '°C' }],
      forecastData: [],
    });
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet, loading: false },
      global: createStubs(),
    });
    expect(wrapper.findComponent({ name: 'Chart' }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: 'Skeleton' }).exists()).toBe(false);
  });

  it('does not show Chart when dataSet has both arrays empty', () => {
    const dataSet = createDataSet();
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet, loading: false },
      global: createStubs(),
    });
    expect(wrapper.findComponent({ name: 'Chart' }).exists()).toBe(false);
  });

  it('passes chart data with Historical data and Forecast data datasets to Chart', () => {
    const dataSet = createDataSet({
      historicalData: [{ date: '2025-02-01', value: 5, unit: '°C' }],
      forecastData: [{ date: '2025-02-02', value: 6, unit: '°C' }],
    });
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet, loading: false },
      global: createStubs(),
    });
    const chart = wrapper.findComponent({ name: 'Chart' });
    expect(chart.props('data')).toBeDefined();
    expect(chart.props('data').datasets).toHaveLength(2);
    expect(chart.props('data').datasets[0].label).toBe('Historical data');
    expect(chart.props('data').datasets[1].label).toBe('Forecast data');
    expect(chart.props('data').datasets[0].data).toEqual([
      { x: '2025-02-01', y: 5 },
      { x: '2025-02-02', y: 6 },
    ]);
    expect(chart.props('data').datasets[1].data).toEqual([{ x: '2025-02-02', y: 6 }]);
  });

  it('passes type and options to Chart', () => {
    const dataSet = createDataSet({
      historicalData: [{ date: '2025-02-01', value: 1, unit: '°C' }],
    });
    const wrapper = mount(WeatherDatasetChart, {
      props: { dataSet, loading: false },
      global: createStubs(),
    });
    const chart = wrapper.findComponent({ name: 'Chart' });
    expect(chart.props('type')).toBe('line');
    expect(chart.props('options')).toBeDefined();
    expect(chart.props('options').scales).toBeDefined();
  });
});
