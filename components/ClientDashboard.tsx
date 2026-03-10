
import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { GlassCard, Button } from './ui/GlassComponents';
import {
  LogOut,
  Calendar,
  FileText,
  FolderOpen,
  Clock,
  ShieldCheck,
  FileCheck,
  Users,
  AlertCircle,
  MessageCircle,
  Home,
  Menu,
  Building2,
  ChevronRight,
  Download,
  Lock,
  MapPin,
  CheckCircle,
  ChevronDown,
  XCircle,
  AlertTriangle,
  Send,
  Sparkles,
  Bot,
  Headphones,
  Briefcase,
  LucideIcon,
  Search,
  X,
  History,
  FileSearch
} from 'lucide-react';
import AppointmentFormClient from './AppointmentFormClient';
import ASOListClient from './ASOListClient';

interface ClientDashboardProps {
  session: Session;
}

type ViewState = 'home' | 'agendamento' | 'asos' | 'documentos';

// Database Interface for Documents
interface DocUnidade {
  id: number;
  tipo_doc: number;
  doc_url: string | null;
  validade: string | null; // YYYY-MM-DD
  unidade_id: number;
}

interface ChatMessage {
  id: number;
  text: string;
  status: 'recebido' | 'enviado'; // 'recebido' = cliente enviou, 'enviado' = suporte enviou
  created_at: string;
  chat_id?: number;
}

interface ModalColaborador {
  id: string;
  nome: string;
  cpf: string;
  setor: string;
  cargo_nome: string;
}

interface SidebarItemProps {
  id: ViewState;
  label: string;
  icon: LucideIcon;
  active: boolean;
}

// Static definitions for Document Types logic
const DOC_DEFINITIONS = [
  {
    typeId: 57,
    id: 'pgr',
    name: 'PGR - Programa de Gerenciamento de Riscos',
    description: 'Documento técnico que identifica e avalia os riscos ocupacionais (físicos, químicos, biológicos, ergonômicos e de acidentes).',
  },
  {
    typeId: 56,
    id: 'pcmso',
    name: 'PCMSO - Programa de Controle Médico',
    description: 'Programa que estabelece a realização de exames médicos admissionais, periódicos, de retorno ao trabalho, mudança de risco e demissionais.',
  },
  {
    typeId: 53,
    id: 'ltcat',
    name: 'LTCAT - Laudo Técnico',
    description: 'Laudo técnico que comprova a exposição aos agentes nocivos à saúde ou à integridade física do trabalhador.',
  }
];

const CHAT_SECTORS = [
  { id: 1, label: 'Administrativo', icon: Building2, color: 'text-blue-500 bg-blue-50' },
  { id: 2, label: 'Medicina', icon: FileCheck, color: 'text-emerald-500 bg-emerald-50' },
  { id: 3, label: 'Segurança', icon: ShieldCheck, color: 'text-orange-500 bg-orange-50' },
  { id: 4, label: 'Suporte', icon: Headphones, color: 'text-purple-500 bg-purple-50' },
  { id: 5, label: 'Comercial', icon: Briefcase, color: 'text-pink-500 bg-pink-50' },
];

// --- Sub-components ---

