<?php

namespace App\Mail\Onboarding;

use App\Models\OnboardingInvite;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OnboardingReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public $invite;

    /**
     * Create a new message instance.
     */
    public function __construct(OnboardingInvite $invite)
    {
        $this->invite = $invite;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reminder: Complete Your Rocket Partners Onboarding',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.onboarding.reminder',
            with: [
                'invite' => $this->invite,
                'guestUrl' => $this->invite->guest_url,
                'expiresAt' => $this->invite->expires_at,
                'firstName' => $this->invite->first_name,
                'daysRemaining' => now()->diffInDays($this->invite->expires_at),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}