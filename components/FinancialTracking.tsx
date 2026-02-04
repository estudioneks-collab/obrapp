
import React, { useState } from 'react';
import { ConstructionState, Certificate, Payment, Project } from '../types';
import { Wallet, Plus, FileText, X, Trash2, FolderClosed, ChevronRight, ArrowLeft, FolderOpen, Coins, ClipboardList } from 'lucide-react';
import { formatCurrency } from '../App';

interface FinancialTrackingProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
  onDelete?: (type: string, id: string) => void;
}

const FinancialTracking: React.FC<FinancialTrackingProps> = ({ state, setState, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'certs' | 'payments'>('certs');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Proyecto seleccionado actualmente para la vista de detalle
  const selectedProject = state.projects.find(p => p.id === selectedProjectId);

  const handleAddCertificate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pId = formData.get('projectId') as string;
    const project = state.projects.find(p => p.id === pId);
    
    if (!project) return;

    const financialAmount = Number(formData.get('financialAmount'));
    const advanceAmortization = financialAmount * (project.advanceRecoveryRate / 100);

    const newCert: Certificate = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: pId,
      period: formData.get('period') as string,
      physicalProgress: Number(formData.get('physicalProgress')),
      financialAmount: financialAmount,
      advanceAmortization: advanceAmortization,
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

  const removeItem = (type: 'certificates' | 'payments', id: string) => {
    if (confirm(`¿Seguro que desea eliminar este ${type === 'certificates' ? 'certificado' : 'pago'}?`)) {
      if (onDelete) onDelete(type, id);
    }
  };

  // Si no hay proyecto seleccionado, mostramos el "Listado de Carpetas"
  if (!selectedProjectId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Archivo de Obras</h2>
          <p className="text-slate-500 text-sm">Seleccione una carpeta para gestionar certificados y pagos.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.projects.map(project => {
            const certs = state.certificates.filter(c => c.projectId === project.id);
            const pays = state.payments.filter(p => p.projectId === project.id);
            const totalCert = certs.reduce((acc, c) => acc + c.financialAmount, 0);
            const totalPaid = pays.reduce((acc, p) => acc + p.amount, 0);
            const contractor = state.contractors.find(c => c.id === project.contractorId);

            return (
              <button 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all text-left group flex flex-col items-start"
              >
                <div className="flex justify-between w-full mb-6">
                  <div className="p-4 bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 rounded-3xl transition-colors">
                    <FolderClosed size={32} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-full uppercase">EXP: {project.fileNumber}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors leading-tight">{project.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{contractor?.name}</p>

                <div className="mt-auto w-full grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certificado</p>
                    <p className="text-sm font-bold text-slate-700">${formatCurrency(totalCert)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Pagado</p>
                    <p className="text-sm font-bold text-emerald-600">${formatCurrency(totalPaid)}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Vista de Detalle (Dentro de una carpeta)
  const projectCerts = state.certificates.filter(c => c.projectId === selectedProjectId);
  const projectPayments = state.payments.filter(p => p.projectId === selectedProjectId);
  const totalPaid = projectPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSelectedProjectId(null)}
            className="p-3 hover:bg-slate-200 bg-slate-100 text-slate-600 rounded-2xl transition-all"
            title="Volver al listado"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FolderOpen size={18} className="text-blue-600" />
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedProject?.name}</h2>
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Carpeta de Obra • EXP {selectedProject?.fileNumber}</p>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> {activeTab === 'certs' ? 'Nuevo Certificado' : 'Registrar Pago'}
        </button>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit shadow-inner">
        <button 
          onClick={() => setActiveTab('certs')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'certs' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <ClipboardList size={16} /> Certificados ({projectCerts.length})
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'payments' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <Wallet size={16} /> Pagos Realizados ({projectPayments.length})
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
        {activeTab === 'certs' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Periodo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avance Físico</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Bruto Certificado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-widest text-right">Amort. Anticipo</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-800 uppercase tracking-widest text-right">Neto a Pagar</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {projectCerts.length > 0 ? projectCerts.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 font-bold text-slate-700 text-sm uppercase">{c.period}</td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-black text-blue-600">{c.physicalProgress.toLocaleString('es-AR')}%</span>
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-slate-500 text-sm">
                      ${formatCurrency(c.financialAmount)}
                    </td>
                    <td className="px-8 py-5 text-right font-bold text-blue-500 text-sm">
                      -${formatCurrency(c.advanceAmortization)}
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900 text-sm">
                      ${formatCurrency(c.financialAmount - c.advanceAmortization)}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button onClick={() => removeItem('certificates', c.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-medium italic">No hay certificados registrados en esta obra.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-8 bg-emerald-50/30 border-b border-emerald-50 flex justify-between items-center">
               <div className="flex items-center gap-3">
                 <Wallet className="text-emerald-500" size={24} />
                 <span className="font-black text-slate-700 uppercase tracking-widest text-xs">Consolidado de Transferencias</span>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Total Acumulado Pagado</p>
                 <p className="text-2xl font-black text-emerald-600">${formatCurrency(totalPaid)}</p>
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white border-b border-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Referencia / Comprobante</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Pagado</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {projectPayments.length > 0 ? projectPayments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-4 text-sm font-bold text-slate-600">{p.date}</td>
                      <td className="px-8 py-4 text-sm text-slate-500 font-medium">{p.reference}</td>
                      <td className="px-8 py-4 text-right font-black text-slate-800 text-sm">
                        ${formatCurrency(p.amount)}
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button onClick={() => removeItem('payments', p.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center text-slate-400 font-medium italic">No se han registrado pagos para esta obra.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Obra (Auto-seleccionada)</label>
                <select 
                  name="projectId" 
                  defaultValue={selectedProjectId}
                  className="w-full px-5 py-3.5 bg-slate-100 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-slate-400 cursor-not-allowed" 
                  required
                >
                  <option value={selectedProject?.id}>{selectedProject?.name}</option>
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
                      <input type="number" step="0.01" name="physicalProgress" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12.5" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto Certificado Bruto ($)</label>
                    <input type="number" step="any" name="financialAmount" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="450000" required />
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 mt-2 flex items-center gap-2">
                       <Coins size={14} className="text-blue-500" />
                       <p className="text-[9px] text-blue-600 font-bold uppercase">Se descontará un {selectedProject?.advanceRecoveryRate}% de amortización.</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Monto a Pagar ($)</label>
                      <input type="number" step="any" name="amount" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono" placeholder="300000" required />
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
