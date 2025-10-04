import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Upload, 
  X, 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  File, 
  Image as ImageIcon,
  FileText,
  Archive,
  Save,
  Paperclip,
  ExternalLink,
  Maximize2
} from 'lucide-react';
import { useAttachmentService } from '@/hooks/useAttachmentService';
import type { TaskAttachment, CreateAttachmentData, UpdateAttachmentData } from '@/types/attachment';

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
  onAttachmentChanged: () => void;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  onAttachmentChanged,
}) => {
  const { fetchTaskAttachments, uploadAttachment, updateAttachment, deleteAttachment, downloadAttachment, validateFile, formatFileSize, getFileIcon } = useAttachmentService();
  
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAttachment, setEditingAttachment] = useState<TaskAttachment | null>(null);
  
  // Upload form
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Edit form
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadAttachments();
    } else {
      // Reset state when modal closes
      setAttachments([]);
      setEditingAttachment(null);
      setSelectedFile(null);
      setDescription('');
      setUploadError(null);
      setError(null);
    }
  }, [isOpen, taskId]);

  const loadAttachments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const attachmentsData = await fetchTaskAttachments(taskId);
      setAttachments(attachmentsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      if (validation.valid) {
        setSelectedFile(file);
        setUploadError(null);
      } else {
        setUploadError(validation.error || 'Invalid file');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const attachmentData: CreateAttachmentData = {
        file: selectedFile,
        task_id: taskId,
        description: description || undefined,
      };
      
      
      await uploadAttachment(attachmentData);
      
      // Reset form and reload data
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      await loadAttachments();
      onAttachmentChanged();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateAttachment = async (attachment: TaskAttachment) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      const updates: UpdateAttachmentData = {
        description: editDescription,
      };
      
      
      await updateAttachment(attachment.id, updates);
      await loadAttachments();
      onAttachmentChanged();
      setEditingAttachment(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update attachment');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAttachment = async (attachment: TaskAttachment) => {
    setError(null);
    
    try {
      await deleteAttachment(attachment.id);
      await loadAttachments();
      onAttachmentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete attachment');
    }
  };

  const handleDownload = async (attachment: TaskAttachment) => {
    try {
      await downloadAttachment(attachment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download attachment');
    }
  };

  const startEdit = (attachment: TaskAttachment) => {
    setEditingAttachment(attachment);
    setEditDescription(attachment.description || '');
  };

  const cancelEdit = () => {
    setEditingAttachment(null);
    setEditDescription('');
  };

  const getAttachmentIcon = (attachment: TaskAttachment) => {
    if (attachment.is_image) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (attachment.is_document) return <FileText className="h-5 w-5 text-green-500" />;
    if (attachment.is_archive) return <Archive className="h-5 w-5 text-orange-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handlePreview = (attachment: TaskAttachment) => {
    setPreviewAttachment(attachment);
  };

  const handleOpenFile = (attachment: TaskAttachment) => {
    // Open file directly using the direct URL
    window.open(attachment.url, '_blank');
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[700px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading attachments...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Attachments</DialogTitle>
          <DialogDescription>
            Manage file attachments for "{taskTitle}"
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Attachments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Attachments</h3>
          
          {attachments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No attachments for this task yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    {/* Thumbnail/Icon */}
                    <div className="relative">
                      {attachment.is_image ? (
                        <div className="relative group">
                          <img
                            src={attachment.url}
                            alt={attachment.original_filename}
                            className="w-12 h-12 object-cover rounded border cursor-pointer"
                            onClick={() => handlePreview(attachment)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            {getAttachmentIcon(attachment)}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Maximize2 className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                          {getAttachmentIcon(attachment)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <p 
                          className="font-medium truncate cursor-pointer hover:text-blue-600 text-sm"
                          onClick={() => handleOpenFile(attachment)}
                          title={attachment.original_filename}
                        >
                          {attachment.original_filename}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {attachment.human_file_size}
                          </Badge>
                          {attachment.description && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              <FileText className="h-3 w-3 mr-1" />
                              Note
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {attachment.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{attachment.description}</p>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-1">
                        Uploaded {new Date(attachment.created_at).toLocaleDateString()} by {attachment.uploader?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {attachment.is_image && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(attachment)}
                        title="Preview"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenFile(attachment)}
                      title="Open file"
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                      title="Download"
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(attachment)}
                      title="Edit"
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAttachment(attachment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Edit Attachment */}
        {editingAttachment && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800">Edit Attachment</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                {getAttachmentIcon(editingAttachment)}
                <div>
                  <p className="font-medium">{editingAttachment.original_filename}</p>
                  <p className="text-sm text-gray-600">{editingAttachment.human_file_size}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a description or note about this attachment (optional)..."
                  rows={3}
                />
              </div>


              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={cancelEdit}
                  disabled={isUpdating}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateAttachment(editingAttachment)}
                  disabled={isUpdating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUpdating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Upload New Attachment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Upload New Attachment</h3>
          
          <form onSubmit={handleUpload} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file">File *</Label>
              <Input
                id="file"
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar,.7z,.gz"
                className="cursor-pointer"
              />
              {selectedFile && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {getAttachmentIcon({ is_image: selectedFile.type.startsWith('image/'), is_document: false, is_archive: false } as any)}
                  <span>{selectedFile.name}</span>
                  <span>({formatFileSize(selectedFile.size)})</span>
                </div>
              )}
              {uploadError && (
                <p className="text-sm text-red-600">{uploadError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description or note about this attachment (optional)..."
                rows={3}
              />
            </div>


            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Upload File
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>

      {/* Preview Modal */}
      {previewAttachment && (
        <Dialog open={!!previewAttachment} onOpenChange={() => setPreviewAttachment(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview: {previewAttachment.original_filename}
              </DialogTitle>
              {previewAttachment.description && (
                <DialogDescription className="text-base text-gray-700 bg-gray-50 p-3 rounded border">
                  {previewAttachment.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <div className="space-y-4">
              {previewAttachment.is_image ? (
                <div className="flex justify-center">
                  <img
                    src={previewAttachment.url}
                    alt={previewAttachment.original_filename}
                    className="max-w-full max-h-[60vh] object-contain rounded border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="hidden flex flex-col items-center justify-center p-8 text-gray-500">
                    <ImageIcon className="h-16 w-16 mb-4" />
                    <p>Preview not available</p>
                    <Button
                      variant="outline"
                      onClick={() => handleDownload(previewAttachment)}
                      className="mt-4"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <div className="mb-4">
                    {getAttachmentIcon(previewAttachment)}
                  </div>
                  <p className="text-lg mb-2">Preview not available for this file type</p>
                  <p className="text-sm mb-4">
                    {previewAttachment.human_file_size} • {previewAttachment.mime_type}
                  </p>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handleOpenFile(previewAttachment)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open File
                    </Button>
                    <Button
                      onClick={() => handleDownload(previewAttachment)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">File Size:</span> {previewAttachment.human_file_size}
                </div>
                <div>
                  <span className="font-medium">File Type:</span> {previewAttachment.mime_type}
                </div>
                <div>
                  <span className="font-medium">Uploaded:</span> {new Date(previewAttachment.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-medium">Uploaded by:</span> {previewAttachment.uploader?.name}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => handleOpenFile(previewAttachment)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File
              </Button>
              <Button
                onClick={() => handleDownload(previewAttachment)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default AttachmentModal;
