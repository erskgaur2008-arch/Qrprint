# Demo Public School Multi-School CRM — Master AI Build Prompt

Build a production-ready, modern, responsive **multi-school SaaS School CRM platform** named **SchoolConnect CRM**, with the first demo tenant configured as:

- **School Name:** Demo Public School
- **Admin:** Santraj
- **Address:** 123, Sector 46-A, Chandigarh
- **Logo:** Not available yet — use an elegant temporary school emblem that can be replaced later.

> **IMPORTANT:** The platform must be designed as a true **multi-school SaaS** from the beginning. Do not build a single-school application and retrofit multi-tenancy later.
>
> Every school must have isolated data using `school_id` / `tenant_id` and strict database-level security.

---

## 1. TECHNOLOGY

### Web
- Next.js
- React
- TypeScript
- Tailwind CSS
- Responsive design
- Reusable component architecture

### Backend
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Storage
- Row Level Security (RLS)
- Realtime where useful

### Hosting
- Vercel

### Mobile
- React Native + Expo
- One mobile application with role-based interfaces for:
  - Admin
  - Teacher
  - Parent
- Prepare the architecture for Android and iOS

---

## 2. DESIGN DIRECTION

Create an original design inspired by the visual principles of the reference school website:

**Reference:** https://www.kis.edu.in/

Do **not** copy its source code, logo, exact layout, exact text, images, branding, or proprietary visual assets.

Use the following general design characteristics:

- Premium educational institution appearance
- Strong visual hierarchy
- Large visual/photography areas
- Clean white/light backgrounds
- Elegant school-oriented typography
- Strong but tasteful accent colour
- Rounded cards
- Spacious sections
- Large headings
- Short descriptive text
- Clear CTA buttons
- Image + text storytelling
- Prominent statistics
- Feature cards
- News/events cards
- Testimonials
- Gallery
- Affiliation/partner section
- Mobile-first responsive design
- Professional but warm visual personality

### Original colour system

Use a configurable theme so each school can later have its own branding.

Suggested initial palette:

| Purpose | Colour |
|---|---|
| Primary | `#173B63` |
| Secondary | `#245EA8` |
| Accent | `#E7B84B` |
| Background | `#F7F9FC` |
| Surface | `#FFFFFF` |
| Text | `#172033` |
| Muted Text | `#667085` |
| Success | `#16845B` |
| Warning | `#D98A19` |
| Danger | `#D64545` |

Allow each school to configure:

- Primary colour
- Secondary colour
- Accent colour
- Logo
- School name
- School tagline
- Favicon
- Contact information

---

# 3. PLATFORM STRUCTURE

Create two major applications:

1. **SaaS Web Application**
2. **Mobile Application**

### Web roles

- Super Admin
- School Admin
- Teacher
- Accountant
- Receptionist
- Other Staff

### Mobile roles

- Admin
- Teacher
- Parent

Prepare the architecture so a Student login can be added later.

---

# 4. SUPER ADMIN

Create a premium SaaS administration dashboard.

### Navigation

- Dashboard
- Schools
- Subscriptions
- Plans
- Users
- Platform Reports
- System Settings
- Audit Logs

### Dashboard cards

- Total Schools
- Active Schools
- Trial Schools
- Total Students
- Total Teachers
- Total Parents
- Monthly Revenue
- Pending Subscriptions

### School management

- Create school
- Edit school
- Activate/deactivate school
- School profile
- School branding
- School administrator
- Academic sessions
- Subscription plan
- Usage statistics

Super Admin access must be explicitly permission-controlled and audited.

---

# 5. SCHOOL ADMIN DASHBOARD

Create a visually impressive school dashboard.

### Header

- School logo
- School name
- Academic session
- Notification icon
- User profile
- Settings

### Dashboard cards

- Total Students
- Total Teachers
- Today's Attendance
- Pending Fees
- Today's Collection
- New Admissions
- Pending Enquiries
- Leave Requests

### Charts

- Student attendance trend
- Monthly fee collection
- Admission enquiry pipeline
- Class-wise student strength

### Quick actions

- Add Student
- New Admission
- Collect Fee
- Mark Attendance
- Create Notice
- Add Teacher

---

# 6. STUDENT CRM

Create complete student profiles.

### Basic information

- Student ID
- Admission Number
- Name
- Photo
- Date of Birth
- Gender
- Blood Group
- Class
- Section
- Roll Number
- Academic Session
- Address
- Admission Date
- Status

### Parent/Guardian

