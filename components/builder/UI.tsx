import React, { useEffect } from 'react';
import { LucideIcon, UploadCloud, File as FileIcon, X, CheckCircle, AlertCircle, Info } from 'lucide-react';

// --- Badge ---
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'draft' | 'review' | 'published' | 'tier' | 'accredited';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'draft', className = '' }) => {
  const styles = {
    draft: 'bg-gray-300 text-gray-900',
    review: 'bg-warning text-white',
    published: 'bg-success text-white',
    tier: 'bg-navy text-white text-xs tracking-wider',
    accredited: 'bg-gold text-navy font-bold flex items-center gap-1',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// --- Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-bold uppercase transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: "bg-red text-white hover:bg-red-700 shadow-md focus:ring-red-600 tracking-widest",
    secondary: "bg-blue text-white hover:bg-blue-600 shadow-md focus:ring-blue-600 tracking-wider",
    outline: "bg-white border border-gray-300 text-slate hover:border-gray-500 focus:ring-gray-300 tracking-wide",
    ghost: "bg-transparent text-slate hover:bg-gray-100 hover:text-navy tracking-wide",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
    md: "text-sm px-5 py-2.5 gap-2 rounded-xl",
    lg: "text-base px-8 py-3 gap-2.5 rounded-xl",
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 18} />}
      {children}
    </button>
  );
};

// --- Card ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-card shadow-card border border-gray-300 overflow-hidden ${className} ${onClick ? 'cursor-pointer transition-transform hover:-translate-y-1' : ''}`}>
    {children}
  </div>
);

// --- Input Components ---
export const Label: React.FC<{ children: React.ReactNode; htmlFor?: string; required?: boolean }> = ({ children, htmlFor, required }) => (
  <label htmlFor={htmlFor} className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
    {children} {required && <span className="text-red">*</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input
    className={`w-full px-4 py-3 rounded-input border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-shadow ${className}`}
    {...props}
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-4 py-3 rounded-input border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent transition-shadow ${className}`}
    {...props}
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className = '', children, ...props }) => (
  <div className="relative">
    <select
      className={`w-full px-4 py-3 pr-8 rounded-input border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent appearance-none transition-shadow ${className}`}
      {...props}
    >
      {children}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

// --- File Upload ---
interface FileUploadProps {
  label?: string;
  accept?: string;
  onChange: (file: File | null, previewUrl: string) => void;
  currentPreviewUrl?: string;
  className?: string;
  readContent?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, accept, onChange, currentPreviewUrl, className = '', readContent = true }) => {
  const [dragActive, setDragActive] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!readContent) {
      onChange(file, '');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    inputRef.current?.click();
  };

  const isImage = currentPreviewUrl?.match(/^data:image/) || currentPreviewUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i);

  return (
    <div className={className}>
      {label && <div className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">{label}</div>}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[160px] ${dragActive ? 'border-blue bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />

        {currentPreviewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center">
            {isImage ? (
              <img src={currentPreviewUrl} alt="Preview" className="max-h-48 object-contain rounded-lg mb-4 shadow-sm" />
            ) : (
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                <FileIcon size={32} />
              </div>
            )}
            <span className="text-xs font-bold text-blue uppercase">Click or Drag to Replace</span>
            {!isImage && <span className="text-xs text-gray-500 mt-1 max-w-xs truncate">{currentPreviewUrl.substring(0, 40)}</span>}
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 mb-3">
              <UploadCloud size={24} />
            </div>
            <p className="text-sm font-bold text-navy mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-500 uppercase">{accept ? accept.replace(/\./g, '').toUpperCase() + ' files' : 'All files allowed'}</p>
          </>
        )}
      </div>
    </div>
  );
};

// --- Toast ---
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle size={20} className="text-white" />,
    error: <AlertCircle size={20} className="text-white" />,
    info: <Info size={20} className="text-white" />
  };

  const bgColors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600'
  };

  return (
    <div className={`fixed bottom-6 right-6 ${bgColors[type]} text-white px-6 py-4 rounded-xl shadow-elevated flex items-center gap-3 z-50`}>
      {icons[type]}
      <span className="font-bold tracking-wide text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75">
        <X size={16} />
      </button>
    </div>
  );
};
