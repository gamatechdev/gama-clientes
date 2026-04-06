import React, { useState, useCallback } from 'react';
// Importação de ícones para auxílio visual e representação de estado
import { Edit2, Stethoscope, CheckCircle, ListChecks } from 'lucide-react';
// Importação de componentes de UI padronizados
import { GlassCard, Layout, PageTitle } from '../../ui/GlassComponents';
// Importação de dados brutos e componente de configuração
import { EXAMES_LIST_EXPORT } from './exame_list';
import ExameConfig from './ExameConfig';

interface ExameListViewProps {
    // Função disparada ao clicar no botão de configuração de um exame
    onConfigureExam: (exame: any) => void;
}

/**
 * Componente ExameListView
 * Exibe a lista de exames exportada do arquivo seguindo o design visual de "Exames do Setor".
 */
export const ExameListView: React.FC<ExameListViewProps> = ({ onConfigureExam }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {/* Grid responsiva para a lista de exames com padding adequado para mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 sm:p-6 pb-20">
                {EXAMES_LIST_EXPORT?.map((exame) => (
                    <GlassCard
                        key={exame.id}
                        hoverEffect={true}
                        className="p-6 flex items-center justify-between group border-l-4 border-l-transparent hover:border-l-[#04a7bd]"
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            {/* Círculo do ícone com cor secundária em opacidade baixa */}
                            <div className="p-3 bg-[#050a30]/5 rounded-xl text-[#050a30]/40 group-hover:bg-[#04a7bd]/10 group-hover:text-[#04a7bd] transition-all duration-300 shrink-0">
                                <Stethoscope size={24} />
                            </div>
                            <div className="min-w-0">
                                {/* Título em negrito e cor terciária conforme guidelines */}
                                <h4 className="text-sm font-bold text-[#050a30] truncate group-hover:text-[#04a7bd] transition-colors">
                                    {exame.nome}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    {/* Indicadores Visuais - Mesma vibe dos crachás (badges) do Dashboard */}
                                    <div className="flex items-center gap-1 text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 font-black">
                                        <CheckCircle size={10} /> ATIVO
                                    </div>
                                    <div className="flex items-center gap-1 text-[9px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100 font-bold uppercase tracking-wider">
                                        ID: {exame.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botão de ação premium que surge no hover */}
                        <button
                            onClick={() => onConfigureExam(exame)}
                            className="p-2.5 bg-gray-50 text-gray-400 hover:bg-[#04a7bd] hover:text-white rounded-xl transition-all duration-300 opacity-60 group-hover:opacity-100 active:scale-90 shrink-0 shadow-sm"
                            title="Configurar Parâmetros"
                        >
                            <Edit2 size={16} />
                        </button>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

/**
 * Componente Principal ExameLists
 * Gerencia o estado de navegação entre a lista geral de exames e a tela de configuração individual.
 */
const ExameLists: React.FC = () => {
    // Estado para controlar qual visualização está ativa
    const [view, setView] = useState<'list' | 'config'>('list');
    // Estado para armazenar o exame selecionado para configuração
    const [selectedExame, setSelectedExame] = useState<any | null>(null);

    // Callback para abrir a configuração de um exame
    const handleConfigureExam = useCallback((exame: any) => {
        setSelectedExame(exame);
        setView('config');
        // Scroll suave para o topo ao trocar de visão
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Callback para voltar à lista principal
    const handleBack = useCallback(() => {
        setView('list');
        setSelectedExame(null);
    }, []);

    // Callback para simular o salvamento (futura integração com API/Supabase)
    const handleSave = useCallback((updatedExame: any) => {
        console.log("Salvando configurações para:", updatedExame);
        alert(`Configurações de "${updatedExame.nome}" salvas com sucesso!`);
        handleBack();
    }, [handleBack]);

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {view === 'list' ? (
                    <div className="animate-in fade-in duration-700">
                        <PageTitle
                            title="Catálogo de Exames"
                            subtitle="Gerencie os parâmetros globais e aplicabilidade dos exames disponíveis"
                        />

                        <div className="mb-8 flex items-center gap-2 px-2">
                            <div className="p-1.5 bg-[#04a7bd]/10 rounded-lg text-[#04a7bd]">
                                <ListChecks size={18} />
                            </div>
                            <span className="text-sm font-bold text-[#050a30]/60 uppercase tracking-widest">
                                Lista de Exames Disponíveis
                            </span>
                        </div>

                        <ExameListView onConfigureExam={handleConfigureExam} />
                    </div>
                ) : (
                    selectedExame && (
                        <ExameConfig
                            exame={selectedExame}
                            onBack={handleBack}
                            onSave={handleSave}
                        />
                    )
                )}
            </div>
        </Layout>
    );
};

export default ExameLists;
