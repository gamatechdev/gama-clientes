import React, { useState, useEffect } from 'react';
// Importação de ícones para auxílio visual seguindo o padrão premium e minimalista
import { X, Info, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface NotifyProps {
  /** Identificador único da notificação no localStorage (ex: 'zoomNotify') */
  id: string;
  /** Título em negrito da notificação */
  title: string;
  /** Mensagem descritiva da notificação */
  message: string;
  /** Tipo visual que define as cores e ícones padrão */
  type?: 'info' | 'success' | 'warning' | 'premium';
  /** Classes CSS adicionais para posicionamento ou ajustes finos */
  className?: string;
}

/**
 * Componente Notify
 * Exibe uma notificação elegante com efeito de vidro (glassmorphism).
 * Gerencia sua própria visibilidade baseada em um array de objetos no localStorage (chave 'notify').
 */
export const Notify: React.FC<NotifyProps> = ({ id, title, message, type = 'info', className = '' }) => {
  // Estado que controla se a notificação deve ser renderizada
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Função para verificar se a notificação já foi visualizada/fechada anteriormente
    const checkNotificationStatus = () => {
      const notifyRaw = localStorage.getItem('notify');
      let notifyArr: any[] = [];

      try {
        // Tenta converter o valor do localStorage em um array
        notifyArr = notifyRaw ? JSON.parse(notifyRaw) : [];
      } catch (e) {
        // Caso o formato esteja corrompido, reinicializa como array vazio
        notifyArr = [];
      }

      // Garante que o conteúdo seja um array antes de buscar o ID
      if (Array.isArray(notifyArr)) {
        // Busca a configuração específica para este ID
        const notificationConfig = notifyArr.find((item: any) => item && Object.prototype.hasOwnProperty.call(item, id));

        // Se a configuração existir e for false, ela não deve ser exibida
        if (notificationConfig && notificationConfig[id] === false) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      } else {
        // Se não houver configuração, exibe por padrão
        setIsVisible(true);
      }
    };

    checkNotificationStatus();
  }, [id]);

  // Função disparada ao clicar no botão de fechar (X)
  const handleClose = () => {
    const notifyRaw = localStorage.getItem('notify');
    let notifyArr: any[] = [];

    try {
      notifyArr = notifyRaw ? JSON.parse(notifyRaw) : [];
    } catch (e) {
      notifyArr = [];
    }

    if (!Array.isArray(notifyArr)) notifyArr = [];

    const existingIndex = notifyArr.findIndex((item: any) => item && Object.prototype.hasOwnProperty.call(item, id));

    if (existingIndex > -1) {
      // De acordo com a solicitação, define como false para não abrir mais
      notifyArr[existingIndex][id] = false;
    } else {
      notifyArr.push({ [id]: false });
    }

    localStorage.setItem('notify', JSON.stringify(notifyArr));
    setIsVisible(false);
  };

  // Se a notificação foi marcada como vista, não renderiza nada
  if (!isVisible) return null;

  // Configurações de cores e ícones baseadas no tipo
  const typeConfig = {
    info: { icon: Info, color: 'text-[#04a7bd]', bg: 'bg-[#04a7bd]/10', border: 'border-[#04a7bd]/20' },
    success: { icon: CheckCircle, color: 'text-[#149890]', bg: 'bg-[#149890]/10', border: 'border-[#149890]/20' },
    warning: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
    premium: { icon: Sparkles, color: 'text-[#050a30]', bg: 'bg-gradient-to-br from-[#04a7bd]/20 to-[#149890]/20', border: 'border-white/40' }
  };

  const { icon: Icon, color, bg, border } = typeConfig[type];

  return (
    <div className={`
      group relative overflow-hidden
      bg-white/80 backdrop-blur-xl 
      border border-white/60
      shadow-[0_8px_30px_rgb(0,0,0,0.06)]
      rounded-[24px] p-5
      animate-in fade-in slide-in-from-top-4 duration-700
      transition-all hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)]
      ${className}
    `}>
      {/* Detalhe de Brilho Superior Minimalista */}
      <div className={`absolute top-0 left-0 w-full h-1`} />

      <div className="flex gap-4 relative z-10">
        {/* Container do Ícone com animação de pulso suave */}
        <div className={`p-3.5 rounded-2xl ${bg} ${color} ${border} border shrink-0 h-fit shadow-inner`}>
          <Icon size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {/* Título com cor terciária do tema */}
            <h4 className="text-sm font-black text-[#050a30] uppercase tracking-widest">{title}</h4>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-gray-100/50 rounded-full transition-all text-gray-400 hover:text-[#050a30] active:scale-90"
              title="Entendi"
            >
              <X size={16} />
            </button>
          </div>
          {/* Mensagem com opacidade e cor padrão */}
          <p className="text-[11px] text-[#050a30]/70 leading-relaxed font-bold">
            {message}
          </p>
        </div>
      </div>

      {/* Shine Effect no Hover - Reforça o visual Premium */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
    </div>
  );
};

export default Notify;
