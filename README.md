# 📱 X Clone - React Native FullStack Mobile App 🚀

This is my personal **X Clone** app (formerly Twitter), built using **React Native**. It’s a full-stack mobile application with authentication, notifications, messaging, and profile management, fully functional on both Android and iOS.

---

## 🎯 App Overview

This app replicates key features of X:

- ✅ Home screen to post text and images
- ✅ Profile screen with editable user information
- ✅ Notifications for likes and comments
- ✅ Direct messages with chat history and deletion
- ✅ Search for trending content
- ✅ Authentication via Clerk (Google & Apple ID)

---

## 🛠️ Features

- 🔐 Secure authentication using Clerk
- 🏠 Post and view content on the Home screen
- ❤️ Like and comment system with smooth interactions
- 📬 Chat system with long-press delete functionality
- 👤 Profile management with editable modal
- 🔎 Search trending content in real time
- 🚪 Sign out functionality

---

## ⚙️ Tech Stack

- **Frontend:** React Native, Expo
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** Clerk
- **Image Hosting:** Cloudinary
- **Security:** Arcjet for rate-limiting and bot detection

---

## ⚡ Environment Setup

### Backend (`/backend`)

Create a `.env` file:

```

PORT=5001
NODE_ENV=development

CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>

MONGO_URI=<your_mongodb_connection_uri>

ARCJET_ENV=development
ARCJET_KEY=<your_arcjet_api_key>

CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>

```

### Mobile (`/mobile`)

Create a `.env` file:

```

EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
EXPO_PUBLIC_API_URL=<your_backend_api_url>

```

---

## 🚀 Running the App

### Backend

```bash
cd backend
npm install
npm run dev
```

### Mobile

```bash
cd mobile
npm install
npx expo start
```

---

## 📁 Project Structure

```
/backend   - Node.js API, MongoDB, authentication
/mobile    - React Native frontend with Expo
```

---

## 📝 License

MIT License © 2025
