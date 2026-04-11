# GST Invoice Hub

**A complete full-stack web application for small businesses in India to solve B2B invoice tracking and GST compliance issues.**

Built for **HackHorizon 2K26** - Hackathon MVP

---

## Problem Statement

Small businesses in India face significant challenges with:
- Tracking B2B invoices between sellers and buyers
- Manual GST compliance and return filing
- Payment tracking and reconciliation
- Inventory management with GST implications
- Communication gaps between trading partners

## Solution Overview

GST Invoice Hub provides a unified platform where:
- **Sellers** can generate/upload invoices, track status, issue credit/debit notes, and manage payments
- **Buyers** can receive invoices, accept/reject/request modifications, and claim ITC
- **Admins** can monitor disputes and view analytics

### Key Features

1. **User Authentication** - GSTIN/Mobile OTP-based login with JWT
2. **Invoice Management** - Create, share, track, and manage B2B invoices
3. **Real-time Notifications** - WebSocket-powered instant updates
4. **Payment Tracking** - Link payments to invoices with UTR/transaction details
5. **Credit/Debit Notes** - Generate against existing invoices
6. **Inventory Sync** - Automatic stock updates on invoice acceptance
7. **GST Returns** - Auto-generate GSTR-1 (Sales) and GSTR-3B (ITC) summaries with CSV export
8. **Mock GSTN Integration** - Simulated IRN generation and GSTR-2A fetch

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Tailwind CSS + Vite |
| **State Management** | Zustand |
| **HTTP Client** | Axios |
| **Forms** | React Hook Form |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Backend** | Node.js + Express + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Real-time** | Socket.io |
| **Auth** | JWT + bcrypt |
| **Containerization** | Docker + Docker Compose |

---

## Project Structure

```
GSTInvoiceHub/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, email config
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers, constants
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── uploads/            # File uploads
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # API, constants
│   │   └── App.tsx         # Main app
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Docker (optional)

### Using Docker (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd GSTInvoiceHub

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

### Manual Setup

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/request-otp` - Request OTP
- `POST /api/auth/verify-otp` - Verify OTP and login

### Invoices
- `GET /api/invoices` - List invoices (with filters)
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/:id` - Get invoice details
- `PATCH /api/invoices/:id/status` - Update invoice status
- `POST /api/invoices/:id/claim-itc` - Claim ITC

### Payments
- `GET /api/payments` - List payments
- `POST /api/payments` - Record payment

### Credit/Debit Notes
- `GET /api/notes` - List notes
- `POST /api/notes` - Create note

### Inventory
- `GET /api/inventory` - List inventory
- `POST /api/inventory` - Add item
- `PATCH /api/inventory/:id` - Update item

### GST Returns
- `GET /api/gst-returns/gstr1?period=MM-YYYY` - Generate GSTR-1
- `GET /api/gst-returns/gstr3b?period=MM-YYYY` - Generate GSTR-3B
- `GET /api/gst-returns/gstr1/export` - Export GSTR-1 as CSV

### Mock GSTN
- `POST /api/mock-gstn/generate-irn` - Generate mock IRN
- `GET /api/mock-gstn/gstr2a` - Fetch mock GSTR-2A
- `GET /api/mock-gstn/taxpayer/:gstin` - Get taxpayer details

---

## Demo Credentials

For hackathon demo purposes:

**Sample Users:**
- Seller: `seller@example.com` / Password: `seller123` / GSTIN: `27AABCU9603R1ZM`
- Buyer: `buyer@example.com` / Password: `buyer123` / GSTIN: `07AABCZ1234A1Z2`
- Admin: `admin@example.com` / Password: `admin123`

**Mock OTP:** `123456`

---

## Database Schema

### Core Entities
- **User** - Businesses (sellers/buyers)
- **Invoice** - B2B invoices with GST fields
- **InvoiceItem** - Line items with HSN codes
- **CreditDebitNote** - Credit/Debit notes
- **Payment** - Payment records
- **Inventory** - Product stock
- **Notification** - User notifications
- **GstReturn** - Generated return summaries

---

## Features Roadmap

### MVP (Completed for Hackathon)
- User registration with GSTIN validation
- Invoice CRUD with GST calculation
- Real-time status updates via WebSockets
- Basic inventory management
- GSTR-1 and GSTR-3B generation
- Payment tracking
- Credit/Debit notes

### Future Enhancements
- E-Way Bill integration
- Multi-GSTIN support
- Advanced analytics dashboard
- Mobile app
- GSTN API integration (production)
- E-Invoice QR code generation
- Automated reconciliation

---

## Team

Built with for **HackHorizon 2K26**

---

## License

MIT License - See [LICENSE](LICENSE) for details

---

## Support

For issues or questions, please contact the development team.

---

**Happy Invoicing!**
