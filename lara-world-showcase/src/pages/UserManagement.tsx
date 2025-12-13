import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  Mail,
  Calendar
} from 'lucide-react';
import { useUserService } from '@/hooks/useUserService';
import { usePermissions } from '@/hooks/usePermissions';
import UserModal from '@/components/UserModal';
import UserDetailModal from '@/components/UserDetailModal';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PublicUserNotice } from '@/components/PublicUserNotice';
import type { User, UserFilters } from '@/types/user';

const UserManagement: React.FC = () => {
  const { 
    users, 
    loading, 
    error, 
    fetchUsers,
    createUser,
    deleteUser,
    fetchUserStatistics
  } = useUserService();
  const { can, isPublicUser } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUserDetailModalOpen, setIsUserDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserDialog, setDeleteUserDialog] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null
  });
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    // Load initial data
    applyFilters();
    // Only load statistics if user has permission to view users
    if (can.viewUsers()) {
      loadStatistics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = () => {
    const filters: UserFilters = {};
    
    if (searchTerm) filters.search = searchTerm;
    if (emailVerifiedFilter !== 'all') filters.email_verified = emailVerifiedFilter as 'verified' | 'unverified';
    if (sortBy) filters.sort_by = sortBy as 'name' | 'email' | 'created_at' | 'updated_at';
    if (sortOrder) filters.sort_order = sortOrder as 'asc' | 'desc';
    
    fetchUsers(filters);
  };

  const loadStatistics = async () => {
    try {
      const stats = await fetchUserStatistics();
      setStatistics(stats);
    } catch (err) {
      console.error('Failed to load user statistics:', err);
    }
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeleteUserDialog({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    if (deleteUserDialog.user) {
      try {
        await deleteUser(deleteUserDialog.user.id);
        applyFilters();
        // Only reload statistics if user has permission
        if (can.viewUsers()) {
          loadStatistics();
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
    setDeleteUserDialog({ isOpen: false, user: null });
  };

  const handleUserSaved = () => {
    applyFilters();
    // Only reload statistics if user has permission
    if (can.viewUsers()) {
      loadStatistics();
    }
  };

  const handleUserUpdated = () => {
    applyFilters();
    // Only reload statistics if user has permission
    if (can.viewUsers()) {
      loadStatistics();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatRoleName = (user: User): string => {
    // Try to get role from user.role first, then from user.roles array
    let role: string | undefined;
    
    if (user.role) {
      role = typeof user.role === 'string' ? user.role : user.role;
    } else if (user.roles && Array.isArray(user.roles) && user.roles.length > 0) {
      // Handle both string array and object array
      const firstRole = user.roles[0];
      role = typeof firstRole === 'string' ? firstRole : (firstRole as any)?.name || firstRole;
    }
    
    if (!role) {
      console.warn('User has no role:', user);
      return 'No Role';
    }
    
    // If user has a parent_id and role is 'visitor', they are a "Visitor Member User"
    if (role === 'visitor' && user.parent_id) {
      return 'Visitor Member User';
    }
    
    // Format role names
    const roleMap: { [key: string]: string } = {
      'public': 'Public User',
      'visitor': 'Visitor User',
      'super_admin': 'Super Admin',
    };
    
    return roleMap[role] || role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') + ' User';
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <PermissionGuard permission="create users">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateUser}>
            <Plus className="h-4 w-4 mr-2" />
            New User
          </Button>
        </PermissionGuard>
      </div>

      {/* Public User Notice */}
      {isPublicUser() && <PublicUserNotice />}

      {/* Statistics Cards */}
      {can.viewUsers() && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold">{statistics.total_users}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{statistics.verified_users}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Unverified</p>
                  <p className="text-2xl font-bold text-yellow-600">{statistics.unverified_users}</p>
                </div>
                <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <UserX className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recent (30d)</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.recent_users}</p>
                </div>
                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Tasks</p>
                  <p className="text-2xl font-bold text-indigo-600">{statistics.users_with_tasks}</p>
                </div>
                <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={emailVerifiedFilter} onValueChange={setEmailVerifiedFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Email Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="updated_at">Updated Date</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={applyFilters} className="w-full md:w-auto">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {formatRoleName(user)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Joined {formatDate(user.created_at)}</span>
                      </div>

                      {user.created_tasks_count !== undefined && (
                        <div className="flex items-center space-x-1">
                          <span className="text-blue-600 font-medium">
                            {user.created_tasks_count} tasks created
                          </span>
                        </div>
                      )}
                    </div>
                    {!user.email_verified_at && (
                      <p className="text-xs text-gray-400 mt-1 italic">
                        Email verification pending - planned for next phase
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {can.viewUsers() && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <PermissionGuard permission="edit users">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="delete users">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </PermissionGuard>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {users.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Users className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">
                {searchTerm || emailVerifiedFilter !== 'all'
                  ? 'No users found matching your search criteria. Try adjusting your filters.'
                  : 'Get started by creating your first user account.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={editingUser}
        onUserSaved={handleUserSaved}
      />

      <UserDetailModal
        isOpen={isUserDetailModalOpen}
        onClose={() => {
          setIsUserDetailModalOpen(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.id || null}
        onUserUpdated={handleUserUpdated}
        onEditUser={(user) => {
          setIsUserDetailModalOpen(false);
          setEditingUser(user);
          setIsUserModalOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteUserDialog.isOpen} 
        onOpenChange={(open) => setDeleteUserDialog({ isOpen: open, user: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUserDialog.user?.name}</strong>? 
              This action cannot be undone and will permanently remove the user account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
