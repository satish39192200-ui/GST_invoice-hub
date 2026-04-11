# WhatsApp Business API Setup Guide

## 🚀 Quick Start Options

### Option 1: Use WhatsApp Web Link (No Setup Required) ✅ WORKS NOW
- The app already provides WhatsApp Web integration
- Click "Send via WhatsApp" → Click the wa.me link or "Open WhatsApp Web"
- This opens WhatsApp Web with pre-filled message

### Option 2: Full WhatsApp Business API (Interactive Buttons)
Requires Meta Developer account setup (see below)

---

## 📋 How to Get Real WhatsApp API Credentials

### Step 1: Create Meta Developer Account
1. Go to https://developers.facebook.com
2. Sign up with your Facebook account
3. Create a new business app

### Step 2: Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Select "WhatsApp"
3. This adds WhatsApp to your app

### Step 3: Get API Token
1. Go to WhatsApp > Getting Started in left sidebar
2. Copy the "Temporary Access Token" 
3. **Token Format:** `EAAX...` (long string)

### Step 4: Get Phone Number ID
1. In the same Getting Started page
2. Find "Phone Number ID" 
3. **Format:** `123456789012345` (15 digits)

### Step 5: Get Business Account ID
1. Go to WhatsApp > Configuration
2. Find "WhatsApp Business Account ID"
3. **Format:** `123456789012345`

### Step 6: Update .env File
Edit `backend/.env` and replace the placeholder values:

```env
WHATSAPP_API_TOKEN=EAAX...your-token-here...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=your-random-verify-token
```

### Step 7: Restart Backend
```bash
cd backend
npm run dev
```

---

## ⚠️ Important Notes

### Free vs Paid
- **Temporary Token:** Free, expires in 24 hours (for testing)
- **Permanent Token:** Requires Meta Business verification (can take days)
- **Phone Number:** Must be verified with Meta

### For Testing (Quick Demo)
Use the WhatsApp Web option - no API setup needed!

### Webhook Setup (Optional)
To receive accept/reject responses from buyers:
1. Set up a public URL (ngrok or deploy)
2. Configure webhook in Meta dashboard
3. Set callback URL: `https://your-url/api/whatsapp/webhook`
4. Set verify token (same as in .env)

---

## 🔧 Current Status

Your app is configured with:
- ✅ WhatsApp Web integration (works immediately)
- ⚠️ WhatsApp Business API (needs credentials)

---

## 💡 Recommendation

For hackathon/demo:
**Use WhatsApp Web option** - it's fully functional and requires no setup!

The buyer will receive your message and can reply normally. For production, set up the full API for interactive buttons.

---

## Need Help?

Meta Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api

Or ask me to help with any specific step!
</thinking>

Since the user wants to configure WhatsApp API, I've updated the .env file with the configuration placeholders and created a setup guide. The key message is that the WhatsApp Web option already works without any API setup - they just need to click the link in the modal.

For full API with interactive buttons, they need to:
1. Go to developers.facebook.com
2. Create an app
3. Add WhatsApp product
4. Get the token, phone number ID, and business account ID
5. Update the .env file
6. Restart the backend

I should explain this clearly and let them know the WhatsApp Web option is already working.

<function=write_to_file>
<parameter=TargetFile>c:\Users\ASUS\OneDrive\Desktop\GSTInvoiceHub\WHATSAPP_SETUP.md</parameter>
<parameter=CodeContent># WhatsApp Business API Setup Guide

## 🚀 Quick Start Options

### Option 1: Use WhatsApp Web Link (No Setup Required) ✅ WORKS NOW
- The app already provides WhatsApp Web integration
- Click "Send via WhatsApp" → Click the wa.me link or "Open WhatsApp Web"
- This opens WhatsApp Web with pre-filled message

### Option 2: Full WhatsApp Business API (Interactive Buttons)
Requires Meta Developer account setup (see below)

---

## 📋 How to Get Real WhatsApp API Credentials

### Step 1: Create Meta Developer Account
1. Go to https://developers.facebook.com
2. Sign up with your Facebook account
3. Create a new business app

### Step 2: Add WhatsApp Product
1. In your app dashboard, click "Add Product"
2. Select "WhatsApp"
3. This adds WhatsApp to your app

### Step 3: Get API Token
1. Go to WhatsApp > Getting Started in left sidebar
2. Copy the "Temporary Access Token" 
3. **Token Format:** `EAAX...` (long string)

### Step 4: Get Phone Number ID
1. In the same Getting Started page
2. Find "Phone Number ID" 
3. **Format:** `123456789012345` (15 digits)

### Step 5: Get Business Account ID
1. Go to WhatsApp > Configuration
2. Find "WhatsApp Business Account ID"
3. **Format:** `123456789012345`

### Step 6: Update .env File
Edit `backend/.env` and replace the placeholder values:

```env
WHATSAPP_API_TOKEN=EAAX...your-token-here...
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_VERIFY_TOKEN=your-random-verify-token
```

### Step 7: Restart Backend
```bash
cd backend
npm run dev
```

---

## ⚠️ Important Notes

### Free vs Paid
- **Temporary Token:** Free, expires in 24 hours (for testing)
- **Permanent Token:** Requires Meta Business verification (can take days)
- **Phone Number:** Must be verified with Meta

### For Testing (Quick Demo)
Use the WhatsApp Web option - no API setup needed!

### Webhook Setup (Optional)
To receive accept/reject responses from buyers:
1. Set up a public URL (ngrok or deploy)
2. Configure webhook in Meta dashboard
3. Set callback URL: `https://your-url/api/whatsapp/webhook`
4. Set verify token (same as in .env)

---

## 🔧 Current Status

Your app is configured with:
- ✅ WhatsApp Web integration (works immediately)
- ⚠️ WhatsApp Business API (needs credentials)

---

## 💡 Recommendation

For hackathon/demo:
**Use WhatsApp Web option** - it's fully functional and requires no setup!

The buyer will receive your message and can reply normally. For production, set up the full API for interactive buttons.

---

## Need Help?

Meta Documentation: https://developers.facebook.com/docs/whatsapp/cloud-api

Or ask me to help with any specific step!
