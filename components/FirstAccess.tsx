import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import { GlassCard, Button, Input } from './ui/GlassComponents';
import { Lock, CheckCircle, AlertTriangle, KeyRound, Check, X, ShieldCheck, ArrowRight, HelpCircle, LogOut } from 'lucide-react';

interface FirstAccessProps {
  session: Session;
}

export default function FirstAccess({ session }: FirstAccessProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password Requirements State
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setRequirements({
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(requirements).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError("A senha não atende a todos os requisitos de segurança.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("As senhas não conferem.");
      return;
    }

    setLoading(true);

    try {
      // 1. Atualizar a senha no Auth (Identity)
      const { error: updateAuthError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateAuthError) throw updateAuthError;

      // 2. Atualizar a flag primeiro_acesso no Banco de Dados
      const { error: dbError } = await supabase
        .from('users')
        .update({ primeiro_acesso: false })
        .eq('user_id', session.user.id);

      if (dbError) throw dbError;

      // 3. Recarregar a aplicação para entrar no Dashboard
      window.location.reload();

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao atualizar senha. Tente novamente.");
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const RequirementItem = ({ met, label }: { met: boolean, label: string }) => (
    <div className={`flex items-center gap-2 text-xs transition-colors duration-300 ${met ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all duration-300 ${met ? 'bg-emerald-100 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
        {met && <Check size={10} />}
      </div>
      <span>{label}</span>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Container aumentado para max-w-6xl */}
      <GlassCard className="w-full max-w-6xl p-0 overflow-hidden shadow-2xl border border-white/50">
        
        {/* Layout Grid: 1 coluna no mobile, 2 colunas no desktop (Lado a Lado) */}
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[650px]">
          
          {/* COLUNA A - MENSAGEM (Esquerda) */}
          <div className="bg-gradient-to-br from-[#04a7bd]/5 via-[#f8fafc] to-[#f8fafc] p-10 md:p-16 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between relative">
             
             {/* Decorative Background Element */}
             <div className="absolute top-0 left-0 w-full h-1.5 bg-[#04a7bd]"></div>

             <div>
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-[#04a7bd] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#04a7bd]/20">
                     <ShieldCheck size={24} />
                  </div>
                  <span className="text-xl font-bold text-[#050a30] tracking-tight">Portal Gama</span>
               </div>

               <h1 className="text-4xl md:text-5xl font-bold text-[#050a30] mb-6 leading-tight">
                 Bem-vindo ao <br/>Portal Gama
               </h1>
               
               <p className="text-[#050a30]/70 text-lg md:text-xl mb-10 leading-relaxed font-light">
                 Que bom ter você aqui 👋 <br/>
                 O Portal Gama foi feito para deixar sua rotina mais organizada e segura.
               </p>

               <div className="space-y-6 mb-10">
                 <p className="text-xs font-bold uppercase tracking-wider text-gray-400">O que você fará a seguir:</p>
                 
                 <div className="flex items-start gap-3">
                    <CheckCircle className="text-[#04a7bd] mt-0.5 shrink-0" size={22} />
                    <span className="text-[#050a30]/80 font-medium text-lg">Acessar seus módulos e permissões</span>
                 </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle className="text-[#04a7bd] mt-0.5 shrink-0" size={22} />
                    <span className="text-[#050a30]/80 font-medium text-lg">Atualizar dados do perfil da empresa</span>
                 </div>
                 <div className="flex items-start gap-3">
                    <CheckCircle className="text-[#04a7bd] mt-0.5 shrink-0" size={22} />
                    <span className="text-[#050a30]/80 font-medium text-lg">Gerenciar exames e documentos</span>
                 </div>
               </div>
             </div>

             <div className="mt-8 p-5 bg-white/60 rounded-2xl border border-[#04a7bd]/10 backdrop-blur-sm">
                <p className="text-sm text-[#050a30]/70">
                   <span className="font-bold text-[#04a7bd] block mb-1">O que acontece agora?</span>
                   Após salvar sua senha segura, você será direcionado automaticamente para o painel inicial.
                </p>
             </div>
          </div>

          {/* COLUNA B - FORMULÁRIO (Direita) */}
          <div className="bg-white p-10 md:p-16 flex flex-col justify-center">
             
             <div className="max-w-md mx-auto w-full">
                <div className="mb-10">
                   <h2 className="text-3xl font-bold text-[#050a30]">Definir Senha de Acesso</h2>
                   <p className="text-gray-500 mt-3 text-lg">Antes de começar, vamos deixar sua conta segura definindo uma nova senha.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  <div className="space-y-5">
                    <Input
                      label="Nova Senha"
                      type="password"
                      placeholder="Crie uma senha forte"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      icon={<Lock size={20} />}
                      required
                    />
                    
                    {/* Checklist de Requisitos */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-2 gap-3">
                       <RequirementItem met={requirements.length} label="Mínimo 8 caracteres" />
                       <RequirementItem met={requirements.uppercase} label="1 Letra maiúscula" />
                       <RequirementItem met={requirements.number} label="1 Número" />
                       <RequirementItem met={requirements.special} label="1 Caractere especial" />
                    </div>

                    <Input
                      label="Confirmar Nova Senha"
                      type="password"
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      icon={<KeyRound size={20} />}
                      required
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                      <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-16 text-lg font-bold shadow-xl shadow-[#04a7bd]/20 rounded-2xl" 
                      disabled={loading || !isPasswordValid || !confirmPassword}
                    >
                      {loading ? 'Salvando...' : <span className="flex items-center gap-2">Salvar e Continuar <ArrowRight size={20} /></span>}
                    </Button>
                  </div>

                  <div className="text-center pt-2">
                     <button type="button" onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center gap-2 mx-auto py-2">
                        <LogOut size={16} /> Voltar para o login
                     </button>
                  </div>
                </form>

                {/* Rodapé Interno */}
                <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                      <HelpCircle size={18} />
                      <span>Precisa de ajuda?</span>
                      <a href="#" className="text-[#04a7bd] font-bold hover:underline">Falar com suporte</a>
                   </div>
                   <p className="text-[10px] text-gray-400 max-w-[200px] md:text-right leading-tight">
                      Essa troca de senha é obrigatória no primeiro acesso para sua segurança.
                   </p>
                </div>
             </div>

          </div>

        </div>
      </GlassCard>
    </div>
  );
}