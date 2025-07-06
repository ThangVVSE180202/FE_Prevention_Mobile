# 📁 Project Structure

## 🏗️ FE Prevention Mobile - Folder Organization

```
FE_Prevention_Mobile/
│
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, Card, etc.)
│   │   └── forms/          # Form-specific components
│   │
│   ├── screens/            # Screen components (pages)
│   │   ├── auth/           # Authentication screens
│   │   ├── courses/        # Course-related screens
│   │   ├── surveys/        # Survey and assessment screens
│   │   ├── blog/           # Blog and content screens
│   │   ├── appointments/   # Appointment booking screens
│   │   └── profile/        # User profile screens
│   │
│   ├── navigation/         # Navigation configuration
│   │
│   ├── services/           # External services and API calls
│   │   └── api/            # API service modules
│   │
│   ├── utils/              # Utility functions
│   │
│   ├── constants/          # App constants and configuration
│   │
│   ├── styles/             # Global styles and themes
│   │
│   ├── context/            # React Context providers
│   │
│   ├── hooks/              # Custom React hooks
│   │
│   └── types/              # TypeScript type definitions
│
├── assets/                 # Static assets (images, fonts)
├── App.js                  # Main app component
├── index.js                # Entry point
└── package.json            # Dependencies and scripts
```

## 📋 Feature Modules

### 🔐 Authentication Module

- Login/Register screens
- Password reset
- Google OAuth integration
- Token management

### 📚 Courses Module

- Course listing
- Course details
- Course enrollment
- Course reviews

### 📝 Surveys Module

- Survey listing
- Survey taking interface
- Results display
- Risk assessment

### 📰 Blog Module

- Blog listing
- Blog article view
- Content sharing

### 📅 Appointments Module

- Consultant listing
- Available time slots
- Appointment booking
- Appointment management

### 👤 Profile Module

- User profile view/edit
- Settings
- My enrollments
- My appointments

## 🎯 Key Design Principles

1. **Separation of Concerns**: Each folder has a specific responsibility
2. **Reusability**: Common components can be used across screens
3. **Scalability**: Easy to add new features without disrupting existing code
4. **Maintainability**: Clear organization makes debugging and updates easier
5. **Type Safety**: TypeScript definitions for better development experience
