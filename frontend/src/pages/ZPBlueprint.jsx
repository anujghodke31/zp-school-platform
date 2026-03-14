import { useState } from "react";

const saffron = "#FF6B00";
const deepBlue = "#0A1628";
const navyBlue = "#0D2045";
const cardBg = "#0F2A4A";
const border = "#1A3A5C";
const textPrimary = "#F0F6FF";
const textSecondary = "#8BA8C7";
const green = "#2ECC71";
const purple = "#9B59B6";
const teal = "#1ABC9C";
const red = "#E74C3C";

const tabs = [
  { id: "overview", label: "🏗️ System Overview" },
  { id: "modules", label: "📦 Modules" },
  { id: "techstack", label: "⚙️ Tech Stack" },
  { id: "auth", label: "🔐 Auth & DB" },
  { id: "roadmap", label: "🗺️ Roadmap" },
  { id: "architecture", label: "🔭 Architecture" },
];

const moduleData = [
  { icon: "🏫", title: "Public Website", color: saffron, desc: "Institutional portal inspired by KK Wagh — school profile, announcements, gallery, contact. Bilingual (Marathi + English). Mobile-first for parents.", features: ["School Info & History", "Notice Board / Circulars", "Gallery (Events, Photos)", "Staff Directory", "Contact & Location (Google Maps)", "Achievement Board", "Downloadable Forms & Documents"] },
  { icon: "👨‍🎓", title: "Student Management", color: green, desc: "Complete student lifecycle — admission to passing out. UDISE+ compliant. Aadhaar-linked. Works offline for rural ZP schools.", features: ["Online/Offline Admission", "Student Profile (Aadhaar-linked)", "Attendance (Biometric/Manual)", "Marks & Grade Management", "Digital Report Cards", "Transfer Certificate", "Caste Certificate Tracking", "Ex-students Archive"] },
  { icon: "👩‍🏫", title: "Teacher & Staff Portal", color: teal, desc: "Complete HR module for teachers — service book, leave management, salary slips, training records. Synced with ZP HR systems.", features: ["Teacher Profile & Service Book", "Leave Management", "Salary Slip Generation", "Training & CPD Records", "Class Assignment & Timetable", "Performance Appraisal", "Retirement & Pension Tracking"] },
  { icon: "📚", title: "Academic Module", color: purple, desc: "Curriculum management aligned to Maharashtra SSC/CBSE syllabus. Timetable, exam scheduling, lesson plans, and digital library.", features: ["Timetable Generator", "Exam Schedule & Seating", "Lesson Plan Management", "Online Test Creator (Offline-capable)", "Digital Library", "Homework Assignment", "E-Learning Resources (DIKSHA integration)"] },
  { icon: "🍱", title: "Mid-Day Meal (MDM)", color: "#F39C12", desc: "Critical for ZP schools. Daily meal tracking, stock management, menu planning per government guidelines, and auto-reports for BEO/DEO.", features: ["Daily Meal Count Entry", "Stock & Inventory", "Menu Planner (Govt. Standard)", "Cook/Helper Management", "Monthly Reports to Block Office", "Nutritional Value Tracking", "Vendor Management"] },
  { icon: "💰", title: "Fee & Finance", color: red, desc: "Fee management for minimal/optional fees in ZP schools. Scholarship disbursement tracking, government grant management.", features: ["Fee Collection (Online/Cash)", "Scholarship Management (Saral-linked)", "Government Grant Tracking", "Expenditure Records", "Annual Budget Planning", "Audit-ready Reports", "SMS Payment Receipts"] },
  { icon: "📊", title: "Admin Dashboard", color: saffron, desc: "Multi-school district overview for BEO/DEO. Real-time insights — enrollment, attendance trends, MDM status, infrastructure health.", features: ["District-level School Monitoring", "Enrollment & Attendance Analytics", "Teacher Availability Heat Map", "MDM Compliance Dashboard", "Infrastructure Status", "Govt. Scheme Penetration Reports", "One-click UDISE Export"] },
  { icon: "📱", title: "Parent & Community App", color: teal, desc: "WhatsApp-first approach for rural parents. Progressive Web App (PWA) + SMS fallback for low-internet areas. Marathi-first UI.", features: ["Attendance Alerts (SMS/WhatsApp)", "Report Card Access", "Fee Payment (UPI/NEFT)", "Circular & Homework Notifications", "Parent-Teacher Meeting Booking", "Grievance Submission", "Offline-capable PWA"] },
  { icon: "🏛️", title: "Government Integration", color: purple, desc: "Seamless integration with Maharashtra government platforms — Saral, UDISE+, Aadhaar, DigiLocker, and eKalyan scholarship portal.", features: ["UDISE+ Auto-reporting", "Saral Portal Sync", "Aadhaar Verification (UIDAI API)", "DigiLocker Document Upload", "eKalyan Scholarship Integration", "SSA/RMSA Data Export", "RTI Compliance Reports"] },
];

