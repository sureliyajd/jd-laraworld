import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TestTube, 
  Power, 
  PowerOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Mail,
  Loader2
} from 'lucide-react';
import { 
  mailerService, 
  Mailer, 
  MailerFormData, 
  SupportedProviders,
  MailerCredentials 
} from '@/services/mailerService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const MailerManagement: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [mailers, setMailers] = useState<Mailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<SupportedProviders>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedMailer, setSelectedMailer] = useState<Mailer | null>(null);
  const [editingMailer, setEditingMailer] = useState<Mailer | null>(null);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [formData, setFormData] = useState<MailerFormData>({
    name: '',
    provider: 'smtp',
    credentials: {},
    from_address: '',
    from_name: '',
    is_active: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [rawError, setRawError] = useState<string | null>(null);

  useEffect(() => {
    fetchMailers();
    fetchProviders();
  }, []);

  const fetchMailers = async () => {
    try {
      setLoading(true);
      const data = await mailerService.fetchMailers();
      setMailers(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to fetch mailers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
    try {
      const data = await mailerService.getSupportedProviders();
      setProviders(data);
    } catch (err) {
      console.error('Failed to fetch providers:', err);
    }
  };

  const handleCreate = () => {
    setEditingMailer(null);
    setFormData({
      name: '',
      provider: 'smtp',
      credentials: {},
      from_address: '',
      from_name: '',
      is_active: false,
    });
    setFormErrors({});
    setRawError(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (mailer: Mailer) => {
    setEditingMailer(mailer);
    setFormData({
      name: mailer.name,
      provider: mailer.provider,
      credentials: {}, // Credentials are encrypted, so we start fresh
      from_address: mailer.from_address || '',
      from_name: mailer.from_name || '',
      is_active: mailer.is_active,
    });
    setFormErrors({});
    setRawError(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (mailer: Mailer) => {
    setSelectedMailer(mailer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedMailer) return;

    try {
      await mailerService.deleteMailer(selectedMailer.id);
      toast({
        title: 'Success',
        description: 'Mailer deleted successfully',
      });
      fetchMailers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete mailer',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setSelectedMailer(null);
    }
  };

  const handleTest = (mailer: Mailer) => {
    setSelectedMailer(mailer);
    setTestEmail(user?.email || '');
    setRawError(null);
    setIsTestDialogOpen(true);
  };

  const confirmTest = async () => {
    if (!selectedMailer || !testEmail) return;

    try {
      setTesting(true);
      const updatedMailer = await mailerService.testMailer(selectedMailer.id, testEmail);
      
      if (updatedMailer.test_status) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully',
        });
      } else {
        setRawError(updatedMailer.test_error || 'Test failed');
        toast({
          title: 'Test Failed',
          description: updatedMailer.test_error || 'Failed to send test email',
          variant: 'destructive',
        });
      }
      
      fetchMailers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to test mailer';
      setRawError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleActivate = async (mailer: Mailer) => {
    try {
      await mailerService.activateMailer(mailer.id);
      toast({
        title: 'Success',
        description: 'Mailer activated successfully',
      });
      fetchMailers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to activate mailer',
        variant: 'destructive',
      });
    }
  };

  const handleDeactivate = async (mailer: Mailer) => {
    try {
      await mailerService.deactivateMailer(mailer.id);
      toast({
        title: 'Success',
        description: 'Mailer deactivated successfully',
      });
      fetchMailers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to deactivate mailer',
        variant: 'destructive',
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const providerInfo = providers[formData.provider];

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (providerInfo) {
      Object.entries(providerInfo.fields).forEach(([fieldName, fieldInfo]) => {
        if (fieldInfo.required && !formData.credentials[fieldName as keyof MailerCredentials]) {
          errors[`credentials.${fieldName}`] = `${fieldName} is required`;
        }
      });
    }

    if (formData.from_address && !formData.from_address.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.from_address = 'Invalid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setRawError(null);

      if (editingMailer) {
        await mailerService.updateMailer(editingMailer.id, formData);
        toast({
          title: 'Success',
          description: 'Mailer updated successfully',
        });
      } else {
        const result = await mailerService.createMailer(formData);
        if (!result.test_status) {
          setRawError(result.test_error || 'Test email failed');
          toast({
            title: 'Mailer Created',
            description: 'Mailer created but test email failed. Please check the error and test again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Success',
            description: 'Mailer created and tested successfully',
          });
        }
      }

      setIsDialogOpen(false);
      fetchMailers();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to save mailer';
      setRawError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCredential = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value === '' ? undefined : value,
      },
    }));
    // Clear error for this field
    if (formErrors[`credentials.${field}`]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`credentials.${field}`];
        return newErrors;
      });
    }
  };

  const renderCredentialFields = () => {
    const providerInfo = providers[formData.provider];
    if (!providerInfo) return null;

    return Object.entries(providerInfo.fields).map(([fieldName, fieldInfo]) => {
      const error = formErrors[`credentials.${fieldName}`];
      const value = formData.credentials[fieldName as keyof MailerCredentials] || '';

      if (fieldInfo.type === 'integer') {
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldInfo.required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={fieldName}
              type="number"
              value={value}
              onChange={(e) => updateCredential(fieldName, parseInt(e.target.value) || undefined)}
              placeholder={`Enter ${fieldName}`}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      }

      if (fieldInfo.options && fieldInfo.options.length > 0) {
        return (
          <div key={fieldName} className="space-y-2">
            <Label htmlFor={fieldName}>
              {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
              {fieldInfo.required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={value || ''}
              onValueChange={(val) => updateCredential(fieldName, val === 'null' ? null : val)}
            >
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={`Select ${fieldName}`} />
              </SelectTrigger>
              <SelectContent>
                {fieldInfo.options.map((option) => (
                  <SelectItem key={option || 'null'} value={option || 'null'}>
                    {option || 'None'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        );
      }

      // Password fields
      const isPassword = fieldName.toLowerCase().includes('password') || 
                        fieldName.toLowerCase().includes('secret') || 
                        fieldName.toLowerCase().includes('token') ||
                        fieldName.toLowerCase().includes('key');

      return (
        <div key={fieldName} className="space-y-2">
          <Label htmlFor={fieldName}>
            {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
            {fieldInfo.required && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={fieldName}
            type={isPassword ? 'password' : 'text'}
            value={value}
            onChange={(e) => updateCredential(fieldName, e.target.value)}
            placeholder={`Enter ${fieldName}`}
            className={error ? 'border-red-500' : ''}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mailer Management</h2>
          <p className="text-muted-foreground">
            Configure and manage your email service providers
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Mailer
        </Button>
      </div>

      {loading && mailers.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : mailers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mailers configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first mailer configuration
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add Mailer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mailers.map((mailer) => (
            <Card key={mailer.id} className={mailer.is_active ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {mailer.name}
                      {mailer.is_active && (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {mailer.provider_name}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  {mailer.test_status ? (
                    <Badge variant="outline" className="border-green-500 text-green-700">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Tested
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-500 text-red-700">
                      <XCircle className="mr-1 h-3 w-3" />
                      Not Tested
                    </Badge>
                  )}
                  {mailer.from_address && (
                    <Badge variant="outline">
                      {mailer.from_address}
                    </Badge>
                  )}
                </div>

                {mailer.test_error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      {mailer.test_error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(mailer)}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTest(mailer)}
                  >
                    <TestTube className="mr-1 h-3 w-3" />
                    Test
                  </Button>
                  {mailer.is_active ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeactivate(mailer)}
                    >
                      <PowerOff className="mr-1 h-3 w-3" />
                      Deactivate
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleActivate(mailer)}
                      disabled={!mailer.test_status}
                    >
                      <Power className="mr-1 h-3 w-3" />
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(mailer)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingMailer ? 'Edit Mailer' : 'Create Mailer'}
            </DialogTitle>
            <DialogDescription>
              Configure your email service provider settings
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My SMTP Mailer"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500">{formErrors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">
                Provider <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.provider}
                onValueChange={(value: any) => {
                  setFormData(prev => ({
                    ...prev,
                    provider: value,
                    credentials: {}, // Reset credentials when provider changes
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(providers).map(([key, provider]) => (
                    <SelectItem key={key} value={key}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {renderCredentialFields()}

            <div className="space-y-2">
              <Label htmlFor="from_address">From Address (Optional)</Label>
              <Input
                id="from_address"
                type="email"
                value={formData.from_address}
                onChange={(e) => setFormData(prev => ({ ...prev, from_address: e.target.value }))}
                placeholder="noreply@example.com"
                className={formErrors.from_address ? 'border-red-500' : ''}
              />
              {formErrors.from_address && (
                <p className="text-sm text-red-500">{formErrors.from_address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_name">From Name (Optional)</Label>
              <Input
                id="from_name"
                value={formData.from_name}
                onChange={(e) => setFormData(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="My App"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="is_active">Set as active mailer</Label>
            </div>

            {rawError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Error:</div>
                  <div className="text-xs whitespace-pre-wrap">{rawError}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Mailer</DialogTitle>
            <DialogDescription>
              Send a test email to verify your mailer configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="test_email">
                Test Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="test_email"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>

            {rawError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-1">Test Failed:</div>
                  <div className="text-xs whitespace-pre-wrap">{rawError}</div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmTest} disabled={testing || !testEmail}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Send Test Email'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the mailer
              "{selectedMailer?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MailerManagement;

