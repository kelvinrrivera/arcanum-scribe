# API Documentation

Comprehensive API reference for Arcanum Scribe adventure generation system.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your-secure-password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "your-secure-password",
  "username": "username"
}
```

## Adventure Generation

#### POST /generate-adventure
Generate a complete TTRPG adventure.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "prompt": "Create a mysterious dungeon adventure",
  "gameSystem": "dnd5e",
  "privacy": "public",
  "playerLevel": "3-5",
  "partySize": "4",
  "duration": "medium",
  "tone": "mystery",
  "setting": "dungeon",
  "themes": ["Mystery", "Exploration"],
  "professionalMode": { "enabled": true }
}
```

**Response:**
```json
{
  "id": "adventure-uuid",
  "title": "The Cursed Depths",
  "gameSystem": "dnd5e",
  "summary": "A mysterious adventure...",
  "acts": [...],
  "encounters": [...],
  "npcs": [...],
  "monsters": [...],
  "magicItems": [...],
  "imageUrls": ["https://..."],
  "imageCost": 0.06,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### POST /generate-prompt
Generate an optimized prompt for adventure creation.

**Request:**
```json
{
  "contextPrompt": "Create a prompt for a naval adventure"
}
```

**Response:**
```json
{
  "prompt": "For 3-5th level characters, a maritime mystery...",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## User Management

#### GET /user/tier-info
Get current user's tier and usage information.

**Response:**
```json
{
  "tier": {
    "name": "explorer",
    "displayName": "Explorer",
    "generationsPerMonth": 10,
    "privateAdventuresPerMonth": 2
  },
  "usage": {
    "generationsUsed": 3,
    "generationsRemaining": 7,
    "privateAdventuresUsed": 0,
    "privateAdventuresRemaining": 2
  }
}
```

#### GET /user/magic-credits-info
Get magic credits balance and tier details.

**Response:**
```json
{
  "userId": "uuid",
  "tier": {
    "name": "explorer",
    "displayName": "Explorer",
    "magicCreditsPerMonth": 50,
    "additionalCreditPrice": 0.10
  },
  "credits": {
    "magicCredits": 50,
    "creditsUsed": 12,
    "creditsRemaining": 38,
    "canCreatePrivate": true
  }
}
```

## Gallery System

#### GET /gallery/public
Get public adventures with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 12)
- `search` (string): Search term
- `sortBy` (string): Sort by 'newest', 'popular', 'rating', 'downloads'

**Response:**
```json
{
  "adventures": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNextPage": true
  }
}
```

#### GET /gallery/adventure/:id
Get specific adventure details.

**Response:**
```json
{
  "id": "uuid",
  "title": "Adventure Title",
  "content": { ... },
  "rating": 4.5,
  "downloads": 123,
  "createdAt": "2025-01-01T00:00:00Z"
}
```

## Export System

#### GET /export/pdf/:id
Export adventure as professional PDF.

**Response:** Binary PDF file

#### GET /export/json/:id
Export adventure as JSON.

**Response:**
```json
{
  "format": "json",
  "data": { ... },
  "filename": "adventure_title.json"
}
```

## Admin Endpoints

#### GET /admin/models
Get all LLM models and providers (admin only).

#### POST /admin/models/:id/toggle
Toggle model active status (admin only).

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions/credits)
- `404` - Not Found
- `429` - Rate Limited
- `500` - Internal Server Error

## Rate Limits

- **Adventure Generation**: 1 request per minute per user
- **General API**: 100 requests per 15 minutes per IP
- **Admin Endpoints**: 50 requests per minute per admin

## Webhooks

#### POST /webhooks/stripe
Handle Stripe payment events for subscription management.

---

For more detailed examples and integration guides, see the [Developer Guide](./DEVELOPER_GUIDE.md).