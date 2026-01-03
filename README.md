# MemeBoard Server - Documentation

- _Error Handling_: All error responses have an HTTP status code and a JSON body `{ message: string }`, which should be displayed directly to the user.
- _Pagination_: Endpoints supporting query-based listing (e.g., `readListOnQuery`) expect query parameters like `perPageLimit`, `currentPage`, `sortOn`, and `sortOrder`.
- _Image Retrieval_: `readImage` endpoints return a single image via HTTP as `image/*`.

---

## Environment Vars

### General

- **`ENVIRONMENT_TYPE`**
  - Environment the app is running in (e.g., `dev`, `devnoemu`).
  - _Default value:_ `dev`

### Server Origins

- **`API_SERVER_ORIGIN`**

  - The base URL of the backend API server.
  - _Format:_ `http(s)://ipaddr:port`

- **`WEB_SERVER_ORIGIN`**
  - The base URL of the frontend web server.
  - _Format:_ `http(s)://ipaddr:port`

### CORS Configuration

- **`ALLOWED_ORIGINS`**

  - List of explicitly allowed origins for CORS requests.
  - _Default value:_ `[]`

- **`ALLOW_ANY_ORIGIN`**
  - If set to `true`, allows requests from any origin (overrides `ALLOWED_ORIGINS`).
  - _Default value:_ `false`

- **`ALLOW_MISSING_ORIGIN`**
  - If set to `true`, allows requests without an `Origin` header (overrides `ALLOW_ANY_ORIGIN`).
  - _Default value:_ `true`

### Dev Mode Default User

- **`ALLOW_DEVMODE_DEFAULT_USER`**

  - Enables login with a built-in default user for development.
  - When `true`, allows authentication without Firebase using default credentials.
  - Automatically disabled in non-development environments.
  - _Default value:_ `false`

- **`DEVMODE_DEFAULT_USER_ID`**

  - The user ID to assign when using the default user.
  - Only effective if `ALLOW_DEVMODE_DEFAULT_USER` is `true` and the app is running in a development environment.
  - _Default value:_ `DevmodeDefaultUser`

### Firebase

- **`FIREBASE_PROJECT_ID`**

  - Firebase project identifier.
  - _Default value:_ `projectid`

- **`FIREBASE_SERVICE_ACCOUNT_KEY`**

  - Service account key for Firebase admin SDK (JSON string).
  - _Default value:_ _(empty string — expected to be set)_

- **`CUSTOM_FIRESTORE_INDEX_ADMIN_SERVICE_ACCOUNT_KEY`**

  - Optional service account key for Firestore index management.
  - _Default value:_ _(empty string — expected to be set)_

- **`FIREBASE_DATABASE_URL`**

  - Firebase Realtime Database URL.
  - _Default value:_ `https://projectid-default-rtdb.asia-southeast1.firebasedatabase.app`

- **`FIREBASE_STORAGE_BUCKET`**
  - Firebase storage bucket for file uploads.
  - _Default value:_ `projectid.firebasestorage.app`

### Firebase Emulators

- **`FIREBASE_EMULATOR_DATABASE_URL`**

  - Local emulator endpoint for Firebase Realtime Database.
  - _Default value:_ `http://localhost:9002/?ns=projectid`

- **`FIREBASE_EMULATOR_STORAGE_BUCKET`**

  - Local emulator bucket name for Firebase Storage.
  - _Default value:_ `projectid.firebasestorage.app`

- **`FIREBASE_STORAGE_EMULATOR_HOST`**

  - Host and port for Firebase Storage emulator.
  - Don't set this in production environment, else server won't connect to Firebase.
  - _Default value:_ `localhost:9003`

- **`FIRESTORE_EMULATOR_HOST`**
  - Host and port for Firebase Firestore emulator.
  - Don't set this in production environment, else server won't connect to Firebase.
  - _Default value:_ `localhost:9004`

### Redis

- **`REDIS_URL`**
  - Connection URL for Redis (maybe used for caching).
  - _Format:_ `redis://user:password@host:port`
  - _Example Value:_ `redis://default:passwd@redis-xxx.com:xxxxx`

---

## Error Codes

- 400 `{ message: "Bad request" }`
- 401 `{ message: "Invalid auth credentials" }`
- 403 `{ message: "Forbidden" }`
- 405 `{ message: "Method not allowed" }`
- 429 `{ message: "Too many requests. Try again after some time" }`
- 500 `{ message: "Internal server error" }`

---

## Rate Limits (per min)

| Has Type | Action  | Rate |
| -------- | ------- | ---- |
| Image    | Read    | 120  |
| Image    | Upload  | 10   |
| Params   | Read    | 60   |
| Params   | Update  | 20   |
| Params   | Search  | 60   |
| Any      | Create  | 5    |
| Any      | Delete  | 5    |
| Logging  | Logging | 60   |

Where:

- Has Type refers to one of the several types of data a single request has.
  For e.g. A request can have both images and params, but images have lower rates, the rate limiter will take the lower rate.
- Action refers to the kind of response
- Rate refers to number of that request allowed in a minute
