<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $allowedDomains = ['rocketpartners.ph', 'rocketpartners.io'];
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                'unique:'.User::class,
                function ($attribute, $value, $fail) use ($allowedDomains) {
                    // Extract domain
                    $emailParts = explode('@', strtolower($value));
                    
                    // Must have exactly 2 parts
                    if (count($emailParts) !== 2) {
                        $fail('Invalid email format.');
                        return;
                    }
                    
                    $domain = $emailParts[1];
                    
                    // Check exact domain match
                    if (!in_array($domain, $allowedDomains)) {
                        $fail('Only @rocketpartners.ph or @rocketpartners.io email addresses are allowed.');
                    }
                },
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $nameParts = explode(' ', trim($request->name), 2);
        $firstName = $nameParts[0];
        $lastName = $nameParts[1] ?? '';

        $user = User::create([
            'name' => $request->name,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $request->email,
            'work_email' => $request->email,
            'password' => Hash::make($request->password),
            'employment_status' => 'active',
            'account_status' => 'pending', // ✅ NEW: Start as pending
        ]);

        event(new Registered($user)); // This sends verification email

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
