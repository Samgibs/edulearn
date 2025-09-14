# EduLearn Frontend

A modern, responsive React frontend for the EduLearn Learning Management System.

## Features

- **Authentication System**: Login, signup, and role selection
- **Role-based Dashboards**: Different interfaces for admin, teacher, and student
- **Course Management**: Browse, enroll, and manage courses
- **Assignment System**: Create, submit, and grade assignments
- **Messaging System**: Real-time communication between users
- **Analytics Dashboard**: Comprehensive reporting and insights
- **Profile Management**: User profile and settings
- **Responsive Design**: Works on desktop, tablet, and mobile

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API calls
- **Recharts** for data visualization
- **Headless UI** for accessible components
- **Heroicons** for icons

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend API running on localhost:8000

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Start the development server:
```bash
yarn start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Building for Production

```bash
yarn build
```

This builds the app for production to the `build` folder.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Top navigation header
│   ├── Sidebar.tsx     # Side navigation
│   └── LoadingSpinner.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Signup.tsx      # Registration page
│   ├── RoleSelection.tsx
│   ├── AdminDashboard.tsx
│   ├── TeacherDashboard.tsx
│   ├── StudentDashboard.tsx
│   ├── Courses.tsx     # Course listing
│   ├── CourseDetail.tsx
│   ├── Assignments.tsx
│   ├── Messages.tsx    # Messaging system
│   ├── Profile.tsx     # User profile
│   └── Analytics.tsx   # Analytics dashboard
├── services/           # API services
│   └── api.ts         # API configuration and endpoints
├── App.tsx            # Main app component
├── index.tsx          # Entry point
└── index.css          # Global styles
```

## API Integration

The frontend communicates with the Django backend through RESTful APIs. All API calls are centralized in the `services/api.ts` file.

### Authentication Flow

1. User signs up/logs in
2. JWT tokens are stored in localStorage
3. Tokens are automatically included in API requests
4. Token refresh is handled automatically

### Role-based Access

- **Admin**: Full access to all features
- **Teacher**: Course creation, student management, analytics
- **Student**: Course enrollment, assignment submission, progress tracking

## Styling

The project uses Tailwind CSS for styling with a custom design system:

- **Primary Colors**: Blue theme (#3B82F6)
- **Secondary Colors**: Gray scale
- **Components**: Custom button, input, and card styles
- **Responsive**: Mobile-first design approach

## Development

### Available Scripts

- `yarn start` - Start development server
- `yarn build` - Build for production
- `yarn test` - Run tests
- `yarn eject` - Eject from Create React App

### Code Style

- TypeScript for type safety
- Functional components with hooks
- Custom hooks for reusable logic
- Consistent naming conventions

## Deployment

The frontend can be deployed to any static hosting service:

1. Build the project: `yarn build`
2. Deploy the `build` folder to your hosting service
3. Configure the API base URL for production

## Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is part of the EduLearn Learning Management System.
