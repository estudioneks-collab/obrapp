
import React, { useState, useEffect } from 'react';
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
  CloudCheck,
  CloudOff,
  RefreshCcw,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { createClient, User } from '@supabase/supabase-js';
import { ConstructionState, ViewType, Contractor, Project, Certificate, Payment } from './types';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ContractorManager from './components/ContractorManager';
import FinancialTracking from './components/FinancialTracking';
import NecessaryPayments from './components/NecessaryPayments';
import AIAssistant from './components/AIAssistant';
import BackupSettings from './components/BackupSettings';
import Auth from './components/Auth';

const SUPABASE_URL = 'https://jlczllsgnpitgvkdxqnc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsY3psbHNnbnBpdGd2a2R4cW5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDY5MTgsImV4cCI6MjA4NTc4MjkxOH0.j7kjimXlXqXizGeVoYFX6upJO0JKTbILdp3lETgClYs';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dbRegistry = {
  contractors: {
    table: 'contractors',
    toDB: (c: Contractor) => ({ id: c.id, name: c.name, tax_id: c.taxId, contact: c.contact }),
    fromDB: (c: any): Contractor => ({ id: c.id, name: c.name, taxId: c.tax_id, contact: c.contact })
  },
  projects: {
    table: 'projects',
    toDB: (p: Project) => ({ id: p.id, name: p.name, file_number: p.fileNumber, budget: p.budget, contractor_id: p.contractorId, start_date: p.startDate, status: p.status }),
    fromDB: (p: any): Project => ({ id: p.id, name: p.name, fileNumber: p.file_number, budget: p.budget, contractorId: p.contractor_id, startDate: p.start_date, status: p.status })
  },
  certificates: {
    table: 'certificates',
    toDB: (c: Certificate) => ({ id: c.id, project_id: c.projectId, period: c.period, physical_progress: c.physicalProgress, financial_amount: c.financialAmount, timestamp: c.timestamp }),
    fromDB: (c: any): Certificate => ({ id: c.id, projectId: c.project_id, period: c.period, physicalProgress: c.physical_progress, financialAmount: c.financial_amount, timestamp: c.timestamp })
  },
  payments: {
    table: 'payments',
    toDB: (p: Payment) => ({ id: p.id, project_id: p.projectId, amount: p.amount, payment_date: p.date, reference: p.reference }),
    fromDB: (p: any): Payment => ({ id: p.id, projectId: p.project_id, amount: p.amount, date: p.payment_date, reference: p.reference })
  }
};

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [state, setState] = useState<ConstructionState>({ contractors: [], projects: [], certificates: [], payments: [] });
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dbStatus, setDbStatus] = useState<'syncing' | 'connected' | 'error'>('syncing');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setState({ contractors: [], projects: [], certificates: [], payments: [] });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (data) setProfile(data);
  };

  const loadFromCloud = async () => {
    if (!session) return;
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
        contractors: (c || []).map(dbRegistry.contractors.fromDB),
        projects: (pr || []).map(dbRegistry.projects.fromDB),
        certificates: (ce || []).map(dbRegistry.certificates.fromDB),
        payments: (pa || []).map(dbRegistry.payments.fromDB)
      });
      setDbStatus('connected');
    } catch (err) {
      setDbStatus('error');
    }
  };

  useEffect(() => {
    if (session) loadFromCloud();
  }, [session]);

  const handleDelete = async (type: keyof ConstructionState, id: string) => {
    const config = dbRegistry[type];
    if (!config) return;

    setDbStatus('syncing');
    try {
      const { error } = await supabase.from(config.table).delete().eq('id', id);
      if (error) {
        alert(error.code === '23503' ? "Debe borrar primero los datos vinculados." : error.message);
        setDbStatus('error');
        return;
      }
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
    if (!session) return;
    const syncToCloud = async () => {
      try {
        if (state.contractors.length > 0) await supabase.from('contractors').upsert(state.contractors.map(dbRegistry.contractors.toDB));
        if (state.projects.length > 0) await supabase.from('projects').upsert(state.projects.map(dbRegistry.projects.toDB));
        if (state.certificates.length > 0) await supabase.from('certificates').upsert(state.certificates.map(dbRegistry.certificates.toDB));
        if (state.payments.length > 0) await supabase.from('payments').upsert(state.payments.map(dbRegistry.payments.toDB));
        setDbStatus('connected');
      } catch (e) { setDbStatus('error'); }
    };
    const timer = setTimeout(syncToCloud, 2000);
    return () => clearTimeout(timer);
  }, [state, session]);

  if (!session) return <Auth />;

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
          
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 pr-6 border-r border-slate-100">
               <div className="text-right">
                 <p className="text-xs font-black text-slate-800 leading-none">{profile?.full_name || 'Cargando...'}</p>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{profile?.position || 'Usuario'}</p>
               </div>
               <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-lg">
                 {profile?.full_name?.charAt(0) || 'U'}
               </div>
             </div>

             <div className="flex items-center gap-2">
               <button onClick={loadFromCloud} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                 {dbStatus === 'syncing' ? <RefreshCcw size={18} className="animate-spin text-blue-500" /> : <CloudCheck size={18} className="text-emerald-500" />}
               </button>
               <button onClick={() => supabase.auth.signOut()} className="p-2 hover:bg-red-50 text-red-500 rounded-xl transition-colors" title="Cerrar Sesión">
                 <LogOut size={18} />
               </button>
             </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {activeView === 'dashboard' && <Dashboard state={state} />}
          {activeView === 'projects' && <ProjectManager state={state} setState={setState} onDelete={(id) => handleDelete('projects', id)} />}
          {activeView === 'contractors' && <ContractorManager state={state} setState={setState} onDelete={(id) => handleDelete('contractors', id)} />}
          {activeView === 'payments' && <FinancialTracking state={state} setState={setState} onDelete={(type, id) => handleDelete(type as any, id)} />}
          {activeView === 'summary' && <NecessaryPayments state={state} />}
          {activeView === 'ai' && <AIAssistant state={state} />}
          {activeView === 'settings' && <BackupSettings state={state} setState={setState} />}
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
