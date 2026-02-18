# WedPlanner Technical Architecture Document

## 1. Project Overview

**Platform Name:** WedPlanner
**Target Market:** Turkey (Primary), with future international expansion capability.
**Core Value:** End-to-end wedding planning with a unique vendor bidding system, culturally nuanced guest management (separate Bride/Groom lists), and an AI assistant ("Aria") for anxiety detection and support.

### Key Differentiators & Technical Implications
1.  **Vendor Bidding System:** Requires a robust state machine for bid lifecycles (Requested -> Bid Submitted -> Accepted/Rejected -> Contracted).
2.  **Separate Guest Lists:** Strict data isolation and permission logic between "Bride Side" and "Groom Side" users within the same Wedding entity.
3.  **AI Assistant (Aria):** Integration with OpenAI GPT-4 for conversational interface and background sentiment analysis on user interactions.
4.  **Cultural Customization:** Database schema must support diverse wedding templates (Turkish, Muslim, Christian, Jewish, LGBTQ+) affecting timeline structures and terminology.

---

## 2. Tech Stack Recommendation

We will utilize a **Unified Full-Stack TypeScript** architecture to maximize code sharing, type safety, and developer velocity for a small team (2-4 developers).

### Frontend (Web & Future Mobile)
*   **Framework:** **Next.js 14+ (App Router)** - React framework for SEO, performance, and rapid development.
*   **Language:** TypeScript - For strict type safety across the stack.
*   **State Management:** **Zustand** - Lightweight, scalable state management without Redux complexity.
*   **UI Component Library:** **shadcn/ui** (built on Tailwind CSS & Radix UI) - Highly customizable, accessible, and supports rapid prototyping.
*   **Styling:** **Tailwind CSS** - Utility-first CSS for responsive, mobile-first design.
*   **Data Fetching:** **TanStack Query (React Query)** - For managing server state, caching, and optimistic updates.
*   **Mobile Strategy:** Responsive web app initially. API-first design ensures the backend is ready for a future **React Native** mobile app.

### Backend (API & Business Logic)
*   **Runtime:** **Node.js** - Unified language stack.
*   **Framework:** **NestJS** or **Fastify** (with Typebox). *Recommendation: **NestJS*** for its modular architecture, which enforces the "Modular Monolith" structure requested, or a well-structured **Express/Fastify** app with strict controller-service-repository layering. Given the small team preference for simplicity, we will document a **Modular Monolith using Fastify/Express + tRPC or standard REST**.
*   **API Paradigm:** **RESTful API** - Standard, easy to consume by future mobile apps.
*   **Authentication:** **NextAuth.js (Auth.js)** - Handles sessions, social logins, and JWTs securely.
*   **Real-time:** **Supabase Realtime** or **Socket.io** - For chat, live bid updates, and "Aria" interactions.

### Database & Storage
*   **Database:** **PostgreSQL** - Relational data integrity is crucial for bookings, financial transactions, and complex relationships (weddings <-> users <-> vendors).
*   **Hosting/Platform:** **Supabase** - Provides managed Postgres, Auth, Realtime subscriptions, and Storage out of the box.
*   **ORM:** **Prisma** - Best-in-class TypeScript ORM for type-safe database access and migrations.
*   **File Storage:** **Cloudinary** - Optimized image delivery, transformations, and Turkish CDN presence.

### DevOps & Infrastructure
*   **Frontend Hosting:** **Vercel** - Optimized for Next.js.
*   **Backend Hosting:** **Railway** or **Render** - Simple deployment for Node.js services/workers.
*   **CI/CD:** GitHub Actions.

### Third-Party Services (Turkey Specific)
*   **Payments:** **iyzico** (Primary for Turkey) + **Stripe** (International backup).
*   **SMS:** **Netgsm** or **iletimerkezi** (Turkish providers).
*   **Email:** **Resend** (Developer-friendly transactional emails).
*   **AI:** **OpenAI API (GPT-4)** - For "Aria" logic and sentiment analysis.
*   **Analytics:** **PostHog** - Privacy-friendly product analytics.

---

## 3. Database Schema (Prisma)

The schema is designed to handle the complex relationships of a wedding platform, specifically separating guest lists and managing the vendor bidding lifecycle.

