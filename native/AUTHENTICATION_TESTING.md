# 🧪 Testing Backend Authentication in React Native App

## ✅ **What I've Added:**

1. **Authentication API Service** (`src/services/authAPI.ts`)
2. **Updated AppStore** with authentication state and methods
3. **AuthScreen** for login/register UI
4. **BackendTestComponent** for easy testing
5. **Updated Navigation** to show auth screen when not logged in

---

## 🚀 **How to Test the Backend Authentication:**

### **Step 1: Start the Backend Server**
```bash
cd /Users/isaacjerish/Documents/parlayparty/backend
npm install
npm run dev
```
The backend should start on `http://localhost:3001`

### **Step 2: Start the React Native App**
```bash
cd /Users/isaacjerish/Documents/parlayparty/native
npm install
npx expo start --tunnel
```

### **Step 3: Test Authentication in the App**

#### **Option A: Use the Auth Screen**
1. **Open the app** - You'll see the login/register screen
2. **Tap "Don't have an account? Sign up"** to switch to registration
3. **Fill out the form:**
   - Email: `test@example.com`
   - Username: `testuser`
   - Full Name: `Test User`
   - Password: `password123`
4. **Tap "Create Account"** - Should show success message
5. **Switch to login** and test logging in with the same credentials

#### **Option B: Use the Test Panel**
1. **Navigate to the Board tab** in the app
2. **Scroll down** to see the "Backend Test Panel"
3. **Tap "Test Register"** - Creates a new test user
4. **Tap "Test Login"** - Tests login functionality
5. **View results** in the test results section

---

## 🎯 **What You Should See:**

### **Successful Registration:**
- ✅ Success alert: "Account created successfully!"
- ✅ User profile displayed with wallet balance
- ✅ "Continue to App" button appears

### **Successful Login:**
- ✅ Success alert: "Logged in successfully!"
- ✅ App navigates to main tabs
- ✅ User data loaded (name, wallet, etc.)

### **Test Panel Results:**
- ✅ "Registration successful" message
- ✅ "Login successful" message
- ✅ Real-time status updates

---

## 🔧 **Troubleshooting:**

### **If Backend Connection Fails:**
1. **Check backend is running:** Visit `http://localhost:3001/api/health`
2. **Check network:** Make sure your phone and computer are on the same network
3. **Check CORS:** Backend is configured for `localhost:8081` and your Expo IP

### **If Authentication Fails:**
1. **Check email format:** Must be valid email
2. **Check password:** Must be at least 6 characters
3. **Check username:** Must be alphanumeric, 3-30 characters
4. **Check for duplicates:** Email and username must be unique

### **Common Error Messages:**
- `"Registration failed"` - Check form validation
- `"Login failed"` - Check credentials
- `"Network request failed"` - Check backend connection
- `"Validation failed"` - Check input format

---

## 📱 **Testing Features:**

### **Registration:**
- ✅ Email validation
- ✅ Username uniqueness
- ✅ Password hashing
- ✅ JWT token generation
- ✅ Wallet initialization ($1000)

### **Login:**
- ✅ Credential validation
- ✅ JWT token verification
- ✅ Session management
- ✅ User profile loading

### **Profile Management:**
- ✅ User data display
- ✅ Wallet balance sync
- ✅ Authentication state persistence

---

## 🎉 **Success Indicators:**

1. **Backend running** on port 3001
2. **App shows auth screen** when not logged in
3. **Registration creates user** in database
4. **Login returns JWT token**
5. **App shows main tabs** after authentication
6. **Test panel shows success messages**

The authentication system is now fully integrated and ready for testing! The backend API is working and the React Native app can communicate with it seamlessly.
