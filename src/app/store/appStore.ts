import { createContext, useContext, useState, ReactNode, createElement } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadStage = 'Lead' | 'Contacted' | 'Interested' | 'Meeting' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type ProjectStatus = 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type MoodScore = 1 | 2 | 3 | 4 | 5;

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  value: number;
  stage: LeadStage;
  assignee: string;
  tags: string[];
  createdAt: string;
  lastContact: string;
  notes: string;
  source: string;
  lostReason?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  assignee: string;
  priority: Priority;
  dueDate: string;
  projectId: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: ProjectStatus;
  priority: Priority;
  assignees: string[];
  progress: number;
  startDate: string;
  deadline: string;
  description: string;
  budget: number;
  spent: number;
  tasks: Task[];
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  projectIds: string[];
  totalRevenue: number;
  status: 'active' | 'inactive' | 'prospect';
  satisfaction: number;
  renewalDate: string;
  contractValue: number;
  tags: string[];
  notes: string;
  joinedDate: string;
  industry: string;
}

export interface Transaction {
  id: string;
  type: 'revenue' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  status: 'paid' | 'pending' | 'overdue';
  client?: string;
  invoiceNumber?: string;
}

export interface Meeting {
  id: string;
  title: string;
  participants: string[];
  date: string;
  time: string;
  duration: number;
  type: 'internal' | 'client' | 'sales';
  notes: string;
  actionItems: { text: string; assignee: string; done: boolean }[];
  recordingUrl?: string;
  location?: string;
}

export interface CheckIn {
  id: string;
  founder: string;
  date: string;
  completed: string[];
  workingOn: string[];
  blockers: string;
  hoursWorked: number;
  mood: MoodScore;
  win: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  initials: string;
  color: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  revenue: number;
  outreach: number;
  meetings: number;
  score: number;
  tasks: Task[];
}

