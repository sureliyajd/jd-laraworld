import { AUTH_CONFIG } from '@/config/auth';

export interface EmailLog {
  id: number;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  body: string; // Supports both plain text and HTML
  html_body: string | null; // Deprecated: kept for backward compatibility
  status: 'pending' | 'sent' | 'failed' | 'bounced';
  status_label: string;
  error_message: string | null;
  sent_at: string | null;
  sent_at_formatted: string | null;
  sent_at_human: string | null;
  metadata: {
    cc?: string[];
    bcc?: string[];
  } | null;
  created_at: string;
  created_at_formatted: string;
  created_at_human: string;
  updated_at: string;
  sender: {
    id: number;
    name: string;
    email: string;
  };
  mailer?: {
    id: number;
    name: string;
    provider: string;
  } | null;
  mailer_id?: number | null;
}

export interface SendEmailData {
  recipient_email: string;
  recipient_name?: string;
  subject: string;
  body: string; // Supports both plain text and HTML
  cc?: string[];
  bcc?: string[];
}

export interface EmailStatistics {
  total: number;
  sent: number;
  pending: number;
  failed: number;
  bounced: number;
}

class EmailService {
  private readonly API_BASE = AUTH_CONFIG.API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async fetchEmailLogs(filters: Record<string, any> = {}): Promise<{ data: EmailLog[]; meta: any }> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.API_BASE}/email-logs?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch email logs');
    }

    return response.json();
  }

  async fetchEmailLog(id: number): Promise<EmailLog> {
    const response = await fetch(`${this.API_BASE}/email-logs/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch email log');
    }

    const data = await response.json();
    return data.data;
  }

  async sendEmail(emailData: SendEmailData): Promise<EmailLog> {
    const response = await fetch(`${this.API_BASE}/email-logs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send email');
    }

    const data = await response.json();
    return data.data;
  }

  async getStatistics(filters: Record<string, any> = {}): Promise<EmailStatistics> {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.API_BASE}/email-logs/statistics/overview?${queryParams}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch email statistics');
    }

    const data = await response.json();
    return data.data;
  }

  async deleteEmailLog(id: number): Promise<void> {
    const response = await fetch(`${this.API_BASE}/email-logs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete email log');
    }
  }
}

export const emailService = new EmailService();

