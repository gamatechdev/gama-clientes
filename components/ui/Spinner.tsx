import React from 'react';

/**
 * Spinner customizado e premium
 */
export const Spinner: React.FC<{ size?: string; color?: string; label?: string }> = ({ 
  size = "h-12 w-12", 
  color = "border-[#04a7bd]", 
  label 
}) => (
  <div className="flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500 py-10">
    <div className={`relative ${size}`}>
      <div className={`absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse ${color.replace('border-', 'bg-')}`} />
      <div className={`inset-0 border-[3px] ${color} border-t-transparent rounded-full animate-spin w-full h-full`} />
    </div>
    {label && <p className="text-sm font-semibold text-gray-400">{label}</p>}
  </div>
);

export default Spinner;
