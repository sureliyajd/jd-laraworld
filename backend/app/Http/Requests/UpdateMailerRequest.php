<?php

namespace App\Http\Requests;

use App\Services\MailerService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMailerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled by middleware
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $supportedProviders = array_keys(MailerService::getSupportedProviders());
        $provider = $this->input('provider');
        
        // If provider is not in request but credentials are, get it from the existing mailer
        if (!$provider && $this->has('credentials')) {
            $mailerId = $this->route('id');
            if ($mailerId) {
                $mailer = \App\Models\Mailer::find($mailerId);
                if ($mailer) {
                    $provider = $mailer->provider;
                }
            }
        }

        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'provider' => ['sometimes', 'required', 'string', Rule::in($supportedProviders)],
            'from_address' => 'nullable|email|max:255',
            'from_name' => 'nullable|string|max:255',
            'credentials' => 'sometimes|required|array',
            'is_active' => 'nullable|boolean',
        ];

        // Add provider-specific credential validation
        if ($provider && $this->has('credentials')) {
            $providerFields = MailerService::getSupportedProviders()[$provider]['fields'] ?? [];
            
            foreach ($providerFields as $field => $config) {
                $fieldRule = $config['required'] ? 'required' : 'nullable';
                
                if ($config['type'] === 'integer') {
                    $fieldRule .= '|integer';
                } elseif ($config['type'] === 'string') {
                    $fieldRule .= '|string';
                }
                
                if (isset($config['options'])) {
                    // Filter out null values for validation
                    $options = array_filter($config['options'], fn($v) => $v !== null);
                    if (!empty($options)) {
                        $fieldRule .= '|in:' . implode(',', $options);
                    }
                    // If null is in options, field should be nullable
                    if (in_array(null, $config['options'])) {
                        $fieldRule = str_replace('required', 'nullable', $fieldRule);
                    }
                }
                
                $rules["credentials.{$field}"] = $fieldRule;
            }
        }

        return $rules;
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'provider.in' => 'The selected provider is not supported.',
            'credentials.required' => 'Credentials are required for the selected provider.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Clean credentials - remove null, empty string values, and undefined keys
        if ($this->has('credentials') && is_array($this->credentials)) {
            $cleanedCredentials = [];
            foreach ($this->credentials as $key => $value) {
                // Only include non-empty values (but allow null if explicitly set)
                if ($value !== '' && $value !== 'null') {
                    // Convert string 'null' to actual null for encryption field
                    if ($value === 'null') {
                        $cleanedCredentials[$key] = null;
                    } else {
                        $cleanedCredentials[$key] = $value;
                    }
                }
            }
            $this->merge(['credentials' => $cleanedCredentials]);
        }
    }
}