export interface KBDocument {
  id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  author: string;
  updatedAt: string;
  views: number;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'follow_up' | 'invoice' | 'deadline' | 'meeting' | 'checkin' | 'task';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const FOUNDERS: Founder[] = [
  { id: 'f1', name: 'Aryan Shah', role: 'CEO & Growth Lead', initials: 'AS', color: '#7c3aed', xp: 4250, level: 8, streak: 12, badges: ['🏆', '🚀', '💎', '🔥'], revenue: 285000, outreach: 142, meetings: 18, score: 92, tasks: [] },
  { id: 'f2', name: 'Priya Mehta', role: 'COO & Client Success', initials: 'PM', color: '#06b6d4', xp: 3890, level: 7, streak: 8, badges: ['⭐', '🤝', '💪'], revenue: 210000, outreach: 89, meetings: 24, score: 88, tasks: [] },
  { id: 'f3', name: 'Rahul Patel', role: 'CTO & Product', initials: 'RP', color: '#10b981', xp: 3540, level: 7, streak: 15, badges: ['⚡', '🛠️', '🎯', '🔥'], revenue: 175000, outreach: 45, meetings: 12, score: 85, tasks: [] },
  { id: 'f4', name: 'Sneha Kapoor', role: 'CMO & Strategy', initials: 'SK', color: '#f59e0b', xp: 3120, level: 6, streak: 5, badges: ['🎨', '📊', '💡'], revenue: 195000, outreach: 167, meetings: 15, score: 79, tasks: [] },
  { id: 'f5', name: 'Dev Sharma', role: 'CFO & Partnerships', initials: 'DS', color: '#ef4444', xp: 2980, level: 6, streak: 3, badges: ['💰', '🤝', '📈'], revenue: 245000, outreach: 78, meetings: 20, score: 83, tasks: [] },
];

export const INITIAL_LEADS: Lead[] = [
  { id: 'l1', name: 'Vikram Nair', company: 'TechNova Solutions', email: 'vikram@technova.in', phone: '+91 98765 43210', value: 180000, stage: 'Proposal', assignee: 'Aryan Shah', tags: ['SaaS', 'Enterprise'], createdAt: '2025-06-01', lastContact: '2025-06-20', notes: 'Very interested in the full package. Needs legal review.', source: 'LinkedIn' },
  { id: 'l2', name: 'Ananya Singh', company: 'GreenLeaf Retail', email: 'ananya@greenleaf.co', phone: '+91 87654 32109', value: 95000, stage: 'Meeting', assignee: 'Priya Mehta', tags: ['E-commerce', 'SMB'], createdAt: '2025-06-05', lastContact: '2025-06-18', notes: 'Demo scheduled for next Thursday.', source: 'Referral' },
  { id: 'l3', name: 'Karan Bose', company: 'Finwise Capital', email: 'karan@finwise.com', phone: '+91 76543 21098', value: 320000, stage: 'Negotiation', assignee: 'Dev Sharma', tags: ['Fintech', 'High-Value'], createdAt: '2025-05-28', lastContact: '2025-06-19', notes: 'Down to pricing. They want 15% off for 2-year contract.', source: 'Cold Outreach' },
  { id: 'l4', name: 'Meera Joshi', company: 'EduPath Academy', email: 'meera@edupathacademy.com', phone: '+91 65432 10987', value: 75000, stage: 'Interested', assignee: 'Sneha Kapoor', tags: ['EdTech', 'Startup'], createdAt: '2025-06-08', lastContact: '2025-06-17', notes: 'Replied positively to email. Wants to see case studies.', source: 'Content Marketing' },
  { id: 'l5', name: 'Rohan Khanna', company: 'BuildRight Infra', email: 'rohan@buildright.in', phone: '+91 54321 09876', value: 150000, stage: 'Contacted', assignee: 'Aryan Shah', tags: ['Construction', 'Mid-Market'], createdAt: '2025-06-10', lastContact: '2025-06-15', notes: 'Sent intro email. Follow up call needed.', source: 'Cold Outreach' },
  { id: 'l6', name: 'Divya Agarwal', company: 'StyleBox Fashion', email: 'divya@stylebox.in', phone: '+91 43210 98765', value: 60000, stage: 'Lead', assignee: 'Priya Mehta', tags: ['Fashion', 'D2C'], createdAt: '2025-06-12', lastContact: '2025-06-12', notes: 'Found via Instagram. Needs intro.', source: 'Social Media' },
  { id: 'l7', name: 'Amit Verma', company: 'HealthFirst Clinics', email: 'amit@healthfirst.co', phone: '+91 32109 87654', value: 240000, stage: 'Won', assignee: 'Dev Sharma', tags: ['Healthcare', 'Enterprise'], createdAt: '2025-05-15', lastContact: '2025-06-10', notes: 'Contract signed! Onboarding starts July 1.', source: 'Conference' },
  { id: 'l8', name: 'Nisha Reddy', company: 'LogiFlow Freight', email: 'nisha@logiflow.com', phone: '+91 21098 76543', value: 110000, stage: 'Lost', assignee: 'Rahul Patel', tags: ['Logistics', 'SMB'], createdAt: '2025-05-20', lastContact: '2025-06-05', notes: '', lostReason: 'Went with competitor - budget concerns', source: 'Cold Outreach' },
];

export const INITIAL_PROJECTS: Project[] = [
  { id: 'p1', name: 'TechNova Brand Overhaul', client: 'TechNova Solutions', status: 'in_progress', priority: 'high', assignees: ['Aryan Shah', 'Sneha Kapoor'], progress: 65, startDate: '2025-06-01', deadline: '2025-07-15', description: 'Complete brand identity redesign including logo, website, and marketing collateral.', budget: 180000, spent: 117000, tasks: [
    { id: 't1', title: 'Logo redesign concepts', status: 'done', assignee: 'Sneha Kapoor', priority: 'high', dueDate: '2025-06-10', projectId: 'p1' },
    { id: 't2', title: 'Website wireframes', status: 'done', assignee: 'Rahul Patel', priority: 'high', dueDate: '2025-06-20', projectId: 'p1' },
    { id: 't3', title: 'Website development', status: 'in_progress', assignee: 'Rahul Patel', priority: 'critical', dueDate: '2025-07-05', projectId: 'p1' },
    { id: 't4', title: 'Content writing', status: 'in_progress', assignee: 'Sneha Kapoor', priority: 'medium', dueDate: '2025-07-01', projectId: 'p1' },
    { id: 't5', title: 'Brand guidelines doc', status: 'todo', assignee: 'Aryan Shah', priority: 'medium', dueDate: '2025-07-10', projectId: 'p1' },
  ]},
  { id: 'p2', name: 'HealthFirst Marketing Campaign', client: 'HealthFirst Clinics', status: 'planning', priority: 'critical', assignees: ['Priya Mehta', 'Dev Sharma'], progress: 15, startDate: '2025-07-01', deadline: '2025-08-30', description: 'Q3 digital marketing campaign across Google, Meta, and LinkedIn.', budget: 240000, spent: 36000, tasks: [
    { id: 't6', title: 'Campaign strategy deck', status: 'in_progress', assignee: 'Priya Mehta', priority: 'critical', dueDate: '2025-06-30', projectId: 'p2' },
    { id: 't7', title: 'Audience research', status: 'done', assignee: 'Sneha Kapoor', priority: 'high', dueDate: '2025-06-25', projectId: 'p2' },
  ]},
  { id: 'p3', name: 'Finwise Lead Gen System', client: 'Finwise Capital', status: 'review', priority: 'high', assignees: ['Rahul Patel', 'Aryan Shah'], progress: 90, startDate: '2025-05-01', deadline: '2025-06-30', description: 'Automated lead generation funnel with CRM integration.', budget: 120000, spent: 108000, tasks: [
    { id: 't8', title: 'Funnel architecture', status: 'done', assignee: 'Rahul Patel', priority: 'high', dueDate: '2025-05-20', projectId: 'p3' },
    { id: 't9', title: 'Landing page A/B tests', status: 'done', assignee: 'Sneha Kapoor', priority: 'medium', dueDate: '2025-06-10', projectId: 'p3' },
    { id: 't10', title: 'CRM integration', status: 'review', assignee: 'Rahul Patel', priority: 'critical', dueDate: '2025-06-28', projectId: 'p3' },
  ]},
  { id: 'p4', name: 'EduPath Social Media', client: 'EduPath Academy', status: 'completed', priority: 'medium', assignees: ['Sneha Kapoor'], progress: 100, startDate: '2025-04-01', deadline: '2025-05-31', description: 'Monthly social media management and content creation.', budget: 45000, spent: 43500, tasks: [] },
];

export const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Vikram Nair', company: 'TechNova Solutions', email: 'vikram@technova.in', phone: '+91 98765 43210', website: 'technova.in', projectIds: ['p1'], totalRevenue: 480000, status: 'active', satisfaction: 4.8, renewalDate: '2025-12-31', contractValue: 180000, tags: ['SaaS', 'Enterprise'], notes: 'Excellent relationship. Looking to expand scope.', joinedDate: '2024-03-15', industry: 'Technology' },
  { id: 'c2', name: 'Amit Verma', company: 'HealthFirst Clinics', email: 'amit@healthfirst.co', phone: '+91 32109 87654', website: 'healthfirst.co', projectIds: ['p2'], totalRevenue: 360000, status: 'active', satisfaction: 4.5, renewalDate: '2026-01-15', contractValue: 240000, tags: ['Healthcare', 'Enterprise'], notes: 'New client. Onboarding in progress.', joinedDate: '2025-06-10', industry: 'Healthcare' },
  { id: 'c3', name: 'Karan Bose', company: 'Finwise Capital', email: 'karan@finwise.com', phone: '+91 76543 21098', website: 'finwise.com', projectIds: ['p3'], totalRevenue: 240000, status: 'active', satisfaction: 4.2, renewalDate: '2025-09-30', contractValue: 120000, tags: ['Fintech'], notes: 'Happy with results. Possible renewal.', joinedDate: '2025-01-20', industry: 'Finance' },
  { id: 'c4', name: 'Meera Joshi', company: 'EduPath Academy', email: 'meera@edupathacademy.com', phone: '+91 65432 10987', website: 'edupathacademy.com', projectIds: ['p4'], totalRevenue: 90000, status: 'inactive', satisfaction: 4.0, renewalDate: '2025-07-31', contractValue: 45000, tags: ['EdTech'], notes: 'Project completed. Following up for renewal.', joinedDate: '2024-09-10', industry: 'Education' },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', type: 'revenue', amount: 180000, category: 'Project', description: 'TechNova Brand Overhaul - Phase 1', date: '2025-06-15', status: 'paid', client: 'TechNova Solutions', invoiceNumber: 'INV-2025-042' },
  { id: 'tr2', type: 'revenue', amount: 80000, category: 'Project', description: 'HealthFirst Onboarding Fee', date: '2025-06-18', status: 'paid', client: 'HealthFirst Clinics', invoiceNumber: 'INV-2025-043' },
  { id: 'tr3', type: 'revenue', amount: 60000, category: 'Retainer', description: 'Finwise Monthly Retainer - June', date: '2025-06-05', status: 'paid', client: 'Finwise Capital', invoiceNumber: 'INV-2025-041' },
  { id: 'tr4', type: 'revenue', amount: 45000, category: 'Retainer', description: 'EduPath Monthly Retainer - June', date: '2025-06-05', status: 'overdue', client: 'EduPath Academy', invoiceNumber: 'INV-2025-040' },
  { id: 'tr5', type: 'expense', amount: 42000, category: 'Salaries', description: 'Employee Salaries - June', date: '2025-06-01', status: 'paid' },
  { id: 'tr6', type: 'expense', amount: 12000, category: 'Tools & Software', description: 'SaaS subscriptions - Figma, Notion, Slack, etc.', date: '2025-06-01', status: 'paid' },
  { id: 'tr7', type: 'expense', amount: 8500, category: 'Ads & Marketing', description: 'Agency self-promotion ads - Google & Meta', date: '2025-06-10', status: 'paid' },
  { id: 'tr8', type: 'expense', amount: 5000, category: 'Office & Admin', description: 'Co-working space - June', date: '2025-06-01', status: 'paid' },
  { id: 'tr9', type: 'revenue', amount: 120000, category: 'Project', description: 'Finwise Lead Gen System - Final Milestone', date: '2025-06-28', status: 'pending', client: 'Finwise Capital', invoiceNumber: 'INV-2025-044' },
  { id: 'tr10', type: 'expense', amount: 18000, category: 'Freelancers', description: 'UI/UX Contractor - TechNova project', date: '2025-06-20', status: 'paid' },
];

