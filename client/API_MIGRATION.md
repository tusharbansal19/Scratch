# API Migration to Railway Backend

## Summary
Successfully migrated the client application from using native `fetch` API to **Axios** with a centralized API configuration pointing to the Railway backend.

## Changes Made

### 1. **Installed Axios**
```bash
npm install axios
```

### 2. **Created Centralized API Configuration**
**File:** `src/lib/api.ts`

- Created an Axios instance with base URL: `https://scratch-production-e94b.up.railway.app`
- Added request interceptor to automatically attach auth tokens from localStorage
- Added response interceptor for global error handling (401 redirects to login)
- Exported `API_BASE_URL` for use in WebSocket connections

### 3. **Updated All API Calls**

#### **Login.tsx**
- Replaced `fetch` calls with `api.post()` and `api.get()`
- Improved error handling to extract error details from response
- Cleaner code with automatic JSON parsing

#### **Register.tsx**
- Replaced `fetch` calls with Axios methods
- Simplified error handling
- Automatic request/response transformation

#### **Home.tsx**
- Updated board creation to use `api.post('/api/boards')`
- Cleaner error handling

#### **Canvas.tsx**
- Added import for `API_BASE_URL`
- Updated WebSocket URL to dynamically use Railway backend
- Converts HTTPS URL to WSS for WebSocket connections

#### **useKeepAlive.ts**
- Updated to import and use `API_BASE_URL` from centralized config
- Ensures keep-alive pings target the Railway backend

## Benefits

1. **Centralized Configuration**: Single source of truth for API URL
2. **Automatic Token Management**: Request interceptor handles auth tokens automatically
3. **Better Error Handling**: Response interceptor provides global error handling
4. **Cleaner Code**: Axios provides cleaner syntax than fetch
5. **Type Safety**: Better TypeScript support
6. **Easy Updates**: Change backend URL in one place (`src/lib/api.ts`)

## Backend URL
- **Production:** `https://scratch-production-e94b.up.railway.app`
- **WebSocket:** `wss://scratch-production-e94b.up.railway.app/api/ws/{boardId}`

## Testing
✅ Build completed successfully
✅ All API endpoints updated
✅ WebSocket connection updated
✅ No remaining references to old URL

## Next Steps
1. Test authentication flow (login/register)
2. Test board creation
3. Test real-time collaboration features
4. Verify WebSocket connections work properly
