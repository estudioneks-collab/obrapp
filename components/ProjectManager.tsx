
import React, { useState } from 'react';
import { ConstructionState, Project } from '../types';
import { Plus, Search, FileText, ChevronRight, Hash, X, Trash2 } from 'lucide-react';

interface ProjectManagerProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
  onDelete?: (id: string) => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ state, setState, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      fileNumber: formData.get('fileNumber') as string,
      budget: Number(formData.get('budget')),
      contractorId: formData.get('contractorId') as string,
      startDate: formData.get('startDate') as string,
      status: 'active'
    };
    setState(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
    setIsModalOpen(false);
  };

  const removeProject = (id: string) => {
    if(confirm('¿Desea eliminar esta obra? Se borrarán también los certificados y pagos asociados si la base de datos lo permite.')) {
      if (onDelete) onDelete(id);
    }
  };

  const filtered = state.projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.fileNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Obras y Expedientes</h2>
          <p className="text-slate-500 text-sm">Administra la cartera de proyectos activos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
        >
          <Plus size={20} /> Nueva Obra
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar por nombre o N° de expediente..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(project => {
          const contractor = state.contractors.find(c => c.id === project.contractorId);
          const totalCertificated = state.certificates
            .filter(c => c.projectId === project.id)
            .reduce((acc, curr) => acc + curr.financialAmount, 0);
          const progressPercent = (totalCertificated / project.budget) * 100;

          return (
            <div key={project.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
              <button 
                onClick={() => removeProject(project.id)}
                className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 z-10"
              >
                <Trash2 size={20} />
              </button>

              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <FileText size={20} />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500">
                  <Hash size={10} />
                  EXP: {project.fileNumber}
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors truncate pr-8">{project.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {contractor?.name || 'Sin contratista asignado'}
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase">Presupuesto</span>
                  <span className="text-slate-700">${project.budget.toLocaleString()}</span>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400 uppercase">Avance Financiero</span>
                    <span className="text-blue-600">{progressPercent.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-500" style={{width: `${progressPercent}%`}} />
                  </div>
                </div>

                <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors">
                  Ver Detalle Completo <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-800">Alta de Obra Pública</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Proyecto</label>
                <input name="name" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Pavimentación Av. Central" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">N° Expediente</label>
                  <input name="fileNumber" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="00-1234/24" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Presupuesto ($)</label>
                  <input type="number" name="budget" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="15000000" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Empresa Contratista</label>
                <select name="contractorId" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none" required>
                  <option value="">Seleccione una empresa...</option>
                  {state.contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Inicio</label>
                <input type="date" name="startDate" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" required />
              </div>
              <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all mt-4">
                Registrar Obra
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManager;
