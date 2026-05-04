import React, { useState, useEffect } from 'react';
import { Input } from '../../ui/GlassComponents';
import { Search, Download } from 'lucide-react';
import { Button } from '../../ui/GlassComponents';

interface CompanySearchProps {
  onSearch: (term: string) => void;
  onExport?: () => void;
  isSearching?: boolean;
}

/**
 * Componente CompanySearch
 * Monitorea o usuário digitando e dispara o evento de busca somente
 * após 1 segundo de inatividade (debounce).
 * 
 * Isso evita re-renders desnecessários no componente Dashboard durante a escrita.
 */
export const CompanySearch: React.FC<CompanySearchProps> = ({ onSearch, onExport, isSearching }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Inicia a contagem de 1 segundo a partir da última alteração no input
    const timer = setTimeout(() => {
      onSearch(inputValue);
    }, 1000);

    // Se o usuário digitar novamente antes de 1 segundo, limpa o timer anterior
    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  return (
    <div className="mb-8 flex items-center gap-4">
      <Input 
        placeholder="Buscar empresa por nome, razão social ou CNPJ..." 
        icon={<Search size={22} className={isSearching ? 'animate-pulse text-[#04a7bd]' : ''} />} 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        className="max-w-2xl flex-1" 
      />
      {onExport && (
        <Button 
          onClick={onExport}
          className="flex items-center gap-2 h-[54px] px-6 rounded-2xl bg-[#050a30] hover:bg-[#0d1654] text-white shadow-xl shadow-[#050a30]/10 shrink-0"
          title="Exportar base completa para Excel"
        >
          <Download size={20} />
          <span className="hidden sm:inline">Exportar Base</span>
        </Button>
      )}
    </div>
  );
};

export default CompanySearch;
