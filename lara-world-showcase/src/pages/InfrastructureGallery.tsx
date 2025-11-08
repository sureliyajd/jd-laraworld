import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Box, 
  Code, 
  Github, 
  Server, 
  GitBranch,
  CheckCircle2,
  XCircle,
  FileCode,
  Cloud
} from 'lucide-react';
import { devopsService, DevOpsInfo } from '@/services/devopsService';
import { ScrollArea } from '@/components/ui/scroll-area';

const InfrastructureGallery: React.FC = () => {
  const [devopsInfo, setDevopsInfo] = useState<DevOpsInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevOpsInfo();
  }, []);

  const fetchDevOpsInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await devopsService.fetchAll();
      setDevopsInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DevOps information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading DevOps information...</p>
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

  if (!devopsInfo) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Infrastructure Gallery</h1>
        <p className="text-gray-600 mt-1">
          Showcase of DevOps implementations, infrastructure as code, and deployment configurations
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="docker">Docker</TabsTrigger>
          <TabsTrigger value="terraform">Terraform</TabsTrigger>
          <TabsTrigger value="github-actions">GitHub Actions</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Docker
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devopsInfo.docker.enabled ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-5 w-5" />
                    <span>Not Configured</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {devopsInfo.docker.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Terraform
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devopsInfo.terraform.enabled ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-5 w-5" />
                    <span>Not Configured</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {devopsInfo.terraform.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5" />
                  GitHub Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {devopsInfo.github_actions.enabled ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Enabled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <XCircle className="h-5 w-5" />
                    <span>Not Configured</span>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {devopsInfo.github_actions.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Infrastructure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline">{devopsInfo.infrastructure.environment}</Badge>
                <p className="text-sm text-gray-600 mt-2">
                  {devopsInfo.infrastructure.description}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>CI/CD Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{devopsInfo.ci_cd.description}</p>
                <div className="flex items-center gap-2">
                  <Badge>{devopsInfo.ci_cd.platform}</Badge>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Pipeline Stages</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {Object.entries(devopsInfo.ci_cd.stages).map(([key, value]) => (
                      <li key={key}>
                        <strong>{key}:</strong> {value}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Docker Tab */}
        <TabsContent value="docker" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Docker Configuration
              </CardTitle>
              <CardDescription>{devopsInfo.docker.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devopsInfo.docker.enabled ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {devopsInfo.docker.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(devopsInfo.docker.files).map(([filename, file]) => (
                      <Card key={filename}>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            {filename}
                          </CardTitle>
                          <CardDescription>{file.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          {file.exists && file.content ? (
                            <ScrollArea className="h-64 w-full rounded border p-4">
                              <pre className="text-xs">
                                <code>{file.content}</code>
                              </pre>
                            </ScrollArea>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              File not found. Create this file to enable Docker configuration.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Docker is not configured. Create Dockerfile and docker-compose.yml files to enable Docker support.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Terraform Tab */}
        <TabsContent value="terraform" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Terraform Configuration
              </CardTitle>
              <CardDescription>{devopsInfo.terraform.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devopsInfo.terraform.enabled ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {devopsInfo.terraform.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(devopsInfo.terraform.files).map(([filename, file]) => (
                      <Card key={filename}>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            {file.path}
                          </CardTitle>
                          <CardDescription>{file.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 w-full rounded border p-4">
                            <pre className="text-xs">
                              <code>{file.content}</code>
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Terraform is not configured. Create terraform directory with .tf files to enable Infrastructure as Code.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* GitHub Actions Tab */}
        <TabsContent value="github-actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Github className="h-5 w-5" />
                GitHub Actions Workflows
              </CardTitle>
              <CardDescription>{devopsInfo.github_actions.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devopsInfo.github_actions.enabled ? (
                <>
                  <div>
                    <h4 className="font-semibold mb-2">Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {devopsInfo.github_actions.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(devopsInfo.github_actions.workflows).map(([filename, workflow]) => (
                      <Card key={filename}>
                        <CardHeader>
                          <CardTitle className="text-sm flex items-center gap-2">
                            <GitBranch className="h-4 w-4" />
                            {workflow.path}
                          </CardTitle>
                          <CardDescription>{workflow.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-64 w-full rounded border p-4">
                            <pre className="text-xs">
                              <code>{workflow.content}</code>
                            </pre>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    GitHub Actions is not configured. Create .github/workflows directory with YAML files to enable CI/CD.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                Infrastructure Details
              </CardTitle>
              <CardDescription>{devopsInfo.infrastructure.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Cloud Provider</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.cloud_provider}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Environment</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.environment}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Server Specifications</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>PHP Version:</strong> {devopsInfo.infrastructure.server_specs.php_version}</p>
                  <p><strong>Laravel Version:</strong> {devopsInfo.infrastructure.server_specs.laravel_version}</p>
                  <p><strong>Database:</strong> {devopsInfo.infrastructure.server_specs.database}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Services</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Database:</strong> {devopsInfo.infrastructure.services.database}</p>
                  <p><strong>Cache:</strong> {devopsInfo.infrastructure.services.cache}</p>
                  <p><strong>Queue:</strong> {devopsInfo.infrastructure.services.queue}</p>
                  <p><strong>Broadcasting:</strong> {devopsInfo.infrastructure.services.broadcasting}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfrastructureGallery;