- Father
- Mother
- Guardian
- Phone
- Email
- Address
- Occupation

### Student profile tabs

- Overview
- Parents
- Attendance
- Fees
- Homework
- Exams
- Marks
- Documents
- Transport
- Communication
- Activity History

### Student lifecycle

`Enquiry → Applicant → Admitted → Active → Promoted → Transferred → Graduated / Inactive`

---

# 7. ADMISSION CRM

Create a complete admission pipeline.

### Pipeline stages

1. New Enquiry
2. Contacted
3. Interested
4. Visit Scheduled
5. Application Started
6. Application Submitted
7. Document Verification
8. Entrance Test
9. Approved
10. Fee Pending
11. Admitted
12. Lost
13. Future Follow-up

### Enquiry fields

- Enquiry ID
- Student Name
- Parent Name
- Phone
- Email
- Class Applying For
- Source
- Counsellor
- Status
- Next Follow-up
- Notes
- Created Date

Create:

- Kanban view
- Table view
- Calendar follow-up view

Actions:

- Call
- WhatsApp
- Email
- Note
- Follow-up
- Appointment

Create automatic follow-up reminders.

---

# 8. PARENT MANAGEMENT

One parent can have multiple children.

Example:

```text
Parent
├── Child 1
├── Child 2
└── Child 3
```

Parent profile:

- Name
- Phone
- Email
- Address
- Occupation
- Children
- Communication history

---

# 9. TEACHER MANAGEMENT

Teacher profile:

- Employee ID
- Name
- Photo
- Department
- Designation
- Subjects
- Classes
- Sections
- Phone
- Email
- Joining Date
- Documents

Teacher dashboard must show only assigned classes and authorized information.

---

# 10. ATTENDANCE

## Student attendance

Support:

- Class
- Section
- Date
- Student
- Present
- Absent
- Late
- Leave

Reports:

- Daily attendance
- Monthly calendar
- Attendance percentage
- Class reports
- Student attendance history

### Teacher workflow

```text
Login
  ↓
Select Class
  ↓
Select Section
  ↓
Student List
  ↓
Mark Attendance
  ↓
Submit
  ↓
Confirmation
```

## Staff attendance

Prepare integration with the previously planned QR/PIN attendance workflow:

```text
First punch of day = PUNCH IN
Next punch = PUNCH OUT
Next punch = PUNCH IN
Next punch = PUNCH OUT
```

Support multiple IN/OUT cycles and calculate working hours automatically.

---

# 11. FEES

Create complete fee management.

### Fee structure

- Admission Fee
- Tuition Fee
- Annual Fee
- Transport Fee
- Activity Fee
- Examination Fee
- Other Charges

### Student fee ledger

- Total
- Discount
- Paid
- Balance
- Due Date
- Status

### Payment workflow

```text
Fee Due
  ↓
Reminder
  ↓
Payment
  ↓
Receipt
  ↓
Ledger Update
```

Support:

- Online payment integration
- Manual payment
- Cash
- UPI
- Bank transfer
- Receipt generation
- PDF receipt
- Payment history

---

# 12. TEACHER MOBILE APPLICATION

Create a mobile-first teacher interface.

### Bottom navigation

`Home | Classes | Attendance | Homework | More`

### Teacher Home

- Today's Classes
- Attendance Tasks
- Pending Homework
- Upcoming Exams
- Notices

### Teacher actions

- View assigned classes
- View students
- Mark attendance
- Create homework
- Upload attachments
- Enter marks
- View timetable
- Apply leave
- Read notices
- Receive notifications

Teacher must not access unrelated school data.

---

# 13. PARENT MOBILE APPLICATION

Create a simple premium parent mobile interface.

### Bottom navigation

`Home | Children | Fees | Homework | More`

### Parent Home

- Child selector
- Today's attendance
- Pending fees
- Homework
- Latest notice
- Upcoming event

### Parent functions

- View children
- View attendance
- View fees
- Pay fees
- Download receipts
- View homework
- View results
- View report cards
- View timetable
- Apply leave
- Receive notifications
- View notices
- Contact school

A parent must only see their own children.

---

# 14. COMMUNICATION

Create:

- Notices
- Announcements
- Push Notifications
- Email
- SMS integration placeholder
- WhatsApp integration placeholder

### Notification categories

- Attendance
- Fees
- Homework
- Exam
- Result
- Leave
- Notice
- Event
- Admission

Create notification history.

---

# 15. ACADEMICS

Create:

- Academic Years
- Classes
- Sections
- Subjects
- Teachers
- Teacher Assignments
- Timetable
- Exams
- Marks
- Report Cards
- Homework

---

# 16. EVENTS AND NEWS

Use an original school-storytelling approach inspired by premium school websites.

Create:

- School News
- Events
- Celebrations
- Achievements
- Workshops
- Activities
- Gallery

### Card design

- Large image
- Category
- Date
- Title
- Short description
- Read More

Create featured story cards.

---

# 17. PUBLIC SCHOOL WEBSITE

Each school should optionally have its own public-facing website.

For Demo Public School create:

### Hero

- School branding
- Large visual
- School tagline
- Admissions CTA
- Parent Login
- Teacher Login

Example original headline:

**“Growing Minds. Inspiring Futures.”**

### Public sections

- About School
- Why Choose Us
- Academic Excellence
- Holistic Development
- Campus & Facilities
- Activities
- News & Events
- Statistics
- Gallery
- Testimonials
- Achievements
- Admissions
- Contact
- Footer

### CTA buttons

- Apply for Admission
- Parent Login
- Teacher Login
- Contact School

Do not copy text from the reference website.

---

# 18. VISUAL DESIGN

Use:

- Premium cards
- Soft shadows
- 14–18px corner radius
- Clean spacing
- Large headings
- Elegant typography
- Smooth hover states
- Subtle animations
- Skeleton loading
- Empty states
- Toast notifications
- Confirmation dialogs
- Responsive tables
- Mobile-friendly forms
- Accessible buttons
- Keyboard navigation

Avoid:

- Cluttered dashboards
- Excessive gradients
- Excessive animation
- Tiny text
- Huge complicated menus
- Generic template appearance

The result should feel like a polished combination of a **premium education website and modern SaaS dashboard**.

---

# 19. DATABASE / MULTI-TENANCY

Every tenant-owned table must contain `school_id`.

### Core tables

```text
schools
school_settings
school_branding
school_users
roles
permissions
user_roles

academic_years

students
parents
student_parents
teachers
staff

classes
sections
subjects
teacher_assignments

student_attendance
staff_attendance
attendance_punches

admission_enquiries
admission_applications
follow_ups

fee_structures
student_fees
payments
receipts

leave_requests

exams
marks
report_cards

homework
timetables

notices
events
notifications
documents

vehicles
routes
stops
student_transport

books
book_transactions

subscriptions
subscription_plans

audit_logs
```

Implement:

- Proper foreign keys
- Indexes
- Constraints
- Timestamps
- Soft-delete/status fields where appropriate
- Audit history for important operations

---

# 20. SECURITY

Use Supabase Row Level Security.

### Access rules

#### Super Admin
Platform-level access according to explicit permissions.

#### School Admin
Only their school.

#### Teacher
Only their school and assigned/authorized classes.

#### Parent
Only their own children.

Never rely only on frontend hiding.

Use database-level authorization.

Do not use editable user metadata as the primary authorization mechanism.

Never expose:

- Supabase service-role key
- Server secrets
- Payment secret keys
- Other privileged credentials

to browser or mobile clients.

---

# 21. MULTI-SCHOOL SAAS

Create a true tenant architecture.

Example:

```text
Platform
├── School A
├── School B
├── School C
└── School D
```

When a school is selected:

```text
Active School
     ↓
school_id
     ↓
Dashboard
     ↓
Students / Teachers / Parents / Fees / Attendance / etc.
```

All queries and mutations must respect the active tenant.

### School isolation

```text
School A User
    ↓
School A data only

School B User
    ↓
School B data only
```

Cross-school access must be denied unless explicitly authorized by the platform-level permission model.

---

# 22. SCHOOL BRANDING

Each school can configure:

- School name
- Logo
- Favicon
- Primary colour
- Secondary colour
- Accent colour
- Tagline
- Address
- Phone
- Email
- Website
- Social media links

Changing the school name later must automatically update relevant:

- Dashboards
- Public website
- Receipts
- Reports
- Notifications
- App branding
- Documents

No code change should be required.

---

# 23. SUBSCRIPTION SYSTEM

Make the platform SaaS-ready.

### School subscription

```text
School
  ↓
Subscription Plan
  ↓
Trial / Active / Past Due / Suspended / Cancelled
```

Create:

- Subscription plans
- Feature limits
- Student limits
- Teacher limits
- Storage limits
- Module access
- Trial period
- Subscription status
- Billing history

Example feature tiers:

