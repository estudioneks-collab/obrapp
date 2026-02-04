
import React, { useState } from 'react';
import { ProjectData, WorkItem } from '../types';
import { Search, Plus, MoreVertical, Edit2, Trash2, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface WorkItemsListProps {
  data: ProjectData;
  setData: React.Dispatch<React.SetStateAction<ProjectData>>;
}

const WorkItemsList: React.FC<WorkItemsListProps> = ({ data, setData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WorkItem | null>(null);

  const filteredItems = data.workItems.filter(item => 
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.includes(searchTerm)
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newItem: WorkItem = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      code: formData.get('code') as string,
      description: formData.get('description') as string,
      unit: formData.get('unit') as string,
      quantity: Number(formData.get('quantity')),
      unitPrice: Number(formData.get('unitPrice')),
      totalPrice: Number(formData.get('quantity')) * Number(formData.get('unitPrice')),
      progress: Number(formData.get('progress')),
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      contractorId: formData.get('contractorId') as string,
      status: formData.get('status') as WorkItem['status'],
    };

    if (editingItem) {
      setData(prev => ({
        ...prev,
        workItems: prev.workItems.map(i => i.id === editingItem.id ? newItem : i)
      }));
    } else {
      setData(prev => ({
        ...prev,
        workItems: [...prev.workItems, newItem]
      }));
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    if(window.confirm('¿Seguro que deseas eliminar esta partida?')) {
      setData(prev => ({
        ...prev,
        workItems: prev.workItems.filter(i => i.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por código o descripción..." 
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-200 font-medium"
        >
          <Plus size={18} />
          Nueva Partida
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cant/Unid</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Progreso</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Monto Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 font-mono text-sm text-blue-600 font-bold">{item.code}</td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-700">{item.description}</p>
                    <p className="text-xs text-slate-400">{data.contractors.find(c => c.id === item.contractorId)?.name || 'Sin asignar'}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{item.quantity} {item.unit}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-slate-100 rounded-full h-2 min-w-[100px]">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${item.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                        style={{width: `${item.progress}%`}}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 inline-block">{item.progress}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-700">${item.totalPrice.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingItem(item); setShowModal(true); }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => deleteItem(item.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">{editingItem ? 'Editar Partida' : 'Nueva Partida'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><Plus className="rotate-45" /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
                <input name="code" defaultValue={editingItem?.code} className="w-full px-4 py-2 border rounded-xl" required />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Descripción</label>
                <input name="description" defaultValue={editingItem?.description} className="w-full px-4 py-2 border rounded-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Unidad</label>
                <input name="unit" defaultValue={editingItem?.unit} className="w-full px-4 py-2 border rounded-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Cantidad</label>
                <input type="number" step="any" name="quantity" defaultValue={editingItem?.quantity} className="w-full px-4 py-2 border rounded-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Precio Unitario ($)</label>
                <input type="number" step="any" name="unitPrice" defaultValue={editingItem?.unitPrice} className="w-full px-4 py-2 border rounded-xl" required />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Progreso (%)</label>
                <input type="number" min="0" max="100" name="progress" defaultValue={editingItem?.progress || 0} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Contratista</label>
                <select name="contractorId" defaultValue={editingItem?.contractorId} className="w-full px-4 py-2 border rounded-xl bg-white">
                  <option value="">Seleccionar...</option>
                  {data.contractors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Estado</label>
                <select name="status" defaultValue={editingItem?.status || 'pending'} className="w-full px-4 py-2 border rounded-xl bg-white">
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Proceso</option>
                  <option value="completed">Completado</option>
                  <option value="delayed">Retrasado</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Inicio</label>
                <input type="date" name="startDate" defaultValue={editingItem?.startDate} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Fin Estimado</label>
                <input type="date" name="endDate" defaultValue={editingItem?.endDate} className="w-full px-4 py-2 border rounded-xl" />
              </div>
              <div className="col-span-2 pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors">Guardar Partida</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: WorkItem['status'] }) => {
  // Move definition of TrendingUp here to ensure it's declared before being used in the styles object.
  const TrendingUp = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;

  const styles = {
    pending: { bg: 'bg-slate-100', text: 'text-slate-600', icon: <Clock size={12} />, label: 'Pendiente' },
    in_progress: { bg: 'bg-blue-100', text: 'text-blue-600', icon: <TrendingUp size={12} />, label: 'En Proceso' },
    completed: { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: <CheckCircle size={12} />, label: 'Completado' },
    delayed: { bg: 'bg-red-100', text: 'text-red-600', icon: <AlertCircle size={12} />, label: 'Retrasado' },
  };

  const config = styles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
      {config.icon}
      {config.label}
    </span>
  );
};

export default WorkItemsList;
