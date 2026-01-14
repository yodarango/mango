# Reward Asset Fix

## Problem
The `rewardAsset` was showing as `null` in the RewardModal because:

1. **Frontend** was fetching from `/api/store` and filtering for `status === "reward"`
2. **Backend** `getStoreItems()` was only querying for `status = 'store'`
3. **Result**: No assets with `status = 'reward'` were being returned

## Solution

### Backend Changes (main.go)

#### 1. Added `Status` field to `StoreItem` struct
```go
type StoreItem struct {
    ID             int    `json:"id"`
    Status         string `json:"status"`  // NEW FIELD
    Type           string `json:"type"`
    // ... rest of fields
}
```

#### 2. Updated `getStoreItems()` query
**Before:**
```sql
WHERE status = 'store' AND avatar_id IS NULL
GROUP BY name
ORDER BY name
```

**After:**
```sql
WHERE (status = 'store' OR status = 'reward') AND avatar_id IS NULL
GROUP BY name, status
ORDER BY status DESC, cost ASC
```

**Changes:**
- Now includes both `'store'` AND `'reward'` status assets
- Added `status` to SELECT clause
- Added `status` to GROUP BY (so same asset name can have different statuses)
- Changed ORDER BY to prioritize 'reward' status (DESC) and then by cost (ASC)
- Updated Scan to include `&item.Status`

### Frontend Changes (AvatarProfile.jsx)

Added debug logging to help troubleshoot:
```javascript
console.log("Store data:", storeData);
console.log("Filtered reward assets:", rewardAssets);
```

## How It Works Now

1. **Backend** returns all assets where:
   - `status = 'store'` OR `status = 'reward'`
   - `avatar_id IS NULL` (not owned by anyone)
   - Grouped by name and status
   - Ordered by status DESC (reward first), then cost ASC

2. **Frontend** filters the response:
   - `filter(item => item.status === "reward")`
   - Sorts by cost ASC
   - Takes the first one (cheapest reward asset)

3. **RewardModal** displays:
   - The reward asset image and name
   - XP range based on milestone
   - Coin range based on milestone

## Database Requirements

For this to work, you need assets in the database with:
- `status = 'reward'`
- `avatar_id IS NULL` (not owned)

**Example SQL to create a reward asset:**
```sql
INSERT INTO assets (
    name, status, type, thumbnail, 
    attack, defense, healing, power, endurance,
    level, required_level, cost, ability, health, stamina
) VALUES (
    'Golden Dragon', 'reward', 'warrior', '/assets/warriors/golden_dragon.png',
    85, 80, 75, 90, 85,
    10, 1, 0, 'Legendary Flame', 100, 100
);
```

## Testing

1. Create at least one asset with `status = 'reward'` in the database
2. Restart the Go server
3. Load an avatar profile with unclaimed streak rewards
4. The RewardModal should now show the reward asset image and name
5. Check console logs to verify the asset is being fetched

## Notes

- Reward assets should have `cost = 0` since they're won, not purchased
- The query orders by cost ASC, so the cheapest reward asset is shown
- If multiple reward assets exist, only the first (cheapest) is used
- The same asset name can exist as both 'store' and 'reward' status

