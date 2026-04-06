import React from 'react';
// Importação de ícones para auxílio visual seguindo o padrão premium
import { ArrowLeft, Save, Info, Settings, Clock, CheckCircle, Activity } from 'lucide-react';
// Importação de componentes de UI padronizados dois níveis acima
import { GlassCard, Button, PageTitle } from '../../ui/GlassComponents';

interface ExameConfigProps {
    // Exame selecionado para configuração
    exame: any;
    // Função para retornar à lista principal
    onBack: () => void;
    // Função disparada ao salvar as alterações
    onSave: (updatedExame: any) => void;
}

/**
 * Componente ExameConfig
 * Tela de configuração detalhada para parâmetros de um exame específico.
 * Utiliza o design system "Glass" para manter consistência visual.
 */
const ExameConfig: React.FC<ExameConfigProps> = ({ exame, onBack, onSave }) => {
    return (
        <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
            {/* Header da seção de configuração com botão de voltar premium */}
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={onBack}
                    className="p-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm text-[#050a30] hover:bg-[#04a7bd] hover:text-white transition-all active:scale-95"
                >
                    <ArrowLeft size={20} />
                </button>
                <PageTitle 
                    title={exame.nome} 
                    subtitle={`Configuração de Parâmetros Globais • ID: ${exame.id}`} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Coluna Principal: Configurações Gerais */}
                <div className="lg:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                            <Settings className="text-[#04a7bd]" size={22} />
                            <h3 className="text-xl font-bold text-[#050a30]">Periodicidade e Regras</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Exemplo de campo: Periodicidade */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#050a30]/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Periodicidade (Meses)
                                </label>
                                <input 
                                    type="number" 
                                    defaultValue={12}
                                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#04a7bd]/20 focus:border-[#04a7bd] outline-none transition-all font-bold text-[#050a30]"
                                />
                            </div>

                            {/* Exemplo de campo: Status */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#050a30]/60 ml-1 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle size={14} /> Status do Exame
                                </label>
                                <div className="flex items-center gap-2 p-1 bg-gray-50/50 rounded-xl border border-gray-200">
                                    <button className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-black shadow-sm">ATIVO</button>
                                    <button className="flex-1 py-2 text-gray-400 text-xs font-bold hover:bg-gray-100 rounded-lg transition-all">INATIVO</button>
                                </div>
                            </div>
                        </div>

                        {/* Seção de Info Adicional */}
                        <div className="mt-8 p-4 bg-[#04a7bd]/5 rounded-2xl border border-[#04a7bd]/10 flex gap-4">
                            <div className="p-2 bg-[#04a7bd]/10 rounded-lg text-[#04a7bd] shrink-0 h-fit">
                                <Info size={20} />
                            </div>
                            <p className="text-sm text-[#050a30]/70 leading-relaxed">
                                Estes parâmetros definem o comportamento padrão para todos os setores e unidades que não possuírem regras específicas sobrepostas.
                            </p>
                        </div>
                    </GlassCard>

                    {/* Botões de Ação Final */}
                    <div className="flex justify-end gap-4">
                        <Button variant="secondary" onClick={onBack} className="bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none border-none">
                            Cancelar
                        </Button>
                        <Button onClick={() => onSave(exame)} className="px-10">
                            <Save size={18} /> Salvar Parâmetros
                        </Button>
                    </div>
                </div>

                {/* Coluna Lateral: Resumo / Ajuda */}
                <div className="space-y-6">
                    <GlassCard className="p-6 bg-[#050a30] text-white overflow-visible">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#04a7bd]/20 rounded-full blur-2xl" />
                        <h4 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">
                            <Activity size={20} className="text-[#04a7bd]" /> Resumo Visual
                        </h4>
                        <div className="space-y-4 relative z-10">
                            {[
                                { label: 'Admissional', value: 'Sim' },
                                { label: 'Periódico', value: 'Sim' },
                                { label: 'Demissional', value: 'Não' }
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/10">
                                    <span className="text-xs text-white/60 font-bold uppercase">{item.label}</span>
                                    <span className="text-sm font-black text-[#04a7bd]">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default ExameConfig;
