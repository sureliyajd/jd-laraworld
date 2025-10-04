import { 
  TaskAttachment, 
  CreateAttachmentData, 
  UpdateAttachmentData, 
  AttachmentFilters, 
  AttachmentListResponse 
} from '@/types/attachment';

type Listener = () => void;

class AttachmentService {
  private attachments: TaskAttachment[] = [];
  private loading = false;
  private error: string | null = null;
  private listeners: Set<Listener> = new Set();
  private attachmentsRequest: Promise<any> | null = null;

  private readonly API_BASE = 'http://localhost:8000/api';

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };
  }

  private getFormDataHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getAttachments() {
    return this.attachments;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  async fetchAttachments(filters: AttachmentFilters = {}): Promise<AttachmentListResponse> {
    if (this.attachmentsRequest) {
      return this.attachmentsRequest;
    }

    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const requestPromise = fetch(`${this.API_BASE}/task-attachments?${queryParams}`, {
        headers: this.getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch attachments');
        }
        return response.json();
      });

      this.attachmentsRequest = requestPromise;
      const data = await requestPromise;
      this.attachments = data.data || [];
      return data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch attachments';
      throw err;
    } finally {
      this.loading = false;
      this.attachmentsRequest = null;
      this.notifyListeners();
    }
  }

  async fetchTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    try {
      const response = await fetch(`${this.API_BASE}/task-attachments?task_id=${taskId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task attachments');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch task attachments';
      this.notifyListeners();
      return [];
    }
  }

  async uploadAttachment(attachmentData: CreateAttachmentData): Promise<TaskAttachment | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const formData = new FormData();
      formData.append('file', attachmentData.file);
      formData.append('task_id', attachmentData.task_id.toString());
      
      if (attachmentData.description) {
        formData.append('description', attachmentData.description);
      }

      const response = await fetch(`${this.API_BASE}/task-attachments`, {
        method: 'POST',
        headers: this.getFormDataHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to upload attachment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      const data = await response.json();
      // Refresh attachments list
      await this.fetchAttachments();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to upload attachment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async updateAttachment(id: number, attachmentData: UpdateAttachmentData): Promise<TaskAttachment | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();


      const response = await fetch(`${this.API_BASE}/task-attachments/${id}`, {
        method: 'PUT',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(attachmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to update attachment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      const data = await response.json();
      // Refresh attachments list
      await this.fetchAttachments();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update attachment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async deleteAttachment(id: number): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/task-attachments/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || errorData.message || 'Failed to delete attachment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      // Refresh attachments list
      await this.fetchAttachments();
      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete attachment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async downloadAttachment(attachment: TaskAttachment): Promise<void> {
    try {
      // Use the download URL which forces download
      const downloadUrl = attachment.download_url || `${this.API_BASE}/task-attachments/${attachment.id}/download`;
      const response = await fetch(downloadUrl, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to download attachment';
      this.notifyListeners();
      throw err;
    }
  }

  // Utility methods
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    return { valid: true };
  }

  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }

  getFileIcon(mimeType: string): string {
    const iconMap: Record<string, string> = {
      'image/jpeg': 'fas fa-image',
      'image/jpg': 'fas fa-image',
      'image/png': 'fas fa-image',
      'image/gif': 'fas fa-image',
      'image/webp': 'fas fa-image',
      'image/svg+xml': 'fas fa-image',
      'application/pdf': 'fas fa-file-pdf',
      'application/msword': 'fas fa-file-word',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
      'application/vnd.ms-excel': 'fas fa-file-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
      'text/plain': 'fas fa-file-alt',
      'text/csv': 'fas fa-file-csv',
      'application/zip': 'fas fa-file-archive',
      'application/x-rar-compressed': 'fas fa-file-archive',
      'application/x-7z-compressed': 'fas fa-file-archive',
      'application/gzip': 'fas fa-file-archive',
    };

    return iconMap[mimeType] || 'fas fa-file';
  }
}

// Export singleton instance
export const attachmentService = new AttachmentService();

// Export types
export type { TaskAttachment, CreateAttachmentData, UpdateAttachmentData, AttachmentFilters, AttachmentListResponse };
