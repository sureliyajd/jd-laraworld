import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  User, 
  MessageSquare, 
  Paperclip, 
  Edit, 
  Trash2,
  CheckCircle,
  Circle,
  Play,
  XCircle,
  Plus,
  Send,
  Users,
  File,
  FileText,
  Image as ImageIcon,
  Eye,
  ExternalLink,
  Download,
  Maximize2
} from 'lucide-react';
import { useTaskService } from '@/hooks/useTaskService';
import AssignmentModal from './AssignmentModal';
import AttachmentModal from './AttachmentModal';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number | null;
  onTaskUpdated?: () => void;
  onEditTask?: (task: any) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose, taskId, onTaskUpdated, onEditTask }) => {
  const { fetchTask, updateTaskStatus, updateTaskPriority, deleteTask, addComment, loading, error } = useTaskService();
  const [task, setTask] = useState<any>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<any>(null);

  useEffect(() => {
    if (isOpen && taskId) {
      loadTask();
    }
  }, [isOpen, taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    
    const taskData = await fetchTask(taskId);
    setTask(taskData);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!task) return;
    const updated = await updateTaskStatus(task.id, newStatus);
    if (updated) {
      //setTask((prev: any) => ({ ...(prev || {}), ...updated }));
      await loadTask();
      // No extra refetch or parent refresh needed (store already updated)
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;
    const updated = await updateTaskPriority(task.id, newPriority);
    if (updated) {
      //setTask((prev: any) => ({ ...(prev || {}), ...updated }));
      await loadTask();
    }
  };

  const handlePreviewAttachment = (attachment: any) => {
    setPreviewAttachment(attachment);
  };

  const handleOpenAttachment = (attachment: any) => {
    // Open file directly using the direct URL
    window.open(attachment.url, '_blank');
  };

  const getAttachmentIcon = (attachment: any) => {
    if (attachment.is_image) return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (attachment.is_document) return <FileText className="h-4 w-4 text-green-500" />;
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      const success = await deleteTask(task.id);
      if (success) {
        onClose();
        onTaskUpdated?.();
      }
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !task) return;

    setIsSubmittingComment(true);
    const success = await addComment(task.id, newComment.trim());
    if (success) {
      setNewComment('');
      await loadTask();
    }
    setIsSubmittingComment(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  if (!task) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Accessibility: provide hidden title/description for screen readers */}
          <DialogHeader>
            <DialogTitle className="sr-only">Loading task</DialogTitle>
            <DialogDescription className="sr-only">Please wait while the task loads.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {getStatusIcon(task.status)}
            <span className="flex-1 truncate">{task.title}</span>
          </DialogTitle>
          <DialogDescription>
            Created by {task.creator.name} • {new Date(task.created_at).toLocaleDateString()}
          </DialogDescription>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => onEditTask?.(task)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeleteTask}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {task.description || 'No description provided.'}
                  </p>
                </div>

                {task.metadata && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Metadata</h4>
                    <div className="flex flex-wrap gap-2">
                      {task.metadata.labels?.map((label: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assignments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Assignments ({task.assignments?.length || 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAssignmentModalOpen(true)}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Manage Assignments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {task.assignments && task.assignments.length > 0 ? (
                  <div className="space-y-3">
                    {task.assignments.map((assignment: any) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 font-medium text-sm">
                              {assignment.user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{assignment.user?.name}</p>
                            <p className="text-sm text-gray-600">{assignment.user?.email}</p>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {assignment.role_label}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No users assigned to this task yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAssignmentModalOpen(true)}
                      className="mt-4"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Assign Users
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({task.attachments?.length || 0})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAttachmentModalOpen(true)}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Manage Attachments
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="space-y-3">
                    {task.attachments.map((attachment: any) => (
                      <div key={attachment.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          {/* Thumbnail/Icon */}
                          <div className="relative flex-shrink-0">
                            {attachment.is_image ? (
                              <div className="relative group">
                                <img
                                  src={attachment.url}
                                  alt={attachment.original_filename}
                                  className="w-10 h-10 object-cover rounded border cursor-pointer"
                                  onClick={() => handlePreviewAttachment(attachment)}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <div className="hidden w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                  {getAttachmentIcon(attachment)}
                                </div>
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                  <Maximize2 className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center">
                                {getAttachmentIcon(attachment)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-medium truncate cursor-pointer hover:text-blue-600 text-sm"
                              onClick={() => handleOpenAttachment(attachment)}
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
                            {attachment.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{attachment.description}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                          {attachment.is_image && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePreviewAttachment(attachment)}
                              title="Preview"
                              className="h-7 w-7 p-0"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAttachment(attachment)}
                            title="Open file"
                            className="h-7 w-7 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Paperclip className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No attachments for this task yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAttachmentModalOpen(true)}
                      className="mt-4"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Comments ({task.comments?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={!newComment.trim() || isSubmittingComment}>
                      {isSubmittingComment ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Add Comment
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <Separator />

                {/* Comments List */}
                <div className="space-y-4">
                  {task.comments?.map((comment: any) => (
                    <div key={comment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {comment.author_name}
                          </span>
                          {comment.is_system_comment && (
                            <Badge variant="secondary" className="text-xs">
                              System
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">
                      No comments yet. Be the first to add a comment!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Priority */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Status
                  </label>
                  <Select value={task.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority
                  </label>
                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Task Info */}
            <Card>
              <CardHeader>
                <CardTitle>Task Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>

                {task.category && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: task.category.color }}
                      />
                      <span className="text-sm font-medium">{task.category.name}</span>
                    </div>
                  </div>
                )}

                {task.due_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Due Date</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className={`text-sm ${task.is_overdue ? 'text-red-600' : ''}`}>
                        {task.due_date_formatted}
                      </span>
                    </div>
                  </div>
                )}

                {task.assignee && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Assignee</span>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">{task.assignee.name}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${task.progress_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{task.progress_percentage}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({task.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {task.attachments.map((attachment: any) => (
                      <div key={attachment.id} className="flex items-center gap-2 p-2 border rounded">
                        <span className="text-sm truncate max-w-xs" title={attachment.original_filename}>{attachment.original_filename}</span>
                        <Badge variant="outline" className="text-xs">
                          {attachment.human_file_size}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* Assignment Modal */}
      {task && (
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          taskId={task.id}
          taskTitle={task.title}
          taskCreatorId={task.created_by}
          onAssignmentChanged={() => {
            loadTask(); // Reload task to get updated assignments
            if (onTaskUpdated) {
              onTaskUpdated();
            }
          }}
        />
      )}
      
      {/* Attachment Modal */}
      {task && (
        <AttachmentModal
          isOpen={isAttachmentModalOpen}
          onClose={() => setIsAttachmentModalOpen(false)}
          taskId={task.id}
          taskTitle={task.title}
          onAttachmentChanged={() => {
            loadTask(); // Reload task to get updated attachments
            if (onTaskUpdated) {
              onTaskUpdated();
            }
          }}
        />
      )}
      
      {/* Attachment Preview Modal */}
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
                  <Button
                    variant="outline"
                    onClick={() => handleOpenAttachment(previewAttachment)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open File
                  </Button>
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
                onClick={() => handleOpenAttachment(previewAttachment)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open File
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default TaskDetailModal;
