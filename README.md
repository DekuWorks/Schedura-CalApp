# 📅 Schedura - Beautiful Calendar App

A modern, feature-rich calendar application built with React, TypeScript, and Supabase. Organize your schedule with beautiful design, smart features, and intuitive user experience.

![Schedura Calendar](https://img.shields.io/badge/Schedura-Calendar-blue?style=for-the-badge&logo=calendar)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=flat&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat&logo=supabase)

## ✨ Features

### 🎯 Core Calendar Features
- **Single Calendar Interface** - Clean, focused calendar experience
- **Interactive Calendar Grid** - Click dates to create events instantly
- **List & Grid Views** - Toggle between monthly grid and event list
- **Month Navigation** - Easy navigation with "Today" button
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile

### 🏷️ Smart Event Management
- **Color-Coded Categories** - 10 predefined categories with custom colors
  - 💼 Work, 👤 Personal, 🏥 Health, 👥 Social, ✈️ Travel
  - 📚 Education, 💰 Finance, 🎨 Hobby, 👨‍👩‍👧‍👦 Family, 📝 Other
- **Custom Category Colors** - Personalize each category with your own colors
- **Timezone Support** - 50+ timezones for global scheduling
- **All-Day Events** - Support for both timed and all-day events
- **Attendee Management** - Add multiple attendees with email addresses
- **Event Details** - Title, description, location, and more

### 🔐 User Experience
- **Authentication** - Secure login/signup with Supabase Auth
- **Real-time Updates** - Events sync instantly across sessions
- **Beautiful UI** - Modern design with smooth animations
- **Toast Notifications** - Helpful feedback for all actions
- **Error Handling** - Graceful error handling with user-friendly messages

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (for database and authentication)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DekuWorks/Schedura-CalApp.git
cd Schedura-CalApp
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:8080`

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.8.3** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security (RLS)** - Secure data access policies
- **Real-time Subscriptions** - Live updates across sessions
- **Authentication** - Built-in user management

### Key Libraries
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling and validation
- **Date-fns** - Date manipulation and formatting
- **Lucide React** - Beautiful icons
- **Zod** - Schema validation
- **React Query** - Server state management

## 📁 Project Structure

```
src/
├── components/
│   ├── events/           # Event-related components
│   │   ├── CreateEventDialog.tsx
│   │   ├── EditEventDialog.tsx
│   │   └── EventCard.tsx
│   └── ui/               # Reusable UI components
├── config/
│   ├── categories.ts     # Event categories configuration
│   └── timezones.ts      # Timezone configuration
├── hooks/                # Custom React hooks
├── integrations/
│   └── supabase/         # Supabase client and types
├── lib/                  # Utility functions
├── pages/                # Main application pages
│   ├── Calendar.tsx      # Main calendar interface
│   ├── Landing.tsx       # Marketing landing page
│   ├── Login.tsx         # Authentication
│   └── Signup.tsx        # User registration
└── utils/                # Helper utilities
```

## 🎨 Customization

### Category Colors
Each category can be customized with your own colors:
- Use the color picker in the event creation dialog
- Choose from 20 preset colors or use any custom color
- Colors are saved locally and persist across sessions

### Timezones
- Automatically detects your browser timezone
- Supports 50+ timezones worldwide
- Perfect for scheduling with people in different time zones

## 🗺️ Roadmap

### 🔄 Phase 1: Core Features (Completed)
- ✅ User authentication and authorization
- ✅ Single calendar interface
- ✅ Event creation, editing, and deletion
- ✅ Category system with custom colors
- ✅ Timezone support
- ✅ Attendee management
- ✅ Responsive design

### 🚀 Phase 2: Enhanced Features (In Progress)
- [ ] **Recurring Events** - Daily, weekly, monthly patterns
- [ ] **Event Notifications** - Email and in-app reminders
- [ ] **Calendar Sharing** - Share calendars with team members
- [ ] **Event Search & Filtering** - Find events quickly
- [ ] **Calendar Import/Export** - iCal and Google Calendar integration

### 🌟 Phase 3: Advanced Features (Planned)
- [ ] **Team Workspaces** - Collaborative calendar management
- [ ] **Calendar Analytics** - Usage insights and statistics
- [ ] **Mobile App** - Native iOS and Android apps
- [ ] **API Integration** - Third-party service connections
- [ ] **Advanced Scheduling** - Smart meeting suggestions

### 🔮 Phase 4: AI & Automation (Future)
- [ ] **AI Event Suggestions** - Smart scheduling recommendations
- [ ] **Natural Language Processing** - Create events from text
- [ ] **Automated Reminders** - Smart notification timing
- [ ] **Conflict Detection** - Automatic schedule conflict resolution

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author & Credits

**Created by:** [Marcus Brown](https://github.com/marcusbrown)  
**Powered by:** [DekuWorks LLC](https://dekuworks.com)

### Acknowledgments
- Built with [Lovable](https://lovable.dev) - AI-powered development platform
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- Database powered by [Supabase](https://supabase.com)

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/DekuWorks/Schedura-CalApp/issues)
- **Discussions:** [GitHub Discussions](https://github.com/DekuWorks/Schedura-CalApp/discussions)
- **Email:** [contact@dekuworks.com](mailto:contact@dekuworks.com)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=DekuWorks/Schedura-CalApp&type=Date)](https://star-history.com/#DekuWorks/Schedura-CalApp&Date)

---

**Made with ❤️ by Marcus Brown | Powered by DekuWorks LLC**