| Feature | Basic | Standard | Premium |
|---|---:|---:|---:|
| Students | Limited | More | Large |
| Teachers | Yes | Yes | Yes |
| Parent App | Yes | Yes | Yes |
| Attendance | Yes | Yes | Yes |
| Fees | Yes | Yes | Yes |
| Admissions CRM | — | Yes | Yes |
| Transport | — | Yes | Yes |
| Library | — | — | Yes |
| Advanced Reports | — | Yes | Yes |

These are product-design examples; keep limits configurable.

---

# 24. REPORTS

Create:

- Student Report
- Attendance Report
- Fee Collection Report
- Pending Fee Report
- Admission Report
- Teacher Report
- Exam Report
- Class Strength Report
- Leave Report

Allow:

- PDF
- Excel
- Print
- Date filtering
- Class filtering
- Section filtering
- Export

---

# 25. SETTINGS

## School Admin

- School Profile
- Branding
- Academic Year
- Classes
- Sections
- Subjects
- Fee Settings
- Attendance Settings
- Notification Settings
- Users
- Roles
- Permissions

## Super Admin

- Platform Settings
- Schools
- Plans
- Subscriptions
- Feature Flags
- Audit Logs

---

# 26. RESPONSIVE DESIGN

### Desktop

Professional sidebar dashboard.

### Tablet

Collapsible navigation.

### Mobile

Bottom navigation for major actions.

The public school website must be fully responsive.

The admin dashboard must also work properly on mobile.

---

# 27. UX DETAILS

Every important operation needs:

- Loading state
- Success state
- Error state
- Empty state
- Confirmation
- Validation
- Toast notification

Forms should have:

- Clear labels
- Helpful validation
- Required-field indicators
- Error messages
- Save/cancel actions

Tables should support:

- Search
- Filter
- Sort
- Pagination
- Export

---

# 28. DEMO DATA

Seed **Demo Public School** with realistic fictional demo data.

Include:

- 5 classes
- Multiple sections
- 20+ fictional students
- 10 fictional teachers
- 15 fictional parents
- Admission enquiries
- Applications
- Attendance
- Fee records
- Homework
- Exams
- Marks
- Notices
- Events

Do not use real people's personal data.

---

# 29. INITIAL USER ROLES

Create test/demo roles:

```text
Super Admin
School Admin
Teacher
Accountant
Receptionist
Parent
```

Prepare Student role for future use.

---

# 30. CORE WORKFLOWS

## Admission

```text
Enquiry
  ↓
Follow-up
  ↓
Application
  ↓
Document Verification
  ↓
Entrance Test
  ↓
Approval
  ↓
Fee
  ↓
Admission
  ↓
Student Created
```

## Attendance

```text
Teacher
  ↓
Class
  ↓
Student List
  ↓
Attendance
  ↓
Save
  ↓
Database
  ↓
Parent Notification
```

## Fees

```text
Fee Created
  ↓
Due
  ↓
Reminder
  ↓
Payment
  ↓
Receipt
  ↓
Ledger
  ↓
Notification
```

## Homework

```text
Teacher Creates Homework
  ↓
Database
  ↓
Parent/Student App
  ↓
Homework Viewed
```

## Leave

```text
Parent Applies
  ↓
Teacher/Admin
  ↓
Approve / Reject
  ↓
Attendance / Leave Updated
  ↓
Parent Notification
```

---

# 31. DELIVERABLE

Create a **complete working application**, not a static mockup.

Initial release must include:

1. Working authentication
2. Multi-school architecture
3. Super Admin
4. School Admin
5. Teacher interface
6. Parent interface
7. Student management
8. Admission CRM
9. Attendance
10. Staff attendance foundation
11. Fees
12. Academics
13. Homework
14. Notices
15. Notification foundation
16. Reports
17. School branding
18. Responsive web application
19. Mobile-ready architecture
20. Secure Supabase RLS
21. Demo Public School seeded as the first tenant
22. Subscription-ready SaaS foundation

Use reusable components and clean architecture so new modules and additional schools can be added without restructuring the application.

Do not ask unnecessary questions. Make sensible defaults where information is not specified.

Build the foundation so the platform can grow into a commercial multi-school SaaS product.

---

## FINAL IMPLEMENTATION PRINCIPLE

The system should be:

**Secure + Multi-Tenant + Mobile-First + Scalable + Customizable + SaaS-Ready**

The first tenant is:

**Demo Public School**

But the architecture must be capable of supporting hundreds or thousands of schools without redesigning the core data model.