```prisma
// This is a conceptual schema definition

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?
  fullName      String
  phone         String?
  role          UserRole  @default(COUPLE) // COUPLE, VENDOR, ADMIN
  createdAt     DateTime  @default(now())

  // Relations
  weddings      WeddingRole[] // Users can be Bride, Groom, or Planner for a wedding
  vendorProfile VendorProfile? // If role is VENDOR
  messages      Message[]
}

enum UserRole {
  COUPLE
  VENDOR
  ADMIN
}

// Join table to handle permissions (Bride vs Groom)
model WeddingRole {
  id        String   @id @default(uuid())
  userId    String
  weddingId String
  role      WeddingSide // BRIDE, GROOM, PLANNER

  user      User     @relation(fields: [userId], references: [id])
  wedding   Wedding  @relation(fields: [weddingId], references: [id])
}

enum WeddingSide {
  BRIDE
  GROOM
  JOINT // For planners or shared accounts
}

model Wedding {
  id          String   @id @default(uuid())
  name        String   // e.g., "Ayşe & Mehmet's Wedding"
  date        DateTime?
  culture     String   // "Turkish", "Western", "Indian", etc.
  budgetTotal Decimal?

  // Relations
  roles       WeddingRole[]
  guests      Guest[]
  tasks       Task[]
  budgetItems BudgetItem[]
  bids        BidRequest[]

  createdAt   DateTime @default(now())
}

model Guest {
  id             String      @id @default(uuid())
  weddingId      String
  fullName       String
  email          String?
  phone          String?
  side           GuestSide   // BRIDE_SIDE, GROOM_SIDE
  rsvpStatus     RsvpStatus  @default(PENDING)
  dietaryNotes   String?
  tableAssignment String?

  wedding        Wedding     @relation(fields: [weddingId], references: [id])
}

enum GuestSide {
  BRIDE_SIDE
  GROOM_SIDE
}

enum RsvpStatus {
  PENDING
  ACCEPTED
  DECLINED
}

model VendorProfile {
  id              String   @id @default(uuid())
  userId          String   @unique
  businessName    String
  category        VendorCategory
  description     String
  city            String
  pricingTier     String
  rating          Float    @default(0)

  // Subscription / Commission info
  subscriptionStatus SubscriptionStatus @default(FREE)
  commissionRate     Decimal            @default(8.0) // Percentage

  user            User     @relation(fields: [userId], references: [id])
  bids            Bid[]
  invoices        Invoice[]
}

enum VendorCategory {
  VENUE
  CATERING
  PHOTOGRAPHY
  MUSIC
  FLORIST
  DECOR
  OTHER
}

enum SubscriptionStatus {
  FREE
  PREMIUM
}

// Couples create a request (e.g., "Need photographer for 8 hours")
model BidRequest {
  id          String   @id @default(uuid())
  weddingId   String
  category    VendorCategory
  title       String
  description String
  maxBudget   Decimal?
  status      RequestStatus @default(OPEN)

  wedding     Wedding  @relation(fields: [weddingId], references: [id])
  bids        Bid[]    // Offers from vendors
}

enum RequestStatus {
  OPEN
  CLOSED
  FULFILLED
}

// Vendors submit bids
model Bid {
  id            String   @id @default(uuid())
  requestId     String
  vendorId      String
  amount        Decimal
  proposalText  String
  status        BidStatus @default(PENDING)
  createdAt     DateTime  @default(now())

  request       BidRequest    @relation(fields: [requestId], references: [id])
  vendor        VendorProfile @relation(fields: [vendorId], references: [id])
  invoices      Invoice[]
}

enum BidStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
}

model Invoice {
  id          String   @id @default(uuid())
  vendorId    String
  bidId       String?
  amount      Decimal
  commission  Decimal  // Calculated commission amount
  status      PaymentStatus @default(PENDING)
  dueDate     DateTime

  vendor      VendorProfile @relation(fields: [vendorId], references: [id])
  bid         Bid?          @relation(fields: [bidId], references: [id])
}

enum PaymentStatus {
  PENDING
  PAID
  OVERDUE
  CANCELLED
}

model Task {
  id          String     @id @default(uuid())
  weddingId   String
  title       String
  dueDate     DateTime?
  status      TaskStatus @default(TODO)
  assignedTo  String?    // User ID (Bride, Groom, or Planner)

  wedding     Wedding    @relation(fields: [weddingId], references: [id])
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  DONE
}

model BudgetItem {
  id          String   @id @default(uuid())
  weddingId   String
  category    String   // e.g., "Venue", "Dress"
  name        String
  estimated   Decimal
  actual      Decimal?
  paid        Decimal? @default(0)

  wedding     Wedding  @relation(fields: [weddingId], references: [id])
}

model Table {
  id          String   @id @default(uuid())
  weddingId   String
  name        String   // e.g., "Table 1", "Head Table"
  capacity    Int

  wedding     Wedding  @relation(fields: [weddingId], references: [id])
  guests      Guest[]
}

model Message {
  id          String   @id @default(uuid())
  senderId    String
  receiverId  String   // Can be User ID or a Group ID
  content     String
  sentiment   String?  // AI Analysis: "Anxious", "Happy", "Neutral"
  createdAt   DateTime @default(now())

  sender      User     @relation(fields: [senderId], references: [id])
}
```

