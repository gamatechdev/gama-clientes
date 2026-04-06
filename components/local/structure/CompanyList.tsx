import React from 'react';
import { GlassCard } from '../../ui/GlassComponents';
import { Briefcase, UserPlus, Network } from 'lucide-react';
import { Cliente } from '../../../types';

interface CompanyListProps {
  companies: Cliente[];
  companiesWithUsers: Set<string>;
  onCompanyClick: (company: Cliente) => void;
  triggerCreateUser: (company: Cliente) => void;
  openHierarchy: (company: Cliente) => void;
}

/**
 * Componente CompanyList
 * Responsável apenas pela renderização da grade de cards de empresas.
 * Recebe a lista já filtrada e os handlers necessários.
 */
export const CompanyList: React.FC<CompanyListProps> = ({
  companies,
  companiesWithUsers,
  onCompanyClick,
  triggerCreateUser,
  openHierarchy
}) => {
  if (companies.length === 0) {
    return (
      <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-200 animate-in fade-in duration-500">
        <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium text-lg">Nenhuma empresa encontrada com os filtros atuais.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {companies.map((company) => {
        const hasUser = companiesWithUsers.has(company.id);
        return (
          <GlassCard
            key={company.id}
            onClick={() => onCompanyClick(company)}
            hoverEffect={true}
            className="p-6 min-h-[180px] flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-[#04a7bd]/10 flex items-center justify-center text-[#04a7bd]">
                <Briefcase size={24} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!hasUser) triggerCreateUser(company);
                  }}
                  disabled={hasUser}
                  className={`p-2 rounded-full transition-colors ${hasUser ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-gray-100 text-[#04a7bd] hover:bg-[#04a7bd] hover:text-white'}`}
                  title={hasUser ? "Usuário já existe" : "Criar Acesso de Usuário"}
                >
                  <UserPlus size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openHierarchy(company);
                  }}
                  className="bg-gray-100 p-2 rounded-full text-[#149890] hover:scale-110 transition-transform"
                  title="Mapa Organizacional"
                >
                  <Network size={18} />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#050a30] truncate">
                {company.nome_fantasia || 'Sem Nome'}
              </h3>
              <p className="text-sm text-gray-500 truncate">{company.razao_social}</p>
              {company.cnpj && (
                <p className="text-xs text-[#149890] mt-2 font-mono bg-[#149890]/10 inline-block px-2 py-1 rounded-lg">
                  {company.cnpj}
                </p>
              )}
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};

export default CompanyList;
