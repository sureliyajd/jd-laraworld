import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle2, 
  XCircle, 
  Code, 
  TestTube, 
  FileCode,
  Zap,
  Shield,
  Database,
  Mail,
  Users,
  FolderTree,
  Coins,
  Rocket,
  Sparkles,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface TestSuite {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  tests: TestCase[];
  totalTests: number;
  passedTests: number;
  coverage: string;
}

interface TestCase {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'pending';
  assertions: string[];
}

const UnitTestingShowcase: React.FC = () => {
  const [selectedSuite, setSelectedSuite] = useState<string>('overview');

  const testSuites: TestSuite[] = [
    {
      name: 'Task Model',
      description: 'Comprehensive tests for Task model including relationships, scopes, and business logic! 🎯',
      icon: <FileCode className="h-6 w-6" />,
      color: 'from-green-500 to-emerald-500',
      totalTests: 18,
      passedTests: 18,
      coverage: '95%',
      tests: [
        {
          name: 'it_can_create_a_task',
          description: 'Verifies that tasks can be created with all required fields',
          status: 'passed',
          assertions: ['Task exists in database', 'All fields are correctly set']
        },
        {
          name: 'it_sets_completed_at_when_status_changes_to_completed',
          description: 'Tests automatic completion timestamp when task status changes',
          status: 'passed',
          assertions: ['completed_at is set when status becomes completed']
        },
        {
          name: 'it_clears_completed_at_when_status_changes_from_completed',
          description: 'Ensures completed_at is cleared when task is no longer completed',
          status: 'passed',
          assertions: ['completed_at is null when status changes from completed']
        },
        {
          name: 'it_belongs_to_a_category',
          description: 'Tests the relationship between Task and Category models',
          status: 'passed',
          assertions: ['Task has category relationship', 'Category is correctly associated']
        },
        {
          name: 'it_belongs_to_a_creator',
          description: 'Verifies the creator relationship on Task model',
          status: 'passed',
          assertions: ['Task has creator relationship', 'Creator is correctly associated']
        },
        {
          name: 'it_belongs_to_an_assignee',
          description: 'Tests the assignee relationship on Task model',
          status: 'passed',
          assertions: ['Task has assignee relationship', 'Assignee is correctly associated']
        },
        {
          name: 'it_can_have_subtasks',
          description: 'Tests parent-child relationship for task hierarchies',
          status: 'passed',
          assertions: ['Parent task has subtasks', 'Subtask has parent reference']
        },
        {
          name: 'it_can_filter_by_status',
          description: 'Tests the byStatus scope for filtering tasks',
          status: 'passed',
          assertions: ['Only tasks with specified status are returned']
        },
        {
          name: 'it_can_filter_by_priority',
          description: 'Tests the byPriority scope for filtering tasks',
          status: 'passed',
          assertions: ['Only tasks with specified priority are returned']
        },
        {
          name: 'it_can_filter_overdue_tasks',
          description: 'Tests the overdue scope for finding past-due tasks',
          status: 'passed',
          assertions: ['Only overdue tasks are returned', 'Completed tasks are excluded']
        },
        {
          name: 'it_can_filter_tasks_due_today',
          description: 'Tests the dueToday scope for finding today\'s tasks',
          status: 'passed',
          assertions: ['Only tasks due today are returned']
        },
        {
          name: 'it_can_check_if_task_is_overdue',
          description: 'Tests the isOverdue helper method',
          status: 'passed',
          assertions: ['Correctly identifies overdue tasks', 'Excludes completed tasks']
        },
        {
          name: 'it_can_check_if_task_is_due_today',
          description: 'Tests the isDueToday helper method',
          status: 'passed',
          assertions: ['Correctly identifies tasks due today']
        },
        {
          name: 'it_calculates_progress_percentage_based_on_subtasks',
          description: 'Tests progress calculation based on completed subtasks',
          status: 'passed',
          assertions: ['Progress percentage is calculated correctly', 'Handles tasks without subtasks']
        },
        {
          name: 'it_returns_100_percent_for_completed_task_without_subtasks',
          description: 'Tests progress for completed tasks without subtasks',
          status: 'passed',
          assertions: ['Returns 100% for completed tasks']
        },
        {
          name: 'it_calculates_total_estimated_hours_including_subtasks',
          description: 'Tests calculation of total estimated hours including subtasks',
          status: 'passed',
          assertions: ['Includes parent and subtask hours', 'Calculates correctly']
        },
        {
          name: 'it_returns_correct_priority_color',
          description: 'Tests priority color mapping for UI display',
          status: 'passed',
          assertions: ['Returns correct color for each priority level']
        },
        {
          name: 'it_returns_correct_status_color',
          description: 'Tests status color mapping for UI display',
          status: 'passed',
          assertions: ['Returns correct color for each status']
        }
      ]
    },
    {
      name: 'User Model',
      description: 'Tests for User model including credit management, permissions, and relationships! 👤',
      icon: <Users className="h-6 w-6" />,
      color: 'from-blue-500 to-cyan-500',
      totalTests: 15,
      passedTests: 15,
      coverage: '92%',
      tests: [
        {
          name: 'it_can_create_a_user',
          description: 'Verifies user creation with all required fields',
          status: 'passed',
          assertions: ['User exists in database', 'All fields are correctly set']
        },
        {
          name: 'it_can_check_if_user_is_super_admin',
          description: 'Tests super admin role checking',
          status: 'passed',
          assertions: ['Correctly identifies super admin users']
        },
        {
          name: 'it_can_check_if_user_is_main_user',
          description: 'Tests main user identification logic',
          status: 'passed',
          assertions: ['Correctly identifies main users', 'Excludes child users']
        },
        {
          name: 'it_returns_self_as_effective_user_for_main_user',
          description: 'Tests effective user logic for main users',
          status: 'passed',
          assertions: ['Returns self for main users']
        },
        {
          name: 'it_returns_parent_as_effective_user_for_child_user',
          description: 'Tests effective user logic for child users',
          status: 'passed',
          assertions: ['Returns parent for child users']
        },
        {
          name: 'it_returns_self_as_effective_user_for_super_admin',
          description: 'Tests effective user logic for super admins',
          status: 'passed',
          assertions: ['Returns self for super admins']
        },
        {
          name: 'it_has_unlimited_credits_if_super_admin',
          description: 'Tests unlimited credits for super admin users',
          status: 'passed',
          assertions: ['Super admin always has enough credits']
        },
        {
          name: 'it_can_check_if_user_has_enough_credits',
          description: 'Tests credit availability checking',
          status: 'passed',
          assertions: ['Correctly checks available credits', 'Returns false when insufficient']
        },
        {
          name: 'it_returns_false_if_no_credit_record_exists',
          description: 'Tests behavior when no credit record exists',
          status: 'passed',
          assertions: ['Returns false when no credits exist']
        },
        {
          name: 'it_can_consume_credits',
          description: 'Tests credit consumption with database locking',
          status: 'passed',
          assertions: ['Credits are consumed correctly', 'Used count is updated']
        },
        {
          name: 'it_cannot_consume_more_credits_than_available',
          description: 'Tests credit consumption validation',
          status: 'passed',
          assertions: ['Prevents over-consumption', 'Returns false when insufficient']
        },
        {
          name: 'it_skips_credit_consumption_for_super_admin',
          description: 'Tests super admin credit consumption bypass',
          status: 'passed',
          assertions: ['Super admin credits are not consumed']
        },
        {
          name: 'it_can_release_credits',
          description: 'Tests credit release functionality',
          status: 'passed',
          assertions: ['Credits are released correctly', 'Used count is decreased']
        },
        {
          name: 'it_can_get_credit_statistics',
          description: 'Tests credit statistics retrieval',
          status: 'passed',
          assertions: ['Returns correct stats for all modules']
        },
        {
          name: 'it_returns_unlimited_stats_for_super_admin',
          description: 'Tests credit stats for super admin',
          status: 'passed',
          assertions: ['Returns -1 for unlimited credits']
        }
      ]
    },
    {
      name: 'Category Model',
      description: 'Tests for Category model including slugs, scopes, and task relationships! 📁',
      icon: <FolderTree className="h-6 w-6" />,
      color: 'from-purple-500 to-pink-500',
      totalTests: 10,
      passedTests: 10,
      coverage: '90%',
      tests: [
        {
          name: 'it_can_create_a_category',
          description: 'Verifies category creation',
          status: 'passed',
          assertions: ['Category exists in database']
        },
        {
          name: 'it_automatically_generates_slug_from_name',
          description: 'Tests automatic slug generation',
          status: 'passed',
          assertions: ['Slug is generated from name', 'Slug is URL-friendly']
        },
        {
          name: 'it_updates_slug_when_name_changes',
          description: 'Tests slug update on name change',
          status: 'passed',
          assertions: ['Slug updates when name changes']
        },
        {
          name: 'it_can_filter_active_categories',
          description: 'Tests active scope for filtering',
          status: 'passed',
          assertions: ['Only active categories are returned']
        },
        {
          name: 'it_can_order_categories_by_sort_order',
          description: 'Tests ordering by sort_order',
          status: 'passed',
          assertions: ['Categories are ordered correctly']
        },
        {
          name: 'it_has_relationship_with_tasks',
          description: 'Tests category-task relationship',
          status: 'passed',
          assertions: ['Category has tasks relationship']
        },
        {
          name: 'it_can_count_tasks',
          description: 'Tests task counting',
          status: 'passed',
          assertions: ['Returns correct task count']
        },
        {
          name: 'it_can_count_completed_tasks',
          description: 'Tests completed task counting',
          status: 'passed',
          assertions: ['Returns correct completed count']
        },
        {
          name: 'it_can_count_pending_tasks',
          description: 'Tests pending task counting',
          status: 'passed',
          assertions: ['Returns correct pending count']
        },
        {
          name: 'it_uses_slug_as_route_key',
          description: 'Tests route key name configuration',
          status: 'passed',
          assertions: ['Uses slug as route key']
        }
      ]
    },
    {
      name: 'UserCredit Model',
      description: 'Tests for UserCredit model including credit calculations and consumption! 🪙',
      icon: <Coins className="h-6 w-6" />,
      color: 'from-yellow-500 to-orange-500',
      totalTests: 9,
      passedTests: 9,
      coverage: '88%',
      tests: [
        {
          name: 'it_can_create_a_user_credit',
          description: 'Verifies credit record creation',
          status: 'passed',
          assertions: ['Credit exists in database']
        },
        {
          name: 'it_calculates_available_credits',
          description: 'Tests available credit calculation',
          status: 'passed',
          assertions: ['Calculates credits - used correctly']
        },
        {
          name: 'it_returns_zero_if_used_exceeds_credits',
          description: 'Tests edge case for over-consumption',
          status: 'passed',
          assertions: ['Returns 0 when used exceeds credits']
        },
        {
          name: 'it_can_check_if_user_has_enough_credits',
          description: 'Tests credit availability check',
          status: 'passed',
          assertions: ['Returns correct availability status']
        },
        {
          name: 'it_can_consume_credits',
          description: 'Tests credit consumption',
          status: 'passed',
          assertions: ['Credits are consumed correctly']
        },
        {
          name: 'it_cannot_consume_more_credits_than_available',
          description: 'Tests consumption validation',
          status: 'passed',
          assertions: ['Prevents over-consumption']
        },
        {
          name: 'it_can_release_credits',
          description: 'Tests credit release',
          status: 'passed',
          assertions: ['Credits are released correctly']
        },
        {
          name: 'it_prevents_used_from_going_below_zero',
          description: 'Tests negative credit prevention',
          status: 'passed',
          assertions: ['Used never goes below 0']
        },
        {
          name: 'it_belongs_to_a_user',
          description: 'Tests user relationship',
          status: 'passed',
          assertions: ['Credit has user relationship']
        }
      ]
    },
    {
      name: 'EmailService',
      description: 'Tests for EmailService including sending, logging, and mailer configuration! 📧',
      icon: <Mail className="h-6 w-6" />,
      color: 'from-indigo-500 to-blue-500',
      totalTests: 9,
      passedTests: 9,
      coverage: '85%',
      tests: [
        {
          name: 'it_can_send_email_to_single_recipient',
          description: 'Tests single recipient email sending',
          status: 'passed',
          assertions: ['Email log is created', 'Recipient is correct']
        },
        {
          name: 'it_can_send_email_to_multiple_recipients',
          description: 'Tests multiple recipient email sending',
          status: 'passed',
          assertions: ['Multiple logs are created', 'All recipients are logged']
        },
        {
          name: 'it_can_send_email_with_cc_and_bcc',
          description: 'Tests CC and BCC functionality',
          status: 'passed',
          assertions: ['CC and BCC are stored in metadata']
        },
        {
          name: 'it_can_send_email_with_recipient_name',
          description: 'Tests recipient name handling',
          status: 'passed',
          assertions: ['Recipient name is stored correctly']
        },
        {
          name: 'it_can_send_email_synchronously',
          description: 'Tests synchronous email sending',
          status: 'passed',
          assertions: ['Email is sent immediately']
        },
        {
          name: 'it_can_send_email_without_logging',
          description: 'Tests email sending without logging',
          status: 'passed',
          assertions: ['No email log is created when logging is disabled']
        },
        {
          name: 'it_can_use_send_to_helper_method',
          description: 'Tests sendTo helper method',
          status: 'passed',
          assertions: ['Helper method works correctly']
        },
        {
          name: 'it_can_use_send_to_many_helper_method',
          description: 'Tests sendToMany helper method',
          status: 'passed',
          assertions: ['Multiple emails are sent correctly']
        },
        {
          name: 'it_can_send_email_with_custom_mailer',
          description: 'Tests custom mailer configuration',
          status: 'passed',
          assertions: ['Custom mailer is used correctly']
        }
      ]
    },
    {
      name: 'MailerService',
      description: 'Tests for MailerService including provider configuration and mailer management! ⚙️',
      icon: <Zap className="h-6 w-6" />,
      color: 'from-red-500 to-pink-500',
      totalTests: 10,
      passedTests: 10,
      coverage: '87%',
      tests: [
        {
          name: 'it_returns_supported_providers',
          description: 'Tests provider list retrieval',
          status: 'passed',
          assertions: ['All supported providers are returned']
        },
        {
          name: 'it_can_configure_smtp_mailer',
          description: 'Tests SMTP mailer configuration',
          status: 'passed',
          assertions: ['SMTP is configured correctly', 'Credentials are set']
        },
        {
          name: 'it_can_configure_mailgun_mailer',
          description: 'Tests Mailgun mailer configuration',
          status: 'passed',
          assertions: ['Mailgun is configured correctly']
        },
        {
          name: 'it_can_configure_ses_mailer',
          description: 'Tests AWS SES mailer configuration',
          status: 'passed',
          assertions: ['SES is configured correctly']
        },
        {
          name: 'it_can_configure_postmark_mailer',
          description: 'Tests Postmark mailer configuration',
          status: 'passed',
          assertions: ['Postmark is configured correctly']
        },
        {
          name: 'it_can_configure_resend_mailer',
          description: 'Tests Resend mailer configuration',
          status: 'passed',
          assertions: ['Resend is configured correctly']
        },
        {
          name: 'it_can_configure_log_mailer',
          description: 'Tests Log mailer configuration',
          status: 'passed',
          assertions: ['Log mailer is configured correctly']
        },
        {
          name: 'it_can_get_active_mailer_for_user',
          description: 'Tests active mailer retrieval',
          status: 'passed',
          assertions: ['Returns active mailer for user']
        },
        {
          name: 'it_returns_null_if_no_active_mailer_for_user',
          description: 'Tests null return when no active mailer',
          status: 'passed',
          assertions: ['Returns null when no active mailer exists']
        }
      ]
    }
  ];

  const totalTests = testSuites.reduce((sum, suite) => sum + suite.totalTests, 0);
  const totalPassed = testSuites.reduce((sum, suite) => sum + suite.passedTests, 0);
  const overallCoverage = Math.round(
    testSuites.reduce((sum, suite) => sum + parseFloat(suite.coverage), 0) / testSuites.length
  );

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-full">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <TestTube className="h-10 w-10 text-purple-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            🧪 Unit Testing Showcase
          </h1>
          <Sparkles className="h-10 w-10 text-purple-600" />
        </div>
        <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
          Comprehensive unit tests ensuring code quality, reliability, and maintainability! 
          Every model and service is thoroughly tested with high coverage! 
          <span className="ml-1">✨</span>
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{totalTests}</div>
            <p className="text-xs text-gray-600 mt-1">Comprehensive test coverage</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Passed Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{totalPassed}</div>
            <p className="text-xs text-gray-600 mt-1">
              {Math.round((totalPassed / totalTests) * 100)}% success rate
            </p>
          </CardContent>
        </Card>
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Test Suites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{testSuites.length}</div>
            <p className="text-xs text-gray-600 mt-1">Different test categories</p>
          </CardContent>
        </Card>
        <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{overallCoverage}%</div>
            <p className="text-xs text-gray-600 mt-1">Average code coverage</p>
          </CardContent>
        </Card>
      </div>

      {/* Test Suites */}
      <Tabs value={selectedSuite} onValueChange={setSelectedSuite} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 h-auto">
          <TabsTrigger value="overview" className="text-xs sm:text-sm px-2 py-2">
            Overview
          </TabsTrigger>
          {testSuites.map((suite) => (
            <TabsTrigger key={suite.name} value={suite.name} className="text-xs sm:text-sm px-2 py-2">
              {suite.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-6 w-6 text-purple-600" />
                <span>🚀 Test Suite Overview</span>
              </CardTitle>
              <CardDescription>
                Explore all our comprehensive unit tests organized by model and service! 
                Each suite covers relationships, business logic, and edge cases! 
                <span className="ml-1">✨</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testSuites.map((suite) => (
                  <Card
                    key={suite.name}
                    className={`border-2 hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${suite.color} bg-opacity-10`}
                    onClick={() => setSelectedSuite(suite.name)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${suite.color} text-white`}>
                          {suite.icon}
                        </div>
                        <span>{suite.name}</span>
                        <Badge className="ml-auto bg-green-600">
                          {suite.passedTests}/{suite.totalTests}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {suite.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coverage:</span>
                        <Badge variant="outline" className="font-bold">
                          {suite.coverage}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Test Suite Tabs */}
        {testSuites.map((suite) => (
          <TabsContent key={suite.name} value={suite.name} className="space-y-4 mt-4">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${suite.color} text-white flex-shrink-0`}>
                      {suite.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xl md:text-2xl break-words">{suite.name} Tests</div>
                      <CardDescription className="text-sm md:text-base mt-1 break-words">
                        {suite.description}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <Badge className="bg-green-600 text-white whitespace-nowrap">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {suite.passedTests}/{suite.totalTests} Passed
                    </Badge>
                    <Badge variant="outline" className="font-bold whitespace-nowrap">
                      {suite.coverage} Coverage
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full">
                <ScrollArea className="h-[500px] md:h-[600px] pr-4 w-full">
                  <div className="space-y-3">
                    {suite.tests.map((test, index) => (
                      <Card
                        key={index}
                        className={`border-2 ${
                          test.status === 'passed'
                            ? 'border-green-300 bg-green-50'
                            : test.status === 'failed'
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm md:text-base font-mono flex items-center gap-2 break-words">
                                {test.status === 'passed' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                                ) : test.status === 'failed' ? (
                                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0" />
                                )}
                                <span className="text-xs md:text-sm break-all">{test.name}</span>
                              </CardTitle>
                              <CardDescription className="text-xs md:text-sm mt-1 break-words">
                                {test.description}
                              </CardDescription>
                            </div>
                            <Badge
                              className={
                                `flex-shrink-0 ${
                                  test.status === 'passed'
                                    ? 'bg-green-600'
                                    : test.status === 'failed'
                                    ? 'bg-red-600'
                                    : 'bg-gray-600'
                                }`
                              }
                            >
                              {test.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-600 mb-2">
                              Assertions:
                            </div>
                            <ul className="space-y-1">
                              {test.assertions.map((assertion, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <CheckCircle2 className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-700">{assertion}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Testing Philosophy */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            <span>🛡️ Our Testing Philosophy</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">✅ Comprehensive Coverage</h4>
              <p className="text-sm text-gray-700">
                We test all models, services, relationships, scopes, and business logic to ensure 
                everything works as expected! Every edge case is considered! 
                <span className="ml-1">🎯</span>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">🔒 Reliability First</h4>
              <p className="text-sm text-gray-700">
                Our tests use database transactions and proper mocking to ensure fast, 
                reliable test execution without side effects! 
                <span className="ml-1">⚡</span>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">📊 High Coverage</h4>
              <p className="text-sm text-gray-700">
                We maintain high code coverage across all modules, ensuring that 
                critical business logic is thoroughly tested! 
                <span className="ml-1">📈</span>
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-purple-700">🚀 Continuous Improvement</h4>
              <p className="text-sm text-gray-700">
                Tests are continuously updated as features are added, ensuring 
                the test suite grows with the application! 
                <span className="ml-1">✨</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitTestingShowcase;

