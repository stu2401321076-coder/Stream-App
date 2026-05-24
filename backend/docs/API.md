# StreamFlix API

REST API for the StreamFlix backend — a Netflix-like streaming service built with Express, MongoDB, and JWT authentication.

The full machine-readable specification lives in [openapi.yaml](openapi.yaml). This document is the human-readable view of the same surface.

> **Base URL (local dev):** `http://localhost:3000/api`
> All routes below are relative to this base URL.

---

## Contents

- [Authentication](#authentication)
- [Errors](#errors)
- [Pagination](#pagination)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Movies](#movies)
  - [Reviews](#reviews)
- [Data models](#data-models)

---

## Authentication

Every endpoint except `POST /auth/register` and `POST /auth/login` requires a JWT in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs…
```

Tokens are issued by login/register and valid for **24 hours**.

### Video streaming uses a different scheme

The `GET /movies/{id}/stream` endpoint can't read an `Authorization` header — it has to work as a plain `<video src>` URL. Instead it accepts a **short-lived stream token** (1-hour TTL) via the query string:

```
GET /api/movies/65f3…/stream?token=<short-lived-jwt>
```

Mint the short-lived token from `GET /movies/{id}/stream-token`.

### Roles

| Role    | Can…                                                     |
|---------|----------------------------------------------------------|
| `user`  | Read everything, create/update/delete own reviews        |
| `admin` | Everything `user` can, plus create/update/delete movies and delete users |

---

## Errors

All non-2xx responses follow [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html):

```json
{
  "type": "https://httpstatuses.com/404",
  "title": "Not Found",
  "status": 404,
  "detail": "Movie not found",
  "instance": "/api/movies/65f3a1d2c8e7b9001fae12d4"
}
```

Validation errors include an extra `errors` array:

```json
{
  "type": "https://httpstatuses.com/400",
  "title": "Validation Error",
  "status": 400,
  "detail": "Database validation failed",
  "instance": "/api/auth/register",
  "errors": [
    { "field": "email", "message": "Must be a valid email address" }
  ]
}
```

### Common status codes

| Status | Meaning                                              |
|--------|------------------------------------------------------|
| `400`  | Validation error or malformed input                  |
| `401`  | Missing, malformed, or expired token                 |
| `403`  | Authenticated but role insufficient (e.g. not admin) |
| `404`  | Resource doesn't exist                               |
| `409`  | Conflict (e.g. duplicate email)                      |
| `416`  | Stream range not satisfiable                         |
| `500`  | Unexpected server error                              |

---

## Pagination

List endpoints return:

```json
{
  "data":  [ … ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

Common query parameters:

| Param    | Type     | Default     | Notes                              |
|----------|----------|-------------|------------------------------------|
| `page`   | int ≥ 1  | `1`         |                                    |
| `limit`  | 1–100    | `10`        |                                    |
| `sortBy` | string   | `createdAt` | Allowed values vary per endpoint   |
| `order`  | enum     | `desc`      | `asc` or `desc`                    |

---

## Endpoints

### Auth

#### `POST /auth/register` — Create an account
Public. Returns a JWT and the new user profile.

**Body**
```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "supersecret",
  "birthDate": "1815-12-10"
}
```
Optional: `role` (`user` | `admin`), `walletBalance`, `isActive`.

**Response — `201`**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs…",
  "user": {
    "id": "65f3…",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "role": "user",
    "walletBalance": 0,
    "isActive": true
  }
}
```
Errors: `400` validation, `409` email already exists.

---

#### `POST /auth/login`
Public.

**Body**
```json
{ "email": "ada@example.com", "password": "supersecret" }
```

**Response — `200`** — same shape as `register`.
Errors: `400` validation, `401` bad credentials.

---

#### `GET /auth/me`
Returns the [User](#user) for the bearer token.

---

### Users

| Method   | Path           | Auth      | Notes                                |
|----------|----------------|-----------|--------------------------------------|
| `GET`    | `/users`       | user      | Paginated; filter by `email`, `isActive` |
| `GET`    | `/users/{id}`  | user      |                                      |
| `PUT`    | `/users/{id}`  | user      | Only `birthDate`, `walletBalance`, `isActive` are mutable |
| `DELETE` | `/users/{id}`  | **admin** |                                      |

**`GET /users` example**
```http
GET /api/users?page=1&limit=20&email=ada&isActive=true
```

**`PUT /users/{id}` body**
```json
{ "walletBalance": 5.00, "isActive": true }
```

---

### Movies

| Method   | Path                          | Auth      | Notes                                       |
|----------|-------------------------------|-----------|---------------------------------------------|
| `GET`    | `/movies`                     | user      | Paginated; filter by `title`, `minRating`   |
| `GET`    | `/movies/{id}`                | user      |                                             |
| `POST`   | `/movies`                     | **admin** | `multipart/form-data` (poster + video)      |
| `PUT`    | `/movies/{id}`                | **admin** | `multipart/form-data`, all fields optional  |
| `DELETE` | `/movies/{id}`                | **admin** | Removes video + poster files from disk      |
| `GET`    | `/movies/{id}/stream-token`   | user      | Mints a 1-hour stream JWT                   |
| `GET`    | `/movies/{id}/stream?token=…` | **token** | Range-aware video stream                    |

**`GET /movies` example**
```http
GET /api/movies?page=1&limit=18&sortBy=averageRating&order=desc&minRating=7
```

**`POST /movies` — multipart fields**

| Field             | Type     | Required | Max length |
|-------------------|----------|----------|-----------|
| `title`           | text     | yes      | 150       |
| `description`     | text     | yes      | 1000      |
| `releaseDate`     | date     | no       |           |
| `averageRating`   | number   | no       | 0–10      |
| `durationMinutes` | integer  | no       | ≥ 0       |
| `poster`          | file     | no       | image/*   |
| `video`           | file     | no       | video/mp4 |

**Streaming flow**
```text
1.  client → GET /movies/{id}/stream-token       (Bearer token)
       ← { "token": "…", "expiresIn": "1h" }

2.  <video src="/api/movies/{id}/stream?token=…">
       supports HTTP Range headers — 206 Partial Content on resume/seek
```

---

### Reviews

| Method   | Path                | Auth | Notes                                    |
|----------|---------------------|------|------------------------------------------|
| `GET`    | `/reviews`          | user | Paginated; filter by `movieId`, `userId` |
| `GET`    | `/reviews/{id}`     | user |                                          |
| `POST`   | `/reviews`          | user | `userId` is set from the JWT             |
| `PUT`    | `/reviews/{id}`     | user |                                          |
| `DELETE` | `/reviews/{id}`     | user |                                          |

**`POST /reviews` body**
```json
{
  "movieId": "65f3a1d2c8e7b9001fae12d4",
  "comment": "Loved the pacing.",
  "rating": 9,
  "isSpoiler": false
}
```

**Read endpoints populate references:**
```json
{
  "_id": "65f3…",
  "userId":  { "_id": "65a2…", "email": "ada@example.com" },
  "movieId": { "_id": "65f3…", "title": "The Matrix" },
  "comment": "Loved the pacing.",
  "rating": 9,
  "isSpoiler": false,
  "createdAt": "2026-05-24T12:00:00Z"
}
```

---

## Data models

### User

| Field           | Type     | Notes                       |
|-----------------|----------|-----------------------------|
| `_id`           | ObjectId |                             |
| `name`          | string   | ≤ 150 chars                 |
| `email`         | string   | unique, ≤ 100 chars         |
| `role`          | enum     | `user` \| `admin`           |
| `birthDate`     | datetime | optional                    |
| `walletBalance` | number   | ≥ 0, default `0`            |
| `isActive`      | boolean  | default `true`              |
| `createdAt`     | datetime |                             |
| `updatedAt`     | datetime |                             |

`passwordHash` is never returned.

### Movie

| Field             | Type     | Notes                          |
|-------------------|----------|--------------------------------|
| `_id`             | ObjectId |                                |
| `title`           | string   | ≤ 150 chars                    |
| `description`     | string   | ≤ 1000 chars                   |
| `releaseDate`     | datetime | optional                       |
| `averageRating`   | number   | 0–10, default `0`              |
| `durationMinutes` | integer  | ≥ 0, optional                  |
| `videoFilePath`   | string   | server-side path, nullable     |
| `posterImage`     | string   | served under `/uploads/...`    |
| `createdAt`       | datetime |                                |
| `updatedAt`       | datetime |                                |

### Review

| Field       | Type     | Notes                                                 |
|-------------|----------|-------------------------------------------------------|
| `_id`       | ObjectId |                                                       |
| `userId`    | ref User | populated as `{ _id, email }` on reads                |
| `movieId`   | ref Movie| populated as `{ _id, title }` on reads                |
| `comment`   | string   | ≤ 500 chars                                           |
| `rating`    | number   | 0–10                                                  |
| `isSpoiler` | boolean  | default `false`                                       |
| `createdAt` | datetime |                                                       |

---

## Quick start — `curl` recipe

```bash
# 1. Register
curl -s -X POST http://localhost:3000/api/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"supersecret"}' \
  | jq -r .token > token.txt

# 2. List movies
curl -s http://localhost:3000/api/movies \
  -H "authorization: Bearer $(cat token.txt)"

# 3. Watch a movie (admin needed to upload one first)
MOVIE_ID=65f3a1d2c8e7b9001fae12d4
STREAM=$(curl -s "http://localhost:3000/api/movies/$MOVIE_ID/stream-token" \
            -H "authorization: Bearer $(cat token.txt)" | jq -r .token)
curl -I "http://localhost:3000/api/movies/$MOVIE_ID/stream?token=$STREAM" \
     -H 'range: bytes=0-1048575'
```

---

## Viewing the OpenAPI spec

The spec at [openapi.yaml](openapi.yaml) can be rendered with any standard tool:

```bash
# Static HTML via Redoc
npx @redocly/cli build-docs openapi.yaml -o api.html
open api.html

# Or serve Swagger UI locally on http://localhost:8080
npx swagger-ui-watcher openapi.yaml
```
