import { fetchWeatherApi } from 'openmeteo';
import { WeatherApiResponse } from '@openmeteo/sdk/weather-api-response';

import { Result } from '#modules/core/domain/result';

import type { WeatherData } from '#modules/weather/domain/entities/WeatherData';
import type { WeatherTimeframe } from '#modules/weather/domain/entities/WeatherTimeframe';
import type { WeatherAggregationMetric } from '#modules/weather/domain/entities/WeatherAggregationMetric';
import { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';

import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';
import type { IWeatherRepository } from '#modules/weather/domain/ports/IWeatherRepository';
import { Unit } from '@openmeteo/sdk/unit';

const unitMap: Partial<Record<Unit, string>> = {
  [Unit.celsius]: '°C',
  [Unit.kilometres_per_hour]: 'km/h',
  [Unit.percentage]: '%',
  [Unit.millimetre]: 'mm',
};

const aggregationMap: Record<WeatherAggregation, 'daily' | 'hourly'> = {
  [WeatherAggregation.daily]: 'daily',
  [WeatherAggregation.hourly]: 'hourly',
};

const aggregationMetricMap: {
  [T in WeatherAggregation]: {
    [M in WeatherAggregationMetric<T>]: string
  }
} = {
  [WeatherAggregation.hourly]: {
    temperature: 'temperature_2m',
    humidity: 'relative_humidity_2m',
    rain: 'rain',
    wind_speed: 'wind_speed_10m',
  },
  [WeatherAggregation.daily]: {
    temperature_max: 'temperature_2m_max',
    temperature_min: 'temperature_2m_min',
    rain: 'rain_sum',
  },
};

const range = (start: bigint, stop: bigint, step: number) =>
 Array.from({ length: (Number(stop) - Number(start)) / step }, (_, i) => Number(start) + i * step);

export class WeatherRepository implements IWeatherRepository {
  public async getDataset<T extends WeatherAggregation>(command: WeatherFilters<T>) {
    const {
      aggregation,
      aggregationMetric,
      location,
      timeframe,
    } = command;

    const {
      forecast,
      historical,
    } = this.prepareTimeframe(timeframe);

    try {
      const [forecastResponse, historicalResponse] = await Promise.all(
        [
          forecast
            ? fetchWeatherApi(
                'https://api.open-meteo.com/v1/forecast',
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  start_date: this.mapDateToQueryParam(forecast.startDate),
                  end_date: this.mapDateToQueryParam(forecast.endDate),
                  ...this.mapAggregationToQueryParams(aggregation, aggregationMetric),
                },
              )
            : Promise.resolve(null),
          historical
            ? fetchWeatherApi(
                'https://historical-forecast-api.open-meteo.com/v1/forecast',
                {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  start_date: this.mapDateToQueryParam(historical.startDate),
                  end_date: this.mapDateToQueryParam(historical.endDate),
                  ...this.mapAggregationToQueryParams(aggregation, aggregationMetric),
                },
              )
            : Promise.resolve(null),
        ].filter((promise) => !!promise),
      );
  
      const forecastData = forecastResponse?.[0]
        ? this.mapWeatherApiResponse(forecastResponse[0], aggregation)
        : [];
  
      const historicalData = historicalResponse?.[0]
        ? this.mapWeatherApiResponse(historicalResponse[0], aggregation)
        : [];      
  
      return Result.success({
        aggregation,
        aggregationMetric,
        location,
        timeframe,
        forecastData,
        historicalData,
      });
    } catch (error) {
      return Result.error(String(error));
    }
  }

  private mapWeatherApiResponse(
    response: WeatherApiResponse,
    aggregation: WeatherAggregation,
  ): WeatherData[] {
    const sourceKey = aggregationMap[aggregation];

    if (!sourceKey) {
      return [];
    }

    const source = response[sourceKey]();

    if (!source) {
      return [];
    }

    const times = range(source.time(), source.timeEnd(), source.interval());
    const values = source.variables(0)?.valuesArray();
    const unit = source.variables(0)?.unit();

    return times.map((time, index) => {
      return {
        date: new Date(time * 1000).toISOString(),
        value: values?.[index] ?? 0,
        unit: unit ? unitMap[unit] ?? '' : '',
      };
    });
  }

  private mapAggregationToQueryParams<T extends WeatherAggregation>(aggregation: T, aggregationMetric: WeatherAggregationMetric<T>) {
    return {
      [aggregationMap[aggregation]]: [aggregationMetricMap[aggregation][aggregationMetric]],
    };
  }

  private mapDateToQueryParam(dateStr: string) {
    const date = new Date(dateStr);

    return date.toISOString().split('T')[0];
  }

  private prepareTimeframe(timeframe: WeatherTimeframe) {
    const now = new Date();

    const startDate = new Date(timeframe.startDate);
    const endDate = new Date(timeframe.endDate);

    if (endDate.getTime() < now.getTime()) {
      return {
        forecast: null,
        historical: { ...timeframe },
      };
    }

    if (startDate.getTime() > now.getTime()) {
      return {
        forecast: { ...timeframe },
        historical: null,
      };
    }

    const forecastStartDate = now;

    const historicalEndDate = new Date(now.toISOString());
    historicalEndDate.setDate(historicalEndDate.getDate() - 1);
    
    return {
      forecast: {
        startDate: forecastStartDate.toISOString(),
        endDate: timeframe.endDate,
      },
      historical: {
        startDate: timeframe.startDate,
        endDate: historicalEndDate.toISOString(),
      },
    };
  }
}