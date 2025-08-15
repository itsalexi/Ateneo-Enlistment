# API Documentation

This document describes the available API endpoints for the Ateneo Enlistment system.

## Semester Information

### GET /api/semester

Returns the current semester information including the period, semester string, and last updated timestamp.

**Response Format:**

```json
{
  "success": true,
  "data": {
    "period": "2025-0",
    "semesterString": "Intersession 2025-2026",
    "lastUpdated": 1753632727456
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Semester information not found"
}
```

**Status Codes:**

- `200` - Success
- `404` - Semester information not found
- `500` - Server error

**Notes:**

- The `period` field contains the AISIS period format (e.g., "2025-0" for Intersession, "2025-1" for First Semester, "2025-2" for Second Semester)
- The `semesterString` field contains the human-readable semester name
- The `lastUpdated` field contains the timestamp when the semester information was last updated

## Schedule Management

### GET /api/schedule

Retrieves schedule data using a prefill token.

**Query Parameters:**

- `token` (required) - The prefill token to retrieve schedule data

**Response Format:**

```json
{
  "success": true,
  "data": {
    "courses": [...]
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Invalid token"
}
```

## Course Data

### GET /api/offerings

Returns course offerings data.

### GET /api/programs

Returns program information.

### GET /api/calculator

Returns calculator-related data.
