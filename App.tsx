import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ClientDashboard from './components/ClientDashboard';
import FirstAccess from './components/FirstAccess';
import { Layout } from './components/ui/GlassComponents';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Safety timer: Força o fim do loading após 8 segundos se algo travar na rede
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("Safety timer triggered: forcing app load.");
        setLoading(false);
      }
    }, 8000);

    // Helper to fetch user role safely with timeout
    const fetchUserProfile = async (userId: string) => {
      try {
        // Create a promise that rejects in 5 seconds
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 5000)
        );

        const fetchPromise = supabase
          .from('users')
          .select('role, primeiro_acesso')
          .eq('user_id', userId)
          .single();

        // Race between fetch and timeout
        // @ts-ignore
        const result: any = await Promise.race([fetchPromise, timeoutPromise]);
        
        const { data, error } = result;
        
        if (error) {
           console.warn("User profile fetch error:", error.message);
           return; 
        }

        if (mounted && data) {
          setUserRole(data.role);
          setIsFirstAccess(data.primeiro_acesso === true);
        }
      } catch (error) {
        console.error("Error fetching profile (network or timeout):", error);
      }
    };

    // Initialize Auth
    const initAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (mounted) {
           if (initialSession) {
             setSession(initialSession);
             // Don't await strictly to prevent UI blocking, allow parallel fetch
             await fetchUserProfile(initialSession.user.id);
           }
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);

      if (currentSession) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
             await fetchUserProfile(currentSession.user.id);
        }
      } else {
        setUserRole(null);
        setIsFirstAccess(false);
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04a7bd]"></div>
          <p className="text-[#050a30]/50 text-sm font-medium animate-pulse">Conectando ao sistema...</p>
        </div>
      </Layout>
    );
  }

  // Render Logic:
  
  if (!session) {
    return (
      <Layout>
        <Login />
      </Layout>
    );
  }

  // 1. Check First Access Priority
  if (isFirstAccess) {
    return (
      <Layout>
        <FirstAccess session={session} />
      </Layout>
    );
  }

  // 2. ClientDashboard handles its own Layout (Full Screen Sidebar) - NO WRAPPER
  if (userRole === 999) {
    return <ClientDashboard session={session} />;
  }

  // 3. Admin Dashboard (Operator) handles its own Layout now too
  return <Dashboard session={session} />;
}