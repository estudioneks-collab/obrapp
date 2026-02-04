
import React from 'react';
import { ConstructionState } from '../types';
import { CreditCard, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';

const NecessaryPayments: React.FC<{ state: ConstructionState }> = ({ state }) => {
  const summaries = state.projects.map(p => {
    const certTotal = state.certificates
      .filter(c => c.projectId === p.id)
      .reduce((acc, curr) => acc + curr.financialAmount, 0);
    const paidTotal = state.payments
      .filter(pay => pay.projectId === p.id)
      .reduce((acc, curr) => acc + curr.amount, 0);
    const debt = certTotal - paidTotal;

    return { ...p, certTotal, paidTotal, debt };
  });

  const totalOwed = summaries.reduce((acc, s) => acc + s.debt, 0);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="max-w-md">
          <h2 className="text-3xl font-black mb-3">Partidas Necesarias</h2>
          <p className="text-slate-400 text-lg leading-relaxed">Resumen consolidado de deuda por obra para el pago mensual o cancelación de saldos.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center min-w-[240px]">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Adeudado</p>
          <p className="text-4xl font-black">${totalOwed.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {summaries.map(s => (
          <div key={s.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch">
            <div className="p-8 md:w-1/3 bg-slate-50 border-r border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">EXP: {s.fileNumber}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">{s.name}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                {state.contractors.find(c => c.id === s.contractorId)?.name}
              </p>
            </div>

            <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-3 gap-8 items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Certificado</p>
                <p className="text-lg font-bold text-slate-700">${s.certTotal.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pagado</p>
                <p className="text-lg font-bold text-emerald-600">${s.paidTotal.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">A Pagar / Deuda</p>
                <p className="text-xl font-black text-red-600">${s.debt.toLocaleString()}</p>
              </div>
            </div>

            <div className="p-8 flex items-center justify-center bg-slate-50/50">
              {s.debt > 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-red-100 text-red-600 rounded-full animate-pulse">
                    <AlertTriangle size={24} />
                  </div>
                  <span className="text-[10px] font-black text-red-500 uppercase">Pago Pendiente</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">Al Día</span>
                </div>
              )}
            </div>
          </div>
        ))}
        {summaries.length === 0 && (
          <div className="py-32 text-center text-slate-400">
            <ListFilter size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold">No hay proyectos para procesar pagos</p>
            <p className="text-sm">Carga una obra y un certificado para empezar.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NecessaryPayments;
