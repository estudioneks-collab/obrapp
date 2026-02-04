
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  HardHat, 
  FileStack, 
  Wallet, 
  PieChart, 
  BrainCircuit,
  Menu,
  X,
  Settings as SettingsIcon,
  Database,
  CloudCheck,
  CloudOff,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { ConstructionState, ViewType, Contractor, Project, Certificate, Payment } from './types';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ContractorManager from './components/ContractorManager';
import FinancialTracking from './components/FinancialTracking';
import NecessaryPayments from './components/NecessaryPayments';
import AIAssistant from './components/AIAssistant';
import BackupSettings from './components/BackupSettings';

const SUPABASE_URL = 'https://jlczllsgnpitgvkdxqnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY3psbHNnbnBpdGd2a2R4cW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDY5MTgsImV4cCI6MjA4NTc4MjkxOH0.j7kjimXlXqXizGeVoYFX6upJO0JKTbILdp3lETgClYs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const map = {
  contractor: {
    table: 'contractors',
    toDB: (c: Contractor) => ({ id: c.id, name: c.name, tax_id: c.taxId, contact: c.contact }),
    fromDB: (c: any): Contractor => ({ id: c.id, name: c.name, taxId: c.tax_id, contact: c.contact })
  },
  project: {
    table: 'projects',
    toDB: (p: Project) => ({ id: p.id, name: p.name, file_number: p.fileNumber, budget: p.budget, contractor_id: p.contractorId, start_date: p.startDate, status: p.status }),
    fromDB: (p: any): Project => ({ id: p.id, name: p.name, fileNumber: p.file_number, budget: p.budget, contractorId: p.contractor_id, startDate: p.start_date, status: p.status })
  },
  certificate: {
    table: 'certificates',
    toDB: (c: Certificate) => ({ id: c.id, project_id: c.projectId, period: c.period, physical_progress: c.physicalProgress, financial_amount: c.financialAmount, timestamp: c.timestamp }),
    fromDB: (c: any): Certificate => ({ id: c.id, projectId: c.project_id, period: c.period, physicalProgress: c.physical_progress, financialAmount: c.financial_amount, timestamp: c.timestamp })
  },
  payment: {
    table: 'payments',
    toDB: (p: Payment) => ({ id: p.id, project_id: p.projectId, amount: p.amount, payment_date: p.date, reference: p.reference }),
    fromDB: (p: any): Payment => ({ id: p.id, projectId: p.project_id, amount: p.amount, date: p.payment_date, reference: p.reference })
  }
};

