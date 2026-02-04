
import React, { useState } from 'react';
import { ConstructionState, Contractor } from '../types';
import { Plus, Trash2, HardHat, Phone, Hash, X } from 'lucide-react';

interface ContractorManagerProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
  onDelete?: (id: string) => void;
}

const ContractorManager: React.FC<ContractorManagerProps> = ({ state, setState, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newContractor: Contractor = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      taxId: formData.get('taxId') as string,
      contact: formData.get('contact') as string,
    };
    setState(prev => ({ ...prev, contractors: [...prev.contractors, newContractor] }));
    setIsModalOpen(false);
  };

  const removeContractor = (id: string) => {
    if(confirm('¿Desea eliminar esta empresa de la base de datos?')) {
      if (onDelete) onDelete(id);
      else setState(prev => ({ ...prev, contractors: prev.contractors.filter(c => c.id !== id) }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro de Contratistas</h2>
          <p className="text-slate-500 text-sm">Empresas y proveedores habilitados.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg"
        >
          <Plus size={20} /> Nueva Empresa
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.contractors.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative group">
            <button 
              onClick={() => removeContractor(c.id)}
              className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={20} />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{c.name}</h3>
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest">
                  <Hash size={12} /> CUIT: {c.taxId}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <Phone size={16} />
                {c.contact}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                <HardHat size={16} />
                {state.projects.filter(p => p.contractorId === c.id).length} Obras Asignadas
              </div>
            </div>
          </div>
        ))}
        {state.contractors.length === 0 && (
          <div className="col-span-full py-32 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-slate-400">
            <HardHat size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">No hay contratistas registrados</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Nueva Empresa</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social</label>
                <input name="name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Construcciones S.A." required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CUIT / ID Fiscal</label>
                <input name="taxId" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="30-12345678-9" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contacto (Email/Tel)</label>
                <input name="contact" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="contacto@empresa.com" required />
              </div>
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all mt-4">
                Dar de Alta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractorManager;
