import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save, X, UserPlus, UserMinus, Edit, Trash2 } from 'lucide-react';
import { useAssignmentService } from '@/hooks/useAssignmentService';
import { useUserService } from '@/hooks/useUserService';
import { usePermissions } from '@/hooks/usePermissions';
import { PublicUserNotice } from './PublicUserNotice';
import { ASSIGNMENT_ROLES } from '@/types/assignment';
import type { TaskAssignment, CreateAssignmentData, UpdateAssignmentData, AssignmentRole } from '@/types/assignment';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
  taskTitle: string;
  taskCreatorId?: number;
  onAssignmentChanged: () => void;
}

const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  taskId,
  taskTitle,
  taskCreatorId,
  onAssignmentChanged,
}) => {
  const { fetchTaskAssignments, createAssignment, updateAssignment, deleteAssignment } = useAssignmentService();
  const { fetchAllUsers } = useUserService();
  const { isPublicUser } = usePermissions();
  
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<TaskAssignment | null>(null);
  
  // New assignment form
  const [newAssignment, setNewAssignment] = useState({
    user_id: '',
    role: 'assignee' as AssignmentRole,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    } else {
      // Reset state when modal closes
      setAssignments([]);
      setUsers([]);
      setEditingAssignment(null);
      setNewAssignment({ user_id: '', role: 'assignee', notes: '' });
      setError(null);
    }
  }, [isOpen, taskId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [assignmentsData, usersData] = await Promise.all([
        fetchTaskAssignments(taskId),
        fetchAllUsers(),
      ]);
      
      setAssignments(assignmentsData);
      setUsers(usersData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.user_id) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const assignmentData: CreateAssignmentData = {
        task_id: taskId,
        user_id: parseInt(newAssignment.user_id),
        role: newAssignment.role,
        notes: newAssignment.notes || undefined,
      };
      
      await createAssignment(assignmentData);
      
      // Reset form and reload data
      setNewAssignment({ user_id: '', role: 'assignee', notes: '' });
      await loadData();
      onAssignmentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateAssignment = async (assignment: TaskAssignment, updates: UpdateAssignmentData) => {
    setError(null);
    
    try {
      await updateAssignment(assignment.id, updates);
      await loadData();
      onAssignmentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
    }
  };

  const handleDeleteAssignment = async (assignment: TaskAssignment) => {
    setError(null);
    
    try {
      await deleteAssignment(assignment.id);
      await loadData();
      onAssignmentChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: AssignmentRole) => {
    const roleConfig = ASSIGNMENT_ROLES[role];
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colorMap[roleConfig.color as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  };

  const availableUsers = users.filter(user => 
    // Exclude users who are already assigned
    !assignments.some(assignment => 
      assignment.user?.id === user.id && assignment.is_active
    ) &&
    // Exclude the task creator
    (!taskCreatorId || user.id !== taskCreatorId)
  );

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Loading assignments...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Assignments</DialogTitle>
          <DialogDescription>
            Manage user assignments for "{taskTitle}"
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isPublicUser() && (
          <PublicUserNotice variant="compact" />
        )}

        {/* Current Assignments */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Current Assignments</h3>
          
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No users assigned to this task yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={assignment.user?.name || 'User'} />
                      <AvatarFallback>
                        {assignment.user?.name ? getInitials(assignment.user.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium">{assignment.user?.name}</p>
                        <Badge className={getRoleColor(assignment.role as AssignmentRole)}>
                          {ASSIGNMENT_ROLES[assignment.role as AssignmentRole]?.label}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600">{assignment.user?.email}</p>
                      {assignment.notes && (
                        <p className="text-sm text-gray-500 mt-1">{assignment.notes}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Assigned {assignment.assigned_at_formatted}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAssignment(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Edit Assignment */}
        {editingAssignment && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold text-blue-800">Edit Assignment</h3>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const updates = {
                role: formData.get('role') as AssignmentRole,
                notes: formData.get('notes') as string,
              };
              handleUpdateAssignment(editingAssignment, updates);
              setEditingAssignment(null);
            }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Role</Label>
                  <Select 
                    name="role"
                    defaultValue={editingAssignment.role}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(ASSIGNMENT_ROLES).map(([key, role]) => (
                        <SelectItem key={key} value={key}>
                          <div>
                            <div className="font-medium">{role.label}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>User</Label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-sm">
                        {editingAssignment.user?.name ? getInitials(editingAssignment.user.name) : 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{editingAssignment.user?.name}</p>
                      <p className="text-sm text-gray-600">{editingAssignment.user?.email}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  name="notes"
                  defaultValue={editingAssignment.notes || ''}
                  placeholder="Add any notes about this assignment..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingAssignment(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Assignment
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Add New Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Add New Assignment</h3>
          
          <form onSubmit={handleCreateAssignment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="user_id">User *</Label>
                <Select 
                  value={newAssignment.user_id} 
                  onValueChange={(value) => setNewAssignment(prev => ({ ...prev, user_id: value }))}
                  disabled={availableUsers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableUsers.length === 0 && (
                  <p className="text-sm text-gray-500">All users are already assigned to this task.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newAssignment.role} 
                  onValueChange={(value) => setNewAssignment(prev => ({ ...prev, role: value as AssignmentRole }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ASSIGNMENT_ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-sm text-gray-500">{role.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={newAssignment.notes}
                onChange={(e) => setNewAssignment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about this assignment..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !newAssignment.user_id || availableUsers.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Assign User
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentModal;
