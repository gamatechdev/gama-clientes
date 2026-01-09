import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard, Button, Input } from './ui/GlassComponents';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
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
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
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