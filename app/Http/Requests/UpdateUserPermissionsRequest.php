<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserPermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->hasPermission('users.assign-permissions');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'grants' => ['nullable', 'array'],
            'grants.*' => ['exists:permissions,id'],
            'revokes' => ['nullable', 'array'],
            'revokes.*' => ['exists:permissions,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'grants.*.exists' => 'One or more selected permissions to grant do not exist.',
            'revokes.*.exists' => 'One or more selected permissions to revoke do not exist.',
        ];
    }
}
