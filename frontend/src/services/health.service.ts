import { httpService } from './http.service';

/** Shape of the backend health-check payload. */
export interface HealthStatus {
  status: string;
  environment: string;
  uptimeSeconds: number;
  timestamp: string;
  services: {
    database: string;
  };
}

/**
 * Example service demonstrating the pattern future modules follow: a plain
 * object of functions returning typed data via `httpService`.
 */
export const healthService = {
  check: () => httpService.get<HealthStatus>('/health'),
};
