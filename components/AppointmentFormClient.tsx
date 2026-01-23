
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { GlassCard, Button, Input } from './ui/GlassComponents';
import { ChevronDown, Search, Plus, Calendar, User, Briefcase, MapPin, AlertCircle, Clock, CheckCircle, XCircle, Filter, ArrowRight, Edit3, Save, AlertTriangle, Info, Map, Copy } from 'lucide-react';

// --- Types ---

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento: string;
  sexo: string;
  setor?: string;
  setorid?: number;
  cargo?: number;
  unidade?: number;
  cargos?: { nome: string };
}

interface Unidade {
  id: number;
  nome_unidade: string;
}

interface OptionItem {
  id: string | number;
  label: string;
}

interface AgendaItem {
  id: number;
  data_atendimento: string;
  colaborador: { nome: string };
  tipo: string;
  status: string;
  unidade_info: { nome_unidade: string };
  compareceu: boolean;
  aso_liberado?: string | null; // Date string or null
  colaborador_id: string; // Added for click handler
  unidade: number; // Added for click handler
}

interface AppointmentFormClientProps {
    preSelectedColabId?: string | null;
}

interface OrientationData {
    patientName: string;
    date: string;
    exams: string[];
}

// --- Helper Components (iOS Style) ---

const OrientationModal = ({ isOpen, data, onClose }: { isOpen: boolean, data: OrientationData | null, onClose: () => void }) => {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) setCopied(false);
    }, [isOpen]);

    if (!isOpen || !data) return null;

    const formatDateFull = (dateString: string) => {
        if (!dateString) return '-';
        const parts = dateString.split('-');
        if (parts.length === 3) {
          return `${parts[2]}/${parts[1]}/${parts[0]}`; 
        }
        return dateString;
    };

    const hasAudiometria = data.exams.some(ex => ex.toLowerCase().includes('audiometria'));
    const hasGlicemia = data.exams.some(ex => ex.toLowerCase().includes('glicemia') || ex.toLowerCase().includes('hemoglobina glicada'));

    const handleCopy = () => {
        let text = `Exame Ocupacional do(a) paciente ${data.patientName} está agendado para ${formatDateFull(data.date)}, às 7:00.\n`;
        text += `Atendimento por ordem de chegada!\n\n`;
        
        if (data.exams.length > 0) {
            text += `Exames Solicitados:\n`;
            data.exams.forEach(ex => {
                text += `${ex}\n`;
            });
            text += `\n`;
        }

        text += `Orientações dos exames ocupacionais:\n`;
        text += `Levar RG e CPF!\n`;
        
        if (hasAudiometria) {
            text += `Fazer repouso auditivo de 12 horas.\n`;
        }
        if (hasGlicemia) {
            text += `Jejum de 8 horas.\n`;
        }

        text += `\nEndereço da Clínica Gama Center: Rua Barão de Pouso Alegre, 90, São Sebastião, Conselheiro Lafaiete (ao lado da Igreja São Sebastião).`;

        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300 p-4">
            <GlassCard className="w-full max-w-lg p-0 bg-white border-none shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-[#04a7bd] p-6 text-white text-center shrink-0">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Info size={32} />
                    </div>
                    <h3 className="text-2xl font-bold">Detalhes do Agendamento</h3>
                    <p className="text-white/90 text-sm mt-1">Orientações e Preparo</p>
                </div>
                
                <div className="p-8 overflow-y-auto custom-scrollbar text-[#050a30] text-sm leading-relaxed space-y-6">
                    <div>
                        <p>
                            Exame Ocupacional do(a) paciente <strong className="text-lg">{data.patientName}</strong> está agendado para <strong className="text-lg">{formatDateFull(data.date)}</strong>, <strong className="text-lg">às 7:00</strong>.
                        </p>
                        <p className="italic text-gray-500 mt-1 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100 inline-block">
                            Atendimento por ordem de chegada!
                        </p>
                    </div>

                    {data.exams.length > 0 && (
                        <div>
                            <h4 className="font-bold text-[#04a7bd] uppercase text-xs tracking-wider mb-2 border-b border-gray-100 pb-1">Exames Solicitados</h4>
                            <ul className="list-disc pl-5 space-y-1 text-gray-700 font-medium">
                                {data.exams.map((ex, i) => (
                                    <li key={i}>{ex}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h4 className="font-bold text-[#04a7bd] uppercase text-xs tracking-wider mb-2 border-b border-gray-100 pb-1">Orientações dos exames ocupacionais</h4>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                                <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                                <span>Levar RG e CPF!</span>
                            </li>
                            {hasAudiometria && (
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                                    <span>Fazer repouso auditivo de 12 horas.</span>
                                </li>
                            )}
                            {hasGlicemia && (
                                <li className="flex items-start gap-2">
                                    <CheckCircle size={16} className="text-green-600 mt-0.5 shrink-0" />
                                    <span>Jejum de 8 horas.</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600">
                        <div className="flex items-center gap-2 mb-2 font-bold text-[#050a30]">
                            <MapPin size={16} className="text-[#04a7bd]" /> Endereço da Clínica Gama Center
                        </div>
                        <p>Rua Barão de Pouso Alegre, 90, São Sebastião, Conselheiro Lafaiete (ao lado da Igreja São Sebastião).</p>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-3">
                    <Button onClick={handleCopy} className={`flex-1 h-12 text-base font-bold shadow-md transition-all ${copied ? '!bg-green-600 hover:!bg-green-700 !text-white' : '!bg-blue-50 !text-blue-700 border border-blue-200 hover:!bg-blue-100 hover:border-blue-300'}`}>
                        {copied ? <><CheckCircle size={20}/> Copiado!</> : <><Copy size={20}/> Copiar Texto</>}
                    </Button>
                    <Button onClick={onClose} className="flex-1 h-12 text-base font-bold shadow-lg">
                        Entendido
                    </Button>
                </div>
            </GlassCard>
        </div>
    );
};

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirmar", isWarning = false }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <GlassCard className="w-full max-w-lg p-8 bg-white border-none shadow-2xl scale-100">
        <div className="flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-5 ${isWarning ? 'bg-yellow-100 text-yellow-600' : 'bg-[#04a7bd]/10 text-[#04a7bd]'}`}>
            {isWarning ? <AlertTriangle size={28} /> : <Calendar size={28} />}
          </div>
          <h3 className="text-2xl font-bold text-[#050a30] mb-3">{title}</h3>
          <div className="text-base text-[#050a30]/80 mb-8 leading-relaxed">
            {message}
          </div>
          <div className="flex gap-4 w-full">
            <button onClick={onCancel} className="flex-1 py-3.5 rounded-2xl bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 transition-colors">Cancelar</button>
            <button 
              onClick={onConfirm} 
              className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg transition-colors ${isWarning ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20' : 'bg-[#04a7bd] hover:bg-[#038e9e] shadow-[#04a7bd]/20'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

const IOSInput: React.FC<{
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  readOnly?: boolean;
  maxLength?: number;
}> = ({ label, value, onChange, placeholder, type = 'text', required, icon, className = '', readOnly, maxLength }) => (
  <div className={`group relative ${className}`}>
    {label && <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 ml-1">{label}</label>}
    <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 ${!readOnly && 'group-focus-within:text-[#04a7bd]'}`}>
        {icon}
      </div>
      <input
        type={type}
        required={required}
        value={value}
        readOnly={readOnly}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full bg-white/50 backdrop-blur-md border border-gray-100 
          text-[#050a30] placeholder-gray-400 font-medium
          rounded-2xl py-4 ${icon ? 'pl-12' : 'pl-5'} pr-4
          focus:outline-none focus:bg-white focus:shadow-[0_8px_30px_rgba(4,167,189,0.08)] focus:border-[#04a7bd]/30
          transition-all duration-300
          ${readOnly ? 'opacity-60 cursor-not-allowed bg-gray-100/50 text-gray-500' : ''}
        `}
      />
    </div>
  </div>
);

const IOSSelect: React.FC<{
  label?: string;
  value: string; 
  displayValue?: string;
  onChange: (val: string) => void; 
  onSelect: (val: string, id?: string | number) => void;
  options: OptionItem[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ label, value, displayValue, onChange, onSelect, options, placeholder, required, disabled, icon }) => {
  const [showList, setShowList] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Use displayValue if provided, otherwise value
  const inputValue = displayValue !== undefined ? displayValue : value;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    (opt.label || '').toLowerCase().includes((inputValue || '').toLowerCase())
  );
  
  // If showing full list (via chevron click), we ignore the filter, otherwise use filtered
  const listToRender = (showList === true && document.activeElement !== wrapperRef.current?.querySelector('input')) 
      ? options 
      : filteredOptions;
      
  const handleChevronClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!disabled) {
        setShowList(prev => !prev);
      }
  };

  return (
    <div ref={wrapperRef} className="relative w-full group">
      {label && <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 ml-1">{label}</label>}
      <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
         <div className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors duration-300 ${!disabled && 'group-focus-within:text-[#04a7bd]'}`}>
            {icon || <Search size={18} />}
         </div>
         <input 
            type="text" 
            required={required}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => { onChange(e.target.value); setShowList(true); }}
            onFocus={() => !disabled && setShowList(true)}
            placeholder={placeholder}
            className={`
              w-full bg-white/50 backdrop-blur-md border border-gray-100
              text-[#050a30] placeholder-gray-400 font-medium
              rounded-2xl py-4 pl-12 pr-10
              focus:outline-none focus:bg-white focus:shadow-[0_8px_30px_rgba(4,167,189,0.08)] focus:border-[#04a7bd]/30
              transition-all duration-300
              ${disabled ? 'bg-gray-100/50 text-gray-400 cursor-not-allowed' : ''}
            `}
          />
          <div 
            onClick={handleChevronClick}
            className={`absolute inset-y-0 right-0 px-4 flex items-center cursor-pointer ${disabled ? 'pointer-events-none text-gray-300' : 'text-gray-400 hover:text-[#04a7bd]'}`}
          >
            <ChevronDown size={16} />
          </div>
      </div>
      
      {showList && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 p-1">
          {(document.activeElement === wrapperRef.current?.querySelector('input') && inputValue && listToRender.length === 0) ? (
            <div className="px-4 py-3 text-center text-gray-400 text-xs italic">
                Sem resultados.
            </div>
          ) : (
            (inputValue && options.find(o => o.label === inputValue) && listToRender.length === 1 ? options : (listToRender.length > 0 ? listToRender : options)).map((opt) => (
              <button 
                key={opt.id} 
                type="button" 
                onClick={() => { onSelect(opt.label, opt.id); setShowList(false); }} 
                className="w-full text-left px-4 py-3 hover:bg-[#04a7bd]/10 hover:text-[#04a7bd] rounded-xl transition-colors text-sm text-gray-700 font-medium flex items-center justify-between group-btn"
              >
                {opt.label}
                {inputValue === opt.label && <CheckCircle size={14} className="text-[#04a7bd]" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default function AppointmentFormClient({ preSelectedColabId }: AppointmentFormClientProps) {
  // State
  const [mode, setMode] = useState<'search' | 'form'>('search');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    confirmText?: string;
    isWarning?: boolean;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Orientation Modal State
  const [orientationModal, setOrientationModal] = useState<{
      isOpen: boolean;
      data: OrientationData | null;
  }>({ isOpen: false, data: null });

  // Data Lists
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  
  // Hierarchy Data
  const [filteredSectors, setFilteredSectors] = useState<OptionItem[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<OptionItem[]>([]);

  // Selection State
  const [colabSearchTerm, setColabSearchTerm] = useState('');
  const [selectedColabId, setSelectedColabId] = useState<string>('');
  
  // Forms
  const [colabFormData, setColabFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    sexo: 'M',
    setor: '',
    setorId: '', 
    funcao: '',
    cargoId: ''  
  });

  const [appointmentData, setAppointmentData] = useState({
    data_atendimento: new Date().toISOString().split('T')[0],
    tipo: 'Admissional',
    unidade: '',
    unidadeId: 0
  });
  const [unitSearchTerm, setUnitSearchTerm] = useState('');

  // Fetch Initial Data
  useEffect(() => {
    fetchClientData();
  }, []);

  // Handle Pre-Selection from Props
  useEffect(() => {
    if (preSelectedColabId && colaboradores.length > 0) {
        const target = colaboradores.find(c => c.id === preSelectedColabId);
        if (target) {
            handleSelectColab(target);
        }
    }
  }, [preSelectedColabId, colaboradores]);

  const fetchClientData = async () => {
    setDataLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado.");

      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('cliente_id')
        .eq('user_id', user.id)
        .single();

      if (userError || !userProfile || !userProfile.cliente_id) {
        setMessage({ type: 'error', text: "Conta não vinculada a empresa." });
        setDataLoading(false);
        return;
      }

      setClientId(userProfile.cliente_id);
      console.log("LOG: Empresa Logada ID:", userProfile.cliente_id);

      // Fetch Units
      const { data: units } = await supabase
        .from('unidades')
        .select('id, nome_unidade')
        .eq('empresaid', userProfile.cliente_id);

      const myUnits = units || [];
      setUnidades(myUnits);
      console.log("LOG: Unidades encontradas:", myUnits.map(u => u.nome_unidade));

      // Fetch Collaborators from COLABORADORES TABLE (Search Source)
      if (myUnits.length > 0) {
        const unitIds = myUnits.map(u => u.id);
        
        console.log("LOG: Buscando colaboradores na tabela 'colaboradores' para as unidades:", unitIds);
        
        const { data: colabs } = await supabase
          .from('colaboradores')
          .select('id, nome, cpf, data_nascimento, sexo, setor, setorid, cargo, cargos(nome), unidade')
          .in('unidade', unitIds);
        
        console.log("LOG: Total de colaboradores carregados para busca:", colabs?.length || 0);

        // @ts-ignore
        setColaboradores(colabs || []);

        // Fetch Agenda (For Display Only)
        fetchAgenda(unitIds);
      } else {
        console.log("LOG: Nenhuma unidade vinculada, impossível buscar colaboradores.");
        setColaboradores([]);
      }

    } catch (error: any) {
      console.error("Erro carregando dados:", error);
      setMessage({ type: 'error', text: "Erro ao carregar dados." });
    } finally {
      setDataLoading(false);
    }
  };

  const fetchAgenda = async (unitIds: number[]) => {
      const { data } = await supabase
          .from('agendamentos')
          .select(`
            id, 
            data_atendimento, 
            status, 
            tipo,
            compareceu,
            aso_liberado,
            colaborador:colaboradores(nome),
            unidade_info:unidades(nome_unidade),
            colaborador_id,
            unidade
          `)
          .in('unidade', unitIds)
          .order('data_atendimento', { ascending: false })
          .limit(50);
      
      // @ts-ignore
      setAgenda(data || []);
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    // Split YYYY-MM-DD manually to avoid UTC conversion issues
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`; // DD/MM
    }
    return dateString;
  };

  const formatDateFull = (dateString: string) => {
    if (!dateString) return '-';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateString;
  };

  // Logic to apply mask: 000.000.000-00
  const applyCPFMask = (val: string) => {
    const numeric = val.replace(/\D/g, '');
    return numeric
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // CPF Change Handler
  const handleCPFChange = (val: string) => {
    const masked = applyCPFMask(val);
    setColabFormData(prev => ({ ...prev, cpf: masked }));
  };

  // --- Hierarchy Logic Reuse ---

  const loadSectorsForUnit = async (unitId: number): Promise<OptionItem[]> => {
      const { data } = await supabase.from('unidade_setor').select('id, setor(id, nome)').eq('unidade', unitId);
      if (data) {
          return data.map((item: any) => ({ id: item.setor.id, label: item.setor.nome })).sort((a,b) => a.label.localeCompare(b.label));
      }
      return [];
  };

  const loadRolesForSector = async (sectorId: number): Promise<OptionItem[]> => {
      const { data } = await supabase.from('cargo_setor').select('id, cargos(id, nome)').eq('idsetor', sectorId);
      if (data) {
          return data.map((item: any) => ({ id: item.cargos.id, label: item.cargos.nome })).sort((a,b) => a.label.localeCompare(b.label));
      }
      return [];
  };

  const handleUnitSelect = async (unitName: string, unitId: string | number | undefined) => {
      if (!unitId) return;
      const id = Number(unitId);
      
      setUnitSearchTerm(unitName);
      setAppointmentData(prev => ({ ...prev, unidade: id.toString(), unidadeId: id }));
      
      // If we are changing unit, we must reset sector/cargo
      if (appointmentData.unidadeId !== id) {
          setColabFormData(prev => ({ ...prev, setor: '', setorId: '', funcao: '', cargoId: '' }));
          setFilteredSectors([]);
          setFilteredRoles([]);
      }

      const sectors = await loadSectorsForUnit(id);
      setFilteredSectors(sectors);
  };

  const handleSectorSelect = async (sectorName: string, sectorId: string | number | undefined) => {
      if (!sectorId) return;
      const id = Number(sectorId);

      setColabFormData(prev => ({ ...prev, setor: sectorName, setorId: id.toString(), funcao: '', cargoId: '' }));
      const roles = await loadRolesForSector(id);
      setFilteredRoles(roles);
  };

  // --- Selection Handler ---

  const handleSelectColab = async (colab: Colaborador) => {
    console.log("LOG: Colaborador selecionado:", colab.nome, "| ID:", colab.id);
    setSelectedColabId(colab.id);
    setMode('form');

    // 1. Set Unit and Load Hierarchy (Sectors for this unit)
    let currentUnitId = colab.unidade;
    
    // Default to the first unit if colab has none (edge case) or use theirs
    if (!currentUnitId && unidades.length > 0) currentUnitId = unidades[0].id;

    if (currentUnitId) {
        const u = unidades.find(u => u.id === currentUnitId);
        if (u) {
            setUnitSearchTerm(u.nome_unidade);
            setAppointmentData(prev => ({ ...prev, unidade: u.id.toString(), unidadeId: u.id }));
            
            // Load Sectors for this unit to populate dropdown
            const sectors = await loadSectorsForUnit(u.id);
            setFilteredSectors(sectors);

            // 2. Clear Roles (since we are resetting sector selection visually)
            setFilteredRoles([]);

            // 3. Set Form Data - Force Sector/Cargo to be BLANK as requested
            setColabFormData(prev => ({
                ...prev,
                // Personal data (keep)
                nome: colab.nome,
                // Apply mask to the CPF coming from DB for display
                cpf: applyCPFMask(colab.cpf || ''),
                data_nascimento: colab.data_nascimento,
                sexo: colab.sexo || 'M',

                // Hierarchy data (BLANK AS REQUESTED)
                setor: '',
                setorId: '',
                funcao: '',
                cargoId: ''
            }));
        }
    }
  };

  const startNew = () => {
      setSelectedColabId('');
      clearFields();
      setMode('form');
      // If units exist, select first by default for convenience? No, force selection.
      setUnitSearchTerm('');
      setAppointmentData(prev => ({...prev, unidade: '', unidadeId: 0}));
  };

  const backToSearch = () => {
      setMode('search');
      setColabSearchTerm('');
  };

  const clearFields = () => {
    setColabFormData({ nome: '', cpf: '', data_nascimento: '', sexo: 'M', setor: '', setorId: '', funcao: '', cargoId: '' });
    setAppointmentData(prev => ({ ...prev, tipo: 'Admissional' }));
    setFilteredSectors([]);
    setFilteredRoles([]);
  };

  const generatePDF = async (payload: any) => {
    try {
      const response = await fetch("https://ficha-api.vercel.app/prontuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      const data = await response.json();
      return data.publicUrl || data.url || data.pdf_url || data.link || (typeof data === 'string' && data.startsWith('http') ? data : null);
    } catch (error) {
      console.error("PDF Error:", error);
      return null;
    }
  };

  // --- SUBMIT LOGIC FLOW ---

  // 1. Pre-Submit: Checks inputs and Duplicate CPF
  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic Validation
    if (!appointmentData.unidadeId) { setMessage({type:'error', text: 'Selecione uma unidade.'}); return; }
    if (!colabFormData.setorId || !colabFormData.cargoId) { setMessage({type:'error', text: 'Setor e Cargo são obrigatórios.'}); return; }

    setLoading(true);
    
    // Clean CPF for verification
    const cleanCPF = colabFormData.cpf.replace(/\D/g, '');

    try {
      // If it's a NEW registration (no selectedColabId), check for duplicate CPF
      if (!selectedColabId) {
        const { data: existingColab } = await supabase
          .from('colaboradores')
          .select('*')
          .eq('cpf', cleanCPF)
          .maybeSingle();

        if (existingColab) {
           setLoading(false);
           setModalConfig({
             isOpen: true,
             isWarning: true,
             title: 'CPF Já Cadastrado',
             message: (
                <span>
                   O CPF <strong className="text-[#050a30]">{applyCPFMask(cleanCPF)}</strong> já pertence a <strong className="text-[#050a30]">{existingColab.nome}</strong>. 
                   <br/><br/>Deseja cadastrar <strong className="text-[#050a30]">{colabFormData.nome}</strong> para um exame atualizando o vínculo empresarial?
                </span>
             ),
             confirmText: 'Sim, Atualizar e Agendar',
             onConfirm: () => {
               setModalConfig(prev => ({...prev, isOpen: false}));
               confirmAppointment(existingColab.id);
             }
           });
           return;
        }
      }

      // If no duplicate or editing existing, proceed to confirm appointment
      setLoading(false);
      confirmAppointment(selectedColabId);

    } catch (err: any) {
      console.error(err);
      setLoading(false);
      setMessage({ type: 'error', text: 'Erro na verificação inicial.' });
    }
  };

  // 2. Confirm Appointment Modal
  const confirmAppointment = (targetColabId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Confirmar Agendamento',
      message: (
         <span>
            Deseja agendar o colaborador <strong className="text-[#050a30] text-lg">{colabFormData.nome}</strong> para o dia <strong className="text-[#050a30] text-lg">{formatDateFull(appointmentData.data_atendimento)}</strong>?
            <br/><br/>
            <span className="text-sm text-gray-500">Essa ação emite documentos oficiais e só pode ser revertida entrando em contato com a Gama.</span>
         </span>
      ),
      confirmText: 'Confirmar Agendamento',
      isWarning: false,
      onConfirm: () => {
        setModalConfig(prev => ({...prev, isOpen: false}));
        executeSaving(targetColabId);
      }
    });
  };

  // 3. Final Execution & Orientation Trigger
  const executeSaving = async (targetColabId: string) => {
    setLoading(true);
    try {
      let finalColabId = targetColabId;
      
      // Send Clean CPF
      const cleanCPF = colabFormData.cpf.replace(/\D/g, '');

      const colabPayload = {
        nome: colabFormData.nome,
        cpf: cleanCPF,
        data_nascimento: colabFormData.data_nascimento,
        sexo: colabFormData.sexo,
        setor: colabFormData.setor, // Stores name
        setorid: colabFormData.setorId ? Number(colabFormData.setorId) : null,
        unidade: appointmentData.unidadeId,
        cargo: Number(colabFormData.cargoId)
      };

      // Create or Update Colaborador
      if (!finalColabId) {
        const { data: newC, error: cErr } = await supabase.from('colaboradores').insert([colabPayload]).select().single();
        if (cErr) throw cErr;
        finalColabId = newC.id;
      } else {
        // Always update existing to capture sector/role changes (upsert logic for existing ID)
        await supabase.from('colaboradores').update(colabPayload).eq('id', finalColabId);
      }

      // Generate PDF
      const selectedUnidade = unidades.find(u => u.id === appointmentData.unidadeId);
      const generatedUrl = await generatePDF({
        agendamentoId: Math.random().toString(36).substr(2, 9),
        empresa: selectedUnidade?.nome_unidade || "Matriz",
        nome: colabFormData.nome,
        dataExame: appointmentData.data_atendimento,
        funcao: colabFormData.funcao,
        cpf: cleanCPF, 
        dataNascimento: colabFormData.data_nascimento,
        sexo: colabFormData.sexo,
        tipoExame: appointmentData.tipo,
        setor: colabFormData.setor,
        tipo_exame: [appointmentData.tipo],
        exames_requisitados: [],
        observacoesClinica: "",
        observacoesLaboratorial: "",
        observacoes: "",
        formularios: ["FICHA_CLINICA"]
      });

      // Insert Appointment
      const { error } = await supabase.from('agendamentos').insert([{
        colaborador_id: finalColabId,
        data_atendimento: appointmentData.data_atendimento,
        tipo: appointmentData.tipo,
        unidade: appointmentData.unidadeId,
        exames_snapshot: [],
        ficha_url: generatedUrl,
        status: 'pendente',
        recepcao: 'Aguardando'
      }]);

      if (error) throw error;

      // --- FETCH EXAMS FOR ORIENTATION MODAL ---
      console.log("LOG: Iniciando busca de exames para orientações...");
      console.log("LOG: Unidade ID:", appointmentData.unidadeId);
      console.log("LOG: Setor ID (Genérico da tabela setor):", colabFormData.setorId);

      // 1. Get the link ID from unidade_setor
      const { data: unitSectorLink, error: linkError } = await supabase
        .from('unidade_setor')
        .select('id')
        .eq('unidade', appointmentData.unidadeId)
        .eq('setor', Number(colabFormData.setorId)) // setorId is generic ID, we need the link ID
        .maybeSingle();

      if (linkError) console.error("LOG: Erro buscando unidade_setor:", linkError);
      console.log("LOG: Vínculo unidade_setor encontrado:", unitSectorLink);

      let examsList: string[] = [];
      
      if (unitSectorLink) {
          // 2. Fetch linked exams using the specific unit_sector ID
          console.log("LOG: Buscando exames na tabela exames_unidade com unidade_setor ID:", unitSectorLink.id);
          
          const { data: examsData, error: examsError } = await supabase
            .from('exames_unidade')
            .select('exames(nome)') // Join to get name
            .eq('unidade_setor', unitSectorLink.id);
          
          if (examsError) console.error("LOG: Erro buscando exames_unidade:", examsError);
          console.log("LOG: Dados brutos retornados de exames_unidade:", examsData);

          if (examsData) {
              examsList = examsData.map((item: any) => item.exames?.nome).filter(Boolean);
          }
      } else {
          console.log("LOG: Nenhum vínculo de setor encontrado para esta unidade e setor genérico.");
      }

      console.log("LOG: Lista final de exames para o modal:", examsList);

      // Open Orientation Modal
      setOrientationModal({
          isOpen: true,
          data: {
              patientName: colabFormData.nome,
              date: appointmentData.data_atendimento,
              exams: examsList
          }
      });

      // Note: We do NOT reset state here anymore. 
      // State reset happens on handleOrientationClose

    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao agendar.' });
    } finally {
      setLoading(false);
    }
  };

  const handleOrientationClose = async () => {
      setOrientationModal({ isOpen: false, data: null });
      setMessage({ type: 'success', text: 'Agendamento realizado com sucesso!' });
      
      // Reset flow (previously done in executeSaving)
      fetchAgenda(unidades.map(u => u.id)); 
      backToSearch(); 
      
      // Background refresh colabs
      const { data: colabs } = await supabase.from('colaboradores').select('id, nome, cpf, data_nascimento, sexo, setor, setorid, cargo, cargos(nome), unidade').in('unidade', unidades.map(u => u.id));
      // @ts-ignore
      if (colabs) setColaboradores(colabs);
  };

  const handleAgendaItemClick = async (item: AgendaItem) => {
      // Use existing fetch logic to show details for existing appointment
      setLoading(true);
      try {
          const { data: colab } = await supabase.from('colaboradores').select('*').eq('id', item.colaborador_id).single();
          
          if (!colab) throw new Error("Colaborador não encontrado");

          // Need sector ID (generic) and Unit ID
          const unitId = item.unidade || colab.unidade;
          const sectorId = colab.setorid;

          if (!unitId || !sectorId) {
              // Fallback if data is missing, just show basic info
              setOrientationModal({
                  isOpen: true,
                  data: {
                      patientName: item.colaborador.nome,
                      date: item.data_atendimento,
                      exams: []
                  }
              });
              setLoading(false);
              return;
          }

          // Fetch Exams logic (Reused)
          const { data: unitSectorLink } = await supabase
            .from('unidade_setor')
            .select('id')
            .eq('unidade', unitId)
            .eq('setor', sectorId)
            .maybeSingle();

          let examsList: string[] = [];
          
          if (unitSectorLink) {
              const { data: examsData } = await supabase
                .from('exames_unidade')
                .select('exames(nome)')
                .eq('unidade_setor', unitSectorLink.id);
              
              if (examsData) {
                  examsList = examsData.map((exItem: any) => exItem.exames?.nome).filter(Boolean);
              }
          }

          setOrientationModal({
              isOpen: true,
              data: {
                  patientName: item.colaborador.nome,
                  date: item.data_atendimento,
                  exams: examsList
              }
          });

      } catch (err) {
          console.error("Erro ao buscar detalhes:", err);
      } finally {
          setLoading(false);
      }
  };

  // Filters
  const unitOptions = unidades.map(u => ({ id: u.id, label: u.nome_unidade }));
  const filteredColabs = colaboradores.filter(c => 
      (c.nome && (c.nome || '').toLowerCase().includes((colabSearchTerm || '').toLowerCase())) || 
      (c.cpf && (c.cpf || '').includes(colabSearchTerm || ''))
  );

  // --- Agenda Grouping Logic (Restored) ---
  const getGroupedAgenda = () => {
     const groups: Record<string, AgendaItem[]> = {};
     agenda.forEach(item => {
         // item.data_atendimento is YYYY-MM-DD
         const date = item.data_atendimento;
         if(!groups[date]) groups[date] = [];
         groups[date].push(item);
     });
     
     // Sort keys descending
     const sortedKeys = Object.keys(groups).sort((a,b) => b.localeCompare(a));
     return sortedKeys.map(dateKey => ({ date: dateKey, items: groups[dateKey] }));
  };

  const groupedAgenda = getGroupedAgenda();

  const getDateHeaderLabel = (dateStr: string) => {
     const today = new Date().toISOString().split('T')[0];
     const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
     
     if (dateStr === today) return "Hoje";
     if (dateStr === yesterday) return "Ontem";
     
     // Format: DD/MM/YYYY
     const [y, m, d] = dateStr.split('-');
     return `${d}/${m}/${y}`;
  };

  if (dataLoading) {
      return (
          <GlassCard className="p-12 flex flex-col items-center justify-center max-w-lg mx-auto min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#04a7bd] mb-4"></div>
              <p className="text-[#050a30]/60 font-medium">Carregando...</p>
          </GlassCard>
      );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Modals */}
        <ConfirmationModal 
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          confirmText={modalConfig.confirmText}
          isWarning={modalConfig.isWarning}
          onConfirm={modalConfig.onConfirm}
          onCancel={() => setModalConfig(prev => ({...prev, isOpen: false}))}
        />

        <OrientationModal 
            isOpen={orientationModal.isOpen}
            data={orientationModal.data}
            onClose={handleOrientationClose}
        />

        {/* LEFT COLUMN: FORM (Increased Width) */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
            <GlassCard className="p-6 relative overflow-visible min-h-[500px] flex flex-col">
                
                {/* Mode: SEARCH / INITIAL */}
                {mode === 'search' && (
                  <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-[#04a7bd]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#04a7bd]">
                           <User size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-[#050a30]">Identificar Colaborador</h2>
                        <p className="text-sm text-gray-400 mt-1">Busque por nome/CPF ou cadastre novo</p>
                     </div>

                     <div className="relative mb-6">
                        <IOSInput 
                           value={colabSearchTerm}
                           onChange={setColabSearchTerm}
                           placeholder="Buscar..."
                           icon={<Search size={20} />}
                           className="shadow-sm"
                        />
                        
                        {colabSearchTerm && (
                            <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredColabs.map(c => (
                                    <button key={c.id} type="button" onClick={() => handleSelectColab(c)} className="w-full text-left px-5 py-4 hover:bg-[#04a7bd]/5 border-b border-gray-50 last:border-0 transition-colors flex justify-between items-center group">
                                        <div>
                                            <p className="font-bold text-[#050a30] text-sm group-hover:text-[#04a7bd]">{c.nome}</p>
                                            <p className="text-xs text-gray-400 font-mono mt-0.5">{c.cpf}</p>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-300 group-hover:text-[#04a7bd]" />
                                    </button>
                                ))}
                                {filteredColabs.length === 0 && (
                                    <div className="p-6 text-center">
                                        <p className="text-gray-400 text-sm mb-2">Nenhum colaborador encontrado.</p>
                                        <button onClick={startNew} className="text-[#04a7bd] text-xs font-bold hover:underline">Cadastrar "{colabSearchTerm}"?</button>
                                    </div>
                                )}
                            </div>
                        )}
                     </div>

                     <div className="mt-auto">
                        <div className="relative flex py-5 items-center">
                            <div className="flex-grow border-t border-gray-100"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-300 text-xs font-medium">OU</span>
                            <div className="flex-grow border-t border-gray-100"></div>
                        </div>
                        <Button variant="primary" onClick={startNew} className="w-full h-12 text-base font-bold shadow-md hover:shadow-lg transition-all">
                            <Plus size={20} /> Novo Cadastro
                        </Button>
                     </div>
                  </div>
                )}

                {/* Mode: FORM (New or Edit) */}
                {mode === 'form' && (
                   <form onSubmit={handlePreSubmit} className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                       <div className="flex items-center justify-between pb-4 border-b border-gray-100/50">
                          <button type="button" onClick={backToSearch} className="text-gray-400 hover:text-[#050a30] transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-wide">
                             <ArrowRight size={14} className="rotate-180" /> Voltar
                          </button>
                          <h3 className="text-[#04a7bd] font-bold text-sm uppercase tracking-wider">{selectedColabId ? 'Editar & Agendar' : 'Novo Cadastro'}</h3>
                       </div>

                       {message && (
                          <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                              <span className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                              {message.text}
                          </div>
                       )}
                       
                       {/* Section 1: Personal (Read Only if Existing) */}
                       <div className="space-y-3">
                          <div className="flex items-center gap-2 text-[#050a30]/40 mb-1">
                             <User size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Dados Pessoais</span>
                             {!!selectedColabId && <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 px-2 rounded-full">Bloqueado</span>}
                          </div>
                          <IOSInput 
                             value={colabFormData.nome} 
                             onChange={(v) => setColabFormData({...colabFormData, nome: v})} 
                             placeholder="Nome Completo" 
                             required 
                             readOnly={!!selectedColabId}
                          />
                          <IOSInput 
                             value={colabFormData.cpf} 
                             onChange={handleCPFChange}
                             maxLength={14} 
                             placeholder="CPF (000.000.000-00)" 
                             required 
                             readOnly={!!selectedColabId}
                          />
                          
                          {/* Data de Nascimento - Full Width */}
                          <IOSInput 
                             type="date"
                             value={colabFormData.data_nascimento} 
                             onChange={(v) => setColabFormData({...colabFormData, data_nascimento: v})} 
                             required 
                             className="w-full"
                             readOnly={!!selectedColabId}
                          />
                          
                          {/* Sexo - Full Width below Date */}
                          <div className={`relative h-14 group ${!!selectedColabId ? 'opacity-60 grayscale' : ''}`}>
                             <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 ml-1">Sexo</label>
                             <div className="relative">
                                <select 
                                   value={colabFormData.sexo} 
                                   disabled={!!selectedColabId}
                                   onChange={(e) => setColabFormData({...colabFormData, sexo: e.target.value})}
                                   className="w-full bg-white/50 backdrop-blur-md border border-gray-100 rounded-2xl py-4 px-4 text-[#050a30] font-medium appearance-none focus:outline-none focus:border-[#04a7bd]/30 transition-all cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-100"
                                >
                                   <option value="M">Masculino</option>
                                   <option value="F">Feminino</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-[#04a7bd]" />
                             </div>
                          </div>
                       </div>

                       {/* Section 2: Work Link (Always Editable) */}
                       <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2 text-[#050a30]/40 mb-1">
                             <Briefcase size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Vínculo Empresarial</span>
                          </div>
                          
                          <IOSSelect
                             value={unitSearchTerm}
                             onChange={(val) => setUnitSearchTerm(val)} 
                             onSelect={handleUnitSelect}
                             options={unitOptions}
                             placeholder="Selecionar Unidade"
                             icon={<MapPin size={18} />}
                             required
                          />

                          <IOSSelect
                             displayValue={colabFormData.setor}
                             value={colabFormData.setor}
                             onChange={() => {}} // Search handled by displayValue if we wanted, but logic here is stricter
                             onSelect={handleSectorSelect}
                             options={filteredSectors}
                             placeholder={filteredSectors.length ? "Selecionar Setor" : "Selecione Unidade..."}
                             disabled={!appointmentData.unidadeId}
                             icon={<Filter size={18} />}
                             required
                          />

                          <IOSSelect
                             displayValue={colabFormData.funcao}
                             value={colabFormData.funcao}
                             onChange={() => {}}
                             onSelect={(val, id) => setColabFormData(prev => ({...prev, funcao: val, cargoId: id?.toString() || ''}))}
                             options={filteredRoles}
                             placeholder={filteredRoles.length ? "Selecionar Cargo" : "Selecione Setor..."}
                             disabled={!colabFormData.setorId}
                             icon={<Briefcase size={18} />}
                             required
                          />
                       </div>

                       {/* Section 3: Appointment */}
                       <div className="space-y-3 pt-2">
                           <div className="flex items-center gap-2 text-[#050a30]/40 mb-1">
                             <Calendar size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Agendamento</span>
                          </div>
                          <IOSInput 
                             type="date"
                             label="Data do Exame"
                             value={appointmentData.data_atendimento} 
                             onChange={(v) => setAppointmentData({...appointmentData, data_atendimento: v})} 
                             required 
                          />
                          
                          <div className="relative">
                             <label className="block text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1.5 ml-1">Tipo de Exame</label>
                             <div className="relative">
                                 <select 
                                    value={appointmentData.tipo} 
                                    onChange={(e) => setAppointmentData({...appointmentData,tipo: e.target.value})} 
                                    className="w-full bg-white/50 backdrop-blur-md border border-gray-100 rounded-2xl py-4 px-4 text-[#050a30] font-medium appearance-none focus:outline-none focus:border-[#04a7bd]/30 cursor-pointer"
                                 >
                                    <option value="Admissional">Admissional</option>
                                    <option value="Demissional">Demissional</option>
                                    <option value="Periódico">Periódico</option>
                                    <option value="Retorno">Retorno ao Trabalho</option>
                                    <option value="Mudança">Mudança de Função</option>
                                 </select>
                                 <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                             </div>
                          </div>
                       </div>

                       <div className="pt-4">
                          <Button type="submit" className="w-full h-14 text-lg font-bold shadow-[0_10px_30px_rgba(4,167,189,0.2)] hover:shadow-[0_15px_40px_rgba(4,167,189,0.3)] transition-all transform active:scale-95" disabled={loading}>
                              {loading ? 'Processando...' : <><Save size={20} /> Confirmar</>}
                          </Button>
                       </div>
                   </form> 
                )}

            </GlassCard>
        </div>

        {/* RIGHT COLUMN: AGENDA (Restored Data) */}
        <div className="lg:col-span-7 xl:col-span-8 w-full h-full flex flex-col">
            <GlassCard className="p-6 h-full min-h-[600px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#050a30] flex items-center gap-2">
                        <Calendar className="text-[#04a7bd]" /> Agenda de Exames
                    </h2>
                </div>

                {/* Agenda List with Date Separators */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                    {agenda.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 opacity-50">
                            <Calendar size={48} className="mb-4 text-gray-300"/>
                            <p className="text-gray-400">Nenhum exame agendado recentemente.</p>
                        </div>
                    ) : (
                        groupedAgenda.map((group) => (
                           <div key={group.date}>
                              <div className="flex items-center gap-4 mb-3">
                                 <h3 className="text-sm font-bold text-[#04a7bd] uppercase tracking-wider bg-[#04a7bd]/10 px-3 py-1 rounded-lg inline-block">
                                    {getDateHeaderLabel(group.date)}
                                 </h3>
                                 <div className="h-[1px] flex-1 bg-gray-100"></div>
                              </div>
                              <div className="space-y-3">
                                 {group.items.map((item) => (
                                    <div 
                                      key={item.id} 
                                      onClick={() => handleAgendaItemClick(item)}
                                      className="group bg-white border border-gray-100 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-all hover:border-[#04a7bd]/30 cursor-pointer"
                                    >
                                        <div className="flex items-start gap-4 mb-3 md:mb-0">
                                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg w-16 h-16 border border-gray-200 group-hover:border-[#04a7bd]/30 transition-colors">
                                                <span className="text-xs text-gray-500 uppercase font-bold">{new Date(item.data_atendimento).toLocaleDateString('pt-BR', { month: 'short' }).replace('.','')}</span>
                                                <span className="text-2xl font-bold text-[#050a30]">
                                                    {formatDateDisplay(item.data_atendimento).split('/')[0]}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-[#050a30]">{item.colaborador?.nome || 'Sem nome'}</h4>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-xs flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                        <Briefcase size={10} /> {item.tipo}
                                                    </span>
                                                    <span className="text-xs flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                        <MapPin size={10} /> {item.unidade_info?.nome_unidade}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
                                            {/* Status Logic */}
                                            {item.aso_liberado ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <CheckCircle size={12} /> ASO Liberado
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                                                        Em: {formatDateDisplay(item.aso_liberado)}
                                                    </span>
                                                </div>
                                            ) : item.compareceu ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <Clock size={12} /> Compareceu
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 mt-1 font-medium">
                                                        Aguardando ASO
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                                    Não Compareceu
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        ))
                    )}
                </div>
            </GlassCard>
        </div>
    </div>
  );
}
