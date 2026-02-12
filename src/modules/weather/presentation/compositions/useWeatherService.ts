import { WeatherService } from '#modules/weather/domain/service/WeatherService';

import { useWeatherRepository } from '#modules/weather/presentation/compositions/useWeatherRepository';

export const useWeatherService = () => {
  const { repository } = useWeatherRepository();
  
  const service = new WeatherService(repository);

  return {
    service,
  };
}