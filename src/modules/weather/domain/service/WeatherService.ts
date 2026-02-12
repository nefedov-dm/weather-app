import type { WeatherAggregation } from '#modules/weather/domain/entities/WeatherAggregation';
import type { WeatherFilters } from '#modules/weather/domain/ports/WeatherFilters';
import type { IWeatherRepository } from '#modules/weather/domain/ports/IWeatherRepository';

export class WeatherService {
  private repo: IWeatherRepository;

  constructor(repo: IWeatherRepository) {
    this.repo = repo;
  }

  public async getWeatherDataset<T extends WeatherAggregation>(filters: WeatherFilters<T>) {
    return this.repo.getDataset(filters);
  }
}
