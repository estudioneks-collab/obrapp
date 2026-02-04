
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ConstructionState } from '../types';
import { Send, BrainCircuit, Loader2, Sparkles, AlertTriangle } from 'lucide-react';

const AIAssistant: React.FC<{ state: ConstructionState }> = ({ state }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: '¡Hola! Soy tu Asistente de Control de Obra. Puedo analizar el desvío entre el avance físico y el financiero de tus expedientes. ¿Qué obra te preocupa hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-flash-preview';
      
      // Summarize current state data to provide context to the AI
      const dataSummary = `
        PROYECTOS: ${state.projects.map(p => `[${p.name}, EXP: ${p.fileNumber}, Presupuesto: $${p.budget}]`).join(', ')}
        CERTIFICADOS: ${state.certificates.map(c => `[ObraID: ${c.projectId}, Avance Físico: ${c.physicalProgress}%, Avance Financiero: $${c.financialAmount}]`).join(', ')}
        PAGOS: ${state.payments.map(p => `[ObraID: ${p.projectId}, Monto: $${p.amount}]`).join(', ')}
      `;

      const systemInstruction = `
        Eres un Experto en Auditoría de Obra Pública. Tu misión es analizar los datos que te provee el usuario.
        Debes enfocarte en:
        1. Desvíos: Si el avance físico es menor al esperado según el monto certificado.
        2. Deuda: Alertar sobre saldos impagos críticos.
        3. Plazos: Evaluar si el ritmo de certificación es coherente con el presupuesto total.
        Responde en español, con tono técnico pero claro, usando Markdown.
      `;

      // Pass both context and user message to the model for analysis
      const response = await ai.models.generateContent({
        model,
        contents: `CONTEXTO DE DATOS:\n${dataSummary}\n\nPREGUNTA USUARIO: ${userMsg}`,
        config: { systemInstruction, thinkingConfig: { thinkingBudget: 0 } }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || 'No pude analizar los datos.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Hubo un error al conectar con el cerebro IA.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl flex items-center gap-6">
          <BrainCircuit size={48} />
          <div>
            <h3 className="text-2xl font-black">Asistente de Auditoría IA</h3>
            <p className="text-blue-100">Análisis inteligente de desvíos, presupuestos y cumplimiento de obra pública.</p>
          </div>
        </div>

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] shadow-sm text-sm leading-relaxed ${
              m.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-line">{m.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-3">
              <Loader2 className="animate-spin text-blue-600" size={18} />
              <span className="text-sm text-slate-500 font-medium">Auditor IA procesando expedientes...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto flex gap-4">
          <input 
            type="text" 
            placeholder="Ej: ¿Hay algún desvío crítico entre lo pagado y el avance físico?"
            className="flex-1 bg-slate-50 border border-slate-200 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 transition-all">
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
