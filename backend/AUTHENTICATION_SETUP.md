# Backend Authentication Setup

This document provides a complete guide for setting up the Laravel backend authentication system to work with the frontend OAuth2 PKCE implementation.

## Quick Setup

Run the following command to automatically set up authentication:

```bash
php artisan auth:setup
```

This will:
- Install Laravel Passport if not already installed
- Create an OAuth2 PKCE client for the frontend
- Display the credentials needed for frontend configuration

## Manual Setup

If you prefer to set up manually or need to troubleshoot:

### 1. Install Laravel Passport

```bash
php artisan passport:install
```

### 2. Create OAuth2 Client

```bash
php artisan passport:client --public
```

When prompted:
- Name: `Lara World Frontend`
- Redirect URI: `http://localhost:5173/auth/callback`

### 3. Update Frontend Configuration

Update your frontend `src/config/auth.ts` with the credentials from the client creation:

```typescript
export const AUTH_CONFIG = {
  API_BASE_URL: 'http://localhost:8000/api',
  CLIENT_ID: 'your-client-id-here',
  CLIENT_SECRET: 'your-client-secret-here',
  REDIRECT_URI: 'http://localhost:5173/auth/callback',
  // ... other settings
};
```

## Available API Endpoints

### Public Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Protected Endpoints (require Bearer token)

- `GET /api/me` - Get authenticated user data
- `POST /api/logout` - Logout user (revoke token)
- `POST /api/refresh` - Refresh access token
- `GET /api/user` - Legacy endpoint for user data

## Request/Response Examples

### Register User

**Request:**
```bash
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000000Z",
    "updated_at": "2024-01-01T00:00:00.000000Z"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer"
}
```

### Login User

**Request:**
```bash
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
  "token_type": "Bearer"
}
```

### Get User Data

**Request:**
```bash
GET /api/me
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00.000000Z",
  "updated_at": "2024-01-01T00:00:00.000000Z"
}
```

## Demo User

A demo user is created by the seeder with the following credentials:
- Email: `demo@laraworld.test`
- Password: `password`

To create the demo user, run:
```bash
php artisan db:seed --class=DemoUserSeeder
```

## CORS Configuration

The backend is configured to allow requests from the frontend. The CORS configuration in `config/cors.php` includes:
- `oauth/*` paths for OAuth endpoints
- Support for credentials
- Allowed origins for development

## Token Management

- Access tokens expire in 15 days
- Refresh tokens expire in 30 days
- Personal access tokens expire in 6 months

## Testing the Setup

1. Start the backend server:
   ```bash
   php artisan serve
   ```

2. Test the endpoints using curl or Postman:
   ```bash
   # Test registration
   curl -X POST http://localhost:8000/api/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","password_confirmation":"password123"}'
   
   # Test login
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

3. Use the returned access token for authenticated requests:
   ```bash
   curl -X GET http://localhost:8000/api/me \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `config/cors.php` includes `oauth/*` in paths
2. **Token Errors**: Check that Laravel Passport is properly installed
3. **Client Errors**: Verify OAuth client credentials match frontend config
4. **Database Issues**: Run migrations and seeders

### Debug Commands

```bash
# Check OAuth clients
php artisan tinker
>>> DB::table('oauth_clients')->get();

# Check if Passport is installed
php artisan passport:status

# Reinstall Passport (if needed)
php artisan passport:install --force
```

## Security Notes

- Never expose client secrets in frontend code
- Use HTTPS in production
- Implement rate limiting for authentication endpoints
- Regularly rotate OAuth client secrets
- Monitor authentication logs for suspicious activity
