import type { WeatherData } from '#modules/weather/domain/entities/WeatherData';
import type { WeatherDataset } from '#modules/weather/domain/entities/WeatherDataset';
import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';
import type { IWeatherRepository } from '#modules/weather/domain/ports/IWeatherRepository';
import { Result } from '#modules/core/domain/result';

export class WeatherService {
  private repo: IWeatherRepository;

  constructor(repo: IWeatherRepository) {
    this.repo = repo;
  }

  public async getWeatherDataset<T extends WeatherAggregation>(filters: WeatherFilters<T>) {
    const result = await this.repo.getDataset(filters);

    if (!result.success) {
      return result;
    }

    return Result.success(this.normalizeDataset(result.payload));
  }

  private normalizeDataset<T extends WeatherAggregation>(dataset: WeatherDataset<T>): WeatherDataset<T> {
    const historicalData = this.sortWeatherData(dataset.historicalData);
    const forecastData = this.sortWeatherData(dataset.forecastData);

    const [firstForecastData] = forecastData;

    if (!firstForecastData) {
      return {
        ...dataset,
        forecastData,
        historicalData,
      };
    }

    const firstForecastTime = new Date(firstForecastData.date).getTime();

    return {
      ...dataset,
      forecastData,
      historicalData: historicalData.filter((data) => {
        return new Date(data.date).getTime() < firstForecastTime;
      }),
    };
  }

  private sortWeatherData(data: WeatherData[]): WeatherData[] {
    return [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
