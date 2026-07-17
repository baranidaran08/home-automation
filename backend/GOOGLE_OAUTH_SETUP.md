# Google OAuth 2.0 — Setup & Flow Guide

Google Sign-In as an **alternative** authentication method for **pre-invited**
users of Xen Automation. Users are never self-created; Google only authenticates
accounts the System Administrator already created. After Google verifies the
user, the backend always issues **its own JWT** — the Google ID token is used
only during verification.

---

## 1. Google Cloud Console configuration

1. Go to <https://console.cloud.google.com/> → create (or pick) a project.
2. **APIs & Services → OAuth consent screen**
   - User type: **Internal** (if a Google Workspace org) or **External**.
   - Fill app name, support email, developer email. Save.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**.
   - **Authorized JavaScript origins** — add every origin the login page is served from:
     - `http://localhost:3000` (local dev)
     - `https://xen-automation.vercel.app` (production frontend)
   - **Authorized redirect URIs** — not required for the ID-token button flow, but
     harmless to add the same origins.
   - Create → copy the **Client ID** (looks like `xxxx…apps.googleusercontent.com`).

> A client **secret** is created too, but we do **not** use it — ID-token
> verification only needs the client ID. Never put the secret in the frontend.

---

## 2. Environment variables

**Backend** (Vercel backend project → Settings → Environment Variables):

```
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

**Frontend** (Vercel frontend project):

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

Both **must be the exact same value** — the backend verifies the token's
`audience` against its `GOOGLE_CLIENT_ID`, and the frontend requests the token
for that same client id.

Notes:
- `NEXT_PUBLIC_*` is inlined at **build time** → redeploy the frontend after setting it.
- If `GOOGLE_CLIENT_ID` is unset on the backend, the `/auth/google` endpoint
  returns 503; if `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is unset on the frontend, the
  Google button (and its "OR" divider) simply don't render — email/password
  login is unaffected.

For local `.env` files:

```
# backend/.env
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com

# frontend/.env.local
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

---

## 3. npm packages (already installed)

| Side | Package | Purpose |
|------|---------|---------|
| Backend | `google-auth-library` | Verify the Google ID token (signature, expiry, audience, issuer) |
| Frontend | `@react-oauth/google` | `GoogleOAuthProvider` + official `GoogleLogin` button |

---

## 4. Data model (`authMethod` — the permanent one-time choice)

`User` gained three fields:

| Field | Type | Meaning |
|-------|------|---------|
| `authMethod` | `'LOCAL' \| 'GOOGLE' \| null` | The locked sign-in method. `null` = invited, not yet activated. |
| `googleId` | `String` (sparse, `select:false`) | Google subject (`sub`), set on Google activation. |
| `accountActivated` | `Boolean` | True once the user completes activation via either method. |

A new invitee starts with `authMethod: null`. The **first successful sign-in
locks the method forever**:
- Logs in with the temp password → forced password change → `authMethod = 'LOCAL'`.
- Signs in with Google (email must match) → `authMethod = 'GOOGLE'`, temp password
  scrambled.

**Migration:** on startup, `backfillAuthMethod` sets every *already-activated*
legacy user (`mustChangePassword === false`) to `LOCAL` so the Google flow can
never hijack an existing password account. Users still holding a temp password
are left `null` — they get the new choice.

---

## 5. End-to-end flow

### Invitation
Admin creates a user → invitation email presents **two options**: Option 1
(email + temp password) and Option 2 (Continue with Google), plus the notice
that the choice is permanent. Both buttons open `/login`.

### Email & Password path
1. User logs in at `/login` with email + temp password → `POST /auth/login`.
2. Backend: rejects if `authMethod === 'GOOGLE'`; otherwise verifies password.
3. `mustChangePassword` is true → forced to `/change-password`.
4. On change: `authMethod = 'LOCAL'`, `accountActivated = true`, JWT issued, → dashboard.
5. Future logins: password only. Google is refused with *"This account uses Email
   & Password authentication."*

### Google path
1. User clicks **Continue with Google** on `/login` → Google returns an **ID token**.
2. Frontend sends it: `POST /auth/google  { idToken }`.
3. Backend verifies the ID token (`google-auth-library`): signature, expiry,
   audience, issuer, plus `email_verified`.
4. Finds the user by the verified email. **No match → 401** *"This Google account
   does not match the invited email address."* (never creates a user).
5. Rejects if `authMethod === 'LOCAL'`.
6. First time (`authMethod === null`): store `googleId`, set `authMethod = 'GOOGLE'`,
   `accountActivated = true`, scramble the temp password.
7. Issues the app's **own JWT** (httpOnly cookie), → dashboard.
8. Future logins: Google only. Password is refused with *"This account is linked
   with Google Sign-In."*

---

## 6. Security properties

- **No self-registration** — Google authenticates only pre-invited emails; a
  non-matching Google account is rejected, never created.
- **Backend-verified tokens** — the ID token is verified server-side with Google's
  library; the frontend is never trusted.
- **App JWT only** — the Google token is discarded after verification; all app
  authorization uses the existing JWT/RBAC.
- **No Google passwords stored**; the temp password is scrambled on Google activation.
- **Permanent method lock** — enforced in the backend on every login, both directions.
- **No hijack of legacy accounts** — the startup migration locks pre-existing
  activated users to LOCAL.

---

## 7. New / changed files

**Backend**
- `src/utils/google.js` — ID-token verification (new)
- `src/seeders/auth-method.migration.js` — legacy backfill (new)
- `src/models/user.model.js` — `authMethod`, `googleId`, `accountActivated`
- `src/services/auth.service.js` — `loginWithGoogle`, login guard, LOCAL lock on change-password
- `src/controllers/auth.controller.js` — `googleLogin`
- `src/routes/auth.routes.js` — `POST /auth/google`
- `src/validations/auth.validation.js` — `googleLoginSchema`
- `src/utils/rbac.js` — serialize `authMethod` / `accountActivated`
- `src/services/email.service.js` — two-option invitation email
- `src/seeders/bootstrap.js` — run the migration
- `src/constants/messages.js`, `src/config/env.js` — messages + `google.clientId`

**Frontend**
- `src/features/auth/components/google-sign-in-button.tsx` — official Google button (new)
- `src/providers/index.tsx` — `GoogleOAuthProvider`
- `src/features/auth/components/login-form.tsx` — divider + Google button, shared post-auth path
- `src/features/auth/hooks/use-auth.ts` — `googleLogin`
- `src/services/auth.service.ts`, `src/types/auth.ts`, `src/constants/env.ts`

---

## 8. Quick test checklist

- [ ] Set both env vars, redeploy both projects.
- [ ] Invite a new user → email shows both options.
- [ ] **Google activation:** click Continue with Google with the invited email →
      lands on dashboard; DB shows `authMethod: 'GOOGLE'`, `googleId` set.
- [ ] That user's password login now fails with the "linked with Google" message.
- [ ] **Local activation:** a different invitee logs in with temp password →
      change-password → dashboard; DB shows `authMethod: 'LOCAL'`.
- [ ] That user's Google sign-in now fails with the "uses Email & Password" message.
- [ ] A Google account whose email is NOT invited → rejected, no user created.
- [ ] Existing admin/root still logs in with password (backfilled to LOCAL).
