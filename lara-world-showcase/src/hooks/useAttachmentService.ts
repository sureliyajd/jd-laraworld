import { useState, useEffect } from 'react';
import { attachmentService } from '@/services/attachmentService';
import type { TaskAttachment, AttachmentFilters, CreateAttachmentData, UpdateAttachmentData } from '@/types/attachment';

export const useAttachmentService = () => {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = attachmentService.subscribe(() => {
      setAttachments(attachmentService.getAttachments());
      setLoading(attachmentService.getLoading());
      setError(attachmentService.getError());
    });

    // Initialize with current state
    setAttachments(attachmentService.getAttachments());
    setLoading(attachmentService.getLoading());
    setError(attachmentService.getError());

    return unsubscribe;
  }, []);

  const fetchAttachments = async (filters: AttachmentFilters = {}) => {
    try {
      setError(null);
      await attachmentService.fetchAttachments(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attachments');
    }
  };

  const fetchTaskAttachments = async (taskId: number): Promise<TaskAttachment[]> => {
    try {
      setError(null);
      return await attachmentService.fetchTaskAttachments(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task attachments');
      return [];
    }
  };

  const uploadAttachment = async (attachmentData: CreateAttachmentData): Promise<TaskAttachment | null> => {
    try {
      setError(null);
      return await attachmentService.uploadAttachment(attachmentData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      if (err instanceof Error && !err.message.includes('file size') && !err.message.includes('file type') && !err.message.includes('required')) {
        setError(err.message);
      }
      throw err;
    }
  };

  const updateAttachment = async (id: number, attachmentData: UpdateAttachmentData): Promise<TaskAttachment | null> => {
    try {
      setError(null);
      return await attachmentService.updateAttachment(id, attachmentData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      if (err instanceof Error && !err.message.includes('field is required')) {
        setError(err.message);
      }
      throw err;
    }
  };

  const deleteAttachment = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      return await attachmentService.deleteAttachment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
      throw err;
    }
  };

  const downloadAttachment = async (attachment: TaskAttachment): Promise<void> => {
    try {
      setError(null);
      await attachmentService.downloadAttachment(attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download attachment');
      throw err;
    }
  };

  // Utility methods
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    return attachmentService.validateFile(file);
  };

  const formatFileSize = (bytes: number): string => {
    return attachmentService.formatFileSize(bytes);
  };

  const getFileIcon = (mimeType: string): string => {
    return attachmentService.getFileIcon(mimeType);
  };

  return {
    attachments,
    loading,
    error,
    fetchAttachments,
    fetchTaskAttachments,
    uploadAttachment,
    updateAttachment,
    deleteAttachment,
    downloadAttachment,
    validateFile,
    formatFileSize,
    getFileIcon,
  };
};
