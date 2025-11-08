<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\SendEmailRequest;
use App\Http\Resources\EmailLogResource;
use App\Http\Resources\EmailLogCollection;
use App\Mail\CustomEmail;
use App\Models\EmailLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Access\AuthorizationException;

class EmailLogController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): EmailLogCollection
    {
        $user = $request->user();
        
        // Check permission to view email logs
        if (!$user->checkPermission('view all email logs') && !$user->checkPermission('view email logs')) {
            throw new AuthorizationException('You do not have permission to view email logs');
        }
        
        $query = EmailLog::with('sender')
            ->orderBy('created_at', 'desc');
        
        // If user can only view their own email logs, filter by sent_by
        if ($user->checkPermission('view email logs') && !$user->checkPermission('view all email logs')) {
            $query->where('sent_by', $user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('recipient_email')) {
            $query->where('recipient_email', 'like', "%{$request->recipient_email}%");
        }

        if ($request->has('sent_by')) {
            $query->where('sent_by', $request->sent_by);
        }

        // Apply search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                  ->orWhere('recipient_email', 'like', "%{$search}%")
                  ->orWhere('recipient_name', 'like', "%{$search}%");
            });
        }

        // Apply date filters
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Apply pagination
        $perPage = min($request->get('per_page', 15), 100);
        $emailLogs = $query->paginate($perPage);

        return new EmailLogCollection($emailLogs);
    }

    /**
     * Store a newly created resource in storage (Send Email).
     */
    public function store(SendEmailRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to send emails
        if (!$user->checkPermission('send emails')) {
            return response()->json([
                'message' => 'You do not have permission to send emails'
            ], 403);
        }

        try {
            DB::beginTransaction();

            // Check and consume credits atomically within transaction (unless super admin)
            if (!$user->isSuperAdmin()) {
                // This will check and consume credits atomically with database lock
                if (!$user->consumeCredits('email', 1)) {
                    $effectiveUser = $user->getEffectiveUser();
                    
                    // Get fresh credit data after rollback for error message
                    DB::rollBack();
                    
                    // Get credit info after rollback (fresh data)
                    $credit = \App\Models\UserCredit::where('user_id', $effectiveUser->id)
                        ->where('module', 'email')
                        ->first();
                    
                    $available = $credit ? max(0, $credit->credits - $credit->used) : 0;
                    $totalCredits = $credit ? $credit->credits : 0;
                    
                    Log::warning('Email sending credit check failed', [
                        'user_id' => $user->id,
                        'effective_user_id' => $effectiveUser->id,
                        'available' => $available,
                        'total_credits' => $totalCredits,
                    ]);
                    
                    return response()->json([
                        'message' => 'Insufficient credits to send email',
                        'error' => "You have {$available} email credit(s) available (out of {$totalCredits} total), but need 1.",
                    ], 403);
                }
                
                Log::info('Email sending credit consumed', [
                    'user_id' => $user->id,
                    'effective_user_id' => $user->getEffectiveUser()->id,
                ]);
            }

            // Create email log entry
            $emailLog = EmailLog::create([
                'sent_by' => $user->id,
                'recipient_email' => $request->recipient_email,
                'recipient_name' => $request->recipient_name,
                'subject' => $request->subject,
                'body' => $request->body,
                'html_body' => $request->html_body,
                'status' => 'pending',
                'metadata' => [
                    'cc' => $request->cc ?? [],
                    'bcc' => $request->bcc ?? [],
                ],
            ]);

            // Send email
            try {
                $mail = new CustomEmail(
                    subject: $request->subject,
                    body: $request->body,
                    htmlBody: $request->html_body,
                    recipientName: $request->recipient_name
                );

                $mail->to($request->recipient_email, $request->recipient_name);

                // Add CC recipients
                if ($request->has('cc') && is_array($request->cc)) {
                    foreach ($request->cc as $ccEmail) {
                        $mail->cc($ccEmail);
                    }
                }

                // Add BCC recipients
                if ($request->has('bcc') && is_array($request->bcc)) {
                    foreach ($request->bcc as $bccEmail) {
                        $mail->bcc($bccEmail);
                    }
                }

                Mail::send($mail);

                // Update email log status
                $emailLog->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                DB::commit();

                return response()->json([
                    'message' => 'Email sent successfully',
                    'data' => new EmailLogResource($emailLog->load('sender')),
                ], 201);

            } catch (\Exception $e) {
                // Update email log with error
                $emailLog->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                // Release credit if email failed to send (unless super admin)
                if (!$user->isSuperAdmin()) {
                    $user->releaseCredits('email', 1);
                }

                DB::commit();

                Log::error('Failed to send email', [
                    'email_log_id' => $emailLog->id,
                    'error' => $e->getMessage(),
                ]);

                return response()->json([
                    'message' => 'Failed to send email',
                    'error' => $e->getMessage(),
                    'data' => new EmailLogResource($emailLog->load('sender')),
                ], 500);
            }

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error creating email log', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Error processing email request',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $emailLog = EmailLog::with('sender')->findOrFail($id);
        
        // Check permission to view email logs
        if (!$user->checkPermission('view all email logs') && !$user->checkPermission('view email logs')) {
            return response()->json([
                'message' => 'You do not have permission to view email logs'
            ], 403);
        }
        
        // If user can only view their own email logs, check ownership
        if ($user->checkPermission('view email logs') && !$user->checkPermission('view all email logs')) {
            if ($emailLog->sent_by !== $user->id) {
                return response()->json([
                    'message' => 'You do not have permission to view this email log'
                ], 403);
            }
        }

        return response()->json([
            'data' => new EmailLogResource($emailLog),
        ]);
    }

    /**
     * Get email statistics
     */
    public function statistics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Check permission to view email logs
        if (!$user->checkPermission('view all email logs') && !$user->checkPermission('view email logs')) {
            return response()->json([
                'message' => 'You do not have permission to view email statistics'
            ], 403);
        }
        
        $query = EmailLog::query();
        
        // If user can only view their own email logs, filter by sent_by
        if ($user->checkPermission('view email logs') && !$user->checkPermission('view all email logs')) {
            $query->where('sent_by', $user->id);
        }

        // Apply date filter if provided
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $stats = [
            'total' => (clone $query)->count(),
            'sent' => (clone $query)->where('status', 'sent')->count(),
            'pending' => (clone $query)->where('status', 'pending')->count(),
            'failed' => (clone $query)->where('status', 'failed')->count(),
            'bounced' => (clone $query)->where('status', 'bounced')->count(),
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}
