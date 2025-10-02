<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization will be handled in the controller/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'status' => 'nullable|in:pending,in_progress,completed,cancelled',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'due_date' => 'nullable|date|after:now',
            'estimated_hours' => 'nullable|integer|min:0|max:1000',
            'actual_hours' => 'nullable|integer|min:0|max:1000',
            'category_id' => 'nullable|exists:categories,id',
            'assigned_to' => 'nullable|exists:users,id',
            'parent_task_id' => 'nullable|exists:tasks,id',
            'metadata' => 'nullable|array',
            'metadata.*' => 'nullable|string|max:1000',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'The task title is required.',
            'title.max' => 'The task title may not be greater than 255 characters.',
            'description.max' => 'The task description may not be greater than 5000 characters.',
            'status.in' => 'The status must be one of: pending, in_progress, completed, cancelled.',
            'priority.in' => 'The priority must be one of: low, medium, high, urgent.',
            'due_date.date' => 'The due date must be a valid date.',
            'due_date.after' => 'The due date must be in the future.',
            'estimated_hours.integer' => 'The estimated hours must be a number.',
            'estimated_hours.min' => 'The estimated hours must be at least 0.',
            'estimated_hours.max' => 'The estimated hours may not be greater than 1000.',
            'actual_hours.integer' => 'The actual hours must be a number.',
            'actual_hours.min' => 'The actual hours must be at least 0.',
            'actual_hours.max' => 'The actual hours may not be greater than 1000.',
            'category_id.exists' => 'The selected category does not exist.',
            'assigned_to.exists' => 'The selected user does not exist.',
            'parent_task_id.exists' => 'The selected parent task does not exist.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Set default values
        $this->merge([
            'status' => $this->status ?? 'pending',
            'priority' => $this->priority ?? 'medium',
        ]);

        // If due_date is provided as string, convert to Carbon
        if ($this->has('due_date') && is_string($this->due_date)) {
            $this->merge([
                'due_date' => \Carbon\Carbon::parse($this->due_date),
            ]);
        }
    }
}