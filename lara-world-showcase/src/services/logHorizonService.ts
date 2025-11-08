import { AUTH_CONFIG } from '@/config/auth';

export interface LogHorizonInfo {
  status: string;
  implementation: {
    laravel_horizon: {
      available: boolean;
      installed: boolean;
      description: string;
    };
    current_setup: {
      queue_driver: string;
      queue_connection: any;
    };
  };
  options: {
    option_1: ImplementationOption;
    option_2: ImplementationOption;
    option_3: ImplementationOption;
  };
  recommendations: {
    recommended_approach: string;
    reason: string;
    steps: string[];
    alternative: string;
  };
}

export interface ImplementationOption {
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  implementation: string;
}

class LogHorizonService {
  private readonly API_BASE = AUTH_CONFIG.API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async fetchInfo(): Promise<LogHorizonInfo> {
    const response = await fetch(`${this.API_BASE}/log-horizon`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Log Horizon information');
    }

    const data = await response.json();
    return data.data;
  }

  async getStatistics(): Promise<any> {
    const response = await fetch(`${this.API_BASE}/log-horizon/statistics`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch log statistics');
    }

    const data = await response.json();
    return data.data;
  }
}

export const logHorizonService = new LogHorizonService();

