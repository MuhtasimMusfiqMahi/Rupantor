# রুপান্তর (Rupantor) - Climate Action Youth Organization App

A comprehensive web application for the রুপান্তর youth-led climate organization, featuring public information portals, community engagement, and internal management tools.

## Features

### 🌍 Public Features (Pre-Login)
- **Event Information Hub**: Browse upcoming and past climate action events
- **Contact Us**: Easy access to organization contact information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 👥 Registered User Features (Post-Login)
- **Social Engagement**: Like and comment on events
- **Event Registration**: Register for upcoming events
- **Profile Management**: Manage personal information

### 🎯 Volunteer Portal
- **Personalized Dashboard**: View assigned tasks and instructions
- **Task Management**: Track progress with "To Do", "In Progress", and "Completed" statuses
- **Priority System**: High, medium, and low priority instructions
- **Real-time Updates**: Stay informed about team activities

### 👨‍💼 Administrative Panel
- **Event Management**: Create and manage climate action events
- **Volunteer Management**: View all registered volunteers and their profiles
- **Instruction System**: Create and assign tasks with priorities
- **Content Control**: Full control over public-facing content

### 💬 Internal Chat System
- **One-to-One Chat**: Direct messaging between team members
- **Group Chats**: Create and manage team-specific group conversations
- **Real-time Messaging**: Instant communication within the organization

## User Roles

1. **Public Member**: Basic access with event viewing and registration
2. **Volunteer**: Task management dashboard and internal communications
3. **Administrative Committee**: Full management access including event creation, volunteer management, and instruction assignment

## Getting Started

### Quick Start with Sample Data (Recommended)

1. **Sign Up as Admin**: Click "Login / Sign Up" and create an account with role "Administrative Committee"
2. **Navigate to Admin Dashboard**: After login, you'll be directed to your dashboard
3. **Generate Sample Data**: Click the "Generate Complete Sample Data" button
4. **Explore**: Sample data includes:
   - 6 volunteer/admin accounts (with login credentials)
   - 6 upcoming climate action events
   - 10 task instructions for volunteers

### Sample Account Credentials (After Seeding)

**Volunteers:**
- sarah.khan@example.com (password: volunteer123)
- mahir.islam@example.com (password: volunteer123)
- fatima.rahman@example.com (password: volunteer123)
- arif.ahmed@example.com (password: volunteer123)
- nadia.chowdhury@example.com (password: volunteer123)

**Admin:**
- karim.hassan@example.com (password: admin123)

### Manual Setup

1. **Sign Up**: Click "Login / Sign Up" in the header
2. **Choose Your Role**: 
   - Public Member for general access
   - Volunteer to participate in activities
   - Administrative Committee for management access
3. **Complete Registration**: Fill in your name, email, and password

### For Administrators

1. **Login** as an admin user
2. **Navigate to Admin Dashboard**
3. **Create Events** from the Events tab
4. **Create Instructions** for volunteers from the Instructions tab
5. **Create Group Chats** for team communication

### For Volunteers

1. **Login** with your volunteer account
2. **View Dashboard** to see assigned instructions
3. **Update Task Status** as you work on assignments
4. **Access Chat** to communicate with team members

## Technology Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Supabase Edge Functions (Hono server)
- **Database**: Supabase Key-Value Store
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Application Structure

```
/
├── components/
│   ├── AdminDashboard.tsx       # Admin management interface
│   ├── VolunteerDashboard.tsx   # Volunteer task dashboard
│   ├── ChatSystem.tsx           # Internal messaging system
│   ├── PublicHome.tsx           # Public landing page
│   ├── EventCard.tsx            # Event display component
│   ├── ContactUs.tsx            # Contact information page
│   ├── Auth.tsx                 # Login/signup forms
│   ├── CompleteSeedData.tsx     # Comprehensive demo data generator
│   ├── WelcomeGuide.tsx         # Interactive onboarding guide
│   └── ui/                      # shadcn/ui components
├── supabase/functions/server/
│   └── index.tsx                # Backend API routes
├── types/
│   └── index.ts                 # TypeScript type definitions
├── utils/
│   └── supabase-client.ts       # Supabase client setup
└── App.tsx                      # Main application component
```

## Screenshots & Features

### 🎨 Branding
- Official রুপান্তর logo used throughout the app
- Consistent green color scheme reflecting environmental focus
- Bengali typography for authentic cultural representation

### 📱 User Experience
- Interactive welcome guide for first-time admins
- One-click sample data generation
- Responsive design for all devices
- Real-time updates and notifications

## API Endpoints

- `POST /signup` - Create new user account
- `GET /events` - Fetch all events
- `POST /events` - Create new event (admin only)
- `POST /events/:id/like` - Like an event
- `POST /events/:id/comment` - Comment on an event
- `POST /events/:id/register` - Register for an event
- `GET /instructions` - Get instructions for user
- `POST /instructions` - Create instruction (admin only)
- `PATCH /instructions/:id` - Update instruction status
- `GET /volunteers` - Get all volunteers (admin only)
- `GET /profile` - Get user profile
- `GET /chat/messages` - Get chat messages
- `POST /chat/messages` - Send chat message
- `GET /chat/groups` - Get user's chat groups
- `POST /chat/groups` - Create chat group (admin only)

## Environment

This app is built using Figma Make and is connected to Supabase for backend functionality including:
- User authentication
- Data storage
- Real-time capabilities

---

**রুপান্তর** - Together for Climate Action 🌱
