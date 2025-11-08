import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Mail, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  Search,
  Filter
} from 'lucide-react';
import { emailService, EmailLog, SendEmailData } from '@/services/emailService';
import { useToast } from '@/hooks/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';
import { PublicUserNotice } from '@/components/PublicUserNotice';
import { usePermissions } from '@/hooks/usePermissions';

const MailCommandCenter: React.FC = () => {
  const { toast } = useToast();
  const { isPublicUser } = usePermissions();
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Compose form state
  const [composeForm, setComposeForm] = useState<SendEmailData>({
    recipient_email: '',
    recipient_name: '',
    subject: '',
    body: '',
    html_body: '',
  });
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchEmailLogs();
    fetchStatistics();
  }, [statusFilter]);

  const fetchEmailLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: Record<string, any> = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (searchTerm) {
        filters.search = searchTerm;
      }
      const response = await emailService.fetchEmailLogs(filters);
      setEmailLogs(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch email logs');
      toast({
        title: 'Error',
        description: 'Failed to load email logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const data = await emailService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    }
  };

  const handleSendEmail = async () => {
    try {
      setSending(true);
      await emailService.sendEmail(composeForm);
      toast({
        title: 'Success',
        description: 'Email sent successfully',
      });
      setIsComposeOpen(false);
      setComposeForm({
        recipient_email: '',
        recipient_name: '',
        subject: '',
        body: '',
        html_body: '',
      });
      fetchEmailLogs();
      fetchStatistics();
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const toggleRow = (id: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleViewEmail = (email: EmailLog) => {
    setSelectedEmail(email);
    setIsViewDialogOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredLogs = emailLogs.filter(log => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      log.subject.toLowerCase().includes(searchLower) ||
      log.recipient_email.toLowerCase().includes(searchLower) ||
      (log.recipient_name && log.recipient_name.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mail Command Center</h1>
          <p className="text-gray-600 mt-1">
            Send emails and monitor email logs with comprehensive tracking
          </p>
        </div>
        <PermissionGuard permission="send emails">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsComposeOpen(true)}>
            <Send className="h-4 w-4 mr-2" />
            Compose Email
          </Button>
        </PermissionGuard>
      </div>

      {/* Public User Notice */}
      {isPublicUser() && <PublicUserNotice />}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Emails</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bounced</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.bounced}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="bounced">Bounced</option>
            </select>

            <Button onClick={fetchEmailLogs}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading email logs...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredLogs.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'No emails match your search criteria.'
                  : 'Get started by sending your first email.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{log.subject}</h3>
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                        <span className="ml-1">{log.status_label}</span>
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{log.recipient_name || log.recipient_email}</span>
                        <span className="text-gray-400">({log.recipient_email})</span>
                      </div>
                      
                      {log.sent_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{log.sent_at_formatted}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <span>From:</span>
                        <span className="font-medium">{log.sender.name}</span>
                      </div>
                    </div>

                    {expandedRows.has(log.id) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="mb-2">
                          <strong>Body:</strong>
                          <div 
                            className="mt-2 prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: log.html_body || log.body.replace(/\n/g, '<br>') }}
                          />
                        </div>
                        {log.error_message && (
                          <div className="mt-2 text-red-600">
                            <strong>Error:</strong> {log.error_message}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleRow(log.id)}
                    >
                      {expandedRows.has(log.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Expand
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewEmail(log)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Compose Email Dialog */}
      <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compose Email</DialogTitle>
            <DialogDescription>
              Send an email using the rich text editor below
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient_email">Recipient Email *</Label>
              <Input
                id="recipient_email"
                type="email"
                value={composeForm.recipient_email}
                onChange={(e) => setComposeForm({ ...composeForm, recipient_email: e.target.value })}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="recipient_name">Recipient Name</Label>
              <Input
                id="recipient_name"
                value={composeForm.recipient_name}
                onChange={(e) => setComposeForm({ ...composeForm, recipient_name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Email Body *</Label>
              <Textarea
                id="body"
                value={composeForm.body}
                onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                placeholder="Email content"
                rows={10}
              />
              <p className="text-sm text-gray-500 mt-1">
                Note: For rich text editing, you can install a library like react-quill or @tiptap/react
              </p>
            </div>
            <div>
              <Label htmlFor="html_body">HTML Body (Optional)</Label>
              <Textarea
                id="html_body"
                value={composeForm.html_body}
                onChange={(e) => setComposeForm({ ...composeForm, html_body: e.target.value })}
                placeholder="HTML content"
                rows={10}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsComposeOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendEmail} disabled={sending}>
                {sending ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Email Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedEmail?.subject}</DialogTitle>
            <DialogDescription>
              Email details and content
            </DialogDescription>
          </DialogHeader>
          {selectedEmail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Recipient</Label>
                  <p className="text-sm">{selectedEmail.recipient_name || selectedEmail.recipient_email}</p>
                  <p className="text-sm text-gray-500">{selectedEmail.recipient_email}</p>
                </div>
                <div>
                  <Label>Sender</Label>
                  <p className="text-sm">{selectedEmail.sender.name}</p>
                  <p className="text-sm text-gray-500">{selectedEmail.sender.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedEmail.status)}>
                    {selectedEmail.status_label}
                  </Badge>
                </div>
                <div>
                  <Label>Sent At</Label>
                  <p className="text-sm">{selectedEmail.sent_at_formatted || 'Not sent yet'}</p>
                </div>
              </div>
              <div>
                <Label>Email Content</Label>
                <div 
                  className="mt-2 p-4 bg-gray-50 rounded-lg prose max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: selectedEmail.html_body || selectedEmail.body.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
              {selectedEmail.error_message && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <strong>Error:</strong> {selectedEmail.error_message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MailCommandCenter;

