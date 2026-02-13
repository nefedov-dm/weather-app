import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import WeatherDatasetTable from './WeatherDatasetTable.vue';

const createStubs = () => {
  const FieldsetStub = {
    name: 'Fieldset',
    template: '<div class="fieldset-stub"><slot /></div>',
    props: ['legend'],
  };
  const DataTableStub = {
    name: 'DataTable',
    template: '<div class="datatable-stub"><slot /></div>',
    props: ['value', 'loading', 'sortOrder', 'sortField'],
  };
  const ColumnStub = {
    name: 'Column',
    template: '<div class="column-stub"></div>',
    props: ['field', 'header', 'sortable'],
  };

  return {
    stubs: {
      Fieldset: FieldsetStub,
      DataTable: DataTableStub,
      Column: ColumnStub,
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

describe('Weather | Components | WeatherDatasetTable', () => {
  it('renders Fieldset with legend Table and DataTable', () => {
    const wrapper = mount(WeatherDatasetTable, {
      props: { dataSet: undefined, loading: false },
      global: createStubs(),
    });
    const fieldset = wrapper.findComponent({ name: 'Fieldset' });
    expect(fieldset.exists()).toBe(true);
    expect(fieldset.props('legend')).toBe('Table');
    expect(wrapper.findComponent({ name: 'DataTable' }).exists()).toBe(true);
  });

  it('passes empty data and loading to DataTable when dataSet is undefined', () => {
    const wrapper = mount(WeatherDatasetTable, {
      props: { dataSet: undefined, loading: false },
      global: createStubs(),
    });
    const dataTable = wrapper.findComponent({ name: 'DataTable' });
    expect(dataTable.props('value')).toEqual([]);
  });

  it('passes loading prop to DataTable', () => {
    const wrapper = mount(WeatherDatasetTable, {
      props: { dataSet: undefined, loading: true },
      global: createStubs(),
    });
    const dataTable = wrapper.findComponent({ name: 'DataTable' });
    expect(dataTable.props('loading')).toBe(true);
  });

  it('passes merged historical and forecast data with value and type to DataTable', () => {
    const dataSet = createDataSet({
      historicalData: [{ date: '2025-02-01', value: 5, unit: '°C' }],
      forecastData: [{ date: '2025-02-02', value: 6, unit: '°C' }],
    });
    const wrapper = mount(WeatherDatasetTable, {
      props: { dataSet, loading: false },
      global: createStubs(),
    });
    const dataTable = wrapper.findComponent({ name: 'DataTable' });
    const value = dataTable.props('value') as Array<{ date: string; value: string; type: string }>;
    expect(value).toHaveLength(2);
    expect(value[0]).toMatchObject({ date: '2025-02-01', value: '5 °C', type: 'Historical data' });
    expect(value[1]).toMatchObject({ date: '2025-02-02', value: '6 °C', type: 'Forecast' });
  });

  it('renders three Column components for date, value and type', () => {
    const wrapper = mount(WeatherDatasetTable, {
      props: { dataSet: undefined, loading: false },
      global: createStubs(),
    });
    const columns = wrapper.findAllComponents({ name: 'Column' });
    expect(columns).toHaveLength(3);
    expect(columns[0]?.props('field')).toBe('date');
    expect(columns[0]?.props('header')).toBe('Date');
    expect(columns[1]?.props('field')).toBe('value');
    expect(columns[1]?.props('header')).toBe('Value');
    expect(columns[2]?.props('field')).toBe('type');
    expect(columns[2]?.props('header')).toBe('Type');
  });
});
