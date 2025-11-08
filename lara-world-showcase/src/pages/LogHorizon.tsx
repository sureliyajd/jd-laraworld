import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Info,
  Lightbulb,
  Code,
  Server,
  Settings
} from 'lucide-react';
import { logHorizonService, LogHorizonInfo } from '@/services/logHorizonService';

const LogHorizon: React.FC = () => {
  const [logHorizonInfo, setLogHorizonInfo] = useState<LogHorizonInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogHorizonInfo();
  }, []);

  const fetchLogHorizonInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await logHorizonService.fetchInfo();
      setLogHorizonInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Log Horizon information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Log Horizon information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!logHorizonInfo) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log Horizon</h1>
        <p className="text-gray-600 mt-1">
          Queue monitoring and log management system - Provisioned for future implementation
        </p>
      </div>

      {/* Status Badge */}
      <div>
        <Badge variant={logHorizonInfo.status === 'provisioned' ? 'default' : 'secondary'}>
          {logHorizonInfo.status.toUpperCase()}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="implementation">Implementation</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Setup</CardTitle>
              <CardDescription>Queue and logging configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Queue Driver</h4>
                <Badge variant="outline">{logHorizonInfo.implementation.current_setup.queue_driver}</Badge>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Laravel Horizon Status</h4>
                <div className="flex items-center gap-2">
                  {logHorizonInfo.implementation.laravel_horizon.installed ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-green-600">Installed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-gray-400">Not Installed</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {logHorizonInfo.implementation.laravel_horizon.description}
                </p>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This module is currently provisioned. Choose an implementation option below to proceed with full implementation.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Implementation Tab */}
        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Implementation Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Laravel Horizon</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Available:</span>
                    {logHorizonInfo.implementation.laravel_horizon.available ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Installed:</span>
                    {logHorizonInfo.implementation.laravel_horizon.installed ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Current Queue Configuration</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <pre className="text-xs overflow-x-auto">
                    <code>{JSON.stringify(logHorizonInfo.implementation.current_setup.queue_connection, null, 2)}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(logHorizonInfo.options).map(([key, option]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    {option.name}
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-green-600">Pros</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                      {option.pros.map((pro, index) => (
                        <li key={index}>{pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-red-600">Cons</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                      {option.cons.map((con, index) => (
                        <li key={index}>{con}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">{option.implementation}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Recommended Approach
              </CardTitle>
              <CardDescription>
                {logHorizonInfo.recommendations.recommended_approach}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Reason</h4>
                <p className="text-sm text-gray-600">
                  {logHorizonInfo.recommendations.reason}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Implementation Steps</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                  {logHorizonInfo.recommendations.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alternative:</strong> {logHorizonInfo.recommendations.alternative}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Implementation Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Option 1: Laravel Horizon Integration</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Install and configure Laravel Horizon for comprehensive queue monitoring:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="text-xs">
                      <code>
{`1. composer require laravel/horizon
2. php artisan horizon:install
3. Configure Horizon in config/horizon.php
4. Set up authentication in AppServiceProvider
5. Embed Horizon dashboard in iframe`}
                      </code>
                    </pre>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Option 2: Custom API-Based Monitoring</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Build custom log monitoring using Laravel's logging and queue APIs:
                  </p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <pre className="text-xs">
                      <code>
{`1. Create API endpoints for log retrieval
2. Implement log parsing and filtering
3. Build custom UI components
4. Add real-time updates via WebSockets
5. Integrate with existing authentication`}
                      </code>
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LogHorizon;

