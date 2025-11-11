# 🏠 Hostel Leave Management System

A digital platform for college hostel leave management with multi-role workflows and real-time tracking.

##  Features

- **Multi-role System**: Student, Parent, Advisor, Warden & Admin dashboards
- **Dual Workflows**: Normal & emergency leave processing  
- **QR E-Passes**: Digital authorization for campus movement
- **Real-time Tracking**: Live status updates and approvals
- **Document Management**: PDF proof upload and verification

##  Tech Stack

**Frontend**: React 19 + Vite  
**Backend**: Node.js + Express + PostgreSQL  
**Security**: JWT + Role-based access control

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

### Frontend
```bash
cd frontend  
npm install
npm run dev
# Runs on http://localhost:5173
```

##  Workflows

**Normal**: Student → Parent → Advisor → Warden  
**Emergency**: Student → Warden (Direct)

##  User Roles

- **Students**: Apply & track leaves
- **Parents**: Approve & confirm safety & upload proof in case of emergency leave  
- **Advisors**: Approving leaves & verifying proof uploads
- **Wardens**: Approve, Reject or schedule meeting with students
- **Admins**: Generate reports and overview of the system

---

