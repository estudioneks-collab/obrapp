
import React from 'react';
import { ConstructionState } from '../types';
import { CreditCard, AlertTriangle, CheckCircle2, ListFilter, Coins } from 'lucide-react';
import { formatCurrency } from '../App';

const NecessaryPayments: React.FC<{ state: ConstructionState }> = ({ state }) => {
  const summaries = state.projects.map(p => {
    const projectCerts = state.certificates.filter(c => c.projectId === p.id);
    
    const certGrossTotal = projectCerts.reduce((acc, curr) => acc + curr.financialAmount, 0);
    const amortTotal = projectCerts.reduce((acc, curr) => acc + curr.advanceAmortization, 0);
    
    // El monto neto certificado es lo que el contratista realmente debería haber cobrado
    const netCertified = certGrossTotal - amortTotal;
    
    const paidTotal = state.payments
      .filter(pay => pay.projectId === p.id)
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    // Deuda = Neto Certificado - Pagado
    const debt = netCertified - paidTotal;

    return { ...p, certGrossTotal, amortTotal, netCertified, paidTotal, debt };
  });

  const totalOwed = summaries.reduce((acc, s) => acc + s.debt, 0);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="max-w-md">
          <h2 className="text-3xl font-black mb-3">Partidas Necesarias</h2>
          <p className="text-slate-400 text-lg leading-relaxed">Resumen de deuda neta (descontando amortizaciones de anticipo) por obra.</p>
        </div>
        <div className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 text-center min-w-[240px]">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Adeudado Neto</p>
          <p className="text-4xl font-black">${formatCurrency(totalOwed)}</p>
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
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest truncate">
                {state.contractors.find(c => c.id === s.contractorId)?.name}
              </p>
            </div>

            <div className="flex-1 p-8 grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bruto Certificado</p>
                <p className="text-sm font-bold text-slate-700">${formatCurrency(s.certGrossTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Amortizado</p>
                <p className="text-sm font-bold text-blue-600">-${formatCurrency(s.amortTotal)}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Pagado</p>
                <p className="text-sm font-bold text-emerald-600">${formatCurrency(s.paidTotal)}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Deuda Neta</p>
                <p className="text-lg font-black text-red-600">${formatCurrency(s.debt)}</p>
              </div>
            </div>

            <div className="p-8 flex items-center justify-center bg-slate-50/50">
              {s.debt > 0.01 ? (
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
      </div>
    </div>
  );
};

export default NecessaryPayments;