const techStackData = {
  frontend: [
    { name: "Next.js 14 (App Router)", reason: "SSR + SSG for public website SEO; API routes for lightweight backend calls; excellent PWA support.", badge: "Primary" },
    { name: "React 18", reason: "Component-based architecture scales perfectly across all modules — admin dashboard, teacher portal, parent PWA.", badge: "Core" },
    { name: "Tailwind CSS + shadcn/ui", reason: "Rapid, consistent UI across all portals. Accessible components out of the box. Marathi font support.", badge: "UI" },
    { name: "Zustand", reason: "Lightweight state management for complex data like student records, attendance grids.", badge: "State" },
    { name: "React Query (TanStack)", reason: "Server state management, caching, background sync — critical for offline-first PWA for teachers.", badge: "Data" },
    { name: "Recharts / Nivo", reason: "Analytics dashboards for DEO/BEO — enrollment trends, attendance charts, MDM compliance visuals.", badge: "Charts" },
  ],
  backend: [
    { name: "Node.js + Express / Fastify", reason: "Fast, scalable REST API. Large ecosystem of Indian govt. integration libraries (Aadhaar, UPI, etc.).", badge: "Primary" },
    { name: "Prisma ORM", reason: "Type-safe database access. Schema migrations made easy. Works perfectly with PostgreSQL.", badge: "ORM" },
    { name: "BullMQ (Redis queue)", reason: "Background jobs — SMS sending, report generation, UDISE batch uploads. Non-blocking architecture.", badge: "Queue" },
    { name: "Socket.io", reason: "Real-time notifications — attendance alerts to parents, emergency broadcasts to all school stakeholders.", badge: "Realtime" },
    { name: "Express-Validator", reason: "Input validation & sanitization. Critical for government-grade data integrity.", badge: "Security" },
  ],
  mobile: [
    { name: "React Native (Expo)", reason: "Single codebase for Android + iOS. Teachers can mark attendance offline; syncs when internet is available.", badge: "Mobile" },
    { name: "WatermelonDB", reason: "Offline-first local SQLite storage for React Native. Syncs with backend when connectivity returns.", badge: "Offline DB" },
    { name: "Expo Notifications", reason: "Push notifications for teacher app — timetable reminders, exam duties, training alerts.", badge: "Notifications" },
  ],
  infra: [
    { name: "AWS / Azure India Region", reason: "Data residency in India (mandatory for Aadhaar data). Mumbai region for low latency across Maharashtra.", badge: "Cloud" },
    { name: "Docker + Kubernetes", reason: "Containerized microservices. Each school block can have isolated deployments if needed.", badge: "DevOps" },
    { name: "Nginx + CloudFront CDN", reason: "Serve static assets fast across rural Maharashtra. SSL termination. Load balancing.", badge: "Infra" },
    { name: "GitHub Actions CI/CD", reason: "Automated testing and deployment pipeline. Zero-downtime deployments.", badge: "CI/CD" },
    { name: "Grafana + Prometheus", reason: "System monitoring, uptime alerts. Critical for a government system with SLA requirements.", badge: "Monitoring" },
  ],
};

const authData = [
  { role: "Super Admin (Zilla Parishad HQ)", access: "All schools in district. Full CRUD on all modules. Can create Block-level admins.", color: red },
  { role: "Block Education Officer (BEO)", access: "All schools in block. View analytics, approve teacher leaves, access MDM reports.", color: saffron },
  { role: "Head Master / Principal", access: "Their school only. Manage students, teachers, attendance, exams, and MDM.", color: purple },
  { role: "Teacher", access: "Own classes only. Mark attendance, enter marks, assign homework, view timetable.", color: teal },
  { role: "Parent / Guardian", access: "Own child's data only. View attendance, marks, pay fees, receive notifications.", color: green },
  { role: "Student (Class 8+)", access: "Own profile, marks, homework, digital library access.", color: "#3498DB" },
];

