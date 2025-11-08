import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, X } from 'lucide-react';
import { useUserService } from '@/hooks/useUserService';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { PublicUserNotice } from './PublicUserNotice';
import { roleService } from '@/services/roleService';
import type { User, CreateUserData, UpdateUserData, Role } from '@/types/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onUserSaved: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserSaved,
}) => {
  const { createUser, updateUser, fetchUser } = useUserService();
  const { user: currentUser } = useAuth();
  const { isPublicUser } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [fullUserData, setFullUserData] = useState<User | null>(null);
  const loadedUserIdRef = useRef<number | null>(null);
  
  // Check if current user is super admin
  const isSuperAdmin = React.useMemo(() => {
    if (!currentUser?.roles) return false;
    const roles = Array.isArray(currentUser.roles) ? currentUser.roles : [];
    return roles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return roleName === 'super_admin';
    });
  }, [currentUser]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    credits: {
      user: 0,
      email: 0,
      task: 0,
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;
  // Use fullUserData if available, otherwise fallback to user prop
  const displayUser = fullUserData || user;
  const userRole = displayUser?.role || formData.role || '';
  // Check if the user being edited is a super admin
  const isEditingSuperAdmin = React.useMemo(() => {
    if (!isEditing || !displayUser?.roles) return false;
    const userRoles = Array.isArray(displayUser.roles) ? displayUser.roles : [];
    return userRoles.some((role: any) => {
      const roleName = typeof role === 'string' ? role : role?.name;
      return roleName === 'super_admin';
    }) || userRole === 'super_admin';
  }, [isEditing, displayUser, userRole]);
  
  const selectedRole = formData.role || userRole;
  const isVisitor = selectedRole === 'visitor' || (!isEditing && !formData.role);
  const showCredits = isSuperAdmin && isVisitor;

  // Load roles when modal opens and user is super admin
  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      loadRoles();
    }
  }, [isOpen, isSuperAdmin]);

  // Load full user data when editing (to get roles and credits)
  useEffect(() => {
    // Reset ref when modal closes
    if (!isOpen) {
      loadedUserIdRef.current = null;
      setFullUserData(null);
      setLoadingUserData(false);
      return;
    }

    // If creating new user, reset form
    if (!user?.id) {
      loadedUserIdRef.current = null;
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: '',
        credits: {
          user: 0,
          email: 0,
          task: 0,
        },
      });
      setFullUserData(null);
      setErrors({});
      setLoadingUserData(false);
      return;
    }

    // If we already loaded this user, don't reload
    if (loadedUserIdRef.current === user.id) {
      setLoadingUserData(false);
      return;
    }

    // Mark this user as being loaded immediately to prevent duplicate loads
    loadedUserIdRef.current = user.id;

    let isMounted = true;
    let isCancelled = false;

    const loadFullUserData = async () => {
      if (!user?.id || !isOpen || isCancelled) return;

      try {
        setLoadingUserData(true);
        const fullUser = await fetchUser(user.id);
        
        if (isCancelled || !isMounted) return;
        
        if (fullUser) {
          setFullUserData(fullUser);
          setFormData({
            name: fullUser.name,
            email: fullUser.email,
            password: '',
            password_confirmation: '',
            role: fullUser.role || '',
            credits: {
              user: fullUser.credits?.user?.credits || 0,
              email: fullUser.credits?.email?.credits || 0,
              task: fullUser.credits?.task?.credits || 0,
            },
          });
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        if (isCancelled || !isMounted) return;
        
        // Fallback to using the user data from props if fetch fails
        if (user) {
          setFormData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            role: user.role || '',
            credits: {
              user: user.credits?.user?.credits || 0,
              email: user.credits?.email?.credits || 0,
              task: user.credits?.task?.credits || 0,
            },
          });
        }
      } finally {
        if (isMounted && !isCancelled) {
          setLoadingUserData(false);
        }
      }
    };

    loadFullUserData();

    return () => {
      isMounted = false;
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isOpen]); // Only depend on user.id and isOpen

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const rolesData = await roleService.fetchRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setLoadingRoles(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!isEditing && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password && formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && user) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
        };

        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }

        // Only include role and credits if super admin
        if (isSuperAdmin) {
          // For super admin editing, if user is super admin, don't update role
          // Otherwise, update role
          if (!isEditingSuperAdmin) {
            updateData.role = formData.role || null;
          }

          // Only include credits if role is visitor
          const finalRole = formData.role || userRole;
          if (finalRole === 'visitor') {
            updateData.credits = formData.credits;
          }
        }

        await updateUser(user.id, updateData);
      } else {
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        };

        // Only include role and credits if super admin
        if (isSuperAdmin) {
          // Default to visitor if no role selected
          createData.role = formData.role || 'visitor';
          
          // Only include credits if role is visitor (or default)
          if (!formData.role || formData.role === 'visitor') {
            createData.credits = formData.credits;
          }
        }

        await createUser(createData);
      }

      onUserSaved();
      onClose();
    } catch (error: any) {
      // Try to extract error data from various possible locations
      let errorData = null;
      let validationMessages = null;
      
      // Check multiple possible locations for error data
      if (error.response?.data) {
        errorData = error.response.data;
      } else if (error.responseData) {
        errorData = error.responseData;
      } else if (error.data) {
        errorData = error.data;
      }
      
      if (errorData?.messages) {
        validationMessages = errorData.messages;
      } else if (errorData?.errors) {
        validationMessages = errorData.errors;
      } else if (error.errors) {
        // Direct access to errors from error object
        validationMessages = error.errors;
      } else if (error.messages) {
        // Direct access to messages from error object
        validationMessages = error.messages;
      }
      
      if (validationMessages) {
        // Handle validation errors
        const mappedErrors: Record<string, string> = {};
        
        Object.keys(validationMessages).forEach(key => {
          const fieldName = key.replace(/\./g, '_');
          mappedErrors[fieldName] = Array.isArray(validationMessages[key]) 
            ? validationMessages[key][0] 
            : validationMessages[key];
        });
        
        setErrors(mappedErrors);
      } else if (errorData?.error) {
        // General server error
        setErrors({ submit: errorData.error });
      } else if (errorData?.message) {
        // General server error
        setErrors({ submit: errorData.message });
      } else if (error.message) {
        // Client-side or network error
        setErrors({ submit: error.message });
      } else {
        setErrors({ submit: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('credits.')) {
      const creditField = field.split('.')[1] as 'user' | 'email' | 'task';
      setFormData(prev => ({
        ...prev,
        credits: {
          ...prev.credits,
          [creditField]: typeof value === 'string' ? parseInt(value) || 0 : value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
    // Clear credits if role is not visitor
    if (value !== 'visitor') {
      setFormData(prev => ({
        ...prev,
        role: value,
        credits: { user: 0, email: 0, task: 0 },
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the user information below.' 
              : 'Fill in the details to create a new user account.'
            }
          </DialogDescription>
        </DialogHeader>

        {loadingUserData && isEditing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading user data...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {isPublicUser() && (
            <PublicUserNotice variant="compact" />
          )}
          
          {errors.submit && (
            <Alert variant="destructive">
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}
          
          {/* Show general validation errors if any field has errors */}
          {Object.keys(errors).some(key => key !== 'submit' && errors[key]) && (
            <Alert variant="destructive">
              <AlertDescription>
                Please correct the errors below before submitting the form.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEditing ? '(leave blank to keep current)' : '*'}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={isEditing ? 'Enter new password (optional)' : 'Enter password'}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {formData.password && (
            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Confirm Password</Label>
              <Input
                id="password_confirmation"
                type="password"
                value={formData.password_confirmation}
                onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                placeholder="Confirm password"
                className={errors.password_confirmation ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-red-600">{errors.password_confirmation}</p>
              )}
            </div>
          )}

          {/* Role and Credits Section - Only for Super Admin */}
          {isSuperAdmin && (
            <>
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                {isEditingSuperAdmin ? (
                  <Input
                    id="role"
                    type="text"
                    value="Super Admin"
                    disabled
                    className="bg-gray-100 cursor-not-allowed"
                  />
                ) : (
                  <Select
                    value={formData.role || undefined}
                    onValueChange={handleRoleChange}
                    disabled={isSubmitting || loadingRoles}
                  >
                    <SelectTrigger id="role" className={errors.role ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select a role (defaults to visitor)" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.role && (
                  <p className="text-sm text-red-600">{errors.role}</p>
                )}
              </div>

              {/* Credits Section - Only show if role is visitor or creating new user */}
              {showCredits && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-md">
                  <Label className="text-base font-semibold">Credits (Only for Visitor Role)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="credits_user">User Credits</Label>
                      <Input
                        id="credits_user"
                        type="number"
                        min="0"
                        value={formData.credits.user}
                        onChange={(e) => handleInputChange('credits.user', e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits_email">Email Credits</Label>
                      <Input
                        id="credits_email"
                        type="number"
                        min="0"
                        value={formData.credits.email}
                        onChange={(e) => handleInputChange('credits.email', e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="credits_task">Task Credits</Label>
                      <Input
                        id="credits_task"
                        type="number"
                        min="0"
                        value={formData.credits.task}
                        onChange={(e) => handleInputChange('credits.task', e.target.value)}
                        placeholder="0"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update User' : 'Create User')
              }
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