const CollaboratorsModal = ({
  isOpen,
  onClose,
  loading,
  collaborators
}: {
  isOpen: boolean,
  onClose: () => void,
  loading: boolean,
  collaborators: ModalColaborador[]
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = collaborators.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm)
  );

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return '';
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <GlassCard className="w-full max-w-3xl bg-white border-none shadow-2xl flex flex-col max-h-[85vh] p-0 overflow-hidden [&>div.relative.z-10]:flex [&>div.relative.z-10]:flex-col [&>div.relative.z-10]:h-full [&>div.relative.z-10]:overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#04a7bd]/10 text-[#04a7bd] flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#050a30]">Colaboradores da Empresa</h3>
              <p className="text-sm text-gray-500">Total de {collaborators.length} cadastrados</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-white border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou CPF..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-[#04a7bd]/20 focus:border-[#04a7bd] transition-all"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#f8fafc]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#04a7bd] mb-4"></div>
              <p className="text-gray-500 font-medium">Carregando lista...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400">
              <FileSearch size={48} className="mb-4 opacity-20" />
              <p>Nenhum colaborador encontrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((colab) => (
                <div key={colab.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-[#04a7bd]/30 transition-all group flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                      <Users size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#050a30] truncate group-hover:text-[#04a7bd] transition-colors">{colab.nome}</h4>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs text-gray-400 font-mono">{formatCPF(colab.cpf)}</p>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{colab.setor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-blue-100">
                      {colab.cargo_nome}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export default function ClientDashboard({ session }: ClientDashboardProps) {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigation Data State
  const [targetColabId, setTargetColabId] = useState<string | null>(null);

  // Data State
  const [publicUserId, setPublicUserId] = useState<number | null>(null); // ID from public.users table
  const [companyName, setCompanyName] = useState<string>('');
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Stats State
  const [stats, setStats] = useState({
    activeCollaborators: 0,
    pendingAsos: 0,
    documentsIssueCount: 0 // Count of Expiring or Expired documents
  });

  // Units & Docs State
  const [unitsList, setUnitsList] = useState<{ id: number, nome_unidade: string }[]>([]);
  const [documents, setDocuments] = useState<DocUnidade[]>([]);

  // Accordion State for Documents
  const [expandedUnits, setExpandedUnits] = useState<number[]>([]);

  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState<'sector' | 'conversation'>('sector');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mobile Menu State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Collaborators Modal State
  const [isColabModalOpen, setIsColabModalOpen] = useState(false);
  const [modalColabs, setModalColabs] = useState<ModalColaborador[]>([]);
  const [colabModalLoading, setColabModalLoading] = useState(false);

  useEffect(() => {
    fetchProfileData();
  }, [session]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen && chatStep === 'conversation') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen, chatStep]);

  // --- CHAT LOGIC: Check Existing Chat ---
  useEffect(() => {
    if (isChatOpen && publicUserId) {
      checkActiveChat();
    }
  }, [isChatOpen, publicUserId]);

  const checkActiveChat = async () => {
    try {
      // Verifica se existe um chat NÃO encerrado para este usuário
      const { data, error } = await supabase
        .from('chat_clientes')
        .select('id, encerrado')
        .eq('cliente_id', publicUserId)
        .eq('encerrado', false)
        .maybeSingle();

      if (data) {
        // Se existe e não está encerrado, retoma a conversa
        setActiveChatId(data.id);
        setChatStep('conversation');
      } else {
        // Se não existe ou todos estão encerrados, mostra seleção de setor
        setChatStep('sector');
        setActiveChatId(null);
        setChatMessages([]);
      }
    } catch (err) {
      console.error("Erro ao verificar chat ativo:", err);
    }
  };

  // --- CHAT LOGIC: Subscribe to Messages ---
  useEffect(() => {
    if (!activeChatId) return;

    // Fetch initial messages history
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('clientes_msg')
        .select('*')
        .eq('chat_id', activeChatId)
        .order('created_at', { ascending: true });

      if (data) {
        setChatMessages(data as ChatMessage[]);
      }
    };
    fetchMessages();

    // Subscribe to NEW messages (Realtime)
    const channel = supabase
      .channel(`chat_room:${activeChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clientes_msg',
          filter: `chat_id=eq.${activeChatId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setChatMessages((current) => {
            // 1. Check for duplicates by real ID
            if (current.some(m => m.id === newMessage.id)) return current;

            // 2. Handle Optimistic Updates for 'recebido'
            // If we find a message that looks like the one we just sent (status received, same text)
            // and has a temporary ID (large timestamp number), we replace it with the real one.
            if (newMessage.status === 'recebido') {
              // Find optimistic version (assuming optimistic IDs are timestamps > 1 year in ms)
              const optimisticIndex = current.findIndex(m =>
                m.status === 'recebido' &&
                m.text === newMessage.text &&
                m.id > 1700000000000 // Simple check for timestamp-based ID
              );

              if (optimisticIndex !== -1) {
                const newHistory = [...current];
                newHistory[optimisticIndex] = newMessage;
                return newHistory;
              }
            }

            // 3. Otherwise, append (e.g. 'enviado' from support)
            return [...current, newMessage];
          });
        }
      )
      .subscribe((status) => {
        setIsChatConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsChatConnected(false);
    };

  }, [activeChatId]);


  const fetchProfileData = async () => {
    try {
      // 1. Fetch User Data (for img_url, public ID) and Client Link
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, img_url, cliente_id')
        .eq('user_id', session.user.id)
        .single();

      if (userError) throw userError;

      if (userData) {
        setPublicUserId(userData.id); // Store public.users.id
        setCompanyLogo(userData.img_url);

        if (userData.cliente_id) {
          // 2. Fetch Client Data (for Company Name)
          const { data: clientData } = await supabase
            .from('clientes')
            .select('nome_fantasia')
            .eq('id', userData.cliente_id)
            .single();

          if (clientData) {
            setCompanyName(clientData.nome_fantasia || 'Empresa');
          }

          // 3. Fetch Units for this Company
          const { data: units } = await supabase
            .from('unidades')
            .select('id, nome_unidade')
            .eq('empresaid', userData.cliente_id);

          if (units && units.length > 0) {
            setUnitsList(units);
            const unitIds = units.map(u => u.id);

            // 4. Calculate Stats - Active Collaborators
            const { count: colabCount } = await supabase
              .from('colaboradores')
              .select('*', { count: 'exact', head: true })
              .in('unidade', unitIds);

            // 5. Calculate Stats - Pending ASOs
            const { count: pendingCount } = await supabase
              .from('agendamentos')
              .select('*', { count: 'exact', head: true })
              .in('unidade', unitIds)
              .eq('compareceu', true)
              .is('aso_liberado', null);

            // 6. Fetch Documents (Real Data)
            // PGR=57, PCMSO=56, LTCAT=53
            const { data: docs } = await supabase
              .from('doc_unidade')
              .select('*')
              .in('unidade_id', unitIds)
              .in('tipo_doc', [53, 56, 57]);

            const fetchedDocs = docs as DocUnidade[] || [];
            setDocuments(fetchedDocs);

            // 7. Calculate Document Issues (Expired or Expiring in 30 days)
            let issues = 0;
            const today = new Date();
            const warningLimit = new Date();
            warningLimit.setDate(today.getDate() + 30);

            fetchedDocs.forEach(doc => {
              // Ignore LTCAT (53) for dashboard alerts/stats
              if (doc.tipo_doc === 53) return;

              if (doc.validade) {
                const valDate = new Date(doc.validade);
                // If expired OR expiring soon
                if (valDate <= warningLimit) {
                  issues++;
                }
              } else {
                // If no validity date but exists, might be considered pending or issue depending on logic.
                // For now, only counting explicit date issues.
              }
            });

            setStats(prev => ({
              ...prev,
              activeCollaborators: colabCount || 0,
              pendingAsos: pendingCount || 0,
              documentsIssueCount: issues
            }));
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Erro no logout:", error);
      window.location.reload();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleUnit = (unitId: number) => {
    setExpandedUnits(prev =>
      prev.includes(unitId)
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  // --- Helper Functions ---

  const getDocStatus = (validity: string | null | undefined, url: string | null) => {
    if (!url) return { status: 'missing', label: 'Pendente', color: 'bg-gray-100 text-gray-400 border-gray-200' };
    if (!validity) return { status: 'active', label: 'Vigente', color: 'bg-green-50 text-green-700 border-green-100' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const valDate = new Date(validity);
    const valDateLocal = new Date(valDate.getUTCFullYear(), valDate.getUTCMonth(), valDate.getUTCDate());

    const diffTime = valDateLocal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', label: 'Vencido', color: 'bg-red-50 text-red-700 border-red-100' };
    } else if (diffDays <= 30) {
      return { status: 'expiring', label: 'Vencendo', color: 'bg-yellow-50 text-yellow-700 border-yellow-100' };
    } else {
      return { status: 'active', label: 'Vigente', color: 'bg-green-50 text-green-700 border-green-100' };
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '--/--/----';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  const handleDownload = (url: string | null) => {
    if (url) window.open(url, '_blank');
  };

  // --- Navigation Handlers ---

  const handleNavigateToSchedule = (colabId: string) => {
    setTargetColabId(colabId);
    setCurrentView('agendamento');
  };

  // --- Chat Handlers ---

  const handleSelectSector = async (sectorId: number) => {
    if (!publicUserId) {
      alert("Erro de identificação do usuário. Tente recarregar a página.");
      return;
    }

    try {
      // 1. Create new chat session (Always create new if we are in sector selection screen, 
      // because checkActiveChat logic directs here only if no active chat exists)
      const { data, error } = await supabase.from('chat_clientes').insert({
        cliente_id: publicUserId,
        last_msg: '',
        profile_img: companyLogo || null,
        tag: sectorId,
        encerrado: false
      }).select().single();

      if (error) throw error;

      setActiveChatId(data.id);
      setChatStep('conversation');
    } catch (err) {
      console.error("Error creating chat:", err);
      alert("Não foi possível iniciar o chat. Tente novamente.");
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || !activeChatId) return;

    setIsSending(true);
    const textToSend = chatInput;
    setChatInput('');

    // Optimistic Update: Show message immediately
    const tempId = Date.now();
    const optimisticMessage: ChatMessage = {
      id: tempId,
      text: textToSend,
      status: 'recebido',
      created_at: new Date().toISOString(),
      chat_id: activeChatId
    };

    setChatMessages(prev => [...prev, optimisticMessage]);

    try {
      // 1. Insert message into clientes_msg
      const { error: msgError } = await supabase.from('clientes_msg').insert({
        chat_id: activeChatId,
        text: textToSend,
        view: false,
        status: 'recebido' // 'recebido' = message received by the system (sent by client)
      });

      if (msgError) throw msgError;

      // 2. Update chat header last_msg
      await supabase.from('chat_clientes')
        .update({ last_msg: textToSend })
        .eq('id', activeChatId);

    } catch (err) {
      console.error("Error sending message:", err);
      // Rollback optimistic update if needed, but usually we just show error
      setChatInput(textToSend); // Restore text
      setChatMessages(prev => prev.filter(m => m.id !== tempId)); // Remove failed msg
      alert("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenColabModal = async () => {
    setIsColabModalOpen(true);
    setColabModalLoading(true);
    try {
      if (unitsList.length === 0) {
        setModalColabs([]);
        return;
      }

      const unitIds = unitsList.map(u => u.id);

      const { data, error } = await supabase
        .from('colaboradores')
        .select(`
            id,
            nome, 
            cpf, 
            setor,
            cargos(nome)
        `)
        .in('unidade', unitIds)
        .order('nome', { ascending: true });

      if (error) throw error;

      const processed = (data || []).map((c: any) => ({
        id: c.id,
        nome: c.nome,
        cpf: c.cpf,
        setor: c.setor || 'N/A',
        cargo_nome: c.cargos?.nome || 'N/A'
      }));

      setModalColabs(processed);
    } catch (err) {
      console.error("Erro ao carregar colaboradores para o modal:", err);
    } finally {
      setColabModalLoading(false);
    }
  };


  // --- Components ---

  const SidebarItem = ({ id, label, icon: Icon, active }: SidebarItemProps) => (
    <button
      onClick={() => { setCurrentView(id); setIsSidebarOpen(false); setTargetColabId(null); }}
      className={`
        w-full flex items-center gap-3 px-5 py-4 rounded-xl transition-all duration-300 group
        border border-transparent text-base
        ${active
          ? 'bg-[#04a7bd] text-white shadow-lg shadow-[#04a7bd]/20 font-bold'
          : 'text-gray-600 hover:bg-gray-50 hover:border-gray-200 hover:text-[#050a30] font-medium'
        }
      `}
    >
      <Icon size={22} className={active ? 'text-white' : 'text-gray-400 group-hover:text-[#04a7bd]'} />
      <span className="tracking-wide">{label}</span>
      {active && <ChevronRight size={18} className="ml-auto opacity-80" />}
    </button>
  );

  const indicators = [
    {
      label: 'Colaboradores Ativos',
      value: loadingProfile ? '-' : stats.activeCollaborators,
      icon: Users,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-100'
    },
    {
      label: 'ASOs Pendentes',
      value: loadingProfile ? '-' : stats.pendingAsos,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50 border-orange-100'
    },
    {
      label: 'Docs com Atenção',
      value: stats.documentsIssueCount,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-100'
    }
  ];

  return (
    <div className="flex h-screen w-screen bg-[#f8fafc] overflow-hidden">

      {/* --- SIDEBAR --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static flex flex-col
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>

        {/* Profile Header */}
        <div className="p-8 border-b border-gray-200/60 flex flex-col items-center text-center">
          <div className="w-28 h-28 rounded-full p-1 border-2 border-[#04a7bd]/20 mb-5 shadow-xl shadow-[#04a7bd]/5 bg-white">
            {companyLogo ? (
              <img src={companyLogo} alt="Logo Empresa" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#04a7bd]/5 flex items-center justify-center text-[#04a7bd]">
                <Building2 size={40} />
              </div>
            )}
          </div>
          {loadingProfile ? (
            <div className="h-7 w-40 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <h2 className="text-xl font-bold text-[#050a30] leading-tight px-2">{companyName}</h2>
          )}
          <p className="text-xs font-bold text-[#04a7bd] mt-2 bg-[#04a7bd]/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
            Cliente Gama
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="px-4 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Menu Principal</span>
          </div>
          <SidebarItem id="home" label="Início" icon={Home} active={currentView === 'home'} />
          <SidebarItem id="agendamento" label="Agendamentos" icon={Calendar} active={currentView === 'agendamento'} />
          <SidebarItem id="asos" label="ASOs e Exames" icon={FileCheck} active={currentView === 'asos'} />
          <SidebarItem id="documentos" label="Documentos" icon={FolderOpen} active={currentView === 'documentos'} />
        </nav>

        {/* Footer / Logout */}
        <div className="p-5 border-t border-gray-200/60 bg-gray-50/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-center gap-2 text-red-600 font-bold hover:bg-red-50 py-4 rounded-xl transition-colors border border-transparent hover:border-red-100 disabled:opacity-50 text-base"
          >
            {isLoggingOut ? <div className="animate-spin h-5 w-5 border-2 border-red-500 border-t-transparent rounded-full"></div> : <LogOut size={20} />}
            <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#f8fafc]">

        {/* Top Header (Mobile Toggle) */}
        <header className="h-16 lg:h-20 px-6 flex items-center justify-between shrink-0 bg-[#f8fafc]/80 backdrop-blur-sm z-20">
          <div className="lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-[#050a30] bg-white rounded-lg shadow-sm border border-gray-200">
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 pt-0 w-full">
          <div className="w-full h-full">

            {/* VIEW: HOME */}
            {currentView === 'home' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8 w-full">

                {/* Welcome Section */}
                <div className="mt-2">
                  <h1 className="text-3xl md:text-5xl font-bold text-[#050a30] tracking-tight">
                    Bem vindo, <span className="text-[#04a7bd]">{companyName}</span>
                  </h1>
                  <p className="text-[#050a30]/70 text-xl mt-3 font-medium">
                    Aqui está o resumo da saúde ocupacional da sua empresa hoje.
                  </p>
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                  {indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      onClick={ind.label === 'Colaboradores Ativos' ? handleOpenColabModal : undefined}
                      className={`p-8 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-6 hover:-translate-y-1 transition-transform duration-300 ${ind.label === 'Colaboradores Ativos' ? 'cursor-pointer active:scale-95' : ''}`}
                    >
                      <div className={`w-18 h-18 p-4 rounded-2xl flex items-center justify-center border ${ind.bg} ${ind.color}`}>
                        <ind.icon size={36} />
                      </div>
                      <div>
                        <h4 className="text-4xl font-bold text-[#050a30]">{ind.value}</h4>
                        <p className="text-base text-[#050a30]/70 font-bold uppercase tracking-wide mt-1">{ind.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Layout Grid: Quick Actions & Status Cards */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                  {/* Left Column: Quick Actions */}
                  <GlassCard className="p-8 border border-gray-200 !bg-white/60 h-full shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="font-bold text-2xl text-[#050a30]">Atalhos Rápidos</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <button onClick={() => setCurrentView('agendamento')} className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#04a7bd] hover:shadow-lg transition-all text-left group">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-xl w-fit mb-4 group-hover:bg-[#04a7bd] group-hover:text-white transition-colors"><Calendar size={28} /></div>
                        <span className="font-bold text-lg text-[#050a30] block mb-1">Novo Agendamento</span>
                        <span className="text-sm text-gray-500 font-medium">Marcar exame</span>
                      </button>
                      <button onClick={() => setCurrentView('asos')} className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#04a7bd] hover:shadow-lg transition-all text-left group">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-xl w-fit mb-4 group-hover:bg-[#04a7bd] group-hover:text-white transition-colors"><FileCheck size={28} /></div>
                        <span className="font-bold text-lg text-[#050a30] block mb-1">Baixar ASO</span>
                        <span className="text-sm text-gray-500 font-medium">Documentos liberados</span>
                      </button>
                    </div>
                  </GlassCard>

                  {/* Right Column: Dynamic Status Card */}
                  {stats.documentsIssueCount === 0 ? (
                    <GlassCard className="p-8 border border-green-200 bg-gradient-to-br from-green-50/50 to-white/60 h-full flex flex-col items-center justify-center text-center shadow-sm">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 text-green-600 shadow-inner">
                        <CheckCircle size={48} />
                      </div>
                      <h3 className="font-bold text-2xl text-[#050a30] mb-2">Tudo em dia!</h3>
                      <p className="text-lg text-gray-500 font-medium max-w-xs mx-auto">
                        Você está em dia com toda a documentação da sua empresa.
                      </p>
                      <div className="mt-6 flex items-center gap-2 text-sm text-green-700 bg-green-100/50 px-4 py-2 rounded-full font-bold">
                        <ShieldCheck size={16} />
                        <span>Empresa 100% Regular</span>
                      </div>
                    </GlassCard>
                  ) : (
                    <GlassCard className="p-8 border border-red-200 bg-gradient-to-br from-red-50/50 to-white/60 h-full flex flex-col items-center justify-center text-center shadow-sm">
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 text-red-600 shadow-inner animate-pulse">
                        <AlertTriangle size={48} />
                      </div>
                      <h3 className="font-bold text-2xl text-[#050a30] mb-2">Atenção Necessária</h3>
                      <p className="text-lg text-gray-500 font-medium max-w-xs mx-auto">
                        Você possui {stats.documentsIssueCount} documento(s) vencendo ou vencido(s).
                      </p>
                      <Button onClick={() => setCurrentView('documentos')} className="mt-6 h-10 text-sm font-bold !bg-red-500 hover:!bg-red-600 !shadow-none">
                        Ver Documentos
                      </Button>
                    </GlassCard>
                  )}
                </div>
              </div>
            )}

            {/* VIEW: AGENDAMENTO */}
            {currentView === 'agendamento' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#050a30]">Gestão de Exames</h2>
                  <p className="text-gray-500 font-medium text-lg">Agende novos exames ou consulte a agenda.</p>
                </div>
                <AppointmentFormClient preSelectedColabId={targetColabId} />
              </div>
            )}

            {/* VIEW: ASOs */}
            {currentView === 'asos' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#050a30]">Consulta de ASOs</h2>
                  <p className="text-gray-500 font-medium text-lg">Baixe os atestados de saúde ocupacional liberados.</p>
                </div>
                <ASOListClient onSchedule={handleNavigateToSchedule} />
              </div>
            )}

            {/* VIEW: DOCUMENTOS */}
            {currentView === 'documentos' && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500 h-full w-full">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-[#050a30]">Documentos da Empresa</h2>
                  <p className="text-gray-500 font-medium text-lg">Acesse e baixe os laudos técnicos vigentes de cada unidade.</p>
                </div>

                {loadingProfile ? (
                  <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04a7bd]"></div>
                  </div>
                ) : unitsList.length === 0 ? (
                  <GlassCard className="p-8 text-center text-gray-500">
                    <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-lg">Nenhuma unidade cadastrada para exibir documentos.</p>
                  </GlassCard>
                ) : (
                  <div className="space-y-6">
                    {unitsList.map((unit) => {
                      const isExpanded = expandedUnits.includes(unit.id);
                      return (
                        <GlassCard key={unit.id} className={`transition-all duration-300 ${isExpanded ? 'bg-white/70' : 'bg-white/40 hover:bg-white/60'}`}>
                          {/* Accordion Header */}
                          <div
                            onClick={() => toggleUnit(unit.id)}
                            className="p-6 flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl transition-colors ${isExpanded ? 'bg-[#04a7bd] text-white shadow-lg shadow-[#04a7bd]/20' : 'bg-[#04a7bd]/10 text-[#04a7bd] group-hover:bg-[#04a7bd] group-hover:text-white'}`}>
                                <MapPin size={24} />
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-[#050a30] group-hover:text-[#04a7bd] transition-colors">{unit.nome_unidade}</h3>
                                <p className="text-sm text-gray-500">{isExpanded ? 'Clique para recolher' : 'Clique para ver documentos'}</p>
                              </div>
                            </div>
                            <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-gray-100 rotate-180 text-[#050a30]' : 'text-gray-400 group-hover:bg-gray-100 group-hover:text-[#050a30]'}`}>
                              <ChevronDown size={24} />
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {isExpanded && (
                            <div className="px-6 pb-8 pt-2 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-gray-100/50 mt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
                                {DOC_DEFINITIONS.map((def) => {
                                  // Find real doc
                                  const doc = documents.find(d => d.unidade_id === unit.id && d.tipo_doc === def.typeId);

                                  let status, label, color;

                                  if (def.typeId === 53) { // LTCAT specific logic
                                    if (doc?.doc_url) {
                                      status = 'active';
                                      label = 'Disponível';
                                      color = 'bg-blue-50 text-blue-700 border-blue-100';
                                    } else {
                                      status = 'missing';
                                      label = 'Não Possui';
                                      color = 'bg-gray-100 text-gray-400 border-gray-200';
                                    }
                                  } else {
                                    const result = getDocStatus(doc?.validade, doc?.doc_url);
                                    status = result.status;
                                    label = result.label;
                                    color = result.color;
                                  }

                                  return (
                                    <div key={`${unit.id}-${def.id}`} className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-[#04a7bd]/30 hover:shadow-lg transition-all flex flex-col h-full">
                                      <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl ${status === 'active' ? 'bg-green-100 text-green-600' : status === 'missing' ? 'bg-gray-100 text-gray-400' : status === 'expiring' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600'}`}>
                                          <ShieldCheck size={24} />
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${color}`}>
                                          {label}
                                        </div>
                                      </div>

                                      <h3 className="text-lg font-bold text-[#050a30] mb-2">{def.name}</h3>

                                      <div className="mb-4">
                                        <span className="text-[10px] text-gray-400 uppercase font-bold">Validade</span>
                                        <p className={`font-bold ${status === 'expired' ? 'text-red-500' : 'text-[#050a30]'}`}>
                                          {def.typeId === 53 ? (doc?.validade ? formatDate(doc.validade) : 'Indeterminada') : formatDate(doc?.validade || null)}
                                        </p>
                                      </div>

                                      <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
                                        {def.description}
                                      </p>

                                      <div className="mt-auto">
                                        {doc?.doc_url ? (
                                          <Button onClick={() => handleDownload(doc.doc_url)} className="w-full justify-center !bg-[#04a7bd] hover:!bg-[#038e9e] h-10 text-sm font-bold">
                                            <Download size={16} /> Baixar PDF
                                          </Button>
                                        ) : (
                                          <Button className="w-full justify-center !bg-gray-200 !text-gray-400 !shadow-none cursor-not-allowed h-10 text-sm font-bold" disabled>
                                            <Lock size={16} /> Não Disponível
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </GlassCard>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Floating Chat Button (Fixed Bottom Right) */}
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-16 h-16 rounded-full bg-[#04a7bd] text-white shadow-xl shadow-[#04a7bd]/30 hover:scale-110 hover:bg-[#038e9e] transition-all flex items-center justify-center border border-white/20 relative z-50"
          >
            {isChatOpen ? <ChevronDown size={32} /> : <MessageCircle size={32} />}
            {/* Notification Dot - Only if closed */}
            {!isChatOpen && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full"></span>}
            {isChatConnected && isChatOpen && <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 border-2 border-[#04a7bd] rounded-full z-10"></span>}
          </button>

          {/* Chat Window */}
          {isChatOpen && (
            <div className="absolute bottom-20 right-0 w-[380px] h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 origin-bottom-right z-40 max-w-[90vw]">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-[#04a7bd] to-[#038e9e] p-5 text-white flex items-center gap-4 shrink-0 shadow-md">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-sm">
                  <Bot size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg leading-tight">Gami</h4>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <span className={`w-2 h-2 rounded-full shadow-[0_0_5px_rgba(255,255,255,0.4)] ${isChatConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <p className="text-xs font-medium">{isChatConnected ? 'Online' : 'Reconectando...'}</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="ml-auto p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ChevronDown size={20} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-[#f0f2f5] relative">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#050a30 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                <div className="relative z-10 flex flex-col min-h-full">
                  {chatStep === 'sector' ? (
                    <div className="flex flex-col h-full">
                      <div className="flex gap-3 mb-6">
                        <div className="w-8 h-8 rounded-full bg-white text-[#04a7bd] shadow-sm flex items-center justify-center shrink-0 mt-1 border border-gray-100">
                          <Bot size={18} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-[#050a30] text-sm leading-relaxed border border-gray-100 max-w-[85%]">
                          Olá! Eu sou a <strong className="text-[#04a7bd]">Gami</strong>. 👋 <br /><br />
                          Selecione o setor para iniciar seu atendimento:
                        </div>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-3 pb-2">
                        {CHAT_SECTORS.map((sector) => (
                          <button
                            key={sector.id}
                            onClick={() => handleSelectSector(sector.id)}
                            className={`
                                            flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-200 bg-white
                                            hover:border-[#04a7bd]/30 hover:shadow-md transition-all group gap-2 h-24
                                        `}
                          >
                            <div className={`p-2 rounded-xl ${sector.color} group-hover:scale-110 transition-transform`}>
                              <sector.icon size={20} />
                            </div>
                            <span className="font-bold text-[#050a30] text-xs text-center">{sector.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-2">
                      {/* Default Welcome Message */}
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-white text-[#04a7bd] shadow-sm flex items-center justify-center shrink-0 mt-1 border border-gray-100">
                          <Bot size={18} />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-[#050a30] text-sm max-w-[85%]">
                          Você iniciou um atendimento. Como podemos te ajudar hoje?
                        </div>
                      </div>

                      {/* Message History */}
                      {chatMessages.map((msg) => {
                        const isClient = msg.status === 'recebido'; // "recebido" by the system = sent by the client
                        return (
                          <div key={msg.id} className={`flex gap-3 w-full ${isClient ? 'justify-end' : 'justify-start'}`}>
                            {!isClient && (
                              <div className="w-8 h-8 rounded-full bg-white text-[#04a7bd] shadow-sm flex items-center justify-center shrink-0 mt-1 border border-gray-100">
                                <Bot size={18} />
                              </div>
                            )}

                            <div className={`
                                              p-3 rounded-2xl text-sm max-w-[80%] shadow-sm leading-relaxed
                                              ${isClient
                                ? 'bg-[#04a7bd] text-white rounded-tr-none rounded-br-2xl rounded-l-2xl'
                                : 'bg-white text-[#050a30] border border-gray-100 rounded-tl-none rounded-bl-2xl rounded-r-2xl'}
                                          `}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

              </div>

              {/* Chat Footer (Input) */}
              {chatStep === 'conversation' && (
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 shrink-0">
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      className="w-full bg-gray-50 text-[#050a30] placeholder-gray-400 rounded-full py-3 pl-5 pr-12 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#04a7bd]/20 transition-all border border-gray-200 focus:border-[#04a7bd]/30"
                      disabled={isSending}
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || isSending}
                      className="absolute right-1.5 p-2 bg-[#04a7bd] text-white rounded-full hover:bg-[#038e9e] disabled:opacity-50 disabled:bg-gray-300 transition-colors shadow-md"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        <CollaboratorsModal
          isOpen={isColabModalOpen}
          onClose={() => setIsColabModalOpen(false)}
          loading={colabModalLoading}
          collaborators={modalColabs}
        />

      </main>
    </div>
  );
}
