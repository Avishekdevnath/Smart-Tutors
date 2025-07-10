# Smart Tutors - Tuition Management Platform

A comprehensive tuition management platform built with Next.js 15, connecting tutors, guardians, and students for personalized educational services.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v5.0 or higher)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-tutors-next
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables**
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/smart-tutors
   
   # Authentication
   NEXTAUTH_SECRET=your-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   JWT_SECRET=your-jwt-secret-here
   
   # AI Integration (Optional)
   GOOGLE_AI_API_KEY=your-google-ai-key
   
   # Email Configuration (Optional)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Cloudinary (Optional - for file uploads)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

5. **Initialize the database**
   ```bash
   # Create default admin user
   node scripts/create-admin.js
   
   # Import sample Facebook groups (optional)
   node scripts/import-facebook-groups.js
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - **Main Site**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/dashboard
   - **Admin Login**: http://localhost:3000/admin/login

## 📱 Features

### 🏠 **Main Platform**
- **Landing Page** with modern, responsive design
- **Tutor Registration** and profile management
- **Guardian Registration** and tuition posting
- **Tuition Browsing** with advanced search and filters
- **Contact Forms** and inquiry management

### 🛡️ **Admin Dashboard**
- **Secure Authentication** with JWT and bcrypt
- **Role-based Access Control** (admin/super_admin)
- **Account Management** (password, email, username changes)
- **Mobile-Responsive Design** with touch-friendly interface

### 👥 **User Management**
- **Tutor Management**
  - Profile creation and verification
  - Qualification tracking
  - Application management
- **Guardian Management**
  - Contact information management
  - Tuition posting and tracking
  - Communication tools

### 📚 **Tuition Management**
- **Tuition Posting** with detailed requirements
- **Auto-generated Social Media Posts** for Facebook groups
- **Application Tracking** and tutor matching
- **Status Management** (open, demo running, booked, etc.)
- **Advanced Search and Filtering** system

### 📊 **Analytics & Reporting**
- **Dashboard Statistics** with real-time data
- **Performance Metrics** and insights
- **Export Functionality** for reports
- **Data Visualization** charts and graphs

### 🌐 **Facebook Groups Integration**
- **Group Collection Management**
- **Bulk Group Operations**
- **Location-based Filtering**
- **Member Count Tracking**
- **Automated Post Generation**

### 🎨 **Mobile-First Design**
- **Responsive Layout** for all device sizes
- **Touch-Friendly Interface** with proper touch targets
- **Mobile Navigation** with hamburger menu
- **"Back to Home" button** for mobile dashboard
- **Progressive Enhancement** from mobile to desktop

## 🗺️ Routes Documentation

### **Public Routes**

| Route | Description | Features |
|-------|-------------|----------|
| `/` | Landing page | Hero section, features, testimonials |
| `/tutors` | Tutor listings | Browse and search tutors |
| `/tutors/register` | Tutor registration | Registration form |
| `/tuitions` | Tuition listings | Browse available tuitions |
| `/guardians` | Guardian information | Guardian registration |
| `/contact` | Contact page | Contact form and info |

### **Authentication Routes**

| Route | Description | Access |
|-------|-------------|--------|
| `/admin/login` | Admin login | Public |
| `/admin/unauthorized` | Unauthorized access | Public |
| `/api/auth/[...nextauth]` | NextAuth endpoints | Public |
| `/api/admin/auth/*` | Admin auth APIs | Protected |

### **Admin Dashboard Routes**

| Route | Description | Features |
|-------|-------------|----------|
| `/dashboard` | Main dashboard | Stats, quick actions, overview |
| `/dashboard/tutors` | Tutor management | CRUD operations, search, filter |
| `/dashboard/guardians` | Guardian management | Contact management, tuition count |
| `/dashboard/guardians/add` | Add guardian | Guardian registration form |
| `/dashboard/tuitions` | Tuition management | CRUD, status tracking, filters |
| `/dashboard/tuitions/add` | Add tuition | Tuition creation form |
| `/dashboard/facebook-groups` | Facebook groups | Collection management, bulk ops |
| `/dashboard/analytics` | Analytics dashboard | Reports and insights |
| `/dashboard/settings` | Admin settings | Password, email, username changes |
| `/dashboard/profile` | Admin profile | Profile management |
| `/dashboard/reports` | Reports section | Detailed reports |

### **API Endpoints**

#### **Admin APIs**
```
POST   /api/admin/auth/login              # Admin login
POST   /api/admin/auth/logout             # Admin logout
GET    /api/admin/auth/verify              # Verify admin session
POST   /api/admin/auth/change-password     # Change password
POST   /api/admin/auth/change-email        # Change email
POST   /api/admin/auth/change-username     # Change username
```

#### **User Management APIs**
```
GET    /api/tutors                        # Get all tutors
POST   /api/tutors                        # Create tutor
GET    /api/tutors/[id]                   # Get tutor by ID
PUT    /api/tutors/[id]                   # Update tutor
DELETE /api/tutors/[id]                   # Delete tutor

GET    /api/guardians                     # Get all guardians
POST   /api/guardians                     # Create guardian
GET    /api/guardians/[id]                # Get guardian by ID
PUT    /api/guardians/[id]                # Update guardian
DELETE /api/guardians/[id]                # Delete guardian
```

#### **Tuition Management APIs**
```
GET    /api/tuitions                      # Get all tuitions
POST   /api/tuitions                      # Create tuition
GET    /api/tuitions/[id]                 # Get tuition by ID
PUT    /api/tuitions/[id]                 # Update tuition
DELETE /api/tuitions/[id]                 # Delete tuition
```

#### **Facebook Groups APIs**
```
GET    /api/facebook-groups               # Get all collections
POST   /api/facebook-groups               # Create collection
GET    /api/facebook-groups/[id]          # Get collection by ID
PUT    /api/facebook-groups/[id]          # Update collection
DELETE /api/facebook-groups/[id]          # Delete collection

POST   /api/facebook-groups/[id]/groups   # Add group to collection
GET    /api/facebook-groups/[id]/groups/[groupId]   # Get specific group
PUT    /api/facebook-groups/[id]/groups/[groupId]   # Update group
DELETE /api/facebook-groups/[id]/groups/[groupId]   # Delete group
```

#### **Utility APIs**
```
POST   /api/ai                           # AI post generation
POST   /api/email                        # Email sending
POST   /api/upload                       # File upload
GET    /api/subjects                     # Get subjects list
```

## 🛠️ Technology Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful icon library
- **Lucide React** - Additional icon set

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication library
- **JWT** - JSON Web Tokens for admin auth
- **bcrypt** - Password hashing

### **Additional Services**
- **Google AI (Gemini)** - AI-powered post generation
- **Cloudinary** - Image and file upload service
- **Nodemailer** - Email sending service

## 🔧 Development Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database Scripts
node scripts/create-admin.js              # Create admin user
node scripts/create-admin-simple.js       # Create simple admin
node scripts/create-admin-atlas.js        # Create admin for Atlas
node scripts/import-facebook-groups.js    # Import Facebook groups
```

## 📊 Database Models

### **Admin Model**
```javascript
{
  name: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String (admin/super_admin),
  accountLocked: Boolean,
  failedLoginAttempts: Number,
  lockUntil: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Guardian Model**
```javascript
{
  name: String (required),
  number: String (required, unique),
  address: String (required),
  createdAt: Date,
  updatedAt: Date
}
```

### **Tutor Model**
```javascript
{
  name: String,
  phone: String,
  email: String,
  address: String,
  education: Object,
  experience: String,
  subjects: [String],
  preferredLocations: [String],
  expectedSalary: Number,
  availability: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### **Tuition Model**
```javascript
{
  code: String (unique),
  guardianName: String,
  guardianNumber: String,
  guardianAddress: String,
  class: String,
  version: String,
  subjects: [String],
  weeklyDays: String,
  dailyHours: String,
  salary: String,
  location: String,
  tutorGender: String,
  urgent: Boolean,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **Facebook Group Collection Model**
```javascript
{
  collectionName: String,
  slug: String (unique),
  groups: [{
    name: String,
    link: String,
    memberCount: Number,
    locations: [String]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication** with HTTP-only cookies
- **Password Hashing** with bcrypt (12 salt rounds)
- **Account Lockout** after 5 failed login attempts
- **Role-based Access Control** for different admin levels
- **Session Management** with 24-hour token expiration
- **CSRF Protection** with NextAuth.js
- **Input Validation** and sanitization
- **API Route Protection** with middleware

## 📱 Mobile Responsive Features

- **Mobile-First Design** approach
- **Touch-Friendly Interface** with 44px+ touch targets
- **Responsive Navigation** with hamburger menu
- **Collapsible Filters** for mobile optimization
- **Adaptive Layouts** for different screen sizes
- **Progressive Enhancement** from mobile to desktop
- **"Back to Home" Button** in mobile dashboard
- **Optimized Typography** for mobile readability

## 🚀 Deployment

### **Environment Setup**
1. Set up production MongoDB database
2. Configure environment variables for production
3. Set up Cloudinary account for file uploads
4. Configure email service for notifications

### **Build Process**
```bash
npm run build
npm run start
```

### **Recommended Platforms**
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- **Email**: support@smarttutors.com
- **Issues**: Create an issue on GitHub
- **Documentation**: Check the `/docs` folder for detailed guides

---

**Smart Tutors** - Connecting quality education with personalized tutoring services.
