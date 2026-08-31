
# DayCare Connect

## A Smart Daycare Management & Parent Communication Platform

DayCare Connect is a MERN stack web application designed to simplify daycare management and improve communication between parents and daycare providers.

The platform acts as a bridge between parents and verified daycare centers, allowing parents to discover nearby daycare facilities, check seat availability, submit enrollment requests, make online payments, communicate with daycare staff, and manage their children's daycare information.

Daycare owners can manage their daycare centers, enrollments, staff accounts, payments, and parent interactions through a dedicated dashboard. A Super Admin panel is provided to verify daycare registrations and manage the platform.

The application follows a role-based architecture with separate access permissions for **Parents, Daycare Owners, Daycare Staff, and Super Admins**.

---

## Core Features

### 1. Daycare Management

Daycare owners can:

* Register their daycare center
* Manage daycare profile information
* Update facilities and daycare details
* Manage seat availability
* Manage daycare location and other essential information

### 2. Parent & Child Management

Parents can:

* Create and manage their profile
* Add multiple children
* Update child information
* View and manage enrollment records

### 3. Enrollment Management

Parents can:

* Browse available daycare centers
* Submit enrollment requests
* Track enrollment status

Daycare owners can:

* View enrollment requests
* Approve or reject requests
* Manage enrolled children

---

# Advanced Features

### Location-Based Daycare Search

Parents can search for nearby daycare centers based on their current location.

The system uses location-based search to display nearby daycare centers according to distance.

### Real-Time Seat Availability

Daycare seat availability can be displayed based on the selected age group, helping parents understand the current availability before submitting an enrollment request.

### Enrollment Request & Approval

Parents can submit enrollment requests for their children.

Daycare owners can review the requests and approve or reject them. Once an enrollment is approved, the parent can proceed with the online payment process.

### Online Payment

Parents can complete enrollment payments through the integrated payment gateway.

**Payment Gateway:** Razorpay (Test Mode)

### Verified Reviews & Ratings

Parents with confirmed enrollments can submit reviews and ratings for daycare centers.

This helps maintain authentic feedback from parents who have actually used the daycare service.

### Super Admin Verification

Daycare registrations are reviewed by the Super Admin before being listed on the platform.

The Super Admin can:

* Review daycare registrations
* Approve daycare centers
* Reject daycare registrations
* Monitor verified daycare centers

### Live Chat

A real-time messaging system allows parents and daycare staff to communicate directly.

The chat functionality is implemented using **Socket.IO**.

### Video Call Request

Parents can send video call requests to daycare staff.

Daycare staff can receive the requests in real time and accept or reject them.

The video communication functionality is implemented using **WebRTC**.

### Daycare Staff Management

Daycare owners can create separate staff accounts.

Staff members have their own login credentials and access to a dedicated dashboard with limited permissions.

Staff can:

* View assigned children
* Communicate with parents
* Manage video call requests
* View child information based on their permissions

---

# User Roles

## Parent

Parents can:

* Register and login
* Manage their profile
* Add and manage children
* Search nearby daycare centers
* View daycare details
* Check seat availability
* Submit enrollment requests
* Track enrollment status
* Complete online payments
* Communicate with daycare staff through Live Chat
* Request video calls
* Submit verified reviews and ratings

## Daycare Owner

Daycare owners can:

* Register and manage daycare centers
* Manage daycare information
* Manage seat availability
* View enrollment requests
* Approve or reject enrollment requests
* Create and manage staff accounts
* View payment information
* Communicate with parents

## Daycare Staff

Daycare staff can:

* Login securely using staff credentials
* Access their dedicated dashboard
* View assigned children
* Communicate with parents
* Manage video call requests
* View child information with limited permissions

## Super Admin

Super Admins can:

* Verify daycare registrations
* Approve or reject daycare listings
* Monitor the platform
* Manage verified daycare centers

---

# Authentication & Security

The application implements role-based authentication and authorization.

### Authentication

* JWT-based authentication
* Access token and refresh token mechanism
* Role-based access control
* Secure staff authentication
* Protected API routes

### Additional Security

* Backend request validation
* Frontend form validation
* API rate limiting
* Secure environment variable management
* MongoDB transactions for critical operations

---

# Technology Stack

## Frontend

* React
* Vite
* React Router
* Redux Toolkit
* Axios
* Bootstrap / CSS

## Backend

* Node.js
* Express.js
* REST API

## Database

* MongoDB
* Mongoose
* MongoDB Atlas

## Authentication

* JSON Web Token (JWT)

## Real-Time Communication

* Socket.IO

## Video Communication

* WebRTC

## Payment Gateway

* Razorpay (Test Mode)

---

# Project Architecture

The backend follows an **MVC (Model-View-Controller)** architecture.

```text
DayCare Connect
│
├── Frontend
│   ├── React
│   ├── Redux Toolkit
│   ├── React Router
│   └── Axios
│
├── Backend
│   ├── Routes
│   ├── Controllers
│   ├── Models
│   ├── Middleware
│   └── Services
│
└── Database
    └── MongoDB
```

---

# Project Objective

The primary objective of DayCare Connect is to provide parents with a secure, transparent, and convenient platform for discovering and enrolling their children in verified daycare centers.

The platform also helps daycare providers efficiently manage:

* Daycare information
* Children
* Enrollments
* Staff
* Payments
* Parent communication
* Reviews

By bringing these functionalities together in a single platform, DayCare Connect aims to make daycare management more organized and improve communication between parents and daycare providers.

---

# Future Improvements

The project can be extended with additional features such as:

* Hardware-integrated CCTV monitoring
* Advanced daycare analytics
* Attendance management
* Notifications and alerts
* Additional daycare management tools
* Production-ready payment integration

> **Note:** CCTV monitoring is currently not implemented. The project may provide a CCTV-related option in the interface, but actual live CCTV functionality would require appropriate hardware and infrastructure.

---

# Environment Variables

Create a `.env` file inside the `backend` directory.

Example:

```env
PORT=
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

**Do not commit your ****`.env`**** file to GitHub.**

Add the environment file to `.gitignore`:

```gitignore
.env
```

---

# Installation & Setup

## 1. Clone the Repository

```bash
git clone <your-repository-url>
cd daycare-connect
```

## 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file and configure the required environment variables.

Then start the backend server:

```bash
npm run dev
```

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will then be available through the local development server.

---

#

# Project Status

**Status: Active Development**

The core daycare management, enrollment, authentication, payment, search, review, staff management, real-time communication, and video-call related functionalities are implemented as part of the project.

Some additional features, such as hardware-based CCTV monitoring, are currently not implemented and may be considered for future development.

---

## License

This project is developed for educational and project demonstration purposes.
