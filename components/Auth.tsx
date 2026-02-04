
import React, { useState } from 'react';
import { supabase } from '../App';
import { KeyRound, Mail, User, Briefcase, UserPlus, LogIn, Construction, ShieldCheck, RefreshCw, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const fullName = formData.get('fullName') as string;
        const position = formData.get('position') as string;
        const username = formData.get('username') as string;

        const { data: authData, error: signUpError } = await supabase.auth.signUp({ 
          email, 
          password 
        });
        
        if (signUpError) throw signUpError;
        
        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: fullName,
            position: position,
            username: username,
            email: email
          });
          
          if (profileError) {
            if (profileError.message.includes("profiles")) {
              throw new Error("ERROR DE BASE DE DATOS: La tabla 'profiles' no existe. Ejecuta el script SQL en Supabase.");
            }
            throw profileError;
          }
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let message = err.message || "Ocurrió un error inesperado";
      
      if (message.includes("email rate limit exceeded")) {
        message = "Límite de envíos excedido. Supabase permite 3 correos por hora. Espera un momento o aumenta el límite en Authentication → Rate Limits en tu panel de Supabase.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-[2rem] shadow-2xl shadow-blue-200 mb-4">
            <Construction size={32} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Obra<span className="text-blue-600">App</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">Sistema de Control de Obra Pública</p>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl mb-8">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <LogIn size={16} /> Ingresar
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <UserPlus size={16} /> Registrarse
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input name="fullName" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Juan Pérez" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cargo que ocupa</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input name="position" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Director de Obra" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-bold text-sm">@</div>
                    <input name="username" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="jperez" required />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input name="email" type="email" className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="ejemplo@correo.com" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors p-1"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[11px] font-bold leading-relaxed animate-shake flex flex-col gap-2">
                <div className="flex items-start gap-2">
                   <AlertTriangle className="shrink-0 mt-0.5" size={14} />
                   <span>{error}</span>
                </div>
                {error.includes("limit exceeded") && (
                  <div className="mt-1 p-2.5 bg-white/60 rounded-xl text-[9px] uppercase tracking-wider text-amber-700 border border-amber-100 shadow-sm">
                    <strong>Tip Profesional:</strong> Ve a Supabase → Settings → Auth → Rate Limits y aumenta el límite de correos.
                  </div>
                )}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {loading ? (
                <RefreshCw size={24} className="animate-spin" />
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <ShieldCheck size={20} />}
                  {isLogin ? 'Iniciar Sesión' : 'Finalizar Registro'}
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Protegido con encriptación de grado militar. <br />
              Sus datos están resguardados en Supabase Cloud.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