---

## 4. User Roles & Permissions

We implement a **Role-Based Access Control (RBAC)** system combined with **Resource-Based Access Control**.

### 1. Bride (Couple Role)
*   **Scope:** Specific Wedding ID via `WeddingRole`.
*   **Permissions:**
    *   **Guests:** Full CRUD on `Guest` where `side == BRIDE_SIDE`. Read-only or hidden for `side == GROOM_SIDE` (configurable).
    *   **Budget:** Full Access.
    *   **Vendors:** Can post `BidRequest`, view `Bid`, accept/reject `Bid`.
    *   **Chat:** Can chat with Vendors and Groom.

### 2. Groom (Couple Role)
*   **Scope:** Specific Wedding ID via `WeddingRole`.
*   **Permissions:**
    *   **Guests:** Full CRUD on `Guest` where `side == GROOM_SIDE`.
    *   **Budget:** Full Access.
    *   **Vendors:** Same as Bride.

### 3. Vendor
*   **Scope:** Global (Public Profile) + Specific Bids.
*   **Permissions:**
    *   **Profile:** Manage own business profile/portfolio.
    *   **Bids:** View open `BidRequest` in their category. Submit `Bid`.
    *   **Messages:** Can only message couples who have initiated contact or accepted a bid.

### 4. Admin
*   **Scope:** System-wide.
*   **Permissions:** User management, Dispute resolution, Content moderation, Analytics view.

---

## 5. API Endpoints Structure (REST)

Grouped by domain (Modular Monolith structure).

### Authentication (`/api/auth`)
*   `POST /register` - Register new User (Couple or Vendor).
*   `POST /login` - Authenticate.
*   `POST /refresh-token` - Refresh JWT.
*   `POST /reset-password` - Request password reset email.

### Weddings (`/api/weddings`)
*   `POST /` - Create a new wedding.
*   `GET /:id` - Get wedding details.
*   `PUT /:id/settings` - Update culture, date, etc.
*   `POST /:id/invite-partner` - Invite the other partner (Bride/Groom).

### Guests (`/api/weddings/:weddingId/guests`)
*   `GET /` - List guests (filters: side, rsvp_status). *Middleware enforces side visibility.*
*   `POST /` - Add guest.
*   `PUT /:guestId` - Update guest (RSVP, meal).
*   `DELETE /:guestId` - Remove guest.
*   `POST /import` - Bulk import (CSV/Contacts).

### Budget (`/api/weddings/:weddingId/budget`)
*   `GET /` - Get budget summary and items.
*   `POST /item` - Add budget item.
*   `PUT /item/:itemId` - Update planned/actual cost.

### Tasks (`/api/weddings/:weddingId/tasks`)
*   `GET /` - List tasks.
*   `POST /` - Create task.
*   `PUT /:taskId` - Update status/assignee.
*   `DELETE /:taskId` - Delete task.

### Seating (`/api/weddings/:weddingId/seating`)
*   `GET /tables` - List all tables and assigned guests.
*   `POST /tables` - Create a table.
*   `PUT /tables/:tableId` - Update capacity/name.
*   `POST /assign` - Assign guest to table.

### Messages (`/api/messages`)
*   `GET /` - List conversation threads.
*   `GET /:threadId` - Get messages in a thread.
*   `POST /` - Send a message to a vendor or user.

### Vendor Marketplace (`/api/vendors`)
*   `GET /` - Search vendors (filters: category, city, price).
*   `GET /:id` - Public profile details.

