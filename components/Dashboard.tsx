
import React from 'react';
import { ConstructionState } from '../types';
import { TrendingUp, Wallet, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard: React.FC<{ state: ConstructionState }> = ({ state }) => {
  const totalBudget = state.projects.reduce((acc, p) => acc + p.budget, 0);
  const totalCertificated = state.certificates.reduce((acc, c) => acc + c.financialAmount, 0);
  const totalPaid = state.payments.reduce((acc, p) => acc + p.amount, 0);
  const totalDebt = totalCertificated - totalPaid;

  const chartData = state.projects.map(p => {
    const certs = state.certificates.filter(c => c.projectId === p.id);
    const progress = certs.reduce((acc, c) => acc + c.financialAmount, 0);
    return {
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      presupuesto: p.budget,
      ejecutado: progress
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Monitor de Gestión Pública</h2>
        <p className="text-slate-500">Consolidado general de obras y compromisos financieros.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI 
          label="Presupuesto Total" 
          value={`$${totalBudget.toLocaleString()}`} 
          sub="Obras registradas" 
          icon={<DollarSign className="text-blue-600" />} 
          color="bg-blue-50"
        />
        <KPI 
          label="Ejecución (Certificado)" 
          value={`$${totalCertificated.toLocaleString()}`} 
          sub={`${((totalCertificated/totalBudget)*100 || 0).toFixed(1)}% del total`} 
          icon={<TrendingUp className="text-amber-600" />} 
          color="bg-amber-50"
        />
        <KPI 
          label="Pagado" 
          value={`$${totalPaid.toLocaleString()}`} 
          sub="Transferencias realizadas" 
          icon={<CheckCircle2 className="text-emerald-600" />} 
          color="bg-emerald-50"
        />
        <KPI 
          label="Deuda Pendiente" 
          value={`$${totalDebt.toLocaleString()}`} 
          sub="Partidas por cancelar" 
          icon={<AlertCircle className="text-red-600" />} 
          color="bg-red-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Comparativa de Ejecución por Obra</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="presupuesto" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Presupuesto" />
                <Bar dataKey="ejecutado" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Ejecutado" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick List */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Últimos Movimientos</h3>
          <div className="space-y-4">
            {state.payments.slice(-5).reverse().map(p => {
              const proj = state.projects.find(pr => pr.id === p.projectId);
              return (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors border border-transparent hover:border-slate-100">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Wallet size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{proj?.name || 'Obra desconocida'}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{p.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-800">${p.amount.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
            {state.payments.length === 0 && (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 italic">No hay registros recientes</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPI = ({ label, value, sub, icon, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        {icon}
      </div>
    </div>
    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</p>
    <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-1 font-medium">{sub}</p>
  </div>
);

export default Dashboard;