const dbSchema = [
  { table: "schools", desc: "UDISE code, name, address, GPS coords, block, district, type, medium", icon: "🏫" },
  { table: "students", desc: "Aadhaar, name, DOB, parent info, class, enrollment no, caste category, scheme flags", icon: "👦" },
  { table: "teachers", desc: "Employee ID, service book data, qualifications, subject, assigned class", icon: "👩‍🏫" },
  { table: "attendance", desc: "Partitioned by month. student_id, date, status, marked_by, device_id", icon: "📋" },
  { table: "marks", desc: "student_id, exam_id, subject_id, marks_obtained, max_marks, grade", icon: "📝" },
  { table: "mdm_records", desc: "school_id, date, menu_id, students_fed, cook_id, stock_used", icon: "🍱" },
  { table: "schemes", desc: "scheme_name, eligibility_criteria, benefit_type, disbursement_status per student", icon: "💰" },
  { table: "notices", desc: "title, body, school_id/district_id, category, attachment_url, publish_date", icon: "📢" },
];

const roadmapPhases = [
  { phase: "Phase 1", title: "Foundation & Public Website", duration: "0 – 6 Weeks", color: saffron, tasks: ["Requirements gathering with ZP Education Dept, BEO, 3-5 sample schools", "Design system — Marathi-first UI kit, color palette, typography", "Database schema design (PostgreSQL) — students, teachers, schools, attendance", "Public website: school profile, notice board, gallery, staff directory", "Authentication system — JWT + role-based access for all 6 roles", "Admin onboarding for 10 pilot schools", "Deploy to staging on AWS Mumbai region"] },
  { phase: "Phase 2", title: "Core School Management", duration: "6 – 16 Weeks", color: green, tasks: ["Student admission module (with UDISE fields, Aadhaar verification)", "Daily attendance module — web + offline-capable mobile (React Native)", "Teacher portal — profile, timetable, class assignment", "Marks entry & digital report card generation (PDF auto-gen in Marathi)", "Mid-Day Meal daily tracking & monthly report module", "SMS/WhatsApp alerts to parents on attendance (Twilio/MSG91)", "Pilot launch in 10 schools, feedback collection & iteration"] },
  { phase: "Phase 3", title: "Analytics & Government Integration", duration: "16 – 28 Weeks", color: purple, tasks: ["District-level analytics dashboard for BEO/DEO", "UDISE+ data export in prescribed format", "Saral portal data sync (Maharashtra Education Dept)", "Scholarship / scheme disbursement tracking (eKalyan)", "Parent PWA — Marathi-first, installable, offline-capable", "Fee & finance module with UPI payment integration (Razorpay)", "DigiLocker integration for digital mark sheets & TC", "Roll out to 50+ schools across one district"] },
  { phase: "Phase 4", title: "Academic & Learning Tools", duration: "28 – 40 Weeks", color: teal, tasks: ["Timetable auto-generator respecting teacher availability", "Exam scheduling & seating arrangement", "DIKSHA LMS integration — Maharashtra e-content access", "Digital library with offline content caching", "Teacher CPD & training management", "HR module — service book, leave, salary slip generation", "Grievance management for parents"] },
  { phase: "Phase 5", title: "Scale & Optimization", duration: "40 – 52 Weeks", color: "#F39C12", tasks: ["Multi-district rollout with isolated data tenants", "Performance optimization — DB indexing, query caching with Redis", "AI-powered early dropout prediction based on attendance patterns", "Automated government report generation (RTI, Annual Reports)", "Full audit logging for all government data changes", "Security penetration testing & CERT-In compliance", "Training program for all headmasters, teachers, BEO staff"] },
];

