
import React, { useState, useMemo } from 'react';
import { ExcelSheetData } from '../types';
import { Search, Filter, Download, ArrowUpDown, FileJson } from 'lucide-react';

interface DynamicSheetViewProps {
  sheet: ExcelSheetData;
}

const DynamicSheetView: React.FC<DynamicSheetViewProps> = ({ sheet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'} | null>(null);

  const filteredRows = useMemo(() => {
    let result = [...sheet.rows];

    if (searchTerm) {
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [sheet.rows, searchTerm, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatValue = (val: any) => {
    if (typeof val === 'number') {
      if (val > 1000) return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
      if (val < 1 && val > 0) return `${(val * 100).toFixed(1)}%`;
      return val.toLocaleString();
    }
    return String(val);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Table Actions */}
      <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between bg-white shrink-0">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Buscar en ${sheet.rows.length} registros...`} 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Registros</p>
            <p className="text-sm font-bold text-slate-700">{filteredRows.length} de {sheet.rows.length}</p>
          </div>
          <button className="p-3 hover:bg-slate-50 text-slate-500 border border-slate-100 rounded-xl transition-colors">
            <Filter size={18} />
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all">
            <Download size={16} />
            Exportar Vista
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-slate-50/90 backdrop-blur-md">
            <tr>
              {sheet.headers.map((header) => (
                <th 
                  key={header}
                  onClick={() => requestSort(header)}
                  className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em] border-b border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    {header}
                    <ArrowUpDown size={12} className={`opacity-0 group-hover:opacity-100 transition-opacity ${sortConfig?.key === header ? 'opacity-100 text-blue-500' : ''}`} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                {sheet.headers.map((header) => (
                  <td key={header} className="px-6 py-4 text-sm text-slate-600 border-b border-slate-50 whitespace-nowrap">
                    <span className={`
                      ${typeof row[header] === 'number' ? 'font-mono font-medium text-slate-800' : ''}
                      ${String(header).toLowerCase().includes('monto') || String(header).toLowerCase().includes('total') ? 'text-emerald-700 font-bold' : ''}
                    `}>
                      {formatValue(row[header])}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredRows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Search size={48} strokeWidth={1} className="mb-4 opacity-20" />
            <p className="font-medium text-lg">No se encontraron resultados para "{searchTerm}"</p>
            <button onClick={() => setSearchTerm('')} className="text-blue-500 font-bold mt-2 hover:underline">Limpiar búsqueda</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicSheetView;
