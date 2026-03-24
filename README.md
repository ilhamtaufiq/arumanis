# ARUMANIS

**Aplikasi Satu Data Air Minum dan Sanitasi** - Bidang Air Minum dan Sanitasi

## 📋 Overview

ARUMANIS is a comprehensive management system for infrastructure projects focused on water supply and sanitation. Built with modern web technologies, it provides features for managing activities (kegiatan), jobs (pekerjaan), contracts, outputs, beneficiaries, and documentation.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Routing**: TanStack Router
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod validation
- **UI Components**: Radix UI + custom shadcn/ui components
- **Authorization**: CASL (role-based access control)
- **HTTP Client**: Axios
- **Charts**: Recharts
- **PDF Export**: jsPDF + html2canvas

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js 18+
- Backend API server (Laravel-based)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd bun

# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
bun run build

# Preview production build
bun run preview
```

### Linting

```bash
bun run lint
```

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── layout/        # Layout components (sidebar, nav, etc.)
│   └── ui/            # Base UI components (button, card, etc.)
├── config/            # App configuration (abilities, themes)
├── context/           # React contexts
├── features/          # Feature-based modules
│   ├── auth/          # Authentication
│   ├── berkas/        # Document management
│   ├── dashboard/     # Dashboard
│   ├── desa/          # Village data
│   ├── foto/          # Photo documentation
│   ├── kecamatan/     # District data
│   ├── kegiatan/      # Activities/Programs
│   ├── kontrak/       # Contracts
│   ├── output/        # Project outputs
│   ├── pekerjaan/     # Jobs/Work items
│   ├── penerima/      # Beneficiaries
│   ├── penyedia/      # Providers/Vendors
│   ├── permissions/   # Permission management
│   ├── roles/         # Role management
│   ├── route-permissions/ # Route-based permissions
│   ├── settings/      # App settings
│   └── users/         # User management
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── routes/            # Route definitions
└── stores/            # Zustand stores
```

## 🔐 Features

- **Authentication**: Secure login with Laravel Sanctum
- **Role-Based Access Control**: Fine-grained permissions using CASL
- **Master Data Management**: Kecamatan, Desa, Penyedia
- **Activity Management**: Create and manage program activities (Kegiatan)
- **Job Tracking**: Track jobs with contracts, outputs, and beneficiaries.
- **Photo Documentation**: 
    - **Advanced Geo-Fencing**: Automatic location validation against project GeoJSON boundaries (Kecamatan/Desa).
    - **Offline Queue**: Reliable photo uploads with IndexedDB persistence for areas with poor connectivity.
    - **Dynamic Watermarking**: Automatic embedding of Date, Time, and GPS coordinates onto captured photos.
    - **Direct Camera Integration**: Optimized capture flow for mobile field supervisors.
- **Physical Progress Map**: Integrated map with heatmaps, markers, and project filtering. Optimized to show the latest status per project with sync to fiscal year.
- **Audit Logging System**: Comprehensive tracking of data changes across the system for administrative transparency.
- **Data Quality Dashboard**: Real-time diagnostic interface for identifying missing project metadata and documentation.

## 🚢 Deployment

### Docker

This project includes a `Dockerfile` for easy deployment using Docker.

```bash
# Build the image
docker build -t arumanis-frontend .

# Run the container
docker run -d -p 80:80 arumanis-frontend
```

### Auto-Redeploy (Coolify)

This project is configured for auto-redeployment via **Coolify**. Every time a commit is pushed to the `main` branch, it triggers a deployment via a GitHub Webhook.

**Deployment URL:** [paas.cianjur.space](https://paas.cianjur.space)

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://apiamis.cianjur.space/api
```

### Backend API

This frontend requires the **apiamis** Laravel backend. Ensure the backend is running and properly configured with CORS settings.

## 📝 License

This project is licensed under the [MIT License](LICENSE).