export const INITIAL_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'TechNova Q3 Strategy Review', participants: ['Aryan Shah', 'Priya Mehta', 'Vikram Nair'], date: '2025-06-30', time: '10:00', duration: 60, type: 'client', notes: 'Quarterly review of brand project progress and upcoming website launch timeline.', actionItems: [{ text: 'Send updated timeline doc', assignee: 'Aryan Shah', done: false }, { text: 'Prepare website demo', assignee: 'Rahul Patel', done: true }], location: 'Google Meet' },
  { id: 'm2', title: 'Weekly Founders Sync', participants: ['Aryan Shah', 'Priya Mehta', 'Rahul Patel', 'Sneha Kapoor', 'Dev Sharma'], date: '2025-06-28', time: '09:00', duration: 45, type: 'internal', notes: 'Weekly check-in on KPIs, blockers, and priorities for the week.', actionItems: [{ text: 'Review Q2 revenue report', assignee: 'Dev Sharma', done: false }, { text: 'Finalize HealthFirst onboarding plan', assignee: 'Priya Mehta', done: false }], location: 'Office' },
  { id: 'm3', title: 'Finwise Contract Negotiation', participants: ['Dev Sharma', 'Karan Bose'], date: '2025-07-02', time: '14:00', duration: 90, type: 'sales', notes: '', actionItems: [], location: 'Zoom' },
];

