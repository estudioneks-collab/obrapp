
import React, { useState } from 'react';
import { ConstructionState, Certificate, Payment } from '../types';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, CheckCircle2, FileText, X, Trash2 } from 'lucide-react';

interface FinancialTrackingProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
  onDelete?: (type: string, id: string) => void;
}

const FinancialTracking: React.FC<FinancialTrackingProps> = ({ state, setState, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'certs' | 'payments'>('certs');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCertificate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newCert: Certificate = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: formData.get('projectId') as string,
      period: formData.get('period') as string,
      physicalProgress: Number(formData.get('physicalProgress')),
      financialAmount: Number(formData.get('financialAmount')),
      timestamp: new Date().toISOString()
    };
    setState(prev => ({ ...prev, certificates: [...prev.certificates, newCert] }));
    setIsModalOpen(false);
  };

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPayment: Payment = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: formData.get('projectId') as string,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      reference: formData.get('reference') as string
    };
    setState(prev => ({ ...prev, payments: [...prev.payments, newPayment] }));
    setIsModalOpen(false);
  };

  const removeItem = (type: string, id: string) => {
    if (confirm(`¿Seguro que desea eliminar este ${type === 'certificates' ? 'certificado' : 'pago'}?`)) {
      if (onDelete) onDelete(type, id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Caja y Certificación</h2>
          <p className="text-slate-500 text-sm">Registro de avances mensuales y movimientos de fondos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
        >
          <Plus size={20} /> {activeTab === 'certs' ? 'Cargar Certificado' : 'Registrar Pago'}
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('certs')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'certs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Certificados de Obra
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'payments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Pagos Realizados
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        {activeTab === 'certs' ? (
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obra</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avance Físico</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Certificado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.certificates.map(c => {
                const proj = state.projects.find(p => p.id === c.projectId);
                return (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{proj?.name || 'Obra Borrada'}</p>
                      <p className="text-[10px] font-medium text-slate-400">EXP: {proj?.fileNumber}</p>
                    </td>
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{c.period}</td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-black text-blue-600">{c.physicalProgress}%</span>
                        <div className="w-16 bg-blue-50 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{width: `${c.physicalProgress}%`}} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-800 text-sm">
                      ${c.financialAmount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => removeItem('certificates', c.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {state.certificates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No hay certificados cargados</td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Obra / Destino</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Referencia</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Pagado</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {state.payments.map(p => {
                const proj = state.projects.find(pr => pr.id === p.projectId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-slate-600">{p.date}</td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-700">{proj?.name}</p>
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500">{p.reference}</td>
                    <td className="px-8 py-5 text-right font-black text-emerald-600 text-sm">
                      ${p.amount.toLocaleString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button onClick={() => removeItem('payments', p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {state.payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 italic">No se han registrado pagos aún</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">
                {activeTab === 'certs' ? 'Nuevo Certificado Mensual' : 'Registro de Pago'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={activeTab === 'certs' ? handleAddCertificate : handleAddPayment} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seleccionar Obra</label>
                <select name="projectId" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none" required>
                  <option value="">Seleccione obra...</option>
                  {state.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {activeTab === 'certs' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Periodo (MM/YYYY)</label>
                      <input name="period" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="03/2024" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Avance Físico (%)</label>
                      <input type="number" step="0.1" name="physicalProgress" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12.5" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Certificado Financiero ($)</label>
                    <input type="number" name="financialAmount" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="450000" required />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a Pagar ($)</label>
                      <input type="number" name="amount" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="300000" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Pago</label>
                      <input type="date" name="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia / Observaciones</label>
                    <input name="reference" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Orden de Pago N° 442" required />
                  </div>
                </>
              )}

              <button type="submit" className={`w-full py-4 text-white rounded-2xl font-black text-lg shadow-xl transition-all mt-4 ${activeTab === 'certs' ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'}`}>
                {activeTab === 'certs' ? 'Confirmar Certificado' : 'Efectuar Pago'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTracking;
