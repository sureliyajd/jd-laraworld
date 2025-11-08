<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMailerRequest;
use App\Http\Requests\UpdateMailerRequest;
use App\Http\Requests\TestMailerRequest;
use App\Http\Resources\MailerResource;
use App\Models\Mailer;
use App\Services\MailerService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MailerController extends Controller
{
    protected MailerService $mailerService;

    public function __construct(MailerService $mailerService)
    {
        $this->mailerService = $mailerService;
    }

    /**
     * Display a listing of the user's mailers.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $mailers = Mailer::where('user_id', $user->id)
            ->orderBy('is_active', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => MailerResource::collection($mailers),
        ]);
    }

    /**
     * Get supported mail providers.
     */
    public function providers(): JsonResponse
    {
        return response()->json([
            'data' => MailerService::getSupportedProviders(),
        ]);
    }

    /**
     * Store a newly created mailer.
     */
    public function store(StoreMailerRequest $request): JsonResponse
    {
        $user = $request->user();

        try {
            DB::beginTransaction();

            // If this mailer is being set as active, deactivate other mailers
            if ($request->input('is_active', false)) {
                Mailer::where('user_id', $user->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            // Create the mailer
            $mailer = Mailer::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'provider' => $request->provider,
                'credentials' => $request->credentials,
                'from_address' => $request->from_address,
                'from_name' => $request->from_name,
                'is_active' => $request->input('is_active', false),
            ]);

            // Test the mailer configuration
            $testEmail = $user->email; // Use user's email as test email
            $testResult = $this->mailerService->testMailer($mailer, $testEmail);

            // Update test status (save even if test fails)
            $mailer->update([
                'test_status' => $testResult['success'],
                'test_error' => $testResult['success'] ? null : ($testResult['error'] ?? $testResult['raw_error'] ?? 'Unknown error'),
                'last_tested_at' => now(),
            ]);

            // If test failed, don't allow activation and return error response
            if (!$testResult['success']) {
                // If mailer was set as active but test failed, deactivate it
                if ($mailer->is_active) {
                    $mailer->update(['is_active' => false]);
                }
                
                DB::commit();
                
                return response()->json([
                    'message' => 'Mailer created but test email failed',
                    'error' => $testResult['error'] ?? 'Unknown error',
                    'raw_error' => $testResult['raw_error'] ?? null,
                    'data' => new MailerResource($mailer->fresh()),
                ], 422);
            }

            DB::commit();

            return response()->json([
                'message' => 'Mailer created and tested successfully',
                'data' => new MailerResource($mailer->fresh()),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create mailer', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to create mailer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified mailer.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        return response()->json([
            'data' => new MailerResource($mailer),
        ]);
    }

    /**
     * Update the specified mailer.
     */
    public function update(UpdateMailerRequest $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        try {
            DB::beginTransaction();

            // If this mailer is being set as active, deactivate other mailers
            if ($request->has('is_active') && $request->input('is_active')) {
                Mailer::where('user_id', $user->id)
                    ->where('id', '!=', $mailer->id)
                    ->where('is_active', true)
                    ->update(['is_active' => false]);
            }

            // Update the mailer
            $updateData = $request->only(['name', 'provider', 'credentials', 'from_address', 'from_name', 'is_active']);
            $mailer->update($updateData);

            // If credentials or provider changed, test the mailer again
            if ($request->has('credentials') || $request->has('provider')) {
                $testEmail = $user->email;
                $testResult = $this->mailerService->testMailer($mailer->fresh(), $testEmail);

                $mailer->update([
                    'test_status' => $testResult['success'],
                    'test_error' => $testResult['success'] ? null : ($testResult['error'] ?? $testResult['raw_error'] ?? 'Unknown error'),
                    'last_tested_at' => now(),
                ]);

                // If test failed, deactivate mailer if it was active
                if (!$testResult['success']) {
                    if ($mailer->is_active) {
                        $mailer->update(['is_active' => false]);
                    }
                    
                    DB::commit();
                    
                    return response()->json([
                        'message' => 'Mailer updated but test email failed',
                        'error' => $testResult['error'] ?? 'Unknown error',
                        'raw_error' => $testResult['raw_error'] ?? null,
                        'data' => new MailerResource($mailer->fresh()),
                    ], 422);
                }
            }

            DB::commit();

            return response()->json([
                'message' => 'Mailer updated successfully',
                'data' => new MailerResource($mailer->fresh()),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update mailer', [
                'mailer_id' => $mailer->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to update mailer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified mailer.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        $mailer->delete();

        return response()->json([
            'message' => 'Mailer deleted successfully',
        ]);
    }

    /**
     * Test a mailer configuration.
     */
    public function test(TestMailerRequest $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        try {
            $testResult = $this->mailerService->testMailer($mailer, $request->test_email);

            // Update test status
            $mailer->update([
                'test_status' => $testResult['success'],
                'test_error' => $testResult['success'] ? null : ($testResult['error'] ?? $testResult['raw_error'] ?? 'Unknown error'),
                'last_tested_at' => now(),
            ]);

            if ($testResult['success']) {
                return response()->json([
                    'message' => 'Test email sent successfully',
                    'data' => new MailerResource($mailer->fresh()),
                ]);
            } else {
                return response()->json([
                    'message' => 'Test email failed',
                    'error' => $testResult['error'] ?? 'Unknown error',
                    'raw_error' => $testResult['raw_error'] ?? null,
                    'data' => new MailerResource($mailer->fresh()),
                ], 422);
            }

        } catch (\Exception $e) {
            Log::error('Failed to test mailer', [
                'mailer_id' => $mailer->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'message' => 'Failed to test mailer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Activate a mailer (set as active and deactivate others).
     */
    public function activate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        // Check if mailer is tested and successful
        if (!$mailer->test_status) {
            return response()->json([
                'message' => 'Cannot activate mailer that has not been tested successfully',
                'error' => 'Please test the mailer first before activating it',
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Deactivate other mailers
            Mailer::where('user_id', $user->id)
                ->where('id', '!=', $mailer->id)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            // Activate this mailer
            $mailer->update(['is_active' => true]);

            DB::commit();

            return response()->json([
                'message' => 'Mailer activated successfully',
                'data' => new MailerResource($mailer->fresh()),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to activate mailer', [
                'mailer_id' => $mailer->id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to activate mailer',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Deactivate a mailer.
     */
    public function deactivate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $mailer = Mailer::where('user_id', $user->id)
            ->findOrFail($id);

        $mailer->update(['is_active' => false]);

        return response()->json([
            'message' => 'Mailer deactivated successfully',
            'data' => new MailerResource($mailer->fresh()),
        ]);
    }
}
