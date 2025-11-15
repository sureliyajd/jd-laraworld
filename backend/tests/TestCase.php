<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Setup the test environment.
     * 
     * This includes a safety check to ensure tests are running
     * against the test database, not your production/development database.
     */
    protected function setUp(): void
    {
        parent::setUp();

        // Safety check: Ensure we're using the test database
        $this->ensureTestDatabaseIsolation();
    }

    /**
     * Verify that tests are using the test database configuration.
     * 
     * This prevents accidental execution of tests against
     * production or development databases.
     */
    protected function ensureTestDatabaseIsolation(): void
    {
        $connection = config('database.default');
        $database = config("database.connections.{$connection}.database");

        // Check if we're using SQLite (test database)
        if ($connection !== 'sqlite') {
            throw new \RuntimeException(
                "SAFETY CHECK FAILED: Tests are configured to use '{$connection}' instead of 'sqlite'. " .
                "This could harm your database! Check phpunit.xml configuration."
            );
        }

        // Check if we're using in-memory database or a test database file
        if ($database !== ':memory:' && !str_contains($database, 'testing')) {
            throw new \RuntimeException(
                "SAFETY CHECK FAILED: Tests are using database '{$database}' which doesn't appear to be a test database. " .
                "Expected ':memory:' or a database file containing 'testing' in the name. " .
                "This could harm your database! Check phpunit.xml configuration."
            );
        }

        // Verify APP_ENV is set to testing
        if (config('app.env') !== 'testing') {
            throw new \RuntimeException(
                "SAFETY CHECK FAILED: APP_ENV is set to '" . config('app.env') . "' instead of 'testing'. " .
                "This could harm your database! Check phpunit.xml configuration."
            );
        }
    }
}
