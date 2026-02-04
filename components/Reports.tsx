
import React from 'react';
import { ConstructionState, Project } from '../types';
import { FileDown, Printer, Layout, ClipboardList, FileText, Download, Building2, Wallet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../App';

interface ReportsProps {
  state: ConstructionState;
  profile: any;
}

const Reports: React.FC<ReportsProps> = ({ state, profile }) => {
  const MARGIN_X = 20;
  const PAGE_WIDTH = 210;
  const RIGHT_MARGIN = PAGE_WIDTH - MARGIN_X;

  const getHeaderElements = (doc: jsPDF) => {
    // 1. Margen superior derecho (Leyenda dinámica)
    const legendText = profile?.report_legend || "SISTEMA DE CONTROL DE OBRA PÚBLICA";
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(legendText, RIGHT_MARGIN, 15, { align: 'right' });

    // 2. Encabezado Izquierdo (Logo dinámico)
    if (profile?.report_logo) {
      try {
        doc.addImage(profile.report_logo, 'PNG', MARGIN_X, 10, 15, 15);
      } catch (e) {
        doc.rect(MARGIN_X, 10, 15, 15);
      }
    } else {
      // Placeholder si no hay logo
      doc.setFillColor(240, 240, 240);
      doc.rect(MARGIN_X, 10, 15, 15, 'F');
      doc.setTextColor(180, 180, 180);
      doc.setFontSize(6);
      doc.text("LOGO", MARGIN_X + 4, 18);
    }
  };

  const generateGeneralPDF = () => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('es-AR');
    
    getHeaderElements(doc);

    // 3. Header Background
    const primaryColor = [59, 130, 246];
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 35, PAGE_WIDTH, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text("REPORTES GENERALES DE OBRA", MARGIN_X, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de emisión: ${now} | Usuario: ${profile?.full_name || 'N/A'}`, MARGIN_X, 63);

    // Resumen Ejecutivo
    doc.setTextColor(44, 62, 80);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text("Resumen Ejecutivo de Cartera", MARGIN_X, 85);
    
    const totalBudget = state.projects.reduce((acc, p) => acc + p.budget, 0);
    const totalCert = state.certificates.reduce((acc, c) => acc + c.financialAmount, 0);
    const totalPaid = state.payments.reduce((acc, p) => acc + p.amount, 0);
    const totalAmort = state.certificates.reduce((acc, c) => acc + c.advanceAmortization, 0);
    const totalDebt = (totalCert - totalAmort) - totalPaid;

    autoTable(doc, {
      startY: 92,
      margin: { left: MARGIN_X, right: MARGIN_X },
      head: [['Concepto', 'Monto Total ($)']],
      body: [
        ['Presupuesto Total Contratado', `$ ${formatCurrency(totalBudget)}`],
        ['Total Certificado (Bruto)', `$ ${formatCurrency(totalCert)}`],
        ['Total Pagado (Transferencias)', `$ ${formatCurrency(totalPaid)}`],
        ['Deuda Neta Exigible', `$ ${formatCurrency(totalDebt)}`]
      ],
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
    });

    const lastY = (doc as any).lastAutoTable.finalY || 130;
    doc.setFontSize(16);
    doc.text("Detalle por Proyecto", MARGIN_X, lastY + 20);
    
    const projectsTable = state.projects.map(p => {
      const contractor = state.contractors.find(c => c.id === p.contractorId)?.name || 'N/A';
      return [p.fileNumber, p.name, contractor, `$ ${formatCurrency(p.budget)}` ];
    });

    autoTable(doc, {
      startY: lastY + 25,
      margin: { left: MARGIN_X, right: MARGIN_X },
      head: [['Expediente', 'Obra', 'Contratista', 'Presupuesto']],
      body: projectsTable,
      theme: 'grid',
      headStyles: { fillColor: primaryColor },
      styles: { fontSize: 8 },
    });

    doc.save(`Reporte_General_Obras_${now.replace(/\//g, '-')}.pdf`);
  };

  const generateProjectPDF = (project: Project) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString('es-AR');
    const contractor = state.contractors.find(c => c.id === project.contractorId);
    const certs = state.certificates.filter(c => c.projectId === project.id);
    const payments = state.payments.filter(p => p.projectId === project.id);

    getHeaderElements(doc);

    // Header Background
    doc.setFillColor(30, 41, 59); // Slate 800
    doc.rect(0, 35, PAGE_WIDTH, 45, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const projectName = project.name.length > 50 ? project.name.substring(0, 47) + "..." : project.name;
    doc.text(projectName, MARGIN_X, 52);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`EXPEDIENTE: ${project.fileNumber}`, MARGIN_X, 62);
    doc.text(`CONTRATISTA: ${contractor?.name || 'S/D'}`, MARGIN_X, 68);
    doc.text(`Fecha de Reporte: ${now}`, MARGIN_X, 74);

    doc.setTextColor(44, 62, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Estado de Situación Financiera", MARGIN_X, 95);

    const totalCert = certs.reduce((acc, c) => acc + c.financialAmount, 0);
    const totalAmort = certs.reduce((acc, c) => acc + c.advanceAmortization, 0);
    const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
    const debt = (totalCert - totalAmort) - totalPaid;

    autoTable(doc, {
      startY: 100,
      margin: { left: MARGIN_X, right: MARGIN_X },
      body: [
        ['Presupuesto Original', `$ ${formatCurrency(project.budget)}`],
        ['Anticipo Otorgado', `$ ${formatCurrency(project.advanceAmount)}`],
        ['Monto Certificado (Bruto)', `$ ${formatCurrency(totalCert)}`],
        ['Amortización de Anticipo', `-$ ${formatCurrency(totalAmort)}`],
        ['Neto Pagado a la Fecha', `$ ${formatCurrency(totalPaid)}`],
        ['DEUDA PENDIENTE', `$ ${formatCurrency(debt)}`]
      ],
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold' }, 1: { halign: 'right' } }
    });

    let lastY = (doc as any).lastAutoTable.finalY || 140;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text("Historial de Certificaciones", MARGIN_X, lastY + 20);
    
    autoTable(doc, {
      startY: lastY + 25,
      margin: { left: MARGIN_X, right: MARGIN_X },
      head: [['Periodo', 'Avance %', 'Bruto', 'Amortización', 'Neto']],
      body: certs.map(c => [
        c.period, 
        `${c.physicalProgress}%`, 
        `$ ${formatCurrency(c.financialAmount)}`, 
        `-$ ${formatCurrency(c.advanceAmortization)}`, 
        `$ ${formatCurrency(c.financialAmount - c.advanceAmortization)}`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 8 },
    });

    if (payments.length > 0) {
      lastY = (doc as any).lastAutoTable.finalY || 180;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Registro de Pagos Efectuados", MARGIN_X, lastY + 20);
      
      autoTable(doc, {
        startY: lastY + 25,
        margin: { left: MARGIN_X, right: MARGIN_X },
        head: [['Fecha', 'Referencia', 'Monto Pagado']],
        body: payments.map(p => [p.date, p.reference, `$ ${formatCurrency(p.amount)}`]),
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 8 },
      });
    }

    doc.save(`Ficha_Obra_${project.fileNumber.replace(/\//g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-gradient-to-r from-blue-700 to-indigo-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-3">Centro de Reportes</h2>
          <p className="text-blue-100 max-w-2xl text-lg font-medium">
            Genera documentos PDF oficiales para auditorías, cierres mensuales o gestión de expedientes.
          </p>
          <div className="mt-8 flex gap-4">
             <button 
              onClick={generateGeneralPDF}
              className="bg-white text-blue-900 px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-50 transition-all shadow-xl"
            >
              <Download size={20} /> Descargar Reporte Consolidado
            </button>
          </div>
        </div>
        <FileText size={240} className="absolute right-[-40px] bottom-[-60px] text-white/10 rotate-12" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-black text-slate-800">Reportes por Obra Individual</h3>
          </div>
          
          <div className="space-y-3">
            {state.projects.map(project => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-slate-50 hover:bg-blue-50 rounded-2xl border border-transparent hover:border-blue-100 transition-all group">
                <div>
                  <p className="text-sm font-bold text-slate-700">{project.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expediente: {project.fileNumber}</p>
                </div>
                <button 
                  onClick={() => generateProjectPDF(project)}
                  className="p-3 bg-white text-slate-400 group-hover:text-blue-600 rounded-xl border border-slate-100 group-hover:border-blue-200 shadow-sm transition-all"
                  title="Descargar Ficha PDF"
                >
                  <FileDown size={20} />
                </button>
              </div>
            ))}
            {state.projects.length === 0 && (
              <p className="text-center py-10 text-slate-400 font-medium">No hay obras registradas para generar reportes.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                 <Wallet size={24} />
               </div>
               <h3 className="text-xl font-black text-slate-800">Resumen de Pagos</h3>
             </div>
             <p className="text-slate-500 text-sm leading-relaxed mb-6">
               El reporte general incluye un consolidado de todas las transferencias realizadas a los contratistas y el estado de deuda actual.
             </p>
             <button 
               onClick={generateGeneralPDF}
               className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
             >
               <Printer size={18} /> Imprimir Estado de Pagos Global
             </button>
           </div>

           <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100">
              <h4 className="text-amber-800 font-black flex items-center gap-2 mb-2">
                <ClipboardList size={18} /> Nota de Auditoría
              </h4>
              <p className="text-amber-700/80 text-xs leading-relaxed font-medium">
                Los reportes generados tienen carácter informativo. Para validación legal, asegúrese de adjuntar las facturas y actas de medición correspondientes a cada certificado.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