export default function ZPBlueprint() {
  const [activeTab, setActiveTab] = useState("overview");
  const [activeModule, setActiveModule] = useState(null);
  const [expandedPhase, setExpandedPhase] = useState(null);

  return (
    <div style={{ background: deepBlue, minHeight: "100vh", fontFamily: "'Georgia', 'Times New Roman', serif", color: textPrimary, overflowX: "hidden" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${navyBlue} 0%, #0A1628 60%, #1a0a00 100%)`, borderBottom: `3px solid ${saffron}`, padding: "28px 32px 20px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px)`, backgroundSize: "40px 40px", opacity: 0.3 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px" }}>
            <div style={{ width: 52, height: 52, borderRadius: "12px", background: `linear-gradient(135deg, ${saffron}, #FFD700)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0, boxShadow: `0 0 20px ${saffron}55` }}>🏛️</div>
            <div>
              <div style={{ fontSize: "11px", letterSpacing: "4px", color: saffron, textTransform: "uppercase", fontFamily: "monospace" }}>FULL-STACK SYSTEM DESIGN · MAHARASHTRA · 2025</div>
              <h1 style={{ margin: 0, fontSize: "clamp(18px, 4vw, 28px)", fontWeight: "bold", color: textPrimary, lineHeight: 1.2 }}>ZP School Digital Transformation</h1>
            </div>
          </div>
          <p style={{ margin: "8px 0 0 68px", color: textSecondary, fontSize: "13px", maxWidth: "700px" }}>
            Enterprise-grade full-stack system for Zilla Parishad schools — designed with 10+ years of experience, inspired by KK Wagh's proven institutional model, adapted for rural Maharashtra's ground realities.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: "4px", padding: "12px 16px", background: navyBlue, borderBottom: `1px solid ${border}`, overflowX: "auto", flexWrap: "nowrap" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", whiteSpace: "nowrap", background: activeTab === t.id ? saffron : "transparent", color: activeTab === t.id ? "#000" : textSecondary, transition: "all 0.2s" }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: "24px 20px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div>
            <SectionHeader title="System Overview" subtitle="What we're building and why" />
            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", marginBottom: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ margin: "0 0 12px", color: saffron, fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace" }}>📋 KK Wagh Analysis — What to Borrow</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
                {[
                  { label: "ERP Login System", note: "Separate portal for internal users — adapt for teachers, HMs, BEO" },
                  { label: "Multi-Institution Dashboard", note: "KK Wagh manages 30+ institutions — ZP needs district-wide school control" },
                  { label: "Notice & Announcement Board", note: "Critical for ZP — circulars from district office to all schools" },
                  { label: "Faculty/Staff Directory", note: "Searchable teacher profiles across the district" },
                  { label: "Events & Gallery", note: "School achievements, sports day, cultural events — boosts community trust" },
                  { label: "Downloadable Documents", note: "Admit cards, TC, mark sheets — digitally accessible, reduce office visits" },
                ].map((item, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "12px", borderLeft: `3px solid ${saffron}` }}>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: textPrimary, marginBottom: "4px" }}>✓ {item.label}</div>
                    <div style={{ fontSize: "11px", color: textSecondary }}>{item.note}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", marginBottom: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ margin: "0 0 12px", color: green, fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace" }}>⚡ ZP School Unique Requirements (Beyond KK Wagh)</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
                {[
                  { icon: "📶", title: "Offline-First Design", desc: "Many ZP schools in rural areas have poor/no internet. System MUST work offline and sync later." },
                  { icon: "🗣️", title: "Marathi-First Interface", desc: "All parent/student-facing UI in Marathi. Admin panels bilingual. Not just translation — native UX." },
                  { icon: "🆔", title: "Aadhaar + UDISE Integration", desc: "Mandatory government requirements. Every student linked to Aadhaar and UDISE+ database." },
                  { icon: "🍱", title: "Mid-Day Meal Tracking", desc: "Unique to government schools. Daily meal count, stock management, government compliance reports." },
                  { icon: "💸", title: "Scheme Disbursement", desc: "Scholarship tracking, uniform distribution, free textbooks — all government schemes per student." },
                  { icon: "📲", title: "SMS/WhatsApp for Parents", desc: "Most ZP school parents don't have smartphones. Primary communication via SMS or WhatsApp." },
                ].map((item, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "14px", border: `1px solid ${border}` }}>
                    <div style={{ fontSize: "22px", marginBottom: "6px" }}>{item.icon}</div>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: green, marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "11px", color: textSecondary, lineHeight: "1.5" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "12px" }}>
              {[
                { num: "9", label: "Core Modules", color: saffron }, { num: "6", label: "User Roles", color: green },
                { num: "5", label: "Dev Phases", color: purple }, { num: "~52", label: "Weeks to Full", color: teal },
                { num: "3", label: "App Surfaces", color: "#F39C12" }, { num: "8+", label: "Govt. Integrations", color: red },
              ].map((s, i) => (
                <div key={i} style={{ background: cardBg, borderRadius: "10px", padding: "16px 12px", textAlign: "center", border: `1px solid ${border}` }}>
                  <div style={{ fontSize: "28px", fontWeight: "bold", color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: "11px", color: textSecondary, marginTop: "4px" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MODULES TAB ── */}
        {activeTab === "modules" && (
          <div>
            <SectionHeader title="System Modules" subtitle="Click any module to expand details" />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {moduleData.map((mod, i) => (
                <div key={i} onClick={() => setActiveModule(activeModule === i ? null : i)} style={{ background: cardBg, borderRadius: "12px", padding: "16px", border: `1px solid ${activeModule === i ? mod.color : border}`, cursor: "pointer", transition: "all 0.2s", boxShadow: activeModule === i ? `0 0 20px ${mod.color}33` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "24px" }}>{mod.icon}</span>
                    <div style={{ fontSize: "14px", fontWeight: "bold", color: mod.color }}>{mod.title}</div>
                    <span style={{ marginLeft: "auto", color: textSecondary, fontSize: "16px" }}>{activeModule === i ? "▲" : "▼"}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: textSecondary, margin: "0 0 8px", lineHeight: "1.5" }}>{mod.desc}</p>
                  {activeModule === i && (
                    <div style={{ marginTop: "12px", borderTop: `1px solid ${border}`, paddingTop: "12px" }}>
                      <div style={{ fontSize: "11px", color: mod.color, letterSpacing: "1px", marginBottom: "8px", fontFamily: "monospace" }}>KEY FEATURES</div>
                      {mod.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "5px" }}>
                          <span style={{ color: mod.color, fontSize: "10px", marginTop: "3px", flexShrink: 0 }}>▸</span>
                          <span style={{ fontSize: "12px", color: textPrimary }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TECH STACK TAB ── */}
        {activeTab === "techstack" && (
          <div>
            <SectionHeader title="Tech Stack" subtitle="Every choice justified for ZP school context" />
            {[
              { key: "frontend", label: "🖥️ Frontend", color: saffron },
              { key: "backend", label: "⚙️ Backend", color: green },
              { key: "mobile", label: "📱 Mobile (React Native)", color: teal },
              { key: "infra", label: "☁️ Infrastructure & DevOps", color: purple },
            ].map(section => (
              <div key={section.key} style={{ marginBottom: "24px" }}>
                <h3 style={{ color: section.color, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", marginBottom: "12px" }}>{section.label}</h3>
                <div style={{ display: "grid", gap: "8px" }}>
                  {techStackData[section.key].map((item, i) => (
                    <div key={i} style={{ background: cardBg, borderRadius: "8px", padding: "12px 16px", border: `1px solid ${border}`, display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <span style={{ background: section.color + "22", color: section.color, fontSize: "10px", padding: "3px 8px", borderRadius: "4px", fontFamily: "monospace", flexShrink: 0, marginTop: "2px", border: `1px solid ${section.color}44` }}>{item.badge}</span>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "bold", color: textPrimary, marginBottom: "3px" }}>{item.name}</div>
                        <div style={{ fontSize: "12px", color: textSecondary, lineHeight: "1.5" }}>{item.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ margin: "0 0 12px", color: red, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace" }}>❌ What to Avoid & Why</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                {[
                  { avoid: "PHP / Laravel", why: "Harder to maintain offline-first PWA. Less JS ecosystem synergy." },
                  { avoid: "MySQL", why: "PostgreSQL handles JSON, arrays, geospatial data better — needed for UDISE." },
                  { avoid: "Firebase (for prod)", why: "Data sovereignty issues for Aadhaar data. Must stay on Indian servers." },
                  { avoid: "WordPress", why: "Cannot handle complex ZP workflows — MDM, UDISE exports, multi-school admin." },
                  { avoid: "Redux (for this scale)", why: "Overkill. Zustand + React Query handles state management more cleanly." },
                  { avoid: "NoSQL-only (MongoDB)", why: "Student/marks data is deeply relational. PostgreSQL + JSON columns gives best of both." },
                ].map((item, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "10px", border: `1px solid ${red}33` }}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: red, marginBottom: "4px" }}>✗ {item.avoid}</div>
                    <div style={{ fontSize: "11px", color: textSecondary }}>{item.why}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AUTH & DB TAB ── */}
        {activeTab === "auth" && (
          <div>
            <SectionHeader title="Authentication & Database" subtitle="Security-first, government-grade design" />
            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", marginBottom: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ color: saffron, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", margin: "0 0 16px" }}>🔐 Authentication Strategy</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px", marginBottom: "16px" }}>
                {[
                  { title: "JWT (Access + Refresh Tokens)", desc: "Short-lived access tokens (15 min) + long-lived refresh tokens (7 days). Stored in HttpOnly cookies." },
                  { title: "OTP via SMS (Teachers/HMs)", desc: "Mobile OTP login via MSG91 — no password to forget. Critical for government employees." },
                  { title: "Aadhaar OTP (Optional)", desc: "For parents verifying their identity during enrollment. Via UIDAI Sandbox API." },
                  { title: "Role-Based Access (RBAC)", desc: "6-tier hierarchy. Every API endpoint checks role + school_id scope. No cross-school data leak." },
                  { title: "2FA for Admin Roles", desc: "BEO and above must use TOTP (Google Authenticator) as second factor." },
                  { title: "Audit Log", desc: "Every data change logged — who, what, when, from which IP. Mandatory for RTI compliance." },
                ].map((item, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "12px", border: `1px solid ${saffron}33` }}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: saffron, marginBottom: "5px" }}>{item.title}</div>
                    <div style={{ fontSize: "11px", color: textSecondary, lineHeight: "1.5" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", marginBottom: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ color: green, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", margin: "0 0 16px" }}>👥 Role Access Matrix</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {authData.map((role, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "12px", background: navyBlue, borderRadius: "8px", padding: "12px", border: `1px solid ${border}` }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: role.color, flexShrink: 0, marginTop: "4px" }} />
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: role.color, marginBottom: "3px" }}>{role.role}</div>
                      <div style={{ fontSize: "12px", color: textSecondary }}>{role.access}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${border}` }}>
              <h3 style={{ color: teal, fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace", margin: "0 0 4px" }}>🗃️ Database: PostgreSQL</h3>
              <div style={{ fontSize: "12px", color: textSecondary, marginBottom: "16px" }}>Multi-tenant architecture — each school has school_id scoped data. Partitioned tables for attendance and marks (by academic year + school).</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                {dbSchema.map((table, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "10px 12px", border: `1px solid ${teal}44` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "14px" }}>{table.icon}</span>
                      <code style={{ fontSize: "12px", color: teal }}>{table.table}</code>
                    </div>
                    <div style={{ fontSize: "11px", color: textSecondary }}>{table.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                {[
                  { title: "Redis Cache", color: red, desc: "Session store, frequently accessed school configs, rate limiting, BullMQ job queue." },
                  { title: "AWS S3 Storage", color: "#F39C12", desc: "Student photos, documents, mark sheets, report cards, gallery images. CDN via CloudFront." },
                  { title: "Database Backups", color: green, desc: "Automated daily backups to S3. Point-in-time recovery. 30-day retention. Encrypted at rest." },
                ].map((item, i) => (
                  <div key={i} style={{ background: navyBlue, borderRadius: "8px", padding: "12px", border: `1px solid ${item.color}44` }}>
                    <div style={{ fontSize: "12px", fontWeight: "bold", color: item.color, marginBottom: "5px" }}>{item.title}</div>
                    <div style={{ fontSize: "11px", color: textSecondary, lineHeight: "1.5" }}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ROADMAP TAB ── */}
        {activeTab === "roadmap" && (
          <div>
            <SectionHeader title="Implementation Roadmap" subtitle="52-week systematic plan — click a phase to expand" />
            <div style={{ display: "grid", gap: "12px" }}>
              {roadmapPhases.map((phase, i) => (
                <div key={i} style={{ background: cardBg, borderRadius: "12px", border: `1px solid ${expandedPhase === i ? phase.color : border}`, overflow: "hidden", transition: "all 0.2s" }}>
                  <div onClick={() => setExpandedPhase(expandedPhase === i ? null : i)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ background: phase.color + "22", border: `2px solid ${phase.color}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: "bold", color: phase.color, fontFamily: "monospace", flexShrink: 0 }}>{phase.phase}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "15px", fontWeight: "bold", color: textPrimary }}>{phase.title}</div>
                      <div style={{ fontSize: "11px", color: phase.color, marginTop: "2px" }}>⏱ {phase.duration}</div>
                    </div>
                    <div style={{ color: textSecondary, fontSize: "14px" }}>{expandedPhase === i ? "▲ Hide" : "▼ Show Tasks"}</div>
                  </div>
                  {expandedPhase === i && (
                    <div style={{ padding: "0 20px 16px", borderTop: `1px solid ${border}` }}>
                      <div style={{ paddingTop: "14px", display: "grid", gap: "8px" }}>
                        {phase.tasks.map((task, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: phase.color + "22", border: `1px solid ${phase.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "10px", color: phase.color, fontWeight: "bold" }}>{j + 1}</div>
                            <span style={{ fontSize: "13px", color: textPrimary, lineHeight: "1.5" }}>{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", marginTop: "24px", border: `1px solid ${saffron}` }}>
              <h3 style={{ color: saffron, margin: "0 0 12px", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "monospace" }}>💡 Expert Advice: How to Start Tomorrow</h3>
              <div style={{ display: "grid", gap: "8px" }}>
                {[
                  "Start with 3-5 schools as a pilot. Don't try to digitize all 100+ ZP schools at once.",
                  "Visit the schools physically. Talk to headmasters, teachers, and parents before writing a single line of code.",
                  "Build the offline-first architecture from Day 1 — retrofitting it later is painful and expensive.",
                  "Get ZP Education Dept. sign-off on the data schema before building — especially for UDISE fields.",
                  "Hire a Marathi-speaking UX designer. The UI must feel native to rural Maharashtra users.",
                  "Build WhatsApp integration (via Twilio/Meta API) before the mobile app — parents already use it.",
                  "Create a demo environment with fake data for stakeholder demos — it speeds up government approvals massively.",
                ].map((tip, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ color: saffron, fontSize: "16px", flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: "13px", color: textPrimary, lineHeight: "1.5" }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── ARCHITECTURE TAB ── */}
        {activeTab === "architecture" && (
          <div>
            <SectionHeader title="System Architecture" subtitle="High-level technical architecture diagram" />
            <div style={{ background: cardBg, borderRadius: "12px", padding: "20px", border: `1px solid ${border}`, marginBottom: "20px", overflowX: "auto" }}>
              <svg width="100%" viewBox="0 0 620 540" style={{ maxWidth: "620px", display: "block", margin: "0 auto" }}>
                <defs>
                  <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke={border} strokeWidth="0.5" opacity="0.5" />
                  </pattern>
                </defs>
                <rect width="620" height="540" fill={navyBlue} rx="8" />
                <rect width="620" height="540" fill="url(#grid)" rx="8" />
                <text x="310" y="22" textAnchor="middle" fill={textSecondary} fontSize="9" fontFamily="monospace">CLIENT LAYER</text>
                <text x="310" y="155" textAnchor="middle" fill={textSecondary} fontSize="9" fontFamily="monospace">API GATEWAY</text>
                <text x="310" y="270" textAnchor="middle" fill={textSecondary} fontSize="9" fontFamily="monospace">MICROSERVICES LAYER</text>
                <text x="310" y="400" textAnchor="middle" fill={textSecondary} fontSize="9" fontFamily="monospace">DATA LAYER</text>
                <line x1="20" y1="30" x2="600" y2="30" stroke={border} strokeWidth="1" />
                <line x1="20" y1="145" x2="600" y2="145" stroke={border} strokeWidth="1" />
                <line x1="20" y1="260" x2="600" y2="260" stroke={border} strokeWidth="1" />
                <line x1="20" y1="390" x2="600" y2="390" stroke={border} strokeWidth="1" />
                {[
                  { x: 20, label: "Public\nWebsite", sub: "Next.js SSR", color: saffron },
                  { x: 160, label: "Admin\nDashboard", sub: "React + Next.js", color: green },
                  { x: 300, label: "Teacher App\n(Mobile)", sub: "React Native", color: teal },
                  { x: 440, label: "Parent\nPWA", sub: "Next.js PWA", color: purple },
                ].map((node, i) => (
                  <g key={i}>
                    <rect x={node.x} y="38" width="120" height="60" rx="8" fill={node.color + "22"} stroke={node.color} strokeWidth="1.5" />
                    <text x={node.x + 60} y="62" textAnchor="middle" fill={node.color} fontSize="11" fontWeight="bold">{node.label.split('\n')[0]}</text>
                    <text x={node.x + 60} y="75" textAnchor="middle" fill={node.color} fontSize="11" fontWeight="bold">{node.label.split('\n')[1] || ''}</text>
                    <text x={node.x + 60} y="90" textAnchor="middle" fill={textSecondary} fontSize="9">{node.sub}</text>
                    <line x1={node.x + 60} y1="98" x2={node.x + 60} y2="155" stroke={node.color} strokeWidth="1" strokeDasharray="4,3" />
                    <polygon points={`${node.x + 60},155 ${node.x + 55},148 ${node.x + 65},148`} fill={node.color} />
                  </g>
                ))}
                <rect x="170" y="160" width="280" height="50" rx="8" fill={"#F39C12" + "22"} stroke="#F39C12" strokeWidth="2" />
                <text x="310" y="182" textAnchor="middle" fill="#F39C12" fontSize="12" fontWeight="bold">API Gateway (Nginx)</text>
                <text x="310" y="198" textAnchor="middle" fill={textSecondary} fontSize="9">JWT Auth · Rate Limiting · SSL Termination · Load Balancer</text>
                {[80, 190, 310, 430, 540].map((x, i) => (
                  <g key={i}>
                    <line x1={x} y1="210" x2={x} y2="265" stroke="#F39C12" strokeWidth="1" strokeDasharray="4,3" />
                    <polygon points={`${x},265 ${x - 4},258 ${x + 4},258`} fill="#F39C12" />
                  </g>
                ))}
                {[
                  { x: 20, label: "Auth\nService", color: red },
                  { x: 130, label: "Student\nService", color: green },
                  { x: 250, label: "MDM\nService", color: saffron },
                  { x: 370, label: "Notify\nService", color: purple },
                  { x: 490, label: "Reports\nService", color: teal },
                ].map((svc, i) => (
                  <g key={i}>
                    <rect x={svc.x} y="270" width="100" height="60" rx="8" fill={svc.color + "22"} stroke={svc.color} strokeWidth="1.5" />
                    <text x={svc.x + 50} y="296" textAnchor="middle" fill={svc.color} fontSize="10" fontWeight="bold">{svc.label.split('\n')[0]}</text>
                    <text x={svc.x + 50} y="310" textAnchor="middle" fill={svc.color} fontSize="10" fontWeight="bold">{svc.label.split('\n')[1]}</text>
                    <line x1={svc.x + 50} y1="330" x2={svc.x + 50} y2="393" stroke={svc.color} strokeWidth="1" strokeDasharray="4,3" />
                    <polygon points={`${svc.x + 50},393 ${svc.x + 45},386 ${svc.x + 55},386`} fill={svc.color} />
                  </g>
                ))}
                {[
                  { x: 30, label: "PostgreSQL", sub: "Primary DB", color: "#3498DB" },
                  { x: 200, label: "Redis", sub: "Cache + Queue", color: red },
                  { x: 360, label: "AWS S3", sub: "Files & Docs", color: "#F39C12" },
                  { x: 480, label: "Aadhaar/UDISE", sub: "Govt. APIs", color: purple },
                ].map((db, i) => (
                  <g key={i}>
                    <rect x={db.x} y="400" width="120" height="55" rx="8" fill={db.color + "22"} stroke={db.color} strokeWidth="1.5" />
                    <text x={db.x + 60} y="422" textAnchor="middle" fill={db.color} fontSize="11" fontWeight="bold">{db.label}</text>
                    <text x={db.x + 60} y="438" textAnchor="middle" fill={textSecondary} fontSize="9">{db.sub}</text>
                  </g>
                ))}
                <rect x="20" y="475" width="580" height="50" rx="8" fill={teal + "11"} stroke={teal} strokeWidth="1" strokeDasharray="5,3" />
                <text x="310" y="497" textAnchor="middle" fill={teal} fontSize="11" fontWeight="bold">📶 Offline-First Layer</text>
                <text x="310" y="514" textAnchor="middle" fill={textSecondary} fontSize="9">WatermelonDB (React Native) · Service Workers (PWA) · Background Sync when connectivity restored</text>
              </svg>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "14px" }}>
              {[
                { icon: "🔒", title: "Security", color: red, points: ["All data encrypted at rest (AES-256) and in transit (TLS 1.3)", "Aadhaar data never stored — only tokenized reference", "OWASP Top 10 compliance audit before launch", "CERT-In notification protocols in place"] },
                { icon: "📈", title: "Scalability", color: green, points: ["Horizontal scaling via Kubernetes pods", "DB read replicas for reporting queries", "CDN for static assets across Maharashtra", "Multi-tenant isolation — district level namespacing"] },
                { icon: "🌐", title: "Offline Strategy", color: teal, points: ["Teacher attendance app works 100% offline", "PWA caches last 7 days of student data", "Background sync queue on reconnect", "Conflict resolution: server-wins strategy with audit log"] },
              ].map((card, i) => (
                <div key={i} style={{ background: cardBg, borderRadius: "12px", padding: "16px", border: `1px solid ${card.color}44` }}>
                  <div style={{ fontSize: "20px", marginBottom: "8px" }}>{card.icon}</div>
                  <h4 style={{ margin: "0 0 10px", color: card.color, fontSize: "13px", letterSpacing: "1px", textTransform: "uppercase", fontFamily: "monospace" }}>{card.title}</h4>
                  {card.points.map((p, j) => (
                    <div key={j} style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                      <span style={{ color: card.color, flexShrink: 0 }}>•</span>
                      <span style={{ fontSize: "12px", color: textSecondary, lineHeight: "1.5" }}>{p}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${border}`, padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span style={{ fontSize: "11px", color: textSecondary, fontFamily: "monospace" }}>ZP SCHOOL DIGITAL SYSTEM · DESIGNED FOR MAHARASHTRA · 2025</span>
        <div style={{ display: "flex", gap: "16px" }}>
          {["Next.js 14", "PostgreSQL", "React Native", "AWS India"].map(tech => (
            <span key={tech} style={{ fontSize: "10px", color: saffron, fontFamily: "monospace", background: saffron + "11", padding: "3px 8px", borderRadius: "4px" }}>{tech}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: "22px", color: textPrimary }}>{title}</h2>
      <p style={{ margin: 0, color: textSecondary, fontSize: "13px" }}>{subtitle}</p>
    </div>
  );
}
