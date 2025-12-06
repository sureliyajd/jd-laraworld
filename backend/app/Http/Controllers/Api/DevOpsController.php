<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\File;

class DevOpsController extends Controller
{
    /**
     * Get all DevOps showcase information
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'data' => [
                'docker' => $this->getDockerInfo(),
                'terraform' => $this->getTerraformInfo(),
                'github_actions' => $this->getGitHubActionsInfo(),
                'infrastructure' => $this->getInfrastructureInfo(),
                'ci_cd' => $this->getCICDInfo(),
            ],
        ]);
    }

    /**
     * Get Docker information
     */
    public function docker(): JsonResponse
    {
        return response()->json([
            'data' => $this->getDockerInfo(),
        ]);
    }

    /**
     * Get Terraform information
     */
    public function terraform(): JsonResponse
    {
        return response()->json([
            'data' => $this->getTerraformInfo(),
        ]);
    }

    /**
     * Get GitHub Actions information
     */
    public function githubActions(): JsonResponse
    {
        return response()->json([
            'data' => $this->getGitHubActionsInfo(),
        ]);
    }

    /**
     * Get Infrastructure information
     */
    public function infrastructure(): JsonResponse
    {
        return response()->json([
            'data' => $this->getInfrastructureInfo(),
        ]);
    }

    /**
     * Get CI/CD information
     */
    public function cicd(): JsonResponse
    {
        return response()->json([
            'data' => $this->getCICDInfo(),
        ]);
    }

    /**
     * Get Docker configuration details
     */
    private function getDockerInfo(): array
    {
        $dockerfilePath = base_path('Dockerfile');
        $nginxConfPath = base_path('nginx-prod.conf');
        $dockerStartPath = base_path('docker-start.sh');
        $dockerIgnorePath = base_path('.dockerignore');

        return [
            'enabled' => File::exists($dockerfilePath),
            'files' => [
                'Dockerfile' => [
                    'exists' => File::exists($dockerfilePath),
                    'path' => 'Dockerfile',
                    'content' => File::exists($dockerfilePath) ? File::get($dockerfilePath) : null,
                    'description' => 'Production-ready Docker configuration with PHP 8.2-FPM and Nginx bundled in a single container. Includes comprehensive documentation for deployment setup, environment variables, and Passport OAuth key configuration.',
                ],
                'nginx-prod.conf' => [
                    'exists' => File::exists($nginxConfPath),
                    'path' => 'nginx-prod.conf',
                    'content' => File::exists($nginxConfPath) ? File::get($nginxConfPath) : null,
                    'description' => 'Nginx web server configuration optimized for Laravel. Includes security headers, gzip compression, static asset caching, and PHP-FPM FastCGI settings.',
                ],
                'docker-start.sh' => [
                    'exists' => File::exists($dockerStartPath),
                    'path' => 'docker-start.sh',
                    'content' => File::exists($dockerStartPath) ? File::get($dockerStartPath) : null,
                    'description' => 'Container startup script that validates environment variables, configures Passport OAuth keys (supports both environment variables and secret file mounts), caches Laravel configuration, and starts PHP-FPM and Nginx services.',
                ],
                '.dockerignore' => [
                    'exists' => File::exists($dockerIgnorePath),
                    'path' => '.dockerignore',
                    'content' => File::exists($dockerIgnorePath) ? File::get($dockerIgnorePath) : null,
                    'description' => 'Files and directories excluded from Docker builds for smaller image size.',
                ],
            ],
            'description' => 'Production-ready Docker setup with Nginx + PHP-FPM in a single container. Designed for easy deployment to any cloud platform (Render, AWS, DigitalOcean, Google Cloud Run, etc.).',
            'features' => [
                'Single unified Dockerfile for production deployment',
                'PHP 8.2-FPM with all Laravel required extensions',
                'Nginx web server with optimized configuration',
                'Automatic Passport OAuth key setup (via env vars or secret files)',
                'Laravel configuration caching on startup',
                'Health check endpoint for container orchestration',
                'Security headers and gzip compression',
                'Compatible with Render, AWS ECS, DigitalOcean, Google Cloud Run',
            ],
            'deployment_steps' => [
                '1. Generate APP_KEY: php artisan key:generate --show',
                '2. Generate Passport keys: php artisan passport:keys',
                '3. Set environment variables in your deployment platform',
                '4. Configure Passport keys (env vars or secret files)',
                '5. Build and deploy the container',
                '6. Run migrations: php artisan migrate --force',
                '7. Create Passport client: php artisan passport:client --personal',
            ],
            'required_env_vars' => [
                'APP_KEY' => 'Laravel application key (base64 encoded)',
                'APP_ENV' => 'Environment (production)',
                'APP_URL' => 'Your API URL',
                'DB_CONNECTION' => 'Database driver (mysql, pgsql)',
                'DB_HOST' => 'Database host',
                'DB_DATABASE' => 'Database name',
                'DB_USERNAME' => 'Database username',
                'DB_PASSWORD' => 'Database password',
            ],
        ];
    }

