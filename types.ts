
export interface Contractor {
  id: string;
  name: string;
  taxId: string;
  contact: string;
  specialty?: string;
  rating?: number | string;
}

export interface Project {
  id: string;
  name: string;
  fileNumber: string;
  budget: number;
  contractorId: string;
  startDate: string;
  status: 'active' | 'paused' | 'completed';
}

// Added WorkItem type to fix import errors in WorkItemsList.tsx
export interface WorkItem {
  id: string;
  code: string;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  progress: number;
  startDate: string;
  endDate: string;
  contractorId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
}

// Added ProjectData type to fix import errors in WorkItemsList.tsx and Reports.tsx
export interface ProjectData {
  projectName: string;
  client: string;
  workItems: WorkItem[];
  contractors: Contractor[];
}

export interface Certificate {
  id: string;
  projectId: string;
  period: string;
  physicalProgress: number;
  financialAmount: number;
  timestamp: string;
}

export interface Payment {
  id: string;
  projectId: string;
  amount: number;
  date: string;
  reference: string;
}

export interface ConstructionState {
  contractors: Contractor[];
  projects: Project[];
  certificates: Certificate[];
  payments: Payment[];
}

export type ViewType = 'dashboard' | 'projects' | 'contractors' | 'payments' | 'summary' | 'ai' | 'settings';

export interface ExcelSheetData {
  name: string;
  headers: string[];
  rows: any[];
}
