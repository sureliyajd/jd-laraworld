<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Laravel\Passport\ClientRepository;
use Illuminate\Support\Facades\DB;

class SetupAuth extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'auth:setup {--frontend-url=http://localhost:5173}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up Laravel Passport OAuth2 authentication for frontend integration';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up Laravel Passport OAuth2 authentication...');
        $this->newLine();

        try {
            // Check if Passport is already installed
            if (!DB::table('oauth_clients')->exists()) {
                $this->info('Installing Laravel Passport...');
                
                // Run passport:install command
                $exitCode = $this->call('passport:install');
                
                if ($exitCode === 0) {
                    $this->info('✓ Laravel Passport installed successfully!');
                } else {
                    $this->error('✗ Failed to install Laravel Passport');
                    return 1;
                }
            } else {
                $this->info('✓ Laravel Passport is already installed');
            }

            // Create PKCE client for frontend
            $this->newLine();
            $this->info('Creating OAuth2 PKCE client for frontend...');
            
            $clientRepository = new ClientRepository();
            $frontendUrl = $this->option('frontend-url');
            $redirectUri = $frontendUrl . '/auth/callback';
            
            // Check if client already exists
            $existingClient = DB::table('oauth_clients')
                ->where('name', 'Lara World Frontend')
                ->first();
            
            if ($existingClient) {
                $this->info('✓ OAuth2 client already exists');
                $clientId = $existingClient->id;
                $clientSecret = $existingClient->secret;
            } else {
                // Create client using DB facade with correct structure
                $clientId = \Illuminate\Support\Str::uuid();
                $clientSecret = \Illuminate\Support\Str::random(40);
                
                DB::table('oauth_clients')->insert([
                    'id' => $clientId,
                    'owner_type' => null,
                    'owner_id' => null,
                    'name' => 'Lara World Frontend',
                    'secret' => $clientSecret,
                    'provider' => null,
                    'redirect_uris' => json_encode([$redirectUri]),
                    'grant_types' => json_encode(['authorization_code', 'refresh_token']),
                    'revoked' => false,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $this->info('✓ OAuth2 PKCE client created successfully!');
            }

            $this->newLine();
            $this->line(str_repeat('=', 50));
            $this->info('AUTHENTICATION SETUP COMPLETE!');
            $this->line(str_repeat('=', 50));
            $this->newLine();
            
            $this->info('Frontend Configuration:');
            $this->line("CLIENT_ID: {$clientId}");
            $this->line("CLIENT_SECRET: {$clientSecret}");
            $this->line("REDIRECT_URI: {$redirectUri}");
            $this->line("API_BASE_URL: http://localhost:8000/api");
            $this->newLine();
            
            $this->info('Next steps:');
            $this->line('1. Update your frontend config with the credentials above');
            $this->line('2. Run: php artisan serve (to start the backend server)');
            $this->line('3. Start your frontend development server');
            $this->line('4. Test the authentication flow');
            $this->newLine();
            
            $this->info('Demo user credentials:');
            $this->line('Email: demo@laraworld.test');
            $this->line('Password: password');
            $this->newLine();

        } catch (\Exception $e) {
            $this->error('✗ Error: ' . $e->getMessage());
            return 1;
        }

        return 0;
    }
}
