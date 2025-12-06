import { AUTH_CONFIG } from '@/config/auth';

export interface DevOpsInfo {
  docker: DockerInfo;
  terraform: TerraformInfo;
  github_actions: GitHubActionsInfo;
  infrastructure: InfrastructureInfo;
  ci_cd: CICDInfo;
}

export interface DockerInfo {
  enabled: boolean;
  files: {
    [key: string]: {
      exists: boolean;
      path: string;
      content: string | null;
      description: string;
    };
  };
  description: string;
  features: string[];
  deployment_steps?: string[];
  required_env_vars?: {
    [key: string]: string;
  };
}

export interface TerraformInfo {
  enabled: boolean;
  files: {
    [key: string]: {
      path: string;
      content: string;
      description: string;
    };
  };
  description: string;
  features: string[];
}

export interface GitHubActionsInfo {
  enabled: boolean;
  workflows: {
    [key: string]: {
      path: string;
      content: string;
      description: string;
    };
  };
  description: string;
  features: string[];
  deployment_flow?: string[];
  required_secrets?: {
    [key: string]: string;
  };
  excluded_files?: {
    [key: string]: string;
  };
}

export interface InfrastructureInfo {
  cloud_provider: string;
  environment: string;
  description: string;
  backend?: {
    hosting: string;
    type: string;
    description: string;
    deployment_method: string;
    web_server: string;
  };
  frontend?: {
    hosting: string;
    description: string;
    deployment_method: string;
    framework: string;
  };
  database?: {
    service: string;
    engine: string;
    type: string;
    description: string;
    connection: string;
  };
  broadcasting?: {
    service: string;
    type: string;
    description: string;
    driver: string;
  };
  server_specs: {
    php_version: string;
    laravel_version: string;
    database: string;
    operating_system?: string;
  };
  services: {
    database: string;
    cache: string;
    queue: string;
    broadcasting: string;
    session?: string;
  };
  cicd?: {
    platform: string;
    trigger: string;
    deployment_target: string;
    method: string;
  };
  cost_optimization?: {
    strategy: string;
    features: string[];
  };
  security?: {
    ssl_tls: string;
    authentication: string;
    api_protection: string;
    database: string;
  };
  monitoring: {
    enabled: boolean;
    tools: string[];
    note?: string;
  };
  scalability?: {
    current_setup: string;
    scaling_options: string[];
  };
}

export interface CICDInfo {
  platform: string;
  stages: {
    [key: string]: string;
  };
  environments: string[];
  description: string;
  trigger?: string;
  runner?: string;
  deployment_method?: string;
  target_infrastructure?: string;
}

class DevOpsService {
  private readonly API_BASE = AUTH_CONFIG.API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async fetchAll(): Promise<DevOpsInfo> {
    const response = await fetch(`${this.API_BASE}/devops`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch DevOps information');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchDocker(): Promise<DockerInfo> {
    const response = await fetch(`${this.API_BASE}/devops/docker`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Docker information');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchTerraform(): Promise<TerraformInfo> {
    const response = await fetch(`${this.API_BASE}/devops/terraform`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Terraform information');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchGitHubActions(): Promise<GitHubActionsInfo> {
    const response = await fetch(`${this.API_BASE}/devops/github-actions`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch GitHub Actions information');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchInfrastructure(): Promise<InfrastructureInfo> {
    const response = await fetch(`${this.API_BASE}/devops/infrastructure`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch infrastructure information');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchCICD(): Promise<CICDInfo> {
    const response = await fetch(`${this.API_BASE}/devops/cicd`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch CI/CD information');
    }

    const data = await response.json();
    return data.data;
  }
}

export const devopsService = new DevOpsService();

