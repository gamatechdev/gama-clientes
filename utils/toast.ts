import { toast as shadcnToast } from '../hooks/use-toast';

export type ToastOptions = {
  title?: string;
  description: string;
};

/**
 * Utilitário global para exibir notificações (Toasts) de forma padronizada.
 * Encapsula as chamadas do shadcn/ui para facilitar o uso no código.
 */
export const toast = {
  /**
   * Notificação de Sucesso (Verde)
   */
  success: (options: ToastOptions) => {
    shadcnToast({
      title: options.title || 'Sucesso',
      description: options.description,
      variant: 'success',
    });
  },

  /**
   * Notificação de Erro (Vermelho)
   */
  error: (options: ToastOptions) => {
    shadcnToast({
      title: options.title || 'Ocorreu um erro',
      description: options.description,
      variant: 'destructive',
    });
  },

  /**
   * Notificação de Atenção (Amarelo)
   */
  warning: (options: ToastOptions) => {
    shadcnToast({
      title: options.title || 'Aviso',
      description: options.description,
      variant: 'warning',
    });
  },

  /**
   * Notificação Informativa (Azul)
   */
  info: (options: ToastOptions) => {
    shadcnToast({
      title: options.title || 'Informação',
      description: options.description,
      variant: 'info',
    });
  },

  /**
   * Notificação Padrão
   */
  default: (options: ToastOptions) => {
    shadcnToast({
      title: options.title,
      description: options.description,
      variant: 'default',
    });
  }
};

export default toast;
