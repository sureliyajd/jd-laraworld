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
  Cloud,
  Terminal,
  Key,
  Rocket
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

          <Card className="bg-gradient-to-br from-gray-50 to-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-blue-600" />
                CI/CD Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">{devopsInfo.ci_cd.description}</p>
                
                {/* Pipeline Info Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="bg-gray-800 text-white">{devopsInfo.ci_cd.platform}</Badge>
                  {devopsInfo.ci_cd.trigger && (
                    <Badge variant="outline" className="border-blue-300 text-blue-700">
                      Trigger: {devopsInfo.ci_cd.trigger}
                    </Badge>
                  )}
                  {devopsInfo.ci_cd.deployment_method && (
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {devopsInfo.ci_cd.deployment_method}
                    </Badge>
                  )}
                  {devopsInfo.ci_cd.target_infrastructure && (
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {devopsInfo.ci_cd.target_infrastructure}
                    </Badge>
                  )}
                </div>

                {/* Pipeline Stages */}
                <div className="mt-4">
                  <h4 className="font-semibold mb-3">Pipeline Stages</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(devopsInfo.ci_cd.stages).map(([key, value], index) => (
                      <div key={key} className="bg-white rounded-lg p-3 border shadow-sm">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm text-gray-800 capitalize">{key}</span>
                        </div>
                        <p className="text-xs text-gray-500 ml-7">{value}</p>
                      </div>
                    ))}
                  </div>
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
            <CardContent className="space-y-6">
              {devopsInfo.docker.enabled ? (
                <>
                  {/* Features Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {devopsInfo.docker.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deployment Steps Section */}
                  {devopsInfo.docker.deployment_steps && devopsInfo.docker.deployment_steps.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-800">
                        <Rocket className="h-4 w-4" />
                        Deployment Steps
                      </h4>
                      <ol className="space-y-2">
                        {devopsInfo.docker.deployment_steps.map((step, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-medium">
                              {index + 1}
                            </span>
                            <span className="pt-0.5">{step.replace(/^\d+\.\s*/, '')}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Required Environment Variables Section */}
                  {devopsInfo.docker.required_env_vars && Object.keys(devopsInfo.docker.required_env_vars).length > 0 && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-purple-800">
                        <Key className="h-4 w-4" />
                        Required Environment Variables
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-purple-200">
                              <th className="text-left py-2 px-2 font-medium text-purple-800">Variable</th>
                              <th className="text-left py-2 px-2 font-medium text-purple-800">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(devopsInfo.docker.required_env_vars).map(([key, value]) => (
                              <tr key={key} className="border-b border-purple-100 last:border-0">
                                <td className="py-2 px-2">
                                  <code className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-mono">
                                    {key}
                                  </code>
                                </td>
                                <td className="py-2 px-2 text-gray-600">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Docker Files Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Configuration Files
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(devopsInfo.docker.files).map(([filename, file]) => (
                        <Card key={filename} className="border-l-4 border-l-blue-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <Terminal className="h-4 w-4 text-blue-500" />
                              {filename}
                              {file.exists ? (
                                <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Available
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="ml-2 text-gray-400 border-gray-300">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Not Found
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-xs">{file.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            {file.exists && file.content ? (
                              <ScrollArea className="h-72 w-full rounded border bg-gray-900 p-4">
                                <pre className="text-xs text-gray-100">
                                  <code>{file.content}</code>
                                </pre>
                              </ScrollArea>
                            ) : (
                              <p className="text-sm text-gray-500 italic">
                                File not found. Create this file to enable this feature.
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Alert>
                  <AlertDescription>
                    Docker is not configured. Create a Dockerfile to enable Docker support.
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
                GitHub Actions - CI/CD Pipeline
              </CardTitle>
              <CardDescription>{devopsInfo.github_actions.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {devopsInfo.github_actions.enabled ? (
                <>
                  {/* Features Section */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <CheckCircle2 className="h-4 w-4" />
                      Pipeline Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {devopsInfo.github_actions.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Deployment Flow Section */}
                  {devopsInfo.github_actions.deployment_flow && devopsInfo.github_actions.deployment_flow.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-800">
                        <Rocket className="h-4 w-4" />
                        Deployment Flow
                      </h4>
                      <div className="flex flex-wrap gap-2 items-center">
                        {devopsInfo.github_actions.deployment_flow.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
                              {index + 1}. {step}
                            </div>
                            {index < devopsInfo.github_actions.deployment_flow!.length - 1 && (
                              <span className="mx-1 text-blue-300">→</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Secrets Section */}
                  {devopsInfo.github_actions.required_secrets && Object.keys(devopsInfo.github_actions.required_secrets).length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-4 border border-amber-100">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-amber-800">
                        <Key className="h-4 w-4" />
                        Required GitHub Secrets
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-amber-200">
                              <th className="text-left py-2 px-2 font-medium text-amber-800">Secret Name</th>
                              <th className="text-left py-2 px-2 font-medium text-amber-800">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(devopsInfo.github_actions.required_secrets).map(([key, value]) => (
                              <tr key={key} className="border-b border-amber-100 last:border-0">
                                <td className="py-2 px-2">
                                  <code className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-mono">
                                    {key}
                                  </code>
                                </td>
                                <td className="py-2 px-2 text-gray-600">{value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Excluded Files Section */}
                  {devopsInfo.github_actions.excluded_files && Object.keys(devopsInfo.github_actions.excluded_files).length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-lg p-4 border border-red-100">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-800">
                        <XCircle className="h-4 w-4" />
                        Excluded from Deployment
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(devopsInfo.github_actions.excluded_files).map(([pattern, reason]) => (
                          <div key={pattern} className="flex items-center gap-2 text-sm">
                            <code className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-mono">
                              {pattern}
                            </code>
                            <span className="text-gray-500 text-xs">- {reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Workflow Files Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileCode className="h-4 w-4" />
                      Workflow Files
                    </h4>
                    <div className="space-y-4">
                      {Object.entries(devopsInfo.github_actions.workflows).map(([filename, workflow]) => (
                        <Card key={filename} className="border-l-4 border-l-gray-500">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                              <GitBranch className="h-4 w-4 text-gray-600" />
                              {workflow.path}
                              <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            </CardTitle>
                            <CardDescription className="text-xs">{workflow.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ScrollArea className="h-80 w-full rounded border bg-gray-900 p-4">
                              <pre className="text-xs text-gray-100">
                                <code>{workflow.content}</code>
                              </pre>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
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
          {/* Overview Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Cloud className="h-5 w-5" />
                Infrastructure Overview
              </CardTitle>
              <CardDescription className="text-blue-700">{devopsInfo.infrastructure.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-blue-900">Cloud Provider</h4>
                  <Badge className="bg-blue-600 text-white">{devopsInfo.infrastructure.cloud_provider}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-900">Environment</h4>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {devopsInfo.infrastructure.environment}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backend Infrastructure */}
          {devopsInfo.infrastructure.backend && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-600" />
                  Backend Infrastructure
                </CardTitle>
                <CardDescription>{devopsInfo.infrastructure.backend.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Hosting Platform</h4>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {devopsInfo.infrastructure.backend.hosting}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Instance Type</h4>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {devopsInfo.infrastructure.backend.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Web Server</h4>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {devopsInfo.infrastructure.backend.web_server}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Deployment Method</h4>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {devopsInfo.infrastructure.backend.deployment_method}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Frontend Infrastructure */}
          {devopsInfo.infrastructure.frontend && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-purple-600" />
                  Frontend Infrastructure
                </CardTitle>
                <CardDescription>{devopsInfo.infrastructure.frontend.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Hosting Platform</h4>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {devopsInfo.infrastructure.frontend.hosting}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Framework</h4>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {devopsInfo.infrastructure.frontend.framework}
                    </Badge>
                  </div>
                  <div className="md:col-span-2">
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Deployment Method</h4>
                    <Badge variant="outline" className="border-purple-300 text-purple-700">
                      {devopsInfo.infrastructure.frontend.deployment_method}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Infrastructure */}
          {devopsInfo.infrastructure.database && (
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-amber-600" />
                  Database Infrastructure
                </CardTitle>
                <CardDescription>{devopsInfo.infrastructure.database.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Service Provider</h4>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {devopsInfo.infrastructure.database.service}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Database Engine</h4>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {devopsInfo.infrastructure.database.engine}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Service Type</h4>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {devopsInfo.infrastructure.database.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Connection</h4>
                    <Badge variant="outline" className="border-amber-300 text-amber-700">
                      {devopsInfo.infrastructure.database.connection}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Broadcasting Service */}
          {devopsInfo.infrastructure.broadcasting && (
            <Card className="border-l-4 border-l-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-pink-600" />
                  Broadcasting Service
                </CardTitle>
                <CardDescription>{devopsInfo.infrastructure.broadcasting.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Service Provider</h4>
                    <Badge variant="outline" className="border-pink-300 text-pink-700">
                      {devopsInfo.infrastructure.broadcasting.service}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Service Type</h4>
                    <Badge variant="outline" className="border-pink-300 text-pink-700">
                      {devopsInfo.infrastructure.broadcasting.type}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Driver</h4>
                    <Badge variant="outline" className="border-pink-300 text-pink-700">
                      {devopsInfo.infrastructure.broadcasting.driver}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Server Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Server Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">PHP Version</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {devopsInfo.infrastructure.server_specs.php_version}
                  </code>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Laravel Version</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {devopsInfo.infrastructure.server_specs.laravel_version}
                  </code>
                </div>
                {devopsInfo.infrastructure.server_specs.operating_system && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Operating System</h4>
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {devopsInfo.infrastructure.server_specs.operating_system}
                    </code>
                  </div>
                )}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Database Driver</h4>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {devopsInfo.infrastructure.server_specs.database}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Box className="h-5 w-5" />
                Services Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Database</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.services.database}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Cache</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.services.cache}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Queue</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.services.queue}</Badge>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-700">Broadcasting</h4>
                  <Badge variant="outline">{devopsInfo.infrastructure.services.broadcasting}</Badge>
                </div>
                {devopsInfo.infrastructure.services.session && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Session</h4>
                    <Badge variant="outline">{devopsInfo.infrastructure.services.session}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* CI/CD Configuration */}
          {devopsInfo.infrastructure.cicd && (
            <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  CI/CD Configuration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Platform</h4>
                    <Badge variant="outline" className="border-gray-300">
                      {devopsInfo.infrastructure.cicd.platform}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Trigger</h4>
                    <Badge variant="outline" className="border-gray-300">
                      {devopsInfo.infrastructure.cicd.trigger}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Deployment Target</h4>
                    <Badge variant="outline" className="border-gray-300">
                      {devopsInfo.infrastructure.cicd.deployment_target}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Method</h4>
                    <Badge variant="outline" className="border-gray-300">
                      {devopsInfo.infrastructure.cicd.method}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cost Optimization */}
          {devopsInfo.infrastructure.cost_optimization && (
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle2 className="h-5 w-5" />
                  Cost Optimization Strategy
                </CardTitle>
                <CardDescription className="text-green-700">
                  {devopsInfo.infrastructure.cost_optimization.strategy}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {devopsInfo.infrastructure.cost_optimization.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Features */}
          {devopsInfo.infrastructure.security && (
            <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Key className="h-5 w-5" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">SSL/TLS</h4>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {devopsInfo.infrastructure.security.ssl_tls}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Authentication</h4>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {devopsInfo.infrastructure.security.authentication}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">API Protection</h4>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {devopsInfo.infrastructure.security.api_protection}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Database Security</h4>
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      {devopsInfo.infrastructure.security.database}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Scalability Information */}
          {devopsInfo.infrastructure.scalability && (
            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Rocket className="h-5 w-5" />
                  Scalability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-blue-900">Current Setup</h4>
                  <p className="text-sm text-gray-700">{devopsInfo.infrastructure.scalability.current_setup}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-sm text-blue-900">Scaling Options</h4>
                  <div className="space-y-2">
                    {devopsInfo.infrastructure.scalability.scaling_options.map((option, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-500 mt-0.5">→</span>
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Monitoring */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {devopsInfo.infrastructure.monitoring.enabled ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Monitoring Enabled</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-500">Monitoring Not Configured</span>
                    </>
                  )}
                </div>
                {devopsInfo.infrastructure.monitoring.tools && devopsInfo.infrastructure.monitoring.tools.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-700">Tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {devopsInfo.infrastructure.monitoring.tools.map((tool, index) => (
                        <Badge key={index} variant="outline">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {devopsInfo.infrastructure.monitoring.note && (
                  <p className="text-sm text-gray-600 italic">{devopsInfo.infrastructure.monitoring.note}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfrastructureGallery;