    /**
     * Get Terraform configuration details
     */
    private function getTerraformInfo(): array
    {
        $terraformDir = base_path('terraform');
        $terraformFiles = [];
        
        if (File::isDirectory($terraformDir)) {
            $files = File::allFiles($terraformDir);
            foreach ($files as $file) {
                if ($file->getExtension() === 'tf' || $file->getExtension() === 'tfvars') {
                    $terraformFiles[$file->getFilename()] = [
                        'path' => $file->getRelativePathname(),
                        'content' => File::get($file->getPathname()),
                        'description' => $this->getTerraformFileDescription($file->getFilename()),
                    ];
                }
            }
        }

        return [
            'enabled' => File::isDirectory($terraformDir) && count($terraformFiles) > 0,
            'files' => $terraformFiles,
            'description' => 'Infrastructure as Code (IaC) using Terraform for provisioning cloud resources',
            'features' => [
                'Infrastructure provisioning and management',
                'Version-controlled infrastructure',
                'Multi-environment support (dev, staging, prod)',
                'Automated resource lifecycle management',
            ],
        ];
    }

    /**
     * Get GitHub Actions configuration details
     */
    private function getGitHubActionsInfo(): array
    {
        // Try multiple paths to find .github/workflows directory
        // Works for both local development (backend subdirectory) and server deployment (root level)
        $possiblePaths = [
            base_path('.github/workflows'),      // Server deployment: .github at root level
            base_path('../.github/workflows'),   // Local dev: backend is subdirectory
            base_path('../../.github/workflows'), // Fallback: if nested deeper
        ];
        
        $workflowsPath = null;
        foreach ($possiblePaths as $path) {
            if (File::isDirectory($path)) {
                $workflowsPath = $path;
                break;
            }
        }
        
        $workflows = [];
        
        if ($workflowsPath && File::isDirectory($workflowsPath)) {
            $files = File::allFiles($workflowsPath);
            foreach ($files as $file) {
                if (in_array($file->getExtension(), ['yml', 'yaml'])) {
                    $workflows[$file->getFilename()] = [
                        'path' => '.github/workflows/' . $file->getFilename(),
                        'content' => File::get($file->getPathname()),
                        'description' => $this->getWorkflowDescription($file->getFilename()),
                    ];
                }
            }
        }

        return [
            'enabled' => $workflowsPath !== null && count($workflows) > 0,
            'workflows' => $workflows,
            'description' => 'Automated CI/CD pipeline using GitHub Actions with rsync-based deployment to AWS EC2. Triggers on push to main branch for seamless continuous deployment.',
            'features' => [
                'Automatic deployment on push to main branch',
                'Rsync-based file transfer for efficient incremental deployments',
                'SSH key authentication with secure GitHub Secrets',
                'Smart file exclusions (vendor, node_modules, .env, logs)',
                'Retry mechanism for network resilience (3 attempts)',
                'Remote server deployment script execution',
                'Automatic cleanup on failure',
                'Post-deployment verification and status reporting',
            ],
            'deployment_flow' => [
                'Checkout code from repository',
                'Install rsync and SSH client',
                'Setup SSH key from GitHub Secrets',
                'Verify Laravel directory structure',
                'Upload code to EC2 via rsync',
                'Verify uploaded files on server',
                'Sync to application directory',
                'Set proper file ownership (www-data)',
                'Execute server-side deploy script',
                'Copy Passport OAuth keys with permissions',
                'Cleanup temporary files',
            ],
            'required_secrets' => [
                'SSH_PRIVATE_KEY' => 'Private SSH key for EC2 server access',
                'SSH_USER' => 'SSH username for the EC2 instance',
                'SERVER_IP' => 'Public IP address of the EC2 instance',
                'SERVER_SSH_PORT' => 'SSH port number (default: 22)',
            ],
            'excluded_files' => [
                '.git' => 'Git repository metadata',
                'vendor' => 'Composer dependencies (installed on server)',
                'node_modules' => 'NPM dependencies',
                '.env' => 'Environment configuration (server-specific)',
                'storage/logs/*' => 'Application log files',
                'storage/framework/*' => 'Cache, sessions, views',
                'tests' => 'Test files',
                '*.sqlite' => 'SQLite database files',
            ],
        ];
    }

    /**
     * Get Infrastructure information
     */
    private function getInfrastructureInfo(): array
    {
        return [
            'cloud_provider' => 'AWS (Amazon Web Services)',
            'environment' => env('APP_ENV', 'production'),
            'description' => 'Cost-optimized infrastructure setup for demo/portfolio project. Backend deployed on AWS EC2, database on RDS MySQL, frontend on GitHub Pages, and real-time features via Pusher.',
            
            // Backend Infrastructure
            'backend' => [
                'hosting' => 'AWS EC2',
                'type' => 'EC2 Instance',
                'description' => 'Laravel backend API running on AWS EC2 instance with Docker containerization',
                'deployment_method' => 'Docker + GitHub Actions CI/CD',
                'web_server' => 'Nginx + PHP-FPM',
            ],
            
            // Frontend Infrastructure
            'frontend' => [
                'hosting' => 'GitHub Pages',
                'description' => 'React-based frontend application deployed on GitHub Pages for cost-effective static hosting',
                'deployment_method' => 'GitHub Actions (automatic on push)',
                'framework' => 'React + TypeScript',
            ],
            
            // Database Infrastructure
            'database' => [
                'service' => 'AWS RDS',
                'engine' => 'MySQL',
                'type' => 'Managed Database Service',
                'description' => 'Fully managed MySQL database on AWS RDS for reliable data persistence',
                'connection' => config('database.default'),
            ],
            
            // Broadcasting Service
            'broadcasting' => [
                'service' => 'Pusher',
                'type' => 'Real-time WebSocket Service',
                'description' => 'Pusher service for real-time broadcasting, notifications, and live updates',
                'driver' => config('broadcasting.default', 'pusher'),
            ],
            
            // Server Specifications
            'server_specs' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'database' => config('database.default'),
                'operating_system' => 'Linux (Ubuntu/Debian)',
            ],
            
            // Services Configuration
            'services' => [
                'database' => config('database.default'),
                'cache' => config('cache.default'),
                'queue' => config('queue.default'),
                'broadcasting' => config('broadcasting.default'),
                'session' => config('session.driver'),
            ],
            
            // CI/CD Configuration
            'cicd' => [
                'platform' => 'GitHub Actions',
                'trigger' => 'Push to main branch',
                'deployment_target' => 'AWS EC2',
                'method' => 'Rsync over SSH',
            ],
            
            // Cost Optimization
            'cost_optimization' => [
                'strategy' => 'Minimal cost demo/portfolio setup',
                'features' => [
                    'Free GitHub Pages hosting for frontend',
                    'Cost-effective EC2 instance sizing',
                    'Managed RDS for reliability without overhead',
                    'Pay-as-you-go Pusher service',
                    'Automated deployments to reduce manual work',
                ],
            ],
            
            // Security Features
            'security' => [
                'ssl_tls' => 'Enabled (HTTPS)',
                'authentication' => 'Laravel Passport OAuth2',
                'api_protection' => 'Bearer token authentication',
                'database' => 'Encrypted connections to RDS',
            ],
            
            // Monitoring
            'monitoring' => [
                'enabled' => false,
                'tools' => [],
                'note' => 'Basic monitoring via Laravel logs. Can be extended with AWS CloudWatch or third-party services.',
            ],
            
            // Scalability Notes
            'scalability' => [
                'current_setup' => 'Single EC2 instance suitable for demo/portfolio',
                'scaling_options' => [
                    'Horizontal scaling: Add more EC2 instances behind load balancer',
                    'Database: RDS supports read replicas for read scaling',
                    'Caching: Redis/ElastiCache for improved performance',
                    'CDN: CloudFront for static asset delivery',
                ],
            ],
        ];
    }

    /**
     * Get CI/CD information
     */
    private function getCICDInfo(): array
    {
        return [
            'platform' => 'GitHub Actions',
            'stages' => [
                'checkout' => 'Clone repository and verify Laravel structure',
                'setup' => 'Configure SSH keys and install rsync',
                'upload' => 'Transfer files to EC2 using rsync with retries',
                'verify' => 'Validate uploaded files on remote server',
                'deploy' => 'Execute deployment script on EC2',
                'cleanup' => 'Remove temporary files and report status',
            ],
            'environments' => ['production'],
            'description' => 'Automated deployment pipeline that deploys Laravel code to AWS EC2 on every push to main branch using rsync over SSH.',
            'trigger' => 'Push to main branch',
            'runner' => 'ubuntu-latest',
            'deployment_method' => 'Rsync over SSH',
            'target_infrastructure' => 'AWS EC2',
        ];
    }

    /**
     * Get description for Terraform file
     */
    private function getTerraformFileDescription(string $filename): string
    {
        $descriptions = [
            'main.tf' => 'Main Terraform configuration file',
            'variables.tf' => 'Terraform variable definitions',
            'outputs.tf' => 'Terraform output values',
            'providers.tf' => 'Terraform provider configurations',
            'terraform.tfvars' => 'Terraform variable values',
        ];

        return $descriptions[$filename] ?? 'Terraform configuration file';
    }

    /**
     * Get description for workflow file
     */
    private function getWorkflowDescription(string $filename): string
    {
        $descriptions = [
            'ci.yml' => 'Continuous Integration workflow',
            'cd.yml' => 'Continuous Deployment workflow',
            'test.yml' => 'Testing workflow',
            'deploy.yml' => 'Deployment workflow',
        ];

        return $descriptions[$filename] ?? 'GitHub Actions workflow';
    }
}
