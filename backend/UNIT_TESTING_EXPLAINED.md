# Unit Testing in Laravel - Complete Implementation Guide

## Table of Contents
1. [Introduction to Unit Testing](#introduction-to-unit-testing)
2. [Laravel Testing Architecture](#laravel-testing-architecture)
3. [Project Test Configuration](#project-test-configuration)
4. [Understanding the Test Lifecycle](#understanding-the-test-lifecycle)
5. [Key Components Explained](#key-components-explained)
6. [Writing Tests - Step by Step](#writing-tests---step-by-step)
7. [Real Examples from This Project](#real-examples-from-this-project)
8. [Testing Patterns and Best Practices](#testing-patterns-and-best-practices)
9. [How Database Isolation Works](#how-database-isolation-works)
10. [Common Testing Scenarios](#common-testing-scenarios)

---

## Introduction to Unit Testing

### What is Unit Testing?

**Unit testing** is a software testing method where individual units (functions, methods, classes) of code are tested in isolation to verify they work as expected. In Laravel, we primarily test:

- **Models**: Database interactions, relationships, scopes, accessors, mutators
- **Services**: Business logic, calculations, transformations
- **Controllers**: Request handling, responses (usually with Feature tests)
- **Helpers**: Utility functions and helper methods

### Why Unit Testing?

1. **Catch Bugs Early**: Find issues before they reach production
2. **Documentation**: Tests serve as living documentation of how code should work
3. **Refactoring Confidence**: Change code safely knowing tests will catch regressions
4. **Design Quality**: Writing tests often reveals design flaws
5. **Regression Prevention**: Ensure new changes don't break existing functionality

### Unit vs Feature Tests

- **Unit Tests**: Test individual components in isolation (models, services, helpers)
- **Feature Tests**: Test complete user workflows (HTTP requests, API endpoints)

This guide focuses on **Unit Tests** for models and services.

---

## Laravel Testing Architecture

### Test Structure

```
backend/
├── tests/
│   ├── TestCase.php          # Base test class
│   ├── Unit/                 # Unit tests
│   │   ├── TaskModelTest.php
│   │   ├── UserModelTest.php
│   │   └── ...
│   └── Feature/              # Feature tests
├── phpunit.xml               # Test configuration
└── database/
    └── factories/            # Model factories
        ├── TaskFactory.php
        ├── UserFactory.php
        └── ...
```

### Test Execution Flow

```
1. PHPUnit reads phpunit.xml
   ↓
2. Sets environment variables (APP_ENV=testing, DB_CONNECTION=sqlite)
   ↓
3. Loads TestCase.php (base class)
   ↓
4. For each test:
   a. setUp() runs (creates test environment)
   b. Test method executes
   c. tearDown() runs (cleans up)
   ↓
5. Results are reported
```

---

## Project Test Configuration

### 1. PHPUnit Configuration (`phpunit.xml`)

This file configures how tests run:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true">
```

**Key Sections:**

#### Test Suites
```xml
<testsuites>
    <testsuite name="Unit">
        <directory>tests/Unit</directory>
    </testsuite>
    <testsuite name="Feature">
        <directory>tests/Feature</directory>
    </testsuite>
</testsuites>
```
- Organizes tests into groups
- Run with: `php artisan test --testsuite=Unit`

#### Environment Variables
```xml
<php>
    <env name="APP_ENV" value="testing"/>
    <env name="DB_CONNECTION" value="sqlite"/>
    <env name="DB_DATABASE" value=":memory:"/>
    <env name="CACHE_STORE" value="array"/>
    <env name="QUEUE_CONNECTION" value="sync"/>
    <env name="MAIL_MAILER" value="array"/>
</php>
```

**What Each Variable Does:**

| Variable | Value | Purpose |
|----------|-------|---------|
| `APP_ENV` | `testing` | Sets Laravel to testing mode |
| `DB_CONNECTION` | `sqlite` | Uses SQLite for tests (faster, simpler) |
| `DB_DATABASE` | `:memory:` | In-memory database (no files, auto-destroyed) |
| `CACHE_STORE` | `array` | In-memory cache (no Redis/file cache) |
| `QUEUE_CONNECTION` | `sync` | Jobs run immediately (no queue worker needed) |
| `MAIL_MAILER` | `array` | Emails stored in memory (not actually sent) |

**Why `:memory:`?**
- Database exists only in RAM
- Automatically destroyed when tests finish
- No file I/O (faster)
- Complete isolation from your real database

---

## Understanding the Test Lifecycle

### Test Execution Sequence

When you run `php artisan test`, here's what happens:

#### 1. **PHPUnit Initialization**
```php
// PHPUnit reads phpunit.xml
// Sets environment variables
// Loads Laravel application
```

#### 2. **TestCase Setup (Before Each Test)**
```php
// tests/TestCase.php
protected function setUp(): void
{
    parent::setUp();  // Laravel's base setup
    
    // Our custom safety check
    $this->ensureTestDatabaseIsolation();
}
```

**What `parent::setUp()` does:**
- Boots Laravel application
- Sets up service container
- Configures database connection
- Prepares test environment

#### 3. **RefreshDatabase Trait (If Used)**
```php
use Illuminate\Foundation\Testing\RefreshDatabase;

class TaskModelTest extends TestCase
{
    use RefreshDatabase;
}
```

**What `RefreshDatabase` does:**

**First Test:**
1. Checks if test database exists
2. If not, runs all migrations to create schema
3. Wraps test in database transaction
4. Test runs (can create/modify data)
5. Transaction rolls back (all changes undone)

**Subsequent Tests:**
1. Wraps test in database transaction
2. Test runs
3. Transaction rolls back

**Why Transactions?**
- Each test starts with a clean database
- Changes are automatically undone
- Tests don't affect each other
- Fast cleanup (no need to delete records)

#### 4. **Test Method Execution**
```php
/** @test */
public function it_can_create_a_task()
{
    // Your test code here
    $task = Task::create([...]);
    $this->assertDatabaseHas('tasks', [...]);
}
```

#### 5. **Cleanup (After Each Test)**
```php
protected function tearDown(): void
{
    // Transaction rollback (if RefreshDatabase used)
    // Clean up any resources
    parent::tearDown();
}
```

---

## Key Components Explained

### 1. Base TestCase Class

**Location:** `tests/TestCase.php`

```php
abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->ensureTestDatabaseIsolation();
    }
    
    protected function ensureTestDatabaseIsolation(): void
    {
        // Safety checks to prevent using production database
    }
}
```

**Purpose:**
- Base class for all tests
- Provides common setup/teardown
- Safety checks to prevent database accidents
- Can add shared helper methods

**Why Abstract?**
- Can't be instantiated directly
- Must be extended by actual test classes
- Ensures all tests inherit safety checks

### 2. RefreshDatabase Trait

**What it does:**
- Runs migrations before first test
- Wraps each test in a transaction
- Rolls back after each test
- Ensures clean state

**How it works internally:**

```php
// Simplified version of what RefreshDatabase does

// Before first test:
if (!Schema::hasTable('tasks')) {
    Artisan::call('migrate');
}

// Before each test:
DB::beginTransaction();

// After each test:
DB::rollBack();
```

**Benefits:**
- ✅ Fast (transactions are quick)
- ✅ Isolated (each test is independent)
- ✅ Clean (no leftover data)
- ✅ Safe (can't affect real database)

### 3. Model Factories

**Location:** `database/factories/`

**Purpose:** Generate fake data for testing

**Example: TaskFactory**

```php
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'status' => fake()->randomElement(['pending', 'in_progress', 'completed']),
            'priority' => fake()->randomElement(['low', 'medium', 'high', 'urgent']),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'category_id' => Category::factory(),
            'created_by' => User::factory(),
        ];
    }
}
```

**How to Use:**

```php
// Create a task with default factory values
$task = Task::factory()->create();

// Override specific attributes
$task = Task::factory()->create([
    'title' => 'Custom Title',
    'status' => 'completed',
]);

// Create multiple
$tasks = Task::factory()->count(5)->create();

// Create but don't save to database
$task = Task::factory()->make();
```

**Factory Relationships:**
```php
'category_id' => Category::factory(),  // Creates a category automatically
'created_by' => User::factory(),       // Creates a user automatically
```

**Why Factories?**
- Consistent test data
- Easy to create related models
- Realistic fake data
- Less boilerplate code

---

## Writing Tests - Step by Step

### Step 1: Create Test File

```php
// tests/Unit/TaskModelTest.php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TaskModelTest extends TestCase
{
    use RefreshDatabase;
}
```

**Key Points:**
- Extends `TestCase` (gets all setup/teardown)
- Uses `RefreshDatabase` (for database tests)
- Namespace matches directory structure

### Step 2: Write Test Method

**Naming Convention:**
- Method name describes what it tests
- Use `/** @test */` annotation or prefix with `test_`

```php
/** @test */
public function it_can_create_a_task()
{
    // Arrange: Set up test data
    $user = User::factory()->create();
    $category = Category::factory()->create();

    // Act: Perform the action being tested
    $task = Task::create([
        'title' => 'Test Task',
        'description' => 'Test Description',
        'status' => 'pending',
        'priority' => 'medium',
        'due_date' => now()->addDays(7),
        'category_id' => $category->id,
        'created_by' => $user->id,
    ]);

    // Assert: Verify the result
    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'title' => 'Test Task',
        'status' => 'pending',
    ]);
}
```

**AAA Pattern:**
- **Arrange**: Set up test data
- **Act**: Execute the code being tested
- **Assert**: Verify the results

### Step 3: Common Assertions

```php
// Database assertions
$this->assertDatabaseHas('tasks', ['title' => 'Test']);
$this->assertDatabaseMissing('tasks', ['title' => 'Deleted']);
$this->assertDatabaseCount('tasks', 5);

// Model assertions
$this->assertEquals('expected', $task->title);
$this->assertNotNull($task->completed_at);
$this->assertNull($task->deleted_at);
$this->assertTrue($task->isOverdue());
$this->assertInstanceOf(User::class, $task->creator);

// Collection assertions
$this->assertCount(3, $tasks);
$this->assertTrue($tasks->contains($task));
```

---

## Real Examples from This Project

### Example 1: Testing Model Creation

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_can_create_a_task()
{
    // Arrange: Create required related models
    $user = User::factory()->create();
    $category = Category::factory()->create();

    // Act: Create the task
    $task = Task::create([
        'title' => 'Test Task',
        'description' => 'Test Description',
        'status' => 'pending',
        'priority' => 'medium',
        'due_date' => now()->addDays(7),
        'category_id' => $category->id,
        'created_by' => $user->id,
    ]);

    // Assert: Verify task was created correctly
    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'title' => 'Test Task',
        'status' => 'pending',
    ]);
}
```

**What This Tests:**
- Task model can be created
- Required fields are saved correctly
- Database record exists

### Example 2: Testing Model Events

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_sets_completed_at_when_status_changes_to_completed()
{
    // Arrange: Create a pending task
    $user = User::factory()->create();
    $task = Task::create([
        'title' => 'Test Task',
        'status' => 'pending',
        'created_by' => $user->id,
    ]);

    // Verify initial state
    $this->assertNull($task->completed_at);

    // Act: Change status to completed
    $task->update(['status' => 'completed']);

    // Assert: completed_at should be set automatically
    $this->assertNotNull($task->fresh()->completed_at);
}
```

**What This Tests:**
- Model event listeners work (in `Task::boot()`)
- `completed_at` is automatically set when status changes
- Uses `fresh()` to reload from database (important!)

**Why `fresh()`?**
- Model in memory might be stale
- `fresh()` reloads from database
- Ensures we're testing actual database state

### Example 3: Testing Relationships

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_belongs_to_a_category()
{
    // Arrange
    $user = User::factory()->create();
    $category = Category::factory()->create();

    // Act
    $task = Task::create([
        'title' => 'Test Task',
        'category_id' => $category->id,
        'created_by' => $user->id,
    ]);

    // Assert: Relationship works
    $this->assertInstanceOf(Category::class, $task->category);
    $this->assertEquals($category->id, $task->category->id);
}
```

**What This Tests:**
- `belongsTo` relationship is configured correctly
- Foreign key works
- Relationship method returns correct model

### Example 4: Testing Scopes

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_can_filter_by_status()
{
    // Arrange: Create tasks with different statuses
    $user = User::factory()->create();
    Task::create(['title' => 'Pending Task', 'status' => 'pending', 'created_by' => $user->id]);
    Task::create(['title' => 'Completed Task', 'status' => 'completed', 'created_by' => $user->id]);
    Task::create(['title' => 'In Progress Task', 'status' => 'in_progress', 'created_by' => $user->id]);

    // Act: Use scope to filter
    $pendingTasks = Task::byStatus('pending')->get();

    // Assert: Only pending tasks returned
    $this->assertCount(1, $pendingTasks);
    $this->assertEquals('Pending Task', $pendingTasks->first()->title);
}
```

**What This Tests:**
- Query scope `byStatus()` works correctly
- Filters tasks by status
- Returns correct results

### Example 5: Testing Accessors (Computed Properties)

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_returns_correct_priority_color()
{
    // Arrange: Create tasks with different priorities
    $user = User::factory()->create();
    $lowTask = Task::create(['title' => 'Low', 'priority' => 'low', 'created_by' => $user->id]);
    $mediumTask = Task::create(['title' => 'Medium', 'priority' => 'medium', 'created_by' => $user->id]);
    $highTask = Task::create(['title' => 'High', 'priority' => 'high', 'created_by' => $user->id]);
    $urgentTask = Task::create(['title' => 'Urgent', 'priority' => 'urgent', 'created_by' => $user->id]);

    // Assert: Accessor returns correct color
    $this->assertEquals('green', $lowTask->priority_color);
    $this->assertEquals('yellow', $mediumTask->priority_color);
    $this->assertEquals('orange', $highTask->priority_color);
    $this->assertEquals('red', $urgentTask->priority_color);
}
```

**What This Tests:**
- Accessor method `getPriorityColorAttribute()` works
- Returns correct color for each priority level
- Accessor is accessed as property: `$task->priority_color`

**How Accessors Work:**
```php
// In Task model:
public function getPriorityColorAttribute(): string
{
    return match ($this->priority) {
        'low' => 'green',
        'medium' => 'yellow',
        'high' => 'orange',
        'urgent' => 'red',
        default => 'gray',
    };
}

// Usage:
$task->priority_color;  // Calls getPriorityColorAttribute()
```

### Example 6: Testing Complex Logic

**From:** `tests/Unit/TaskModelTest.php`

```php
/** @test */
public function it_calculates_progress_percentage_based_on_subtasks()
{
    // Arrange: Create parent task with subtasks
    $user = User::factory()->create();
    $parentTask = Task::create([
        'title' => 'Parent',
        'status' => 'in_progress',
        'created_by' => $user->id,
    ]);

    // No subtasks - should return 0 for in_progress
    $this->assertEquals(0, $parentTask->progress_percentage);

    // Create subtasks
    Task::create([
        'title' => 'Subtask 1',
        'status' => 'completed',
        'parent_task_id' => $parentTask->id,
        'created_by' => $user->id,
    ]);
    Task::create([
        'title' => 'Subtask 2',
        'status' => 'pending',
        'parent_task_id' => $parentTask->id,
        'created_by' => $user->id,
    ]);

    // Refresh to reload relationships
    $parentTask->refresh();
    
    // Assert: 50% complete (1 of 2 subtasks)
    $this->assertEquals(50, $parentTask->progress_percentage);
}
```

**What This Tests:**
- Complex calculation logic
- Relationship loading (subtasks)
- Edge case (no subtasks)
- Progress calculation formula

**Key Points:**
- `refresh()` reloads model and relationships
- Tests both edge case and normal case
- Verifies calculation accuracy

---

## Testing Patterns and Best Practices

### 1. Test Naming

**Good:**
```php
public function it_can_create_a_task()
public function it_sets_completed_at_when_status_changes_to_completed()
public function it_returns_correct_priority_color()
```

**Bad:**
```php
public function test1()
public function testTask()
public function testSomething()
```

**Why?**
- Descriptive names explain what's being tested
- Readable test output
- Self-documenting code

### 2. One Assertion Per Test (Sometimes)

**Good:**
```php
/** @test */
public function it_sets_completed_at_when_status_changes_to_completed()
{
    // ... setup ...
    $task->update(['status' => 'completed']);
    $this->assertNotNull($task->fresh()->completed_at);
}
```

**Also Good (Related Assertions):**
```php
/** @test */
public function it_returns_correct_priority_color()
{
    // Multiple assertions testing the same concept
    $this->assertEquals('green', $lowTask->priority_color);
    $this->assertEquals('yellow', $mediumTask->priority_color);
    $this->assertEquals('orange', $highTask->priority_color);
}
```

**Rule of Thumb:**
- One concept per test
- Multiple assertions OK if testing same concept
- Separate tests for different behaviors

### 3. Use Factories, Not Raw Data

**Good:**
```php
$user = User::factory()->create();
$task = Task::factory()->create(['status' => 'completed']);
```

**Bad:**
```php
$user = User::create([
    'name' => 'John Doe',
    'email' => 'john@example.com',
    'password' => Hash::make('password'),
    // ... many more fields
]);
```

**Why?**
- Less code
- Consistent data
- Easy to maintain
- Handles relationships automatically

### 4. Test Edge Cases

```php
// Test with no subtasks
$this->assertEquals(0, $parentTask->progress_percentage);

// Test with null values
$this->assertNull($task->completed_at);

// Test with empty collections
$this->assertCount(0, $user->tasks);
```

### 5. Keep Tests Independent

**Good:**
```php
// Each test creates its own data
public function test1() {
    $task = Task::factory()->create();
    // ...
}

public function test2() {
    $task = Task::factory()->create();  // Fresh data
    // ...
}
```

**Bad:**
```php
// Tests depend on each other
public function test1() {
    $this->task = Task::factory()->create();
}

public function test2() {
    $this->task->update([...]);  // Depends on test1
}
```

**Why?**
- Tests can run in any order
- One test failure doesn't cascade
- Easier to debug

### 6. Use Descriptive Assertions

**Good:**
```php
$this->assertDatabaseHas('tasks', ['status' => 'completed']);
$this->assertInstanceOf(User::class, $task->creator);
$this->assertCount(3, $tasks);
```

**Bad:**
```php
$this->assertTrue($task->status === 'completed');
$this->assertTrue($task->creator instanceof User);
```

**Why?**
- Better error messages
- More readable
- Clearer intent

---

## How Database Isolation Works

### The Complete Picture

```
┌─────────────────────────────────────────────────────────┐
│                    Your Development DB                   │
│  (MySQL/PostgreSQL/SQLite - database.sqlite)            │
│  Contains: Real application data                        │
└─────────────────────────────────────────────────────────┘
                        ↑
                        │ NEVER TOUCHED
                        │
┌─────────────────────────────────────────────────────────┐
│                  Test Execution                          │
│                                                          │
│  1. phpunit.xml sets:                                    │
│     - DB_CONNECTION=sqlite                               │
│     - DB_DATABASE=:memory:                              │
│                                                          │
│  2. TestCase::setUp() runs safety check                 │
│     - Verifies using SQLite                             │
│     - Verifies using :memory: or testing database       │
│     - Throws error if wrong database                    │
│                                                          │
│  3. RefreshDatabase trait:                               │
│     - Runs migrations (creates schema)                   │
│     - Wraps test in transaction                         │
│                                                          │
│  4. Test runs:                                           │
│     - Creates/modifies data in :memory: database       │
│     - All changes are in transaction                    │
│                                                          │
│  5. After test:                                          │
│     - Transaction rolls back                             │
│     - All data disappears                                │
│     - :memory: database is destroyed                    │
└─────────────────────────────────────────────────────────┘
```

### Why This is Safe

1. **Different Database Connection**
   - Tests use `sqlite` connection
   - Development uses your configured connection (MySQL/PostgreSQL/etc.)
   - Completely separate

2. **In-Memory Database**
   - `:memory:` exists only in RAM
   - Destroyed when process ends
   - No file system access

3. **Transaction Wrapping**
   - Each test wrapped in transaction
   - Rollback undoes all changes
   - Even if test fails, data is cleaned up

4. **Safety Checks**
   - `TestCase` verifies correct database
   - Throws error if misconfigured
   - Prevents accidents

### What Happens Step by Step

**When you run `php artisan test`:**

1. **PHPUnit starts**
   ```php
   // Reads phpunit.xml
   // Sets environment variables
   APP_ENV=testing
   DB_CONNECTION=sqlite
   DB_DATABASE=:memory:
   ```

2. **Laravel boots**
   ```php
   // Connects to :memory: SQLite database
   // NOT your development database
   ```

3. **TestCase::setUp() runs**
   ```php
   // Safety check verifies:
   // - Using sqlite connection ✓
   // - Using :memory: database ✓
   // - APP_ENV is testing ✓
   ```

4. **RefreshDatabase runs (first test)**
   ```php
   // Checks: Does :memory: database have tables?
   // No → Run migrations
   // Creates all tables in :memory:
   ```

5. **Test starts**
   ```php
   DB::beginTransaction();  // Start transaction
   
   // Your test code runs
   $task = Task::create([...]);
   
   // Data exists in :memory: database
   // Inside transaction
   ```

6. **Test ends**
   ```php
   DB::rollBack();  // Undo all changes
   // All data removed from :memory:
   ```

7. **Next test**
   ```php
   // Fresh :memory: database
   // No data from previous test
   // Transaction wraps this test
   ```

8. **All tests complete**
   ```php
   // :memory: database destroyed
   // Process ends
   // No trace left
   ```

---

## Common Testing Scenarios

### Scenario 1: Testing Model Creation

```php
/** @test */
public function it_can_create_a_task()
{
    $user = User::factory()->create();
    $category = Category::factory()->create();

    $task = Task::create([
        'title' => 'Test Task',
        'category_id' => $category->id,
        'created_by' => $user->id,
    ]);

    $this->assertDatabaseHas('tasks', [
        'id' => $task->id,
        'title' => 'Test Task',
    ]);
}
```

### Scenario 2: Testing Model Updates

```php
/** @test */
public function it_can_update_a_task()
{
    $user = User::factory()->create();
    $task = Task::factory()->create(['created_by' => $user->id]);

    $task->update(['status' => 'completed']);

    $this->assertEquals('completed', $task->fresh()->status);
}
```

### Scenario 3: Testing Model Deletion

```php
/** @test */
public function it_can_delete_a_task()
{
    $user = User::factory()->create();
    $task = Task::factory()->create(['created_by' => $user->id]);

    $task->delete();

    $this->assertSoftDeleted('tasks', ['id' => $task->id]);
}
```

### Scenario 4: Testing Relationships

```php
/** @test */
public function task_belongs_to_user()
{
    $user = User::factory()->create();
    $task = Task::factory()->create(['created_by' => $user->id]);

    $this->assertInstanceOf(User::class, $task->creator);
    $this->assertEquals($user->id, $task->creator->id);
}
```

### Scenario 5: Testing Scopes

```php
/** @test */
public function it_can_filter_overdue_tasks()
{
    $user = User::factory()->create();
    
    Task::factory()->create([
        'due_date' => now()->subDays(5),
        'status' => 'pending',
        'created_by' => $user->id,
    ]);
    
    Task::factory()->create([
        'due_date' => now()->addDays(5),
        'status' => 'pending',
        'created_by' => $user->id,
    ]);

    $overdue = Task::overdue()->get();
    
    $this->assertCount(1, $overdue);
}
```

### Scenario 6: Testing Accessors

```php
/** @test */
public function it_returns_correct_priority_color()
{
    $user = User::factory()->create();
    $task = Task::factory()->create([
        'priority' => 'high',
        'created_by' => $user->id,
    ]);

    $this->assertEquals('orange', $task->priority_color);
}
```

### Scenario 7: Testing Model Events

```php
/** @test */
public function it_sets_completed_at_on_status_change()
{
    $user = User::factory()->create();
    $task = Task::factory()->create([
        'status' => 'pending',
        'created_by' => $user->id,
    ]);

    $task->update(['status' => 'completed']);

    $this->assertNotNull($task->fresh()->completed_at);
}
```

### Scenario 8: Testing Complex Calculations

```php
/** @test */
public function it_calculates_progress_from_subtasks()
{
    $user = User::factory()->create();
    $parent = Task::factory()->create(['created_by' => $user->id]);
    
    Task::factory()->create([
        'parent_task_id' => $parent->id,
        'status' => 'completed',
        'created_by' => $user->id,
    ]);
    
    Task::factory()->create([
        'parent_task_id' => $parent->id,
        'status' => 'pending',
        'created_by' => $user->id,
    ]);

    $parent->refresh();
    
    $this->assertEquals(50, $parent->progress_percentage);
}
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Unit

# Run specific test file
php artisan test tests/Unit/TaskModelTest.php

# Run specific test method
php artisan test --filter it_can_create_a_task

# Run with coverage
php artisan test --coverage
```

### Understanding Test Output

```
PASS  Tests\Unit\TaskModelTest
  ✓ it can create a task                                   0.48s
  ✓ it sets completed_at when status changes to completed  0.32s
  ✓ it belongs to a category                                0.28s

Tests:    3 passed (15 assertions)
Duration: 1.08s
```

**What it means:**
- ✓ = Test passed
- Duration = How long test took
- Assertions = Number of checks performed

---

## Summary

1. **Tests are isolated**: Use `:memory:` SQLite database
2. **RefreshDatabase**: Wraps tests in transactions, auto-cleans
3. **Factories**: Generate test data easily
4. **TestCase**: Base class with safety checks
5. **Pattern**: Arrange → Act → Assert
6. **Safe**: Never touches your real database

**Key Takeaways:**
- ✅ Tests run in completely isolated environment
- ✅ Each test starts with clean database
- ✅ All changes are automatically rolled back
- ✅ Your development database is never touched
- ✅ Fast execution with in-memory database

**Next Steps:**
- Write tests for your models
- Test relationships, scopes, accessors
- Test edge cases
- Keep tests simple and focused

---

## Additional Resources

- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [PHPUnit Documentation](https://phpunit.de/documentation.html)
- [Factory Documentation](https://laravel.com/docs/eloquent-factories)

---

*This guide explains the complete unit testing implementation in this Laravel project. Use it as a reference when writing and understanding tests.*

