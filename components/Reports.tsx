
import React from 'react';
import { ProjectData } from '../types';
import { FileDown, Printer, Layout, ClipboardList } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportsProps {
  data: ProjectData;
}

const Reports: React.FC<ReportsProps> = ({ data }) => {
  const generatePDF = (type: 'general' | 'budget' | 'contractors') => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.text(data.projectName, 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Cliente: ${data.client} | Fecha: ${now}`, 14, 30);
    doc.line(14, 35, 196, 35);

    if (type === 'general' || type === 'budget') {
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Estado de Partidas de Obra", 14, 45);

      const tableData = data.workItems.map(item => [
        item.code,
        item.description,
        `${item.quantity} ${item.unit}`,
        `${item.progress}%`,
        `$${item.totalPrice.toLocaleString()}`,
        item.status.toUpperCase()
      ]);

      // Use type assertion as module augmentation for jspdf-autotable may not be available in the type path.
      (doc as any).autoTable({
        startY: 50,
        head: [['Cód', 'Descripción', 'Unidad', 'Progreso', 'Total', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 },
      });
    }

    if (type === 'contractors') {
      doc.setFontSize(16);
      doc.setTextColor(44, 62, 80);
      doc.text("Listado de Contratistas", 14, 45);

      const tableData = data.contractors.map(c => {
        const total = data.workItems.filter(wi => wi.contractorId === c.id).reduce((acc, i) => acc + i.totalPrice, 0);
        return [c.name, c.specialty, c.contact, c.rating, `$${total.toLocaleString()}`];
      });

      // Use type assertion as module augmentation for jspdf-autotable may not be available in the type path.
      (doc as any).autoTable({
        startY: 50,
        head: [['Nombre', 'Especialidad', 'Contacto', 'Rating', 'Total Presupuestado']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 9 },
      });
    }

    doc.save(`${data.projectName.replace(/\s/g, '_')}_Reporte.pdf`);
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white">
        <h2 className="text-3xl font-bold mb-2">Centro de Reportes</h2>
        <p className="text-blue-100 max-w-2xl text-lg">
          Genera documentos listos para impresión o auditoría. Elige el formato que mejor se adapte a tus necesidades.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard 
          title="Resumen Ejecutivo"
          desc="Incluye todas las partidas, progresos y estados actuales de la obra."
          icon={<Layout className="text-blue-500" />}
          onDownload={() => generatePDF('general')}
        />
        <ReportCard 
          title="Control de Costos"
          desc="Reporte detallado de presupuestos asignados y montos ejecutados."
          icon={<ClipboardList className="text-emerald-500" />}
          onDownload={() => generatePDF('budget')}
        />
        <ReportCard 
          title="Directorio Contratistas"
          desc="Reporte de todos los proveedores con sus especialidades y montos asignados."
          icon={<Printer className="text-slate-700" />}
          onDownload={() => generatePDF('contractors')}
        />
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-slate-800 text-lg">Reporte Mensual Automatizado</h4>
          <p className="text-slate-500 text-sm">Tu reporte consolidado está listo para el cierre de mes actual.</p>
        </div>
        <button 
          onClick={() => generatePDF('general')}
          className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <FileDown size={20} />
          Descargar Informe Completo
        </button>
      </div>
    </div>
  );
};

const ReportCard = ({ title, desc, icon, onDownload }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-blue-300 transition-all group">
    <div className="p-4 bg-slate-50 rounded-2xl w-fit mb-6 group-hover:bg-blue-50 transition-colors">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
    <button 
      onClick={onDownload}
      className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
    >
      <FileDown size={18} />
      Generar PDF
    </button>
  </div>
);

export default Reports;
