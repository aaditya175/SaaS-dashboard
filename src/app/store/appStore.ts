import { createContext, useContext, useState, ReactNode, createElement, useEffect } from 'react';

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
  updatedBy?: string;
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
  githubRepo?: string;
  updatedBy?: string;
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
  updatedBy?: string;
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
  email?: string;
  password?: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  revenue: number;
  outreach: number;
  meetings: number;
  score: number;
  weeklyGoals?: string[];
  todayTasks?: { text: string; done: boolean }[];
  radarData?: { subject: string; A: number }[];
  performanceTrend?: { week: string; score: number }[];
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

// ─── Initial Data ────────────────────────────────────────────────────────────────

export const FOUNDERS: Founder[] = [
  { id: 'f1', name: 'Super Admin', role: 'Super Admin', initials: 'SA', color: '#7c3aed', xp: 0, level: 1, streak: 0, badges: ['🏆'], revenue: 0, outreach: 0, meetings: 0, score: 0, tasks: [] }
];

export const INITIAL_LEADS: Lead[] = [];
export const INITIAL_PROJECTS: Project[] = [];
export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_KB: KBDocument[] = [];
export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const REVENUE_CHART_DATA: any[] = [];
export const LEAD_CHART_DATA: any[] = [];

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
  founders: Founder[];
  setFounders: (f: Founder[]) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (v: boolean) => void;
  currentFounder: string;
  setCurrentFounder: (id: string) => void;
  activityLog: any[];
  setActivityLog: (v: any[]) => void;
  refreshData: () => Promise<void>;
  isAiOpen: boolean;
  setIsAiOpen: (v: boolean) => void;
}

const AppContext = createContext<AppState | null>(null);

import { api } from '../../lib/api';

export function AppProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [kbDocs, setKbDocs] = useState<KBDocument[]>(INITIAL_KB);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [founders, setFounders] = useState<Founder[]>(FOUNDERS);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isDark, setIsDark] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [currentFounder, setCurrentFounder] = useState(localStorage.getItem('founderId') || '');
  const [activityLog, setActivityLog] = useState<any[]>([]);

  const loadData = async () => {
    if (!currentFounder) return;
    
    try {
      const [apiLeads, apiProjects, apiClients, apiCheckins, apiKb, apiFounders, apiTransactions, apiMeetings, apiNotifications, apiActivity] = await Promise.all([
        api.get('/leads', currentFounder).catch(() => INITIAL_LEADS),
        api.get('/projects', currentFounder).catch(() => INITIAL_PROJECTS),
        api.get('/clients', currentFounder).catch(() => INITIAL_CLIENTS),
        api.get('/checkins', currentFounder).catch(() => []),
        api.get('/kb').catch(() => INITIAL_KB),
        api.get('/founders').catch(() => FOUNDERS),
        api.get('/transactions', currentFounder).catch(() => INITIAL_TRANSACTIONS),
        api.get('/meetings', currentFounder).catch(() => INITIAL_MEETINGS),
        api.get('/notifications', currentFounder).catch(() => INITIAL_NOTIFICATIONS),
        api.get('/activity?limit=20', currentFounder).catch(() => [])
      ]);
      
      if (Array.isArray(apiLeads)) setLeads(apiLeads);
      if (Array.isArray(apiProjects)) setProjects(apiProjects);
      if (Array.isArray(apiClients)) setClients(apiClients);
      if (Array.isArray(apiCheckins)) setCheckIns(apiCheckins);
      if (Array.isArray(apiKb)) setKbDocs(apiKb);
      if (Array.isArray(apiFounders) && apiFounders.length > 0) setFounders(apiFounders);
      if (Array.isArray(apiTransactions)) setTransactions(apiTransactions);
      if (Array.isArray(apiMeetings)) setMeetings(apiMeetings);
      if (Array.isArray(apiNotifications)) setNotifications(apiNotifications.map((n: any) => ({ ...n, createdAt: n.createdAt || new Date().toISOString() })));
      if (Array.isArray(apiActivity)) setActivityLog(apiActivity);
    } catch (err) {
      console.error('Error loading data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentFounder]);

  return createElement(AppContext.Provider, {
    value: { leads, setLeads, projects, setProjects, clients, setClients, transactions, setTransactions, meetings, setMeetings, kbDocs, setKbDocs, notifications, setNotifications, checkIns, setCheckIns, founders, setFounders, currentPage, setCurrentPage, isDark, setIsDark, commandOpen, setCommandOpen, currentFounder, setCurrentFounder, activityLog, setActivityLog, refreshData: loadData, isAiOpen, setIsAiOpen },
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
