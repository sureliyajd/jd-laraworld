import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Info,
  Lightbulb,
  Code,
  Server,
  Settings,
  Monitor,
  Zap,
  Rocket,
  Shield,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  Activity,
  Clock,
  Sparkles,
  Star
} from 'lucide-react';
import { logHorizonService, LogHorizonInfo } from '@/services/logHorizonService';
import { AUTH_CONFIG } from '@/config/auth';
import { usePermissions } from '@/hooks/usePermissions';
import { PublicUserNotice } from '@/components/PublicUserNotice';

const LogHorizon: React.FC = () => {
  const { isPublicUser } = usePermissions();
  const [logHorizonInfo, setLogHorizonInfo] = useState<LogHorizonInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [horizonUrl, setHorizonUrl] = useState<string>('');

  useEffect(() => {
    fetchLogHorizonInfo();
    
    // Get the access token from localStorage
    const token = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    
    // Build Horizon URL with token as query parameter
    if (token) {
      // API_BASE is the backend URL without /api
      // If it contains /api, remove it; otherwise use as is
      const baseUrl = AUTH_CONFIG.API_BASE.endsWith('/api') 
        ? AUTH_CONFIG.API_BASE.replace('/api', '') 
        : AUTH_CONFIG.API_BASE;
      const horizonPath = '/horizon';
      setHorizonUrl(`${baseUrl}${horizonPath}?token=${encodeURIComponent(token)}`);
    }
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
          <p className="mt-4 text-gray-600">Loading Log Horizon information... 🚀</p>
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

  const isHorizonInstalled = logHorizonInfo?.implementation?.laravel_horizon?.installed;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground flex items-center gap-3">
              <span>📊</span>
              <span>Log Horizon</span>
              {isHorizonInstalled && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  ✅ Installed
                </Badge>
              )}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isHorizonInstalled 
                ? "🎉 Real-time queue monitoring and job management with Laravel Horizon! Monitor your background jobs, track metrics, and manage queues like a pro! 🚀"
                : "⚙️ Queue monitoring and log management system - Provisioned for future implementation! Explore the possibilities! ✨"
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isHorizonInstalled && horizonUrl && (
              <Button
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                <a
                  href={horizonUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open Full Dashboard</span>
                  <Rocket className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button
              onClick={fetchLogHorizonInfo}
              variant="outline"
              className="border-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Public User Notice */}
        {isPublicUser() && <PublicUserNotice />}
      </div>

      {/* If Horizon is installed, show full-width dashboard */}
      {isHorizonInstalled ? (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Queue Driver</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      {logHorizonInfo.implementation.current_setup.queue_driver.toUpperCase()}
                    </p>
                  </div>
                  <Server className="h-8 w-8 text-blue-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-1">
                      <span>✅</span>
                      <span>Active</span>
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">Dashboard</p>
                    <p className="text-2xl font-bold text-purple-600 mt-1 flex items-center gap-1">
                      <span>📊</span>
                      <span>Live</span>
                    </p>
                  </div>
                  <Monitor className="h-8 w-8 text-purple-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security</p>
                    <p className="text-2xl font-bold text-orange-600 mt-1 flex items-center gap-1">
                      <span>🔐</span>
                      <span>Secure</span>
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-orange-600 opacity-70" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Full-Width Horizon Dashboard */}
          <Card className="border-2 border-blue-300 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Monitor className="h-6 w-6 text-blue-600" />
                    <span>📊 Laravel Horizon Dashboard</span>
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    🎯 Real-time queue monitoring, job metrics, and management! 
                    This dashboard is <span className="font-semibold">secured with bearer token authentication</span> and embedded directly in the portal! 
                    <span className="ml-1">✨</span>
                  </CardDescription>
                </div>
                  {horizonUrl && (
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-blue-300"
                  >
                  </Button>
                )}
              </div>
                </CardHeader>
            <CardContent className="p-0">
                  {horizonUrl ? (
                <div className="w-full" style={{ height: '900px' }}>
                      <iframe
                        src={horizonUrl}
                    className="w-full h-full border-0"
                    style={{ minHeight: '900px' }}
                        title="Laravel Horizon Dashboard"
                        allow="clipboard-read; clipboard-write"
                      />
                    </div>
                  ) : (
                <div className="p-12 text-center">
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <Info className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                      🔒 Unable to load Horizon dashboard. Please ensure you are authenticated and have a valid access token.
                      </AlertDescription>
                    </Alert>
                </div>
                  )}
                </CardContent>
              </Card>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* What's Implemented */}
            <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <span>✨ What's Implemented</span>
                  </CardTitle>
                <CardDescription>
                  Skills showcased in this module! 🎓
                </CardDescription>
                </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span>🔐</span>
                    <span><strong>Secure Horizon embedding</strong> with token-based access</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🛡️</span>
                    <span><strong>Custom middleware</strong> on backend to authorize Horizon</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>⚙️</span>
                    <span><strong>Environment-aware config</strong> and robust queue setup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>🎨</span>
                    <span><strong>Responsive UI</strong> with Tailwind and Shadcn UI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✅</span>
                    <span><strong>Error handling</strong> and graceful fallbacks</span>
                  </li>
                </ul>
                </CardContent>
              </Card>

            {/* Why Horizon */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-600" />
                  <span>💡 Why Horizon?</span>
                  </CardTitle>
                <CardDescription>
                  Perfect for production! 🚀
                </CardDescription>
                </CardHeader>
                <CardContent>
                <p className="text-sm text-gray-700 mb-4">
                  Horizon provides excellent visibility into queues with per-job metrics, retries, failed jobs management, and scaling strategies! 
                  <span className="ml-1">🎯</span>
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                    <span>Track throughput and runtime per queue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Settings className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span>Manage supervisors and balance strategies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Activity className="h-4 w-4 text-purple-600 mt-0.5" />
                    <span>Handle failed jobs and retry flows</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span>Centralize monitoring with authentication</span>
                  </li>
                  </ul>
                </CardContent>
              </Card>

            {/* Access & Security */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  <span>🔒 Access & Security</span>
                  </CardTitle>
                <CardDescription>
                  How it works! 🎯
                </CardDescription>
                </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-700">
                  Use the embedded dashboard above or click <span className="font-semibold">"Open Full Dashboard"</span>. 
                  Access is restricted via bearer token added to the iframe URL! 
                  <span className="ml-1">🛡️</span>
                </p>
                <Alert className="border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    <strong>🔑 Token Security:</strong> Tokens are short-lived and tied to your session. 
                    If the iframe fails, refresh your session and try again! 
                    <span className="ml-1">✨</span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
          </div>

          {/* Queue Configuration */}
          <Card className="border-2 border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-gray-600" />
                <span>⚙️ Queue Configuration</span>
                  </CardTitle>
              <CardDescription>
                Connection details used by Horizon! 📋
              </CardDescription>
                </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                    <span>🚀</span>
                    <span>Queue Driver</span>
                  </h4>
                  <Badge className="bg-blue-600 text-white text-lg px-4 py-2">
                    {logHorizonInfo.implementation.current_setup.queue_driver.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-2 text-green-800 flex items-center gap-2">
                    <span>✅</span>
                    <span>Status</span>
                  </h4>
                  <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                    Active & Running
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <span>📋</span>
                  <span>Connection Details</span>
                </h4>
                <pre className="text-xs overflow-x-auto bg-white p-4 rounded border">
                  <code>{JSON.stringify(logHorizonInfo.implementation.current_setup.queue_connection, null, 2)}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Learning Note */}
          <Card className="border-2 border-gradient-to-r from-purple-300 to-blue-300 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl">
                    🎓
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🎯 Learning Note: Laravel Horizon
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Laravel Horizon</strong> is a beautiful dashboard and configuration system for Redis-powered queues! 
                    It provides real-time insights into queue performance, job throughput, wait times, and failed jobs. 
                    This implementation showcases <span className="font-semibold">secure embedding</span> of Horizon in a React SPA, 
                    <span className="font-semibold"> token-based authentication</span>, and <span className="font-semibold">custom middleware</span> for authorization. 
                    Perfect for production environments where you need visibility into your background job processing! 
                    <span className="ml-1">🚀</span>
                  </p>
                </div>
              </div>
                </CardContent>
              </Card>
        </div>
      ) : (
        /* Not Installed - Show Provisioned State with Fun Tone */
        <div className="space-y-6">
          {/* Info Banner */}
          <Alert className="border-2 border-yellow-300 bg-gradient-to-r from-yellow-50 to-orange-50">
            <Info className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="text-yellow-800 text-base">
              <strong>⚙️ Provisioned State:</strong> This module is currently provisioned for future implementation! 
              Explore the options below to see what's possible with Laravel Horizon! 
              <span className="ml-1">✨</span>
            </AlertDescription>
          </Alert>

          {/* Current Setup */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Server className="h-6 w-6 text-blue-600" />
                <span>⚙️ Current Setup</span>
              </CardTitle>
              <CardDescription className="text-base">
                Queue and logging configuration status! 📊
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-lg border-2 border-blue-200">
                  <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
                    <span>🚀</span>
                    <span>Queue Driver</span>
                  </h4>
                  <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                    {logHorizonInfo.implementation.current_setup.queue_driver.toUpperCase()}
                  </Badge>
                </div>
                <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <span>📊</span>
                    <span>Laravel Horizon Status</span>
                  </h4>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 font-medium">Not Installed</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {logHorizonInfo.implementation.laravel_horizon.description}
            </p>
          </div>
          </div>
            </CardContent>
          </Card>

          {/* Tabs for Options */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger value="implementation" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Implementation</span>
              </TabsTrigger>
              <TabsTrigger value="options" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                <span>Options</span>
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                <span>Recommendations</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>📋</span>
                    <span>Current Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Queue and logging setup details! 🔍
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-3 text-blue-800 flex items-center gap-2">
                      <span>🚀</span>
                      <span>Queue Driver</span>
                    </h4>
                    <Badge variant="outline" className="text-base px-4 py-2">
                      {logHorizonInfo.implementation.current_setup.queue_driver}
                    </Badge>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                      <span>📊</span>
                      <span>Laravel Horizon Status</span>
                    </h4>
                    <div className="flex items-center gap-3 mb-2">
                      <XCircle className="h-6 w-6 text-gray-400" />
                      <span className="text-gray-600 font-medium text-lg">Not Installed</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {logHorizonInfo.implementation.laravel_horizon.description}
                    </p>
                  </div>
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      💡 This module is currently provisioned. Choose an implementation option below to proceed with full implementation! 
                      <span className="ml-1">🚀</span>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="implementation" className="space-y-4 mt-6">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <span>⚙️ Implementation Status</span>
                  </CardTitle>
                  <CardDescription>
                    Current implementation details! 📊
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold mb-3 text-purple-800 flex items-center gap-2">
                      <span>📊</span>
                      <span>Laravel Horizon</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-700">Available:</span>
                        <Badge variant="secondary">No</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded border">
                        <span className="text-sm font-medium text-gray-700">Installed:</span>
                        <Badge variant="secondary">No</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                      <span>⚙️</span>
                      <span>Current Queue Configuration</span>
                    </h4>
                    <pre className="text-xs overflow-x-auto bg-white p-4 rounded border">
                        <code>{JSON.stringify(logHorizonInfo.implementation.current_setup.queue_connection, null, 2)}</code>
                      </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="options" className="space-y-4 mt-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>🎯</span>
                  <span>Implementation Options</span>
                </h2>
                <p className="text-gray-600 mt-2">
                  Explore different approaches to implementing queue monitoring! Each option has its pros and cons! 
                  <span className="ml-1">✨</span>
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(logHorizonInfo.options).map(([key, option], index) => (
                  <Card key={key} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-2xl">{index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : '3️⃣'}</span>
                        <Code className="h-5 w-5" />
                        <span>{option.name}</span>
                      </CardTitle>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-sm mb-2 text-green-800 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Pros</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                          {option.pros.map((pro, idx) => (
                            <li key={idx}>{pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <h4 className="font-semibold text-sm mb-2 text-red-800 flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          <span>Cons</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-xs text-gray-700">
                          {option.cons.map((con, idx) => (
                            <li key={idx}>{con}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-600 italic">{option.implementation}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-4 mt-6">
              <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Lightbulb className="h-6 w-6 text-yellow-600" />
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>🌟 Recommended Approach</span>
                  </CardTitle>
                  <CardDescription className="text-base">
                    {logHorizonInfo.recommendations.recommended_approach}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-3 text-yellow-800 flex items-center gap-2">
                      <span>💡</span>
                      <span>Reason</span>
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {logHorizonInfo.recommendations.reason}
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-yellow-200">
                    <h4 className="font-semibold mb-3 text-yellow-800 flex items-center gap-2">
                      <span>📋</span>
                      <span>Implementation Steps</span>
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      {logHorizonInfo.recommendations.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="font-bold text-yellow-600">{index + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>💡 Alternative:</strong> {logHorizonInfo.recommendations.alternative}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default LogHorizon;
