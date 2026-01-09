import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-white/70 backdrop-blur-xl 
        border border-white/60
        shadow-[0_8px_30px_rgb(0,0,0,0.04)]
        rounded-[20px] 
        transition-all duration-300 ease-out
        ${hoverEffect ? 'hover:scale-[1.02] hover:bg-white/80 hover:shadow-[0_20px_40px_rgba(4,167,189,0.15)] cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Vitrification Shine Effect - Subtle for light mode */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className = '', variant = 'primary', ...props }) => {
  const variants = {
    // Primary: #04a7bd
    primary: "bg-[#04a7bd] hover:bg-[#038e9e] text-white shadow-lg shadow-[#04a7bd]/20",
    // Secondary: #149890
    secondary: "bg-[#149890] hover:bg-[#117e75] text-white shadow-lg shadow-[#149890]/20",
    // Danger
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
  };

  return (
    <button
      className={`
        px-6 py-3 rounded-2xl font-medium
        transition-all duration-200 active:scale-95
        backdrop-blur-md
        flex items-center justify-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, className = '', icon, ...props }) => {
  return (
    <div className="w-full">
      {/* Label: Tertiary Color #050a30 */}
      {label && <label className="block text-sm text-[#050a30]/80 mb-2 ml-1 font-medium">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#149890]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-white/60 border border-gray-200/60
            text-[#050a30] placeholder-gray-400
            rounded-2xl py-3.5 
            ${icon ? 'pl-12 pr-4' : 'px-4'}
            focus:outline-none focus:border-[#04a7bd] focus:bg-white focus:ring-2 focus:ring-[#04a7bd]/20
            transition-all duration-200
            backdrop-blur-sm
            shadow-sm
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mesh-bg min-h-screen text-[#050a30] p-4 sm:p-6 lg:p-8">
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

export const PageTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-8 pl-2">
    <h1 className="text-4xl font-bold text-[#050a30]">
      {title}
    </h1>
    {subtitle && <p className="text-lg text-[#050a30]/60 mt-1 font-light tracking-wide">{subtitle}</p>}
  </div>
);