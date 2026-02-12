import { WeatherRepository } from '#modules/weather/infrastructure/repository/weather-repository';

export const useWeatherRepository = () => {
  const repository = new WeatherRepository();

  return {
    repository,
  };
}