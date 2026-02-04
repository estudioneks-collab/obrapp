
import React, { useRef, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ConstructionState } from '../types';
import { Download, Upload, Database, FileSpreadsheet, RefreshCw, Image as ImageIcon, FileText, CheckCircle2, Cloud, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../App';

interface BackupSettingsProps {
  state: ConstructionState;
  setState: React.Dispatch<React.SetStateAction<ConstructionState>>;
  profile: any;
  setProfile: React.Dispatch<React.SetStateAction<any>>;
}

const BackupSettings: React.FC<BackupSettingsProps> = ({ state, setState, profile, setProfile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [legend, setLegend] = useState(profile?.report_legend || '');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar leyenda local si el perfil cambia (ej. al cargar)
  useEffect(() => {
    if (profile?.report_legend) {
      setLegend(profile.report_legend);
    }
  }, [profile]);

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!profile?.id) {
      alert("Error: No se detectó sesión de usuario activa.");
      return;
    }
    
    if (file.size > 500000) {
      alert("La imagen es muy pesada. Intente con una de menos de 500KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setIsSaving(true);
      setErrorMessage(null);
      try {
        const { error } = await supabase.from('profiles').update({ report_logo: base64 }).eq('id', profile.id);
        if (error) throw error;
        setProfile((prev: any) => ({ ...prev, report_logo: base64 }));
      } catch (err: any) {
        console.error("Error saving logo:", err);
        setErrorMessage("No se pudo guardar el logo. Asegúrate de haber ejecutado el SQL para agregar las columnas.");
      } finally {
        setIsSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveLegend = async () => {
    if (!profile?.id) {
      alert("Error: No se detectó sesión de usuario activa.");
      return;
    }
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.from('profiles').update({ report_legend: legend }).eq('id', profile.id);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, report_legend: legend }));
      alert("Identidad visual actualizada con éxito.");
    } catch (err: any) {
      console.error("Error saving legend:", err);
      setErrorMessage("Error al guardar la leyenda. Verifica que la columna 'report_legend' exista en la tabla 'profiles'.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Personalización y Mantenimiento</h2>
        <p className="text-slate-500">Configura la identidad visual de tus reportes y gestiona copias de seguridad.</p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-[2rem] flex items-start gap-4 text-red-700 animate-in slide-in-from-top-4">
          <AlertCircle className="shrink-0 mt-1" />
          <div>
            <p className="font-bold text-sm">Problema detectado al guardar</p>
            <p className="text-xs opacity-80 mt-1 leading-relaxed">{errorMessage}</p>
            <div className="mt-3 p-3 bg-white/50 rounded-xl border border-red-100 font-mono text-[9px] uppercase tracking-tighter">
              ALTER TABLE profiles ADD COLUMN report_logo TEXT, ADD COLUMN report_legend TEXT;
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Identidad de Reportes</h3>
          </div>

          <div className="space-y-8 flex-1">
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-inner overflow-hidden border border-slate-100 relative group">
                {profile?.report_logo ? (
                  <img src={profile.report_logo} className="w-full h-full object-contain p-2" />
                ) : (
                  <ImageIcon size={32} className="text-slate-300" />
                )}
                {isSaving && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><RefreshCw className="animate-spin text-blue-600" /></div>}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-black text-slate-700 mb-1">Logotipo Institucional</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">PNG o JPG • Máx 500KB</p>
                <input type="file" ref={logoInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                <button 
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-white border border-slate-200 text-blue-600 font-bold text-xs rounded-xl hover:bg-blue-50 transition-all shadow-sm disabled:opacity-50"
                >
                  Cambiar Imagen
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Leyenda Superior (Margen Derecho)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-300" size={18} />
                <textarea 
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium resize-none h-24"
                  placeholder="Ej: SECRETARÍA DE OBRAS PÚBLICAS - GOBIERNO MUNICIPAL"
                  value={legend}
                  onChange={e => setLegend(e.target.value)}
                />
              </div>
              <button 
                onClick={saveLegend}
                disabled={isSaving || !profile}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                Guardar Cambios Visuales
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Download size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Resguardo Físico (Excel)</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Genera un archivo local con toda la información de tus expedientes.</p>
            <button onClick={exportToExcel} className="w-full py-4 bg-slate-100 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-200 transition-all">
              <FileSpreadsheet size={20} /> Descargar Backup .xlsx
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
              <Upload size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Restaurar Datos</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">Carga un archivo previo para sobreescribir los datos actuales.</p>
            <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={importFromExcel} />
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
              <RefreshCw size={20} /> Cargar Archivo Local
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupSettings;
