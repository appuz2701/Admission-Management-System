# Admission Management System

A comprehensive web-based admission management system for colleges to manage programs, quotas, applicants, and seat allocation with real-time tracking.

##  Features

### Master Setup
- Institution, Campus, and Department management
- Program/Branch configuration
- Academic Year management
- Course Type (UG/PG) and Entry Type (Regular/Lateral)
- Admission Mode (Government/Management)

### Seat Matrix & Quota Management
- Total intake configuration per program
- Quota-wise seat allocation (KCET, COMEDK, Management)
- Real-time seat availability tracking
- Automatic quota validation (prevents overbooking)
- Supernumerary seats support

### Applicant Management
- Comprehensive applicant registration (15 fields)
- Category-based classification (GM/SC/ST/OBC)
- Document checklist with status tracking
- Marks and rank management

### Admission Process
- Government and Management admission flows
- Seat allocation with quota availability check
- Automatic admission number generation
- Format: `INST/YEAR/LEVEL/DEPT/QUOTA/SERIAL`
- Document verification workflow
- Fee status tracking

### Dashboard & Reports
- Total intake vs admitted statistics
- Quota-wise filled seats visualization
- Remaining seats tracking
- Pending documents and fees monitoring
- Real-time updates using Socket.IO

### User Management
- Role-based access control (Admin, Admission Officer, Management)
- User creation and management
- Institution-level user assignment

##  Tech Stack

### Frontend
- React.js
- Redux Toolkit (State Management)
- Ant Design (UI Components)
- Recharts (Data Visualization)
- Axios (HTTP Client)
- Socket.IO Client (Real-time Updates)

### Backend
- Node.js
- Express.js
- MongoDB (Database)
- Mongoose (ODM)
- JWT (Authentication)
- Socket.IO (Real-time Communication)
- bcrypt.js (Password Hashing)

##  Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

##  Installation & Setup

###  IMPORTANT: After Deployment

If you deployed to production and login fails, you need to create the admin user first!

**Quick Fix:**
```bash
# On Render Shell
node seed.js
```

Or use the `setup-admin.html` page. See [QUICK-FIX.md](QUICK-FIX.md) for details.

---

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd admission-management-system
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Update .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/admission_mgmt
# JWT_SECRET=your_secret_key

# Seed database with admin user
node seed.js

# Start backend server
npm start
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup
```bash
cd client
npm install

# Create .env file
cp .env.example .env

# Update .env with backend URL
# REACT_APP_API_URL=http://localhost:5000

# Start frontend
npm start
```

Frontend will run on: `http://localhost:3000`

### 4. Database Migration (Important!)
```bash
cd server
node fix-academic-year-index.js
```

This fixes the academic year unique index to allow same year across different institutions.

##  Default Login Credentials

After running `node seed.js`, use these credentials:

```
Email: admin@college.com
Password: admin123
Role: Admin
```

## User Roles & Permissions

### Admin
- Full system access
- Create institutions, campuses, departments
- Create programs and academic years
- Manage applicants and admissions
- Create and manage users
- View all dashboards

### Admission Officer
- Create and manage applicants
- Allocate seats
- Generate admission numbers
- Confirm admissions
- Update document and fee status
- View dashboards

### Management (View Only)
- View dashboards and reports
- Monitor admission progress
- No create/edit permissions

##  Typical Workflow

### 1. System Setup (Admin)
1. Login as admin
2. Create Institution → Campus → Department
3. Create Academic Year
4. Create Programs with quotas
5. Create Admission Officers (optional)

### 2. Admission Process (Admission Officer)
1. Create applicant with details
2. Allocate seat (system validates quota availability)
3. Verify documents
4. Update fee status to "Paid"
5. Generate admission number
6. Confirm admission

### 3. Monitoring (Management)
1. Login and view dashboard
2. Monitor seat filling progress
3. Track pending documents/fees

##  Key System Rules

1.  Quota seats cannot exceed total intake
2.  No seat allocation if quota is full
3.  Admission number generated only once (immutable)
4. Admission confirmed only if fee is paid
5. Real-time seat counters update automatically

##  Project Structure

```
admission-management-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── redux/         # Redux store & slices
│   │   ├── services/      # API services
│   │   └── styles/        # CSS files
│   └── package.json
│
├── server/                # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── middleware/       # Auth & validation
│   ├── seed.js           # Database seeder
│   └── server.js         # Entry point
│
├── DEPLOYMENT.md         # Deployment guide
└── README.md            # This file
```

 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Create user (Admin only)
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/users` - Get all users (Admin only)

### Institution
- `POST /api/institution/create` - Create institution (Admin)
- `GET /api/institution/list` - Get all institutions
- `POST /api/institution/campus/create` - Create campus (Admin)
- `POST /api/institution/department/create` - Create department (Admin)

### Program
- `POST /api/program/create` - Create program (Admin)
- `GET /api/program/list` - Get all programs
- `POST /api/program/academic-year/create` - Create academic year (Admin)
- `GET /api/program/academic-year/list` - Get academic years

### Applicant
- `POST /api/applicant/create` - Create applicant
- `GET /api/applicant/list` - Get all applicants
- `PATCH /api/applicant/:id/document-status` - Update document status
- `PATCH /api/applicant/:id/fee-status` - Update fee status

### Admission
- `POST /api/admission/allocate-seat` - Allocate seat
- `POST /api/admission/generate-number` - Generate admission number
- `POST /api/admission/confirm` - Confirm admission

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

## AI Assistance Disclosure

This project was developed with assistance from Kiro AI Assistant for:
- Bug fixes and error resolution
- Code review and optimization
- Database migration scripts
- Redux state management improvements
- Frontend error handling (array safety checks)

Self-implemented areas:
- Complete backend architecture and API design
- Database models and relationships
- Seat allocation logic and quota validation
- Admission number generation algorithm
- Frontend UI components and forms
- Real-time updates with Socket.IO
- Dashboard statistics and visualizations
- Authentication and authorization system

## Known Issues & Solutions

### Issue: "rawData.some is not a function"
**Solution**: Already fixed with safe array handling in all components.

### Issue: E11000 duplicate key error for academic year
**Solution**: Run the migration script:
```bash
node server/fix-academic-year-index.js
```

## Testing

### Manual Testing Checklist
- [ ] Admin can create institution, campus, department
- [ ] Admin can create programs with quotas
- [ ] Quota validation prevents overbooking
- [ ] Admission officer can create applicants
- [ ] Seat allocation checks quota availability
- [ ] Admission number is generated correctly
- [ ] Fee payment is required for confirmation
- [ ] Dashboard shows correct statistics
- [ ] Real-time updates work

##  Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick summary:
1. Deploy backend to Render.com
2. Deploy frontend to Vercel
3. Use MongoDB Atlas for database
4. Update environment variables

## License

This project is for educational/assessment purposes.

Author

[Your Name]

 Support

For issues or questions, please contact [your-email@example.com]

---

**Note**: This is a demo application. For production use, additional security measures, testing, and optimizations are recommended.
