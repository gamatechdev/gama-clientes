
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard, Button, Input } from './ui/GlassComponents';
import { Mail, Lock, LogIn, AlertCircle, User } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log("Tentativa de login iniciada. Identificador:", identifier);

    try {
      let loginEmail = identifier.trim();

      // Se não parecer um email, tenta buscar o email associado ao nome de usuário
      if (!loginEmail.includes('@')) {
        console.log("Formato de usuário detectado. Buscando na tabela 'users' coluna 'usuario'...");
        
        const { data, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('usuario', loginEmail) // Atualizado para a coluna 'usuario' conforme solicitado
          .maybeSingle();

        console.log("Resultado da busca de usuário:", { data, userError });

        if (userError) {
          console.error("Erro ao buscar usuário (DB):", userError);
          throw new Error("Erro ao verificar usuário.");
        }

        if (!data || !data.email) {
          console.warn("Usuário não encontrado ou sem e-mail vinculado.");
          throw new Error("Usuário não encontrado.");
        }

        loginEmail = data.email;
        console.log("E-mail resolvido:", loginEmail);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) {
        console.error("Erro na autenticação Supabase:", error);
        throw error;
      }
      
      console.log("Login bem sucedido.");

    } catch (err: any) {
      console.error("Exceção capturada no login:", err);
      setError(err.message || "Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <GlassCard className="w-full max-w-md p-8 md:p-10">
        <div className="text-center mb-10">
          {/* Logo Icon Container - Primary Color #04a7bd */}
          <div className="w-16 h-16 bg-[#04a7bd]/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-[#04a7bd]/20 shadow-lg shadow-[#04a7bd]/10">
            <span className="text-3xl font-bold text-[#04a7bd]">G</span>
          </div>
          {/* Title - Tertiary Color #050a30 */}
          <h1 className="text-3xl font-bold text-[#050a30] mb-2">Gama Clientes</h1>
          <p className="text-[#050a30]/60">Entre para gerenciar seu ecossistema</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email ou Usuário"
            type="text"
            placeholder="seu@email.com ou usuário"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            icon={<User size={20} />}
            required
          />
          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={20} />}
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
            {loading ? 'Entrando...' : 'Acessar Sistema'} <LogIn size={20} />
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