export const INITIAL_KB: KBDocument[] = [
  { id: 'kb1', title: 'Agency Services & Pricing Guide', category: 'Sales', content: '# Services & Pricing\n\n## Social Media Management\n- Starter: ₹25,000/month\n- Growth: ₹45,000/month\n- Enterprise: ₹75,000/month\n\n## Performance Marketing\n- Ad spend below ₹5L: 15% management fee\n- Ad spend ₹5L-20L: 12% management fee\n- Ad spend above ₹20L: 10% management fee', tags: ['pricing', 'sales', 'services'], author: 'Dev Sharma', updatedAt: '2025-06-15', views: 42, icon: '💰' },
  { id: 'kb2', title: 'Client Onboarding SOP', category: 'Operations', content: '# Client Onboarding Process\n\n## Week 1\n1. Welcome email + portal access\n2. Discovery call (90 min)\n3. Kick-off deck preparation\n\n## Week 2\n4. Kick-off call with full team\n5. Brand audit submission\n6. Strategy document review', tags: ['SOP', 'onboarding', 'process'], author: 'Priya Mehta', updatedAt: '2025-06-20', views: 67, icon: '📋' },
  { id: 'kb3', title: 'Brand Story & Messaging Framework', category: 'Brand', content: '# NexGo Digital — Brand Story\n\n## Mission\nHelp ambitious businesses grow through data-driven digital strategy.\n\n## Vision\nBecome the most trusted growth partner for 100 Indian brands by 2027.', tags: ['brand', 'messaging', 'marketing'], author: 'Sneha Kapoor', updatedAt: '2025-06-10', views: 29, icon: '🎨' },
  { id: 'kb4', title: 'Technical Stack & Architecture Guide', category: 'Technical', content: '# Tech Stack Guide\n\n## Frontend\n- React + TypeScript\n- Tailwind CSS\n- Vercel deployment\n\n## Backend\n- Node.js + Express\n- Supabase (PostgreSQL)\n- Redis for caching', tags: ['technical', 'development', 'architecture'], author: 'Rahul Patel', updatedAt: '2025-06-22', views: 35, icon: '⚙️' },
  { id: 'kb5', title: 'Sales Script — Cold Outreach', category: 'Sales', content: '# Cold Outreach Script\n\n## LinkedIn DM Template\nHi [Name], I noticed [Company] recently [trigger event]...\n\n## Cold Email Subject Lines\n- "Quick question about [Company]\'s growth"\n- "Saw your recent [post/news] — thought this might help"', tags: ['sales', 'outreach', 'scripts'], author: 'Aryan Shah', updatedAt: '2025-06-18', views: 88, icon: '📞' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', type: 'follow_up', title: 'Follow-up overdue', message: 'Rohan Khanna (BuildRight Infra) — no contact in 7 days', createdAt: '2025-06-28T09:00:00', read: false, priority: 'high' },
  { id: 'n2', type: 'invoice', title: 'Invoice overdue', message: 'INV-2025-040 from EduPath Academy — ₹45,000 overdue by 3 days', createdAt: '2025-06-27T14:30:00', read: false, priority: 'high' },
  { id: 'n3', type: 'deadline', title: 'Project deadline approaching', message: 'Finwise Lead Gen System — due in 2 days', createdAt: '2025-06-28T08:00:00', read: false, priority: 'medium' },
  { id: 'n4', type: 'meeting', title: 'Meeting in 1 hour', message: 'Weekly Founders Sync at 09:00 AM', createdAt: '2025-06-28T08:00:00', read: true, priority: 'medium' },
  { id: 'n5', type: 'checkin', title: 'Daily check-in reminder', message: "You haven't submitted today's check-in yet", createdAt: '2025-06-28T09:30:00', read: false, priority: 'low' },
  { id: 'n6', type: 'task', title: 'Task assigned to you', message: 'Sneha Kapoor assigned "Brand guidelines doc" to you', createdAt: '2025-06-27T16:00:00', read: true, priority: 'low' },
];

export const REVENUE_CHART_DATA = [
  { month: 'Jan', revenue: 285000, expenses: 82000, profit: 203000 },
  { month: 'Feb', revenue: 320000, expenses: 91000, profit: 229000 },
  { month: 'Mar', revenue: 298000, expenses: 88000, profit: 210000 },
  { month: 'Apr', revenue: 415000, expenses: 105000, profit: 310000 },
  { month: 'May', revenue: 380000, expenses: 98000, profit: 282000 },
  { month: 'Jun', revenue: 485000, expenses: 85500, profit: 399500 },
];

export const LEAD_CHART_DATA = [
  { month: 'Jan', leads: 18, won: 4 },
  { month: 'Feb', leads: 24, won: 6 },
  { month: 'Mar', leads: 21, won: 5 },
  { month: 'Apr', leads: 31, won: 9 },
  { month: 'May', leads: 28, won: 7 },
  { month: 'Jun', leads: 35, won: 11 },
];

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppState {
  leads: Lead[];
  setLeads: (leads: Lead[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  clients: Client[];
  setClients: (clients: Client[]) => void;
  transactions: Transaction[];
  setTransactions: (t: Transaction[]) => void;
  meetings: Meeting[];
  setMeetings: (m: Meeting[]) => void;
  kbDocs: KBDocument[];
  setKbDocs: (d: KBDocument[]) => void;
  notifications: Notification[];
  setNotifications: (n: Notification[]) => void;
  checkIns: CheckIn[];
  setCheckIns: (c: CheckIn[]) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  currentFounder: string;
  setCurrentFounder: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>(INITIAL_KB);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [currentFounder, setCurrentFounder] = useState('f1');

  return createElement(AppContext.Provider, {
    value: { leads, setLeads, projects, setProjects, clients, setClients, transactions, setTransactions, meetings, setMeetings, kbDocs, setKbDocs, notifications, setNotifications, checkIns, setCheckIns, currentPage, setCurrentPage, isDark, setIsDark, commandOpen, setCommandOpen, currentFounder, setCurrentFounder },
    children
  });
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getStageColor(stage: LeadStage): string {
  const map: Record<LeadStage, string> = {
    Lead: 'bg-slate-500/20 text-slate-400',
    Contacted: 'bg-blue-500/20 text-blue-400',
    Interested: 'bg-cyan-500/20 text-cyan-400',
    Meeting: 'bg-violet-500/20 text-violet-400',
    Proposal: 'bg-amber-500/20 text-amber-400',
    Negotiation: 'bg-orange-500/20 text-orange-400',
    Won: 'bg-emerald-500/20 text-emerald-400',
    Lost: 'bg-red-500/20 text-red-400',
  };
  return map[stage] ?? 'bg-muted text-muted-foreground';
}

export function getStatusColor(status: ProjectStatus): string {
  const map: Record<ProjectStatus, string> = {
    planning: 'bg-blue-500/20 text-blue-400',
    in_progress: 'bg-violet-500/20 text-violet-400',
    review: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
    on_hold: 'bg-red-500/20 text-red-400',
  };
  return map[status] ?? 'bg-muted text-muted-foreground';
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-red-500/20 text-red-400',
  };
  return map[priority] ?? 'bg-muted text-muted-foreground';
}

export const LEAD_STAGES: LeadStage[] = ['Lead', 'Contacted', 'Interested', 'Meeting', 'Proposal', 'Negotiation', 'Won', 'Lost'];
