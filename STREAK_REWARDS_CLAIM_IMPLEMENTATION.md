# Streak Rewards Claim Implementation

## Overview
Implemented the backend and frontend functionality to actually claim and save streak rewards to the database.

## Backend Changes (main.go)

### 1. Added `xp_bank` Field
- **Avatar Struct**: Added `XPBank int` field with JSON tag `xpBank`
- **Database Migration**: Added `xp_bank INTEGER DEFAULT 0` column to avatars table
- **Updated Queries**: 
  - `getAvatar()` now includes `COALESCE(xp_bank, 0)` in SELECT
  - `getAvatars()` now includes `COALESCE(xp_bank, 0)` in SELECT

### 2. New API Endpoint: `POST /api/streak/claim-reward`

**Request Body:**
```json
{
  "avatarId": 8,
  "milestone": 6,
  "prizeType": "coins|xp|asset",
  "prizeAmount": 180,        // for coins or xp
  "prizeAssetId": 42         // for asset
}
```

**Functionality:**
1. Verifies the avatar belongs to the authenticated user
2. Updates `last_streak_reward_claimed` to the milestone value
3. Based on `prizeType`:
   - **coins**: Adds `prizeAmount` to `avatar.coins`
   - **xp**: Adds `prizeAmount` to `avatar.xp_bank`
   - **asset**: 
     - Sets `avatar_id` to the claiming avatar
     - Changes `status` from "reward" to "warrior"
     - Sets `is_locked`, `is_locked_for`, and `is_locked_by` to NULL
4. All operations wrapped in a transaction for data integrity

**Response:**
```json
{
  "success": true,
  "message": "Reward claimed successfully"
}
```

## Frontend Changes

### 1. RewardModal.jsx
- Added `avatarId` prop
- Modified `handleClose()` to be async
- Calls `/api/streak/claim-reward` API when user claims a reward
- Sends appropriate payload based on prize type:
  - XP/Coins: includes `prizeAmount`
  - Asset: includes `prizeAssetId` (from `finalPrize.asset.id`)
- Logs success/error to console
- Still calls `onClaimReward(milestone)` callback after API call

### 2. AvatarProfile.jsx
- Fixed streak fetching bug (now uses avatar ID instead of user ID)
- Passes `avatarId={parseInt(id)}` to RewardModal
- Modified `handleRewardClaimed()`:
  - After all rewards claimed, calls `fetchAvatarData()` to refresh
  - This updates coins, xp_bank, and asset list in real-time
- Added debug logging for streak data and milestones

## Data Flow

1. User loads profile → sees notification if unclaimed milestones exist
2. User clicks "Claim Your Rewards" → first RewardModal appears
3. User clicks "Try Your Luck" → 5-second roulette animation
4. Prize is selected and displayed
5. User clicks "Claim Reward":
   - Frontend calls `POST /api/streak/claim-reward`
   - Backend updates database (coins/xp/asset + milestone)
   - Modal closes
6. If more milestones exist, next modal appears (repeat from step 3)
7. After all rewards claimed, avatar data refreshes automatically

## Database Updates Per Prize Type

### Coins Prize
```sql
UPDATE avatars 
SET last_streak_reward_claimed = ?, 
    coins = coins + ? 
WHERE id = ?
```

### XP Prize
```sql
UPDATE avatars 
SET last_streak_reward_claimed = ?, 
    xp_bank = xp_bank + ? 
WHERE id = ?
```

### Asset Prize
```sql
UPDATE avatars 
SET last_streak_reward_claimed = ? 
WHERE id = ?;

UPDATE assets 
SET avatar_id = ?, 
    status = 'warrior', 
    is_locked = NULL, 
    is_locked_for = NULL, 
    is_locked_by = NULL 
WHERE id = ?
```

## Testing

To test the full flow:
1. Ensure you have a streak >= 6 assignments
2. Set `last_streak_reward_claimed = 0` in database for your avatar
3. Load your avatar profile
4. Notification modal should appear
5. Click through reward claiming process
6. Check database to verify:
   - `last_streak_reward_claimed` updated to milestone
   - `coins` or `xp_bank` increased (if won coins/xp)
   - Asset transferred to your avatar (if won asset)
7. Refresh page - notification should not appear again

## Security
- Endpoint requires authentication (JWT token)
- Verifies avatar ownership before allowing claim
- All database operations in transaction (rollback on error)
- Prevents claiming rewards for other users' avatars

