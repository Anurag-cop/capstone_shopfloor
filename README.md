# Shop-Floor Resource Allocation System

Enterprise SaaS system for manufacturing resource allocation that enables supervisors to assign operators, machines, and materials to work orders and adjust allocations in real-time.

## ✨ Features

- 🎯 Real-time resource allocation dashboard
- 🖱️ Drag-and-drop interface for quick assignments
- 📊 Live utilization metrics and analytics
- ⚡ On-the-fly reallocation for disruption handling
- 🔔 Automated alerts for conflicts and bottlenecks
- 📱 Tablet-optimized for shop-floor use
- 🔍 Smart resource matching and optimization
- 📈 Historical performance tracking
- 🔐 Role-based access control
- 🌐 Multi-language support ready

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Shop-Floor-Resource-Allocation

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the application.

### Available Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checker
npm test             # Run tests (when implemented)
```

## 🛠️ Technology Stack

### Core Technologies
- **Frontend Framework**: React 18.2
- **Language**: TypeScript 5.2
- **Build Tool**: Vite 5.0
- **State Management**: Zustand 4.4
- **Drag & Drop**: React DnD 16.0

### UI & Styling
- **Icons**: Lucide React 0.294
- **Date Handling**: date-fns 2.30
- **CSS**: CSS Modules + CSS Variables

### Development Tools
- **Linting**: ESLint 8.55
- **Type Checking**: TypeScript Compiler
- **Package Manager**: npm

## 📁 Project Structure

```
Shop-Floor-Resource-Allocation/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── MetricsCards.tsx
│   │   ├── WorkOrderPanel.tsx
│   │   ├── ResourcePanel.tsx
│   │   ├── AlertBanner.tsx
│   │   └── AllocationInterface.tsx
│   ├── features/
│   │   └── dashboard/    # Main dashboard feature
│   ├── store/           # Zustand state management
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions & helpers
│   ├── styles/          # Global CSS styles
│   ├── App.tsx          # Root component
│   └── main.tsx         # Application entry point
├── .vscode/             # VS Code configuration
├── docs/                # Additional documentation
├── .env.example         # Environment variables template
├── .gitignore           # Git ignore rules
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── README.md            # This file
```

## 📚 Documentation

### Getting Started
- 📖 [Implementation Guide](IMPLEMENTATION_GUIDE.md) - Complete setup and implementation instructions
- 📋 [Requirements](requirements.md) - Full system requirements and specifications
- 🏗️ [Architecture](ARCHITECTURE.md) - System architecture with Mermaid diagrams
- 🔧 [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions

### Development
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project
- 🔐 [Security Policy](SECURITY.md) - Security guidelines and reporting
- 🚀 [Deployment Guide](DEPLOYMENT.md) - Deploy to production (Vercel, Netlify, AWS, Docker)

### Navigation
- 🔗 [Project Links](project-links.html) - Quick navigation to all project files

## 🎯 Key Components

### Dashboard Components

- **MetricsCards** - Displays KPIs (active operators, machines, work orders, utilization)
- **WorkOrderPanel** - Shows work orders with priority, status, and resource requirements
- **ResourcePanel** - Lists available operators and machines with their current status
- **AlertBanner** - Real-time notifications for conflicts, warnings, and information
- **AllocationInterface** - Drag-and-drop interface for assigning resources to work orders

### State Management

The application uses Zustand for centralized state management:
- Operators, machines, materials, work orders
- Allocations and their validation
- Dashboard metrics
- Alert management

### Type System

Comprehensive TypeScript types ensure type safety:
- `Operator`, `Machine`, `Material`, `WorkOrder`
- `Allocation`, `AllocationValidation`
- `Alert`, `DashboardMetrics`

## 🔍 Core Features

### Resource Allocation
- Drag operators from resource panel to work orders
- Drag machines to work orders
- Real-time validation of skill matches
- Automatic conflict detection
- Optimal resource suggestions

### Validation System
- Operator skill verification
- Machine capability checking
- Availability conflict resolution
- Resource count validation
- Warning system for potential issues

### Real-time Updates
- Live metrics updates every 5 seconds
- Instant allocation changes
- Dynamic alert generation
- Utilization tracking

## 🧪 Testing

Testing infrastructure ready for implementation:

```bash
# Unit tests (to be implemented)
npm test

# Test with coverage
npm run test:coverage

# E2E tests (to be implemented)
npm run test:e2e
```

## 🔒 Security

- Input validation on all user interactions
- XSS protection through React's built-in escaping
- Environment variable configuration for sensitive data
- No hardcoded credentials
- Security headers ready for production

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## 🌐 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome  | 90+     | ✅ Full |
| Firefox | 88+     | ✅ Full |
| Safari  | 14+     | ✅ Full |
| Edge    | 90+     | ✅ Full |

## 📱 Responsive Design

- **Desktop**: Optimized for 1920x1080, 1440x900, 1366x768
- **Tablet**: Touch-optimized for iPad (1024x768)
- **Mobile**: Basic support (375x667, 360x640)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Coding standards
- Commit guidelines
- Pull request process

## 📝 License

Proprietary - All rights reserved

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Questions**: Use GitHub Discussions
- **Security**: See [SECURITY.md](SECURITY.md) for security-related concerns

## 🎉 Acknowledgments

Built with modern web technologies and best practices:
- React team for React 18
- Zustand team for simple state management
- React DnD team for drag-and-drop capabilities
- Vite team for blazingly fast dev experience

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready 🚀
