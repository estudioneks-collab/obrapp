
import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import { ConstructionState } from '../types';
import { Download, Upload, Database, FileSpreadsheet, RefreshCw, AlertTriangle, Cloud } from 'lucide-react';

interface BackupSettingsProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ state, setState }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        if (confirm("¿Estás seguro de restaurar este backup? Se sobrescribirán los datos actuales en la app y en la nube.")) {
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
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Mantenimiento y Resguardos</h2>
        <p className="text-slate-500">Gestión de copias de seguridad físicas y estado de la infraestructura.</p>
      </div>

      {/* Cloud Status Card */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-xl shadow-blue-100 shrink-0">
          <Cloud size={32} />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-800">Sincronización en la Nube Activa</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            ObraApp está vinculada permanentemente a tu base de datos Supabase. Cualquier cambio realizado se guarda automáticamente en tiempo real sin intervención manual.
          </p>
        </div>
        <div className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 font-black text-xs uppercase tracking-widest">
          Sistema Operativo
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
            <Download size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Exportar a Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Genera un archivo local con toda la información de tus expedientes.</p>
          <button onClick={exportToExcel} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
            <FileSpreadsheet size={20} /> Descargar Backup
          </button>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Restaurar desde Excel</h3>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">Carga un archivo previo para sobreescribir los datos actuales.</p>
          <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={importFromExcel} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            <RefreshCw size={20} /> Cargar Archivo
          </button>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black mb-4">Integridad de Datos</h3>
          <p className="text-slate-400 max-w-2xl leading-relaxed">
            La arquitectura de ObraApp utiliza una estrategia de "Local-First". Los datos se cargan en tu navegador para máxima velocidad y se replican en Supabase para asegurar que nunca pierdas tu trabajo, incluso si cambias de dispositivo.
          </p>
        </div>
        <div className="absolute right-[-5%] bottom-[-10%] opacity-5 rotate-12">
          <Database size={300} />
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
