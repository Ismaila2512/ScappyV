// ============================================================
// TYPE DEFINITIONS — Scotty Salesforce Chatbot
// ============================================================

export type UserRole = 'admin' | 'guest' | 'unauthorized';

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface AdminConfig {
  authorizedEmails: string[];
  secretCode: string;
  temperature: number; // 0.0 - 1.0
}

export interface SalesforceRecord {
  id: string;
  type: 'lead' | 'opportunity' | 'account' | 'contact' | 'case';
  name: string;
  value?: number;
  status: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  stage?: string;
  probability?: number;
  region?: string;
  source?: string;
}

export interface SalesMetrics {
  totalRevenue: number;
  totalLeads: number;
  convertedLeads: number;
  openOpportunities: number;
  closedWonDeals: number;
  closedLostDeals: number;
  pipelineValue: number;
  averageDealSize: number;
  winRate: number;
  conversionRate: number;
  newAccounts: number;
  openCases: number;
  resolvedCases: number;
}

export interface ReportData {
  period: ReportPeriod;
  generatedAt: string;
  metrics: SalesMetrics;
  topDeals: SalesforceRecord[];
  recentActivities: ActivityLog[];
  regionBreakdown: RegionData[];
  stageDistribution: StageData[];
  leadSources: SourceData[];
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  user: string;
  timestamp: string;
  details: string;
}

export interface RegionData {
  region: string;
  revenue: number;
  leads: number;
  deals: number;
  growth: number;
}

export interface StageData {
  stage: string;
  count: number;
  value: number;
  percentage: number;
}

export interface SourceData {
  source: string;
  leads: number;
  converted: number;
  revenue: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isAdmin?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  email?: string;
  token?: string;
  sessionToken?: string;
  authenticatedAt?: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  relevanceScore?: number;
}
