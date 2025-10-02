<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CategoryController extends Controller
{
    use AuthorizesRequests;
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Category::query();

        // Apply filters
        if ($request->has('active_only') && $request->boolean('active_only')) {
            $query->active();
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'sort_order');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        $allowedSortFields = ['name', 'sort_order', 'created_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->ordered();
        }

        // Load task counts if requested
        if ($request->has('with_task_counts') && $request->boolean('with_task_counts')) {
            $query->withCount('tasks');
        }

        $categories = $query->get();

        return response()->json([
            'data' => CategoryResource::collection($categories),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            $category = Category::create($request->validated());

            DB::commit();

            Log::info('Category created', [
                'category_id' => $category->id,
                'user_id' => $request->user()->id,
                'name' => $category->name,
            ]);

            return response()->json([
                'message' => 'Category created successfully',
                'data' => new CategoryResource($category),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Category creation failed', [
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
                'request_data' => $request->validated(),
            ]);

            return response()->json([
                'message' => 'Failed to create category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category): JsonResponse
    {
        $category->loadCount(['tasks']);
        $category->load(['tasks' => function ($query) {
            $query->latest()->limit(10);
        }]);

        return response()->json([
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreCategoryRequest $request, Category $category): JsonResponse
    {
        try {
            DB::beginTransaction();

            $originalData = $category->toArray();
            $category->update($request->validated());

            DB::commit();

            Log::info('Category updated', [
                'category_id' => $category->id,
                'user_id' => $request->user()->id,
                'changes' => array_diff_assoc($category->toArray(), $originalData),
            ]);

            return response()->json([
                'message' => 'Category updated successfully',
                'data' => new CategoryResource($category),
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            
            Log::error('Category update failed', [
                'category_id' => $category->id,
                'user_id' => $request->user()->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to update category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category): JsonResponse
    {
        try {
            $categoryName = $category->name;
            $categoryId = $category->id;
            $userId = auth()->id();

            // Check if category has tasks
            if ($category->tasks()->count() > 0) {
                return response()->json([
                    'message' => 'Cannot delete category with existing tasks',
                ], 422);
            }

            $category->delete();

            Log::info('Category deleted', [
                'category_id' => $categoryId,
                'user_id' => $userId,
                'name' => $categoryName,
            ]);

            return response()->json([
                'message' => 'Category deleted successfully',
            ]);

        } catch (\Exception $e) {
            Log::error('Category deletion failed', [
                'category_id' => $category->id,
                'user_id' => auth()->id(),
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Failed to delete category',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}