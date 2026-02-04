
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { ConstructionState } from '../types';
import { Download, Upload, Database, FileSpreadsheet, RefreshCw, AlertTriangle, Key, Globe } from 'lucide-react';

interface BackupSettingsProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ state, setState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Local state for SB credentials
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('sb_url') || '');
  const [sbKey, setSbKey] = useState(localStorage.getItem('sb_key') || '');

  const saveCredentials = () => {
    localStorage.setItem('sb_url', sbUrl);
    localStorage.setItem('sb_key', sbKey);
    alert("Credenciales guardadas. Reiniciando conexión...");
    window.location.reload();
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const contractorsWS = XLSX.utils.json_to_sheet(state.contractors);
    XLSX.utils.book_append_sheet(wb, contractorsWS, "Contratistas");
    const projectsWS = XLSX.utils.json_to_sheet(state.projects);
    XLSX.utils.book_append_sheet(wb, projectsWS, "Obras");
    const certificatesWS = XLSX.utils.json_to_sheet(state.certificates);
    XLSX.utils.book_append_sheet(wb, certificatesWS, "Certificados");
    const paymentsWS = XLSX.utils.json_to_sheet(state.payments);
    XLSX.utils.book_append_sheet(wb, paymentsWS, "Pagos");
    XLSX.writeFile(wb, `ObraApp_Backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const importFromExcel = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const newState: ConstructionState = { contractors: [], projects: [], certificates: [], payments: [] };
      try {
        if (wb.SheetNames.includes("Contratistas")) newState.contractors = XLSX.utils.sheet_to_json(wb.Sheets["Contratistas"]);
        if (wb.SheetNames.includes("Obras")) newState.projects = XLSX.utils.sheet_to_json(wb.Sheets["Obras"]);
        if (wb.SheetNames.includes("Certificados")) newState.certificates = XLSX.utils.sheet_to_json(wb.Sheets["Certificados"]);
        if (wb.SheetNames.includes("Pagos")) newState.payments = XLSX.utils.sheet_to_json(wb.Sheets["Pagos"]);
        if (confirm("¿Estás seguro de restaurar este backup? Se sobrescribirán los datos actuales.")) {
          setState(newState);
          alert("Backup restaurado con éxito.");
        }
      } catch (error) {
        alert("Error al procesar el archivo Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Configuración y Nube</h2>
        <p className="text-slate-500">Conecta ObraApp con tu base de datos Supabase o gestiona backups locales.</p>
      </div>

      {/* Supabase Connection Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Conexión Supabase</h3>
            <p className="text-slate-400 text-sm">Vincula la app con tu infraestructura en la nube.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Supabase URL</label>
            <div className="relative">
              <input 
                type="text" 
                value={sbUrl}
                onChange={e => setSbUrl(e.target.value)}
                placeholder="https://xyz.supabase.co"
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs" 
              />
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anon Key (Public API Key)</label>
            <div className="relative">
              <input 
                type="password" 
                value={sbKey}
                onChange={e => setSbKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1..."
                className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs" 
              />
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            </div>
          </div>
        </div>
        
        <button 
          onClick={saveCredentials}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
        >
          <Database size={18} />
          Guardar y Conectar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Export Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Exportar Backup Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Descarga todas las tablas del sistema en un archivo .xlsx.</p>
          <button onClick={exportToExcel} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            <FileSpreadsheet size={20} /> Descargar Backup
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Importar Backup Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Restaura datos desde un archivo exportado previamente.</p>
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={importFromExcel} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <RefreshCw size={20} /> Cargar Archivo
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="text-3xl font-black mb-4">¿Todo listo?</h3>
            <p className="text-slate-400 mb-6">Recuerda configurar las políticas RLS en tu dashboard de Supabase para permitir lecturas y escrituras anónimas si no estás usando autenticación.</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/5 flex items-start gap-4">
          <AlertTriangle className="text-amber-500 shrink-0" size={24} />
          <p className="text-xs text-slate-500">Importante: El auto-guardado en Supabase requiere que las tablas coincidan exactamente con el esquema SQL proporcionado. Asegúrate de haber ejecutado el script en el SQL Editor de Supabase.</p>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