### Bidding System (`/api/bids`)
*   `POST /requests` - (Couple) Create a service request.
*   `GET /requests` - (Vendor) Feed of open requests matching category.
*   `POST /requests/:requestId/submit` - (Vendor) Submit a proposal.
*   `PUT /:bidId/status` - (Couple) Accept/Reject bid.

### AI Assistant - Aria (`/api/ai`)
*   `POST /chat` - Send message to Aria. Returns GPT-4 response + sentiment analysis.
*   `POST /analyze-sentiment` - Background job to analyze recent user activity for anxiety detection.

### Payments (`/api/payments`)
*   `POST /checkout` - Initialize iyzico/Stripe checkout session (Premium sub or Deposit).
*   `POST /webhook` - Handle payment success/failure events.

---

## 6. Folder Structure (Modular Monolith)

Recommended structure for a Next.js (Frontend) + Node/Express (Backend) Monorepo.

```
/wedplanner-monorepo
├── /apps
│   ├── /web (Next.js - Frontend)
│   │   ├── /app             # App Router pages
│   │   ├── /components      # Shared UI (shadcn)
│   │   ├── /lib             # API clients, utils
│   │   ├── /hooks           # Custom React hooks
│   │   ├── /store           # Zustand stores
│   │   └── /public          # Static assets
│   │
│   └── /api (Node.js/Express - Backend)
│       ├── /src
│       │   ├── /config      # Env vars, DB config
│       │   ├── /modules     # Modular Monolith Domains
│       │   │   ├── /auth
│       │   │   ├── /wedding
│       │   │   ├── /guest
│       │   │   ├── /vendor
│       │   │   ├── /payment
│       │   │   └── /ai
│       │   ├── /shared      # Shared middlewares, utils
│       │   └── /jobs        # Background jobs (sentiment analysis)
│       ├── /prisma          # Database Schema & Migrations
│       └── package.json
│
├── /packages
│   ├── /ui                  # Shared UI library (optional)
│   └── /types               # Shared TypeScript interfaces
│
├── package.json             # Workspace config
└── README.md
```

### Key Directories within Modules (`/api/src/modules/guest`)
*   `guest.controller.ts` - HTTP endpoint definitions.
*   `guest.service.ts` - Business logic (e.g., "Check if user is Groom before returning Groom side list").
*   `guest.schema.ts` - Zod/Typebox validation schemas.

---

## 7. Third-Party Integrations & Implementation Strategy

### 1. Payment Processing (iyzico)
*   **Strategy:** Use iyzico's Node.js SDK for processing credit cards in Turkey.
*   **Flow:**
    1.  Vendor accepts a booking -> Invoice created (Pending).
    2.  Couple pays deposit -> Funds held or split (if marketplace supports split payments) or sent to Vendor minus commission.
    3.  System updates Invoice status -> `PAID`.
    4.  Platform records 8% commission revenue.

### 2. SMS Notifications (Netgsm)
*   **Usage:** OTP for login, Booking Confirmations, Urgent Reminders.
*   **Implementation:** Create a generic `NotificationService` interface. Implement `NetgsmAdapter`.
*   **Fallback:** If Netgsm fails, fallback to `iletimerkezi`.

### 3. AI Assistant (Aria)
*   **Engine:** OpenAI `gpt-4-turbo`.
*   **Context Management:**
    *   Store last 10-20 messages in Redis or Postgres for immediate context.
    *   System Prompt: "You are Aria, a calming and organized wedding assistant. The user is [User Name], wedding date is [Date]. Current anxiety level detected: [Level]."
*   **Sentiment Analysis:**
    *   Running a lightweight analysis (using a cheaper model like `gpt-3.5-turbo` or a local NLP library) on user messages to detect keywords ("stressed", "panic", "too expensive").
    *   **Trigger:** If anxiety > Threshold -> Trigger "Calm Down" flow or suggest a task breakdown.

### 4. Image Handling (Cloudinary)
*   **Usage:** Vendor portfolios, Inspiration boards.
*   **Optimization:** Auto-format to WebP/AVIF.
*   **Upload:** Signed uploads directly from Frontend (prevents server load), utilizing Cloudinary's React SDK.

### 5. Maps & Location (Google Maps API)
*   **Usage:** Displaying venue locations, calculating distances for vendors, and guest directions.
*   **Implementation:** `react-google-maps/api` for Frontend components.
*   **Key APIs:** Maps JavaScript API, Places API (for venue search/autocomplete), Directions API.
