import React from 'react';
// Importação do componente base de notificação
import { Notify } from '../../ui/Notify';

/**
 * Componente NotifyList
 * Gerencia o agrupamento e o posicionamento das notificações informativas do sistema
 * no mapa organizacional. Centraliza as dicas de navegação (Zoom e Barra de Espaço).
 */
export const NotifyList: React.FC = () => {
  return (
    <div
      className="absolute top-6 left-6 z-[100] rounded-lg max-h-[85vh] overflow-y-auto custom-scrollbar flex flex-col gap-3 p-4 pointer-events-none bg-transparent select-none"
      style={{ scrollbarWidth: 'thin' }} // Garante visibilidade da barra de rolagem em navegadores modernos
    >
      {/* Notificação sobre o atalho de Shift + Scroll para Zoom */}
      <Notify
        id="zoomNotify"
        title="Atalho de Zoom"
        message="Segure o botão Shift do teclado enquanto usa o scroll do mouse para dar zoom de forma precisa."
        className="border-none shadow-2xl max-w-[280px] pointer-events-auto"
        type="info"
      />

      {/* Notificação sobre o atalho da tecla Espaço para navegação (Pan) */}
      <Notify
        id="espaco"
        title="Navegação Rápida"
        message="Segure a tecla Espaço, clique e arraste com o botão esquerdo para navegar pelo mapa organizacional."
        className="border-none shadow-2xl max-w-[280px] pointer-events-auto"
        type="info"
      />

      {/* Este container permite a inclusão futura de outras notificações de sistema sem poluir o Dashboard.tsx */}
    </div>
  );
};

export default NotifyList;
