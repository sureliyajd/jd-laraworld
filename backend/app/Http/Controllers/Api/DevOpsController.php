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
        $dockerComposePath = base_path('docker-compose.yml');
        $dockerIgnorePath = base_path('.dockerignore');

        return [
            'enabled' => File::exists($dockerfilePath) || File::exists($dockerComposePath),
            'files' => [
                'Dockerfile' => [
                    'exists' => File::exists($dockerfilePath),
                    'path' => 'Dockerfile',
                    'content' => File::exists($dockerfilePath) ? File::get($dockerfilePath) : null,
                    'description' => 'Docker containerization configuration for the Laravel application',
                ],
                'docker-compose.yml' => [
                    'exists' => File::exists($dockerComposePath),
                    'path' => 'docker-compose.yml',
                    'content' => File::exists($dockerComposePath) ? File::get($dockerComposePath) : null,
                    'description' => 'Docker Compose configuration for multi-container Docker applications',
                ],
                '.dockerignore' => [
                    'exists' => File::exists($dockerIgnorePath),
                    'path' => '.dockerignore',
                    'content' => File::exists($dockerIgnorePath) ? File::get($dockerIgnorePath) : null,
                    'description' => 'Files and directories to exclude from Docker builds',
                ],
            ],
            'description' => 'Docker containerization setup for consistent development and deployment environments',
            'features' => [
                'Multi-stage builds for optimized images',
                'Development and production configurations',
                'Service orchestration with Docker Compose',
                'Volume management for persistent data',
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
        $workflowsPath = base_path('.github/workflows');
        $workflows = [];
        
        if (File::isDirectory($workflowsPath)) {
            $files = File::allFiles($workflowsPath);
            foreach ($files as $file) {
                if (in_array($file->getExtension(), ['yml', 'yaml'])) {
                    $workflows[$file->getFilename()] = [
                        'path' => $file->getRelativePathname(),
                        'content' => File::get($file->getPathname()),
                        'description' => $this->getWorkflowDescription($file->getFilename()),
                    ];
                }
            }
        }

        return [
            'enabled' => File::isDirectory($workflowsPath) && count($workflows) > 0,
            'workflows' => $workflows,
            'description' => 'CI/CD pipelines using GitHub Actions for automated testing, building, and deployment',
            'features' => [
                'Automated testing on pull requests',
                'Automated deployment on merge to main',
                'Multi-environment deployments',
                'Parallel job execution',
                'Build artifact management',
            ],
        ];
    }

    /**
     * Get Infrastructure information
     */
    private function getInfrastructureInfo(): array
    {
        return [
            'cloud_provider' => env('CLOUD_PROVIDER', 'Not configured'),
            'environment' => env('APP_ENV', 'local'),
            'server_specs' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'database' => config('database.default'),
            ],
            'services' => [
                'database' => config('database.default'),
                'cache' => config('cache.default'),
                'queue' => config('queue.default'),
                'broadcasting' => config('broadcasting.default'),
            ],
            'description' => 'Infrastructure configuration and deployment information',
            'monitoring' => [
                'enabled' => false,
                'tools' => [],
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
                'test' => 'Run automated tests',
                'build' => 'Build application artifacts',
                'deploy' => 'Deploy to target environment',
            ],
            'environments' => ['development', 'staging', 'production'],
            'description' => 'Continuous Integration and Continuous Deployment pipeline configuration',
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
