import { AUTH_CONFIG } from '@/config/auth';

export interface Mailer {
  id: number;
  name: string;
  provider: 'smtp' | 'mailgun' | 'ses' | 'postmark' | 'resend' | 'sendmail' | 'log';
  provider_name: string;
  is_active: boolean;
  from_address: string | null;
  from_name: string | null;
  test_status: boolean;
  test_error: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MailerCredentials {
  // SMTP
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  encryption?: 'tls' | 'ssl' | null;
  timeout?: number;
  // Mailgun
  domain?: string;
  secret?: string;
  endpoint?: string;
  // AWS SES
  key?: string;
  secret?: string;
  region?: string;
  // Postmark
  token?: string;
  // Resend
  key?: string;
  // Sendmail
  path?: string;
}

export interface MailerFormData {
  name: string;
  provider: 'smtp' | 'mailgun' | 'ses' | 'postmark' | 'resend' | 'sendmail' | 'log';
  credentials: MailerCredentials;
  from_address?: string;
  from_name?: string;
  is_active?: boolean;
}

export interface ProviderField {
  name: string;
  required: boolean;
  type: 'string' | 'integer';
  options?: (string | null)[];
}

export interface ProviderInfo {
  name: string;
  fields: Record<string, ProviderField>;
}

export interface SupportedProviders {
  [key: string]: ProviderInfo;
}

class MailerService {
  private readonly API_BASE = AUTH_CONFIG.API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async fetchMailers(): Promise<Mailer[]> {
    const response = await fetch(`${this.API_BASE}/mailers`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mailers');
    }

    const data = await response.json();
    return data.data;
  }

  async fetchMailer(id: number): Promise<Mailer> {
    const response = await fetch(`${this.API_BASE}/mailers/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch mailer');
    }

    const data = await response.json();
    return data.data;
  }

  async createMailer(mailerData: MailerFormData): Promise<Mailer> {
    // Clean credentials - remove undefined and empty string values, but keep null for encryption field
    const cleanedCredentials: MailerCredentials = {};
    Object.entries(mailerData.credentials).forEach(([key, value]) => {
      // Keep null for encryption field (it's a valid value)
      if (key === 'encryption' && value === null) {
        cleanedCredentials[key as keyof MailerCredentials] = null;
      } else if (value !== undefined && value !== null && value !== '') {
        cleanedCredentials[key as keyof MailerCredentials] = value;
      }
    });

    const cleanedData = {
      ...mailerData,
      credentials: cleanedCredentials,
    };

    const response = await fetch(`${this.API_BASE}/mailers`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    const responseData = await response.json();

    // Even if status is 422 (test failed), return the created mailer data
    if (response.status === 422 && responseData.data) {
      // Return the mailer but include error info
      return {
        ...responseData.data,
        test_status: responseData.data.test_status || false,
        test_error: responseData.raw_error || responseData.error || responseData.data.test_error,
      };
    }

    if (!response.ok) {
      // Handle validation errors
      if (responseData.errors) {
        const errorMessages = Object.entries(responseData.errors)
          .map(([field, messages]) => {
            const fieldMessages = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${fieldMessages.join(', ')}`;
          })
          .join('\n');
        throw new Error(errorMessages || responseData.message || 'Validation failed');
      }
      throw new Error(responseData.message || responseData.error || 'Failed to create mailer');
    }

    return responseData.data;
  }

  async updateMailer(id: number, mailerData: Partial<MailerFormData>): Promise<Mailer> {
    // Clean credentials if provided
    let cleanedData: any = { ...mailerData };
    if (mailerData.credentials) {
      const cleanedCredentials: MailerCredentials = {};
      Object.entries(mailerData.credentials).forEach(([key, value]) => {
        // Keep null for encryption field (it's a valid value)
        if (key === 'encryption' && value === null) {
          cleanedCredentials[key as keyof MailerCredentials] = null;
        } else if (value !== undefined && value !== null && value !== '') {
          cleanedCredentials[key as keyof MailerCredentials] = value;
        }
      });
      cleanedData.credentials = cleanedCredentials;
    }

    const response = await fetch(`${this.API_BASE}/mailers/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(cleanedData),
    });

    const responseData = await response.json();

    // Even if status is 422 (test failed), return the updated mailer data
    if (response.status === 422 && responseData.data) {
      return {
        ...responseData.data,
        test_status: responseData.data.test_status || false,
        test_error: responseData.raw_error || responseData.error || responseData.data.test_error,
      };
    }

    if (!response.ok) {
      // Handle validation errors
      if (responseData.errors) {
        const errorMessages = Object.entries(responseData.errors)
          .map(([field, messages]) => {
            const fieldMessages = Array.isArray(messages) ? messages : [messages];
            return `${field}: ${fieldMessages.join(', ')}`;
          })
          .join('\n');
        throw new Error(errorMessages || responseData.message || 'Validation failed');
      }
      throw new Error(responseData.message || responseData.error || 'Failed to update mailer');
    }

    return responseData.data;
  }

  async deleteMailer(id: number): Promise<void> {
    const response = await fetch(`${this.API_BASE}/mailers/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete mailer');
    }
  }

  async testMailer(id: number, testEmail: string): Promise<Mailer> {
    const response = await fetch(`${this.API_BASE}/mailers/${id}/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ test_email: testEmail }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to test mailer');
    }

    const data = await response.json();
    return data.data;
  }

  async activateMailer(id: number): Promise<Mailer> {
    const response = await fetch(`${this.API_BASE}/mailers/${id}/activate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to activate mailer');
    }

    const data = await response.json();
    return data.data;
  }

  async deactivateMailer(id: number): Promise<Mailer> {
    const response = await fetch(`${this.API_BASE}/mailers/${id}/deactivate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to deactivate mailer');
    }

    const data = await response.json();
    return data.data;
  }

  async getSupportedProviders(): Promise<SupportedProviders> {
    const response = await fetch(`${this.API_BASE}/mailers/providers/list`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch supported providers');
    }

    const data = await response.json();
    return data.data;
  }
}

export const mailerService = new MailerService();

