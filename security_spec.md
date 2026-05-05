# Firestore Security Specification - TAHQIQ

## Data Invariants
1. **Users**: A user document must have a unique ID matching their `request.auth.uid`.
2. **Content**: Only admins can create/update/delete content. Anyone authenticated can read.
3. **Submissions**: Users can only see their own submissions. Admin can see all.
4. **Notifications**: Users can only see their own notifications.
5. **Activity**: Only admins can read activity logs. Anyone can write (to allow logging).

## The "Dirty Dozen" Payloads (Red Team Test Cases)

### 1. Identity Spoofing (User Profile)
- **Path**: `/users/attacker_id`
- **Payload**: `{ "id": "target_id", "username": "victim", "role": "admin" }`
- **Expected**: `PERMISSION_DENIED` - UID mismatch and privilege escalation.

### 2. State Shortcutting (Content)
- **Path**: `/content/new_doc`
- **Payload**: `{ "type": "article", "title_uz": "Fake", "author": "hacker" }`
- **User**: Anonymous (Non-admin)
- **Expected**: `PERMISSION_DENIED` - Only admins can write content.

### 3. Ghost Field Injection
- **Path**: `/users/my_id`
- **Payload**: `{ "name": "Me", "isVerified": true }`
- **Expected**: `PERMISSION_DENIED` - `affectedKeys().hasOnly()` blocks `isVerified`.

### 4. PII Leak (Submission)
- **Path**: `/submissions/someone_else_sub`
- **User**: Authenticated (Non-admin)
- **Operation**: `get`
- **Expected**: `PERMISSION_DENIED` - Cannot read other users' submissions.

### 5. Denial of Wallet (Large ID)
- **Path**: `/content/a_very_long_id_exceeding_128_characters_...`
- **Expected**: `PERMISSION_DENIED` - `isValidId()` check.

### 6. Timestamp Spoofing
- **Path**: `/submissions/my_sub`
- **Payload**: `{ "createdAt": "2020-01-01" }`
- **Expected**: `PERMISSION_DENIED` - Must use `request.time`.

### 7. Resource Poisoning (Massive String)
- **Path**: `/newsletter/sub`
- **Payload**: `{ "email": "a".repeat(2000) }`
- **Expected**: `PERMISSION_DENIED` - `.size()` limits.

### 8. Anonymous Admin Attempt
- **Path**: `/content/new_doc`
- **User**: Anonymous
- **Expected**: `PERMISSION_DENIED` - `isAdmin()` requires email verification.

### 9. Query Scraping (Content)
- **Path**: `/content`
- **User**: Unauthenticated
- **Operation**: `list`
- **Expected**: `PERMISSION_DENIED` - `isSignedIn()` required.

### 10. Role Escalation
- **Path**: `/users/my_id`
- **Payload**: `{ "role": "admin" }`
- **Expected**: `PERMISSION_DENIED` - `affectedKeys().hasOnly()` excludes `role`.

### 11. Orphaned Record (Content Ref)
- **Path**: `/submissions/my_sub`
- **Payload**: `{ "contentId": "non_existent_id" }`
- **Expected**: `PERMISSION_DENIED` - `exists()` check on related document.

### 12. Terminal State Write
- **Path**: `/submissions/my_sub`
- **Condition**: `status == 'completed'`
- **Payload**: `{ "note": "changing something" }`
- **Expected**: `PERMISSION_DENIED` - State locking.

## Test Runner (firestore.rules.test.ts)
`Tests implemented in Draft below.`