const App: React.FC = () => {
  const [state, setState] = useState<ConstructionState>(() => {
    const local = localStorage.getItem('obraapp_v1_data');
    return local ? JSON.parse(local) : { contractors: [], projects: [], certificates: [], payments: [] };
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dbStatus, setDbStatus] = useState<'syncing' | 'connected' | 'error'>('syncing');

  const loadFromCloud = async () => {
    setDbStatus('syncing');
    try {
      const [
        { data: c }, { data: pr }, { data: ce }, { data: pa }
      ] = await Promise.all([
        supabase.from('contractors').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('certificates').select('*'),
        supabase.from('payments').select('*')
      ]);

      setState({
        contractors: (c || []).map(map.contractor.fromDB),
        projects: (pr || []).map(map.project.fromDB),
        certificates: (ce || []).map(map.certificate.fromDB),
        payments: (pa || []).map(map.payment.fromDB)
      });
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
    }
  };

  useEffect(() => { loadFromCloud(); }, []);

  // Función de borrado sincronizado
  const handleDelete = async (type: keyof ConstructionState, id: string) => {
    const tableName = map[type.slice(0, -1) as keyof typeof map]?.table;
    if (!tableName) return;

    setDbStatus('syncing');
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      
      if (error) {
        if (error.code === '23503') {
          alert("No se puede eliminar: Este registro tiene datos vinculados (ej: una obra tiene pagos o certificados cargados). Borre primero los datos dependientes.");
        } else {
          alert(`Error al borrar en la nube: ${error.message}`);
        }
        setDbStatus('error');
        return;
      }

      // Si se borró en la nube con éxito, actualizamos localmente
      setState(prev => ({
        ...prev,
        [type]: (prev[type] as any[]).filter((item: any) => item.id !== id)
      }));
      setDbStatus('connected');
    } catch (e) {
      setDbStatus('error');
    }
  };

  useEffect(() => {
    localStorage.setItem('obraapp_v1_data', JSON.stringify(state));
    const syncToCloud = async () => {
      try {
        if (state.contractors.length > 0) await supabase.from('contractors').upsert(state.contractors.map(map.contractor.toDB));
        if (state.projects.length > 0) await supabase.from('projects').upsert(state.projects.map(map.project.toDB));
        if (state.certificates.length > 0) await supabase.from('certificates').upsert(state.certificates.map(map.certificate.toDB));
        if (state.payments.length > 0) await supabase.from('payments').upsert(state.payments.map(map.payment.toDB));
        setDbStatus('connected');
      } catch (e) { setDbStatus('error'); }
    };
    const timer = setTimeout(syncToCloud, 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'projects': return <ProjectManager state={state} setState={setState} onDelete={(id) => handleDelete('projects', id)} />;
      case 'contractors': return <ContractorManager state={state} setState={setState} onDelete={(id) => handleDelete('contractors', id)} />;
      case 'payments': return <FinancialTracking state={state} setState={setState} onDelete={(type, id) => handleDelete(type as any, id)} />;
      case 'summary': return <NecessaryPayments state={state} />;
      case 'ai': return <AIAssistant state={state} />;
      case 'settings': return <BackupSettings state={state} setState={setState} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <aside className={`bg-[#3b82f6] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-2xl z-20`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-lg shrink-0 shadow-sm">
              <div className="w-6 h-6 bg-[#3b82f6] rounded-md flex items-center justify-center font-black text-white text-[10px]">OA</div>
            </div>
            {isSidebarOpen && <span className="font-bold text-2xl tracking-tight text-white">Obra<span className="font-medium opacity-90">App</span></span>}
          </div>
        </div>
        <nav className="flex-1 mt-6 px-4 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<FileStack size={20} />} label="Obras" active={activeView === 'projects'} onClick={() => setActiveView('projects')} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<HardHat size={20} />} label="Contratistas" active={activeView === 'contractors'} onClick={() => setActiveView('contractors')} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<Wallet size={20} />} label="Pagos" active={activeView === 'payments'} onClick={() => setActiveView('payments')} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<PieChart size={20} />} label="Partidas" active={activeView === 'summary'} onClick={() => setActiveView('summary')} collapsed={!isSidebarOpen} />
          <SidebarItem icon={<BrainCircuit size={20} />} label="Auditor IA" active={activeView === 'ai'} onClick={() => setActiveView('ai')} collapsed={!isSidebarOpen} />
        </nav>
        <div className="p-4 mt-auto border-t border-white/10">
          <SidebarItem icon={<SettingsIcon size={20} />} label="Configuración" active={activeView === 'settings'} onClick={() => setActiveView('settings')} collapsed={!isSidebarOpen} />
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
             <button 
               onClick={loadFromCloud}
               className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
               dbStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
               dbStatus === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'
             }`}>
                {dbStatus === 'connected' ? <CloudCheck size={14} /> : 
                 dbStatus === 'error' ? <CloudOff size={14} /> : <RefreshCcw size={14} className="animate-spin" />}
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {dbStatus === 'connected' ? 'Nube OK' : dbStatus === 'error' ? 'Error Nube' : 'Sincronizando...'}
                </span>
             </button>
             <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">AD</div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, collapsed }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-white text-[#3b82f6] shadow-lg' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="font-bold text-sm whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
