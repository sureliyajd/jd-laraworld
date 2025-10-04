export interface TaskAttachment {
  id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  file_path: string;
  disk: string;
  description?: string;
  task_id: number;
  uploaded_by: number;
  created_at: string;
  updated_at: string;
  
  // Computed attributes
  url: string;
  preview_url?: string;
  download_url?: string;
  extension: string;
  human_file_size: string;
  is_image: boolean;
  is_document: boolean;
  is_archive: boolean;
  icon_class: string;
  
  // Relationships
  task?: {
    id: number;
    title: string;
  };
  uploader?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateAttachmentData {
  file: File;
  task_id: number;
  description?: string;
}

export interface UpdateAttachmentData {
  description?: string;
}

export interface AttachmentFilters {
  task_id?: number;
  uploaded_by?: number;
  type?: 'image' | 'document' | 'archive';
  sort_by?: 'filename' | 'file_size' | 'created_at' | 'updated_at';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
}

export interface AttachmentListResponse {
  data: TaskAttachment[];
  meta: {
    total: number;
    count: number;
    per_page: number;
    current_page: number;
    total_pages: number;
    has_more_pages: boolean;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

// File type configurations
export const FILE_TYPES = {
  image: {
    label: 'Image',
    color: 'blue',
    icon: 'fas fa-image',
    description: 'Image files (JPG, PNG, GIF, etc.)'
  },
  document: {
    label: 'Document',
    color: 'green',
    icon: 'fas fa-file-alt',
    description: 'Document files (PDF, DOC, XLS, TXT, etc.)'
  },
  archive: {
    label: 'Archive',
    color: 'orange',
    icon: 'fas fa-file-archive',
    description: 'Archive files (ZIP, RAR, 7Z, etc.)'
  },
  other: {
    label: 'Other',
    color: 'gray',
    icon: 'fas fa-file',
    description: 'Other file types'
  }
} as const;

export type FileType = keyof typeof FILE_TYPES;

// MIME type mappings
export const MIME_TYPE_ICONS: Record<string, string> = {
  // Images
  'image/jpeg': 'fas fa-image',
  'image/jpg': 'fas fa-image',
  'image/png': 'fas fa-image',
  'image/gif': 'fas fa-image',
  'image/webp': 'fas fa-image',
  'image/svg+xml': 'fas fa-image',
  
  // Documents
  'application/pdf': 'fas fa-file-pdf',
  'application/msword': 'fas fa-file-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
  'application/vnd.ms-excel': 'fas fa-file-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
  'text/plain': 'fas fa-file-alt',
  'text/csv': 'fas fa-file-csv',
  
  // Archives
  'application/zip': 'fas fa-file-archive',
  'application/x-rar-compressed': 'fas fa-file-archive',
  'application/x-7z-compressed': 'fas fa-file-archive',
  'application/gzip': 'fas fa-file-archive',
  
  // Default
  'default': 'fas fa-file'
};

// File size limits
export const FILE_SIZE_LIMITS = {
  max_size: 10 * 1024 * 1024, // 10MB
  max_size_mb: 10,
  allowed_types: [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed', 'application/gzip'
  ]
} as const;
