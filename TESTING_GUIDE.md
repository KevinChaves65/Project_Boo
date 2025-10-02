# Multi-User Testing Guide

## Testing Two Accounts on Same Machine

### Method 1: URL Session Parameters (Recommended for Development)

You can now test multiple accounts simultaneously using URL session parameters:

**User 1:**
- URL: `http://localhost:3000/login`
- Login normally

**User 2:**  
- URL: `http://localhost:3000/login?session=user2`
- Login with different account

**User 3:**
- URL: `http://localhost:3000/login?session=user3`
- And so on...

Each session parameter creates a separate localStorage namespace, allowing multiple logins on the same browser.

### Method 2: Browser Profiles
1. **Chrome:** Create separate profiles (Profile menu → Add)
2. **Edge:** Similar profile creation
3. Each profile maintains separate localStorage

### Method 3: Different Browsers
- Chrome for User 1
- Firefox for User 2  
- Edge for User 3

### Method 4: Incognito/Private Mode
- Regular window: User 1
- Incognito window: User 2

## Example Test Scenarios

### Testing Couple Linking:
1. Open two browser tabs:
   - Tab 1: `http://localhost:3000/login`
   - Tab 2: `http://localhost:3000/login?session=partner`

2. Create two test accounts:
   - User1: username "alice"
   - User2: username "bob"

3. Login to both accounts in their respective tabs
4. Use LinkPartner feature to connect accounts
5. Test couple functionality (shared date ideas, milestones, etc.)

### Testing Chat/Messaging:
1. Login as User1 in regular tab
2. Login as User2 in `?session=partner` tab  
3. Send messages between accounts
4. Verify real-time updates

## Development Notes

- Session mode is enabled via `DEV_MODE = true` in `apiService.js`
- Set `DEV_MODE = false` for production
- Session parameter persists across page navigation
- Each session maintains separate authentication tokens