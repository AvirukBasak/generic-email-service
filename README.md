# Email API Documentation

## Endpoint
```
POST /api/v1/email
```

## Description
Send emails with support for multiple recipients, CC, BCC, attachments, and custom SMTP configuration.

## Content Type
```
multipart/form-data
```

---

## Request Parameters

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `to` | string (multiple) | Recipient email address(es). Add multiple times for multiple recipients. |
| `from` | string | Sender email address |
| `subject` | string | Email subject line |
| `emailHost` | string | SMTP server hostname (e.g., `smtp.gmail.com`) |
| `emailUser` | string | SMTP authentication username |
| `emailPassword` | string | SMTP authentication password |

### Body Fields
| Field | Type | Description |
|-------|------|-------------|
| `body` | string | Email content (HTML or plain text) |
| `isHtml` | string/boolean | Set to `"true"` for HTML body, `"false"` for plain text body. Required only if `body` is provided. |
| `html` | string | Use instead of `body` and `isHtml`. Email content as HTML only. |
| `text` | string | Use instead of `body` and `isHtml`. Email content as plain text only. |

#### Email Content Options

You have three ways to specify your email content:

**Option 1: Using `body` and `isHtml`**
- Provide `body` with your email content
- Set `isHtml` to `"true"` for HTML emails or `"false"` for plain text
- Both fields are required when using this approach

**Option 2: Using `html` and/or `text` directly**
- Use `html` for HTML content only
- Use `text` for plain text content only  
- You can provide both together to send a multi-part email (recommended for better compatibility)

**Option 3: Combining both approaches**
- Provide explicit `html` and/or `text` fields for precise control
- Optionally include `body` and `isHtml` as fallback values
- Explicit fields always take precedence over the `body` fallback

**Note:** At least one content field (`body`, `html`, or `text`) must be provided.

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `cc` | string (multiple) | `[]` | CC email address(es). Add multiple times for multiple CCs. |
| `bcc` | string (multiple) | `[]` | BCC email address(es). Add multiple times for multiple BCCs. |
| `emailPort` | string | `"587"` | SMTP server port (use `"465"` for SSL, `"587"` for TLS) |
| `file` | File (multiple) | `[]` | File attachment(s). Add multiple times for multiple attachments. |

---

## JavaScript/TypeScript Fetch Example

```typescript
import fs from "fs";
import path from "path";
import { lookup } from 'mime-types';

export async function sendEmail(filePath) {
  const formData = new FormData();

  // Recipients
  formData.append("to", "alice@example.com");
  formData.append("to", "bob@example.com");

  // Email details
  formData.append("from", "Joh Doe <johndoe@example.com>");
  formData.append("subject", "Hello World");
  formData.append("html", "<h1>Hello World</h1><p>This is a hello world email.</p>");

  // SMTP credentials
  formData.append("emailHost", "[HOST]");
  formData.append("emailPort", "[POST]");
  formData.append("emailUser", "[EMAIL_USER]");
  formData.append("emailPassword", "[EMAIL_PASSWORD]");

  // Attachments - read files from disk
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const mimeType = lookup(filePath) || 'application/octet-stream';
  const blob = new Blob([fileBuffer], { type: mimeType });
  formData.append("file", blob, fileName);

  return fetch("https://generic-email-service.vercel.app/api/v1/email", {
    method: "POST",
    body: formData,
  });
}
```

---

## cURL Example

```bash
curl -X POST https://generic-email-service.vercel.app/api/v1/email \
  -F "to=alice@example.com" \
  -F "to=bob@example.com" \
  -F "from=Joh Doe <johndoe@example.com>" \
  -F "subject=Hello World" \
  -F "html=<h1>Hello World</h1><p>This is a hello world email.</p>" \
  -F "emailHost=[HOST]" \
  -F "emailPort=[POST]" \
  -F "emailUser=[EMAIL_USER]" \
  -F "emailPassword=[EMAIL_PASSWORD]" \
  -F "file=@/path/to/your/file"
```

---

## Response Format

The following are a few examples.

### Success Response (200 OK)
```json
{
  "message": "Email sent successfully",
  "messageId": "<unique-message-id@smtp-server>"
}
```

### Error Response (400 Bad Request)
```json
{
  "status": 400,
  "message": "Missing 'from' field"
}
```

### Error Response (500 Internal Server Error)
```json
{
  "status": 500,
  "message": "Failed to send email"
}
```

---

## Common SMTP Configurations

### Gmail
```
emailHost: smtp.gmail.com
emailPort: 587
emailUser: your-email@gmail.com
emailPassword: your-app-password (not regular password!)
```
**Note:** Enable 2FA and generate an App Password from Google Account settings.

### Outlook/Office 365
```
emailHost: smtp.office365.com
emailPort: 587
emailUser: your-email@outlook.com
emailPassword: your-password
```

### Yahoo Mail
```
emailHost: smtp.mail.yahoo.com
emailPort: 587
emailUser: your-email@yahoo.com
emailPassword: your-app-password
```

### Custom SMTP Server
```
emailHost: mail.yourdomain.com
emailPort: 587 (or 465 for SSL)
emailUser: your-username
emailPassword: your-password
```

---

## Important Notes

1. **App Passwords**: For Gmail and other providers with 2FA, use app-specific passwords instead of your regular password.

2. **Multiple Values**: To add multiple recipients, CC, BCC, or files, add the same field name multiple times:
   ```java
   body.add("to", "email1@example.com");
   body.add("to", "email2@example.com");
   body.add("to", "email3@example.com");
   ```

3. **HTML vs Plain Text**: Set `isHtml` to `"true"` for HTML emails, `"false"` for plain text.

4. **Port Selection**:
   - Port `587`: TLS/STARTTLS (recommended)
   - Port `465`: SSL (older, but still supported)
   - Port `25`: Usually blocked by ISPs

5. **File Attachments**: All common file types are supported. Multiple attachments can be added by using the `file` field multiple times.

6. **Security**: Since this API accepts SMTP credentials, ensure:
   - The API endpoint is served over HTTPS
   - Credentials are not logged or stored
   - Consider implementing authentication/authorization on the API endpoint itself

---

## Error Handling

The API will return appropriate HTTP status codes:

- `200`: Email sent successfully
- `400`: Bad request (missing required fields, invalid data)
- `500`: Server error (SMTP connection failed, file upload issues)

Always check the response status and handle errors appropriately in your applicati

---

# Generic Email Service - Documentation

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
