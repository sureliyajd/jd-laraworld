<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MailerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'provider' => $this->provider,
            'provider_name' => $this->getProviderName(),
            'is_active' => $this->is_active,
            'from_address' => $this->from_address,
            'from_name' => $this->from_name,
            'test_status' => $this->test_status,
            'test_error' => $this->test_error,
            'last_tested_at' => $this->last_tested_at?->toISOString(),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            // Don't expose credentials in the response for security
        ];
    }

    /**
     * Get provider display name.
     */
    protected function getProviderName(): string
    {
        $providers = \App\Services\MailerService::getSupportedProviders();
        return $providers[$this->provider]['name'] ?? $this->provider;
    }
}
