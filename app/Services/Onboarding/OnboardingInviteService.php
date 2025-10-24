<?php

namespace App\Services\Onboarding;

use App\Models\OnboardingInvite;
use App\Models\OnboardingSubmission;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class OnboardingInviteService
{
    /**
     * Create a new onboarding invite and send email
     */
    public function createInvite(array $data)
    {
        DB::beginTransaction();
        
        try {
            $token = $this->generateUniqueToken();
            
            // ✅ CHANGED: No expiration (set to null or very far future)
            $expiresAt = null; // No expiration
            // OR: $expiresAt = now()->addYear(); // 1 year expiration
            
            $invite = OnboardingInvite::create([
                'email' => $data['email'],
                'first_name' => $data['first_name'] ?? null,
                'last_name' => $data['last_name'] ?? null,
                'position' => $data['position'] ?? null,
                'department' => $data['department'] ?? null,
                'token' => $token,
                'expires_at' => $expiresAt,
                'status' => 'pending',
                'created_by' => auth()->id(),
            ]);
            
            OnboardingSubmission::create([
                'invite_id' => $invite->id,
                'status' => 'draft',
                'completion_percentage' => 0,
            ]);
            
            $this->sendInviteEmail($invite);
            
            DB::commit();
            
            return $invite;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function generateUniqueToken()
    {
        do {
            $token = Str::random(64);
        } while (OnboardingInvite::where('token', $token)->exists());
        
        return $token;
    }

    /**
     * ✅ UPDATED: Email message without expiration mention
     */
    public function sendInviteEmail(OnboardingInvite $invite)
    {
        $message = "Hello {$invite->full_name},\n\n" .
            "Welcome to Rocket Partners!\n\n" .
            "You've been invited to complete your pre-onboarding requirements.\n\n" .
            "Please click the link below to get started:\n" .
            "{$invite->guest_url}\n\n";
        
        // ✅ Only mention expiration if it exists
        if ($invite->expires_at) {
            $message .= "This link is valid until " . $invite->expires_at->format('F d, Y') . "\n\n";
        }
        
        $message .= "Best regards,\n" .
            "Rocket Partners HR Team";
        
        Mail::raw($message, function ($mail) use ($invite) {
            $mail->to($invite->email)
                 ->subject('Welcome to Rocket Partners - Complete Your Onboarding');
        });
    }

    public function resendInvite(OnboardingInvite $invite)
    {
        if (!$invite->isValid()) {
            throw new \Exception('Cannot resend expired or cancelled invite.');
        }
        
        $this->sendInviteEmail($invite);
        return true;
    }

    public function extendExpiration(OnboardingInvite $invite, int $days = 7)
    {
        $newExpiration = $invite->expires_at 
            ? $invite->expires_at->addDays($days)
            : now()->addDays($days);
        
        $invite->update([
            'expires_at' => $newExpiration,
            'status' => 'pending',
        ]);
        
        return $invite;
    }

    public function cancelInvite(OnboardingInvite $invite)
    {
        if (in_array($invite->status, ['approved', 'submitted'])) {
            throw new \Exception('Cannot cancel already submitted or approved invites.');
        }
        
        $invite->update(['status' => 'cancelled']);
        return true;
    }

    public function markExpiredInvites()
    {
        $expiredInvites = OnboardingInvite::where('expires_at', '<=', now())
            ->whereIn('status', ['pending', 'in_progress'])
            ->get();
        
        foreach ($expiredInvites as $invite) {
            $invite->markAsExpired();
        }
        
        return $expiredInvites->count();
    }

    /**
     * ✅ Convert approved submission to User account
     * This creates their work email and login credentials
     */
    public function convertToUser(OnboardingInvite $invite)
    {
        if ($invite->status !== 'submitted') {
            throw new \Exception('Can only convert submitted invites to user accounts.');
        }
        
        if (!$invite->submission) {
            throw new \Exception('No submission found for this invite.');
        }
        
        DB::beginTransaction();
        
        try {
            $userData = $invite->submission->toUserArray();
            
            // ✅ Create work email based on name
            $firstName = strtolower($userData['first_name']);
            $lastName = strtolower($userData['last_name']);
            $workEmail = "{$firstName}.{$lastName}@rocketpartners.ph";
            
            // Check if email exists, add number if needed
            $counter = 1;
            while (User::where('email', $workEmail)->exists()) {
                $workEmail = "{$firstName}.{$lastName}{$counter}@rocketpartners.ph";
                $counter++;
            }
            
            $userData['email'] = $workEmail;
            $userData['work_email'] = $workEmail;
            
            // Create user account
            $user = User::create($userData);
            
            // ✅ Assign role based on position from invite
            $role = \App\Models\Role::where('slug', $invite->position)->first();
            if ($role) {
                $user->roles()->attach($role->id);
            }
            
            $invite->update([
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by' => auth()->id(),
                'converted_user_id' => $user->id,
            ]);
            
            $invite->submission->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'reviewed_by' => auth()->id(),
            ]);
            
            // TODO: Send welcome email with work email and temp password
            
            DB::commit();
            
            return $user;
            
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    public function getStatistics()
    {
        return [
            'total' => OnboardingInvite::count(),
            'pending' => OnboardingInvite::pending()->count(),
            'in_progress' => OnboardingInvite::inProgress()->count(),
            'submitted' => OnboardingInvite::submitted()->count(),
            'approved' => OnboardingInvite::approved()->count(),
            'expired' => OnboardingInvite::expired()->count(),
        ];
    }
}