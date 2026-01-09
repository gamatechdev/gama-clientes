import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard, Button } from './ui/GlassComponents';
import { Search, Calendar, FileText, Download, Briefcase, MapPin, User, ArrowRight, CreditCard, Building2, CheckCircle, Clock, AlertTriangle, X, History, ChevronRight, CalendarPlus } from 'lucide-react';

// --- Interfaces ---

interface AsoItem {
  id: number;
  data_atendimento: string;
  aso_url: string | null;
  aso_liberado?: string | null;
  tipo: string;
  unidade_info: { nome_unidade: string };
  status_agendamento: string; // 'pendente', 'concluido', etc from agendamentos table
}

interface ColaboradorData {
  id: string;
  nome: string;
  cpf: string;
  setor: string;
  cargo_id: number;
  cargo_nome: string;
  historico: AsoItem[];
  ultimo_aso?: AsoItem;
  status_validade: 'valid' | 'expiring' | 'expired' | 'pending';
  dias_para_vencer?: number;
  data_vencimento?: Date;
  periodicidade_meses: number;
}

interface ASOListClientProps {
    onSchedule?: (colabId: string) => void;
}

// --- Helper Components ---

const IOSInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}> = ({ value, onChange, placeholder, icon }) => (
  <div className="group relative w-full">
    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 group-focus-within:text-[#04a7bd]">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/50 backdrop-blur-md border border-gray-100 text-[#050a30] placeholder-gray-400 font-medium rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:bg-white focus:shadow-[0_8px_30px_rgba(4,167,189,0.08)] focus:border-[#04a7bd]/30 transition-all duration-300 text-base"
      />
    </div>
  </div>
);

const HistoryModal = ({ isOpen, colaborador, onClose }: { isOpen: boolean, colaborador: ColaboradorData | null, onClose: () => void }) => {
    if (!isOpen || !colaborador) return null;

    const handleDownload = (url: string | null) => {
        if (url) window.open(url, '_blank');
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '-';
        const parts = dateString.split('-');
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dateString;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <GlassCard className="w-full max-w-2xl bg-white border-none shadow-2xl flex flex-col max-h-[85vh] p-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#04a7bd]/10 text-[#04a7bd] flex items-center justify-center">
                            <History size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-[#050a30]">{colaborador.nome}</h3>
                            <p className="text-sm text-gray-500">Histórico de Exames</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {colaborador.historico.length === 0 ? (
                        <p className="text-center text-gray-400 py-8">Nenhum histórico encontrado.</p>
                    ) : (
                        colaborador.historico.map((item) => (
                            <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#04a7bd]/30 transition-all bg-white hover:shadow-sm gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg w-14 h-14 border border-gray-200">
                                        <span className="text-[10px] text-gray-500 uppercase font-bold">{new Date(item.data_atendimento + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
                                        <span className="text-xl font-bold text-[#050a30]">
                                            {item.data_atendimento.split('-')[2]}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-[#050a30]">{item.tipo}</span>
                                            {item.aso_liberado ? (
                                                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Liberado</span>
                                            ) : (
                                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold uppercase">Pendente</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin size={10} /> {item.unidade_info.nome_unidade}
                                        </div>
                                    </div>
                                </div>
                                
                                {item.aso_url ? (
                                    <Button 
                                        onClick={() => handleDownload(item.aso_url)} 
                                        className="h-10 text-xs font-bold px-4 !bg-[#04a7bd] hover:!bg-[#038e9e] !shadow-none whitespace-nowrap"
                                    >
                                        <Download size={14} /> Baixar PDF
                                    </Button>
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium italic px-4">Documento indisponível</span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default function ASOListClient({ onSchedule }: ASOListClientProps) {
  const [loading, setLoading] = useState(true);
  const [collaborators, setCollaborators] = useState<ColaboradorData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [selectedColab, setSelectedColab] = useState<ColaboradorData | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Client ID
      const { data: userProfile } = await supabase.from('users').select('cliente_id').eq('user_id', user.id).single();
      if (!userProfile?.cliente_id) return;

      // 2. Get Units
      const { data: units } = await supabase.from('unidades').select('id').eq('empresaid', userProfile.cliente_id);
      if (!units || units.length === 0) { setLoading(false); return; }
      const unitIds = units.map(u => u.id);

      // 3. Get Reference Tables (Setor & Cargo_Setor) to calculate periodicity
      // We need to fetch all sectors to map names to IDs
      const { data: setores } = await supabase.from('setor').select('id, nome');
      
      // We need cargo_setor to get periodicity
      const { data: cargoSetorRules } = await supabase.from('cargo_setor').select('idsetor, idcargo, periodicidade');

      // 4. Get Agendamentos + Colaboradores
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_atendimento,
          aso_url,
          aso_liberado,
          tipo,
          status,
          colaborador:colaboradores(
            id,
            nome, 
            cpf, 
            setor,
            cargo,
            cargos(id, nome)
          ),
          unidade_info:unidades(nome_unidade)
        `)
        .in('unidade', unitIds)
        .order('data_atendimento', { ascending: false });

      if (!agendamentos) { setLoading(false); return; }

      // 5. Process Data: Group by Collaborator and Calculate Status
      const colabMap = new Map<string, ColaboradorData>();

      agendamentos.forEach((item: any) => {
          const c = item.colaborador;
          if (!c) return;
          
          if (!colabMap.has(c.id)) {
              // Determine Periodicity
              let periodicity = 12; // Default to 12 months if not found
              
              if (c.setor && setores && cargoSetorRules) {
                  const setorObj = setores.find((s: any) => s.nome.toLowerCase() === c.setor.toLowerCase());
                  if (setorObj) {
                      // Find rule matching sector ID and cargo ID
                      const rule = cargoSetorRules.find((r: any) => r.idsetor === setorObj.id && r.idcargo === c.cargos?.id);
                      if (rule && rule.periodicidade) {
                          periodicity = rule.periodicidade;
                      }
                  }
              }

              colabMap.set(c.id, {
                  id: c.id,
                  nome: c.nome,
                  cpf: c.cpf,
                  setor: c.setor,
                  cargo_id: c.cargos?.id,
                  cargo_nome: c.cargos?.nome || 'N/A',
                  historico: [],
                  status_validade: 'pending', // Will calculate after sorting history
                  periodicidade_meses: periodicity
              });
          }

          const colabEntry = colabMap.get(c.id)!;
          
          colabEntry.historico.push({
              id: item.id,
              data_atendimento: item.data_atendimento,
              aso_url: item.aso_url,
              aso_liberado: item.aso_liberado,
              tipo: item.tipo,
              unidade_info: item.unidade_info,
              status_agendamento: item.status
          });
      });

      // 6. Finalize Status for each collaborator
      const processedList: ColaboradorData[] = Array.from(colabMap.values()).map(colab => {
          // Sort history by date desc
          colab.historico.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime());
          
          // Get latest ASO (prefer released ones, otherwise just latest appointment)
          // Actually, status depends on the last performed exam date.
          const lastExam = colab.historico[0]; // Most recent
          colab.ultimo_aso = lastExam;

          if (lastExam) {
              // Safe Parse Date YYYY-MM-DD to Local Date Object 00:00:00
              const [y, m, d] = lastExam.data_atendimento.split('-').map(Number);
              const lastDate = new Date(y, m - 1, d);
              
              const dueDate = new Date(lastDate);
              dueDate.setMonth(dueDate.getMonth() + colab.periodicidade_meses);
              
              colab.data_vencimento = dueDate;

              const today = new Date();
              today.setHours(0,0,0,0);
              
              const diffTime = dueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              colab.dias_para_vencer = diffDays;

              if (diffDays < 0) {
                  colab.status_validade = 'expired';
              } else if (diffDays <= 30) { // Alterado de 15 para 30 dias
                  colab.status_validade = 'expiring';
              } else {
                  colab.status_validade = 'valid';
              }
          } else {
              colab.status_validade = 'pending';
          }

          return colab;
      });

      setCollaborators(processedList);

    } catch (error) {
      console.error("Erro ao processar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string | null) => {
    e.stopPropagation();
    if (url) window.open(url, '_blank');
  };

  const formatCPF = (cpf: string) => {
    return cpf
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const formatDate = (date: Date | undefined) => {
      if (!date) return '--/--/----';
      return date.toLocaleDateString('pt-BR');
  };

  // Safe string formatter to assume YYYY-MM-DD input without timezone conversion
  const formatDateString = (dateStr: string | undefined) => {
      if (!dateStr) return '--/--/----';
      const parts = dateStr.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return dateStr;
  };

  // Filtering
  const filteredList = collaborators.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cpf.includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header / Search - Added shrink-0 and min-h to prevent collapsing */}
      <GlassCard className="p-8 mb-8 shrink-0 min-h-[200px] flex flex-col justify-center">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
           <div>
             <h2 className="text-2xl font-bold text-[#050a30] flex items-center gap-2">
                <FileText className="text-[#04a7bd]" size={28} /> Consulta de ASOs
             </h2>
             <p className="text-[#050a30]/60 text-base mt-2 font-medium">Gerencie a validade dos exames e baixe os atestados.</p>
           </div>
        </div>
        
        <div className="mt-6 w-full">
          <IOSInput 
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar colaborador..."
            icon={<Search size={22} />}
          />
        </div>
      </GlassCard>

      {/* Grid List */}
      <div className="flex-1">
        {loading ? (
           <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[300px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04a7bd] mb-4"></div>
              <p className="text-[#050a30]/60 font-medium text-lg">Processando dados e validades...</p>
          </GlassCard>
        ) : filteredList.length === 0 ? (
           <GlassCard className="p-12 flex flex-col items-center justify-center min-h-[300px] opacity-60">
              <User size={80} className="mb-6 text-gray-300"/>
              <p className="text-gray-400 text-xl font-medium">Nenhum colaborador encontrado.</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
             {filteredList.map((colab) => (
                 <GlassCard 
                    key={colab.id} 
                    hoverEffect={true} 
                    onClick={() => setSelectedColab(colab)}
                    className="flex flex-col gap-0 border border-gray-100/50 overflow-hidden p-0 h-full group min-h-[320px]"
                 >
                    {/* Status Header */}
                    <div className={`
                       px-6 py-2 text-xs font-bold uppercase tracking-wider flex justify-between items-center
                       ${colab.status_validade === 'valid' ? 'bg-green-50 text-green-700' : 
                         colab.status_validade === 'expiring' ? 'bg-yellow-50 text-yellow-700' : 
                         colab.status_validade === 'expired' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'}
                    `}>
                        <span className="flex items-center gap-1.5">
                            {colab.status_validade === 'valid' ? <><CheckCircle size={14}/> Vigente</> :
                             colab.status_validade === 'expiring' ? <><Clock size={14}/> Vencendo em {colab.dias_para_vencer} dias</> :
                             colab.status_validade === 'expired' ? <><AlertTriangle size={14}/> Vencido</> : 'Sem Dados'}
                        </span>
                        {colab.data_vencimento && (
                           <span>Vence: {formatDate(colab.data_vencimento)}</span>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col gap-4">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 rounded-full bg-[#050a30]/5 text-[#050a30] flex items-center justify-center shrink-0 border border-[#050a30]/10 mt-1">
                                <User size={24} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-lg font-bold text-[#050a30] leading-tight mb-1">{colab.nome}</h4>
                                <p className="text-sm text-gray-400 font-mono mb-2">{formatCPF(colab.cpf)}</p>
                                <div className="flex flex-wrap gap-2 text-xs font-medium text-gray-500">
                                   <span className="bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[120px]" title={colab.cargo_nome}>{colab.cargo_nome}</span>
                                   <span className="bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[120px]" title={colab.setor}>{colab.setor}</span>
                                </div>
                            </div>
                        </div>

                        {/* Last Exam Info */}
                        <div className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 mt-auto">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">Último Exame</p>
                            {colab.ultimo_aso ? (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-[#050a30]">
                                        {formatDateString(colab.ultimo_aso.data_atendimento)}
                                    </span>
                                    <span className="text-xs text-[#04a7bd] bg-[#04a7bd]/10 px-2 py-0.5 rounded-md font-bold">{colab.ultimo_aso.tipo}</span>
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 italic">Nenhum registro</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white border-t border-gray-100 p-4 flex items-center gap-3">
                        {colab.status_validade === 'expired' ? (
                            <Button 
                                onClick={(e) => { e.stopPropagation(); if(onSchedule) onSchedule(colab.id); }}
                                className="flex-1 h-10 text-xs font-bold !shadow-none rounded-xl flex items-center justify-center gap-2 !bg-orange-500 hover:!bg-orange-600 text-white"
                            >
                                <CalendarPlus size={16} /> Agendar Renovação
                            </Button>
                        ) : (
                            <Button 
                                onClick={(e) => handleDownload(e, colab.ultimo_aso?.aso_url || null)}
                                disabled={!colab.ultimo_aso?.aso_url}
                                className={`flex-1 h-10 text-xs font-bold !shadow-none rounded-xl flex items-center justify-center gap-2 ${!colab.ultimo_aso?.aso_url ? '!bg-gray-100 !text-gray-400' : '!bg-[#04a7bd] hover:!bg-[#038e9e]'}`}
                            >
                                <Download size={16} /> {colab.ultimo_aso?.aso_url ? 'Baixar Último ASO' : 'ASO Indisponível'}
                            </Button>
                        )}
                        
                        <button className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                           <ChevronRight size={20} />
                        </button>
                    </div>
                 </GlassCard>
             ))}
          </div>
        )}
      </div>

      <HistoryModal 
        isOpen={!!selectedColab} 
        colaborador={selectedColab} 
        onClose={() => setSelectedColab(null)} 
      />

    </div>
  );
}