
import React, { useState, useEffect, useCallback } from 'react';
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
  CloudOff
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { ConstructionState, ViewType } from './types';
import Dashboard from './components/Dashboard';
import ProjectManager from './components/ProjectManager';
import ContractorManager from './components/ContractorManager';
import FinancialTracking from './components/FinancialTracking';
import NecessaryPayments from './components/NecessaryPayments';
import AIAssistant from './components/AIAssistant';
import BackupSettings from './components/BackupSettings';

const Logo = ({ collapsed }: { collapsed: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="bg-white p-1.5 rounded-lg shrink-0">
      <div className="w-6 h-6 bg-[#3b82f6] rounded-md flex items-center justify-center font-black text-white text-[10px]">
        OA
      </div>
    </div>
    {!collapsed && (
      <span className="font-bold text-2xl tracking-tight text-white">
        Obra<span className="font-medium opacity-90">App</span>
      </span>
    )}
  </div>
);

const App: React.FC = () => {
  const [state, setState] = useState<ConstructionState>(() => {
    const saved = localStorage.getItem('obraapp_v1_data');
    if (saved) return JSON.parse(saved);
    return {
      contractors: [],
      projects: [],
      certificates: [],
      payments: []
    };
  });

  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dbStatus, setDbStatus] = useState<'local' | 'syncing' | 'connected' | 'error'>('local');

  // Supabase Credentials (loaded from localStorage for persistence)
  const sbUrl = localStorage.getItem('sb_url') || '';
  const sbKey = localStorage.getItem('sb_key') || '';
  
  const supabase = (sbUrl && sbKey) ? createClient(sbUrl, sbKey) : null;

  // Initial Fetch from Supabase
  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) return;
      setDbStatus('syncing');
      try {
        const [
          { data: contractors },
          { data: projects },
          { data: certificates },
          { data: payments }
        ] = await Promise.all([
          supabase.from('contractors').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('certificates').select('*'),
          supabase.from('payments').select('*')
        ]);

        if (contractors || projects || certificates || payments) {
          setState({
            contractors: contractors || [],
            projects: projects || [],
            certificates: certificates || [],
            payments: payments || []
          });
          setDbStatus('connected');
        }
      } catch (err) {
        console.error("Supabase fetch error:", err);
        setDbStatus('error');
      }
    };

    fetchData();
  }, [sbUrl, sbKey]); // Re-run when credentials change

  // Sync to Supabase and LocalStorage
  useEffect(() => {
    localStorage.setItem('obraapp_v1_data', JSON.stringify(state));
    
    const syncToCloud = async () => {
      if (!supabase || dbStatus === 'syncing') return;
      
      // In a real production app, we would only sync deltas. 
      // For this implementation, we handle logical upserts on state change.
      // This is a simplified version of cloud sync.
      try {
        // Example for contractors (logical sync)
        if (state.contractors.length > 0) {
           await supabase.from('contractors').upsert(state.contractors);
        }
        if (state.projects.length > 0) {
           await supabase.from('projects').upsert(state.projects);
        }
        // ... same for others as needed
      } catch (e) {
        console.warn("Auto-sync failed, check RLS policies in Supabase", e);
      }
    };

    syncToCloud();
  }, [state, supabase]);

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard': return <Dashboard state={state} />;
      case 'projects': return <ProjectManager state={state} setState={setState} />;
      case 'contractors': return <ContractorManager state={state} setState={setState} />;
      case 'payments': return <FinancialTracking state={state} setState={setState} />;
      case 'summary': return <NecessaryPayments state={state} />;
      case 'ai': return <AIAssistant state={state} />;
      case 'settings': return <BackupSettings state={state} setState={setState} />;
      default: return <Dashboard state={state} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-[#3b82f6] text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shadow-2xl z-20`}>
        <div className="p-6 border-b border-white/10">
          <Logo collapsed={!isSidebarOpen} />
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
          <SidebarItem 
            icon={<SettingsIcon size={20} />} 
            label="Config / Supabase" 
            active={activeView === 'settings'} 
            onClick={() => setActiveView('settings')} 
            collapsed={!isSidebarOpen} 
          />
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-6">
             <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border hidden sm:flex transition-colors ${
               dbStatus === 'connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
               dbStatus === 'error' ? 'bg-red-50 text-red-700 border-red-100' :
               dbStatus === 'syncing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
               'bg-slate-50 text-slate-700 border-slate-100'
             }`}>
                {dbStatus === 'connected' ? <CloudCheck size={14} /> : <Database size={14} className={dbStatus === 'syncing' ? 'animate-spin' : ''} />}
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {dbStatus === 'connected' ? 'Supabase Conectado' : 
                   dbStatus === 'error' ? 'Error de Conexión' :
                   dbStatus === 'syncing' ? 'Sincronizando...' :
                   'Modo Local'}
                </span>
             </div>
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
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active 
        ? 'bg-white text-[#3b82f6] shadow-lg' 
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`}
  >
    <span className="shrink-0">{icon}</span>
    {!collapsed && <span className="font-bold text-sm whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
