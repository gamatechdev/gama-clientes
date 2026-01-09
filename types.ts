export interface Cliente {
  id: string; // uuid
  razao_social: string | null;
  nome_fantasia: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  status: string | null;
  img_url?: string; // Optional placeholder for UI
}

export interface Unidade {
  id: number; // bigint
  nome_unidade: string | null;
  empresaid: string | null; // uuid
  created_at: string;
}

export interface Setor {
  id: number; // bigint
  nome: string;
}

// Helper interface to handle the join table data for UI display (unidade_setor)
export interface LinkedSetor {
  link_id: number; // The id from 'unidade_setor' table
  setor: Setor;
}

export interface Cargo {
  id: number;
  nome: string;
  ativo?: boolean;
}

// Helper interface to handle the join table data for UI display (cargo_setor)
export interface LinkedCargo {
  link_id: number; // The id from 'cargo_setor' table
  cargo: Cargo;
}

export interface UserProfile {
  id: number;
  user_id: string;
  username: string;
  email: string;
  img_url: string;
  role: number | null;
  primeiro_acesso?: boolean;
}

export interface Exame {
  id: number;
  nome: string;
  // Global defaults (optional now, as specific rules override)
  admissao?: boolean;
  periodicidade?: number;
  ret_trabalho?: boolean;
  mud_riscos?: boolean;
  demissao?: boolean;
}

// --- Hierarchy Tree Types ---

export interface HierarchyCargo {
  id: number; // cargo_setor id
  periodicidade?: number;
  descricao?: string;
  cargos: {
    id: number;
    nome: string;
  };
}

export interface HierarchySector {
  id: number; // unidade_setor id
  setor: {
    id: number;
    nome: string;
    cargo_setor?: HierarchyCargo[];
  };
  exames_unidade?: {
    id: number;
    periodicidade?: number;
    admissao?: boolean;
    demissao?: boolean;
    ret_trabalho?: boolean;
    mud_riscos?: boolean;
    exames: {
      id: number;
      nome: string;
    };
  }[];
}

export interface HierarchyUnit {
  id: number;
  nome_unidade: string;
  unidade_setor?: HierarchySector[];
}