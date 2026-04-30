import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://blwbkhyqeyoyhdonwgaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsd2JraHlxZXlveWhkb253Z2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NzQ4MTEsImV4cCI6MjA5MzA1MDgxMX0.0VLhDHeplcC-ZLwbXn2NU7vDDbocb0b4oHS3tm22VsY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public',
  },
  // Aumenta o timeout global para evitar falhas em conexões lentas
  global: {
    headers: { 'x-my-custom-header': 'gama-clientes' },
  },
});