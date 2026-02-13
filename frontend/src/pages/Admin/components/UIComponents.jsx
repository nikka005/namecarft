import React from 'react';

// Status Badge Component
export const StatusBadge = ({ status, variant = 'default' }) => {
  const statusStyles = {
    // Order statuses
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    processing: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
    
    // Payment statuses
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending_verification: 'bg-purple-50 text-purple-700 border-purple-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
    
    // General
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    inactive: 'bg-slate-50 text-slate-600 border-slate-200',
    blocked: 'bg-red-50 text-red-700 border-red-200',
    approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    processed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    
    // Default
    default: 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const normalizedStatus = status?.toLowerCase()?.replace(/\s+/g, '_') || 'default';
  const style = statusStyles[normalizedStatus] || statusStyles.default;
  
  const displayText = status?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${style}`}>
      {displayText}
    </span>
  );
};

// Action Button Group
export const ActionButtons = ({ children, className = '' }) => (
  <div className={`flex items-center gap-1 ${className}`}>
    {children}
  </div>
);

// Card Container
export const Card = ({ children, className = '', padding = true }) => (
  <div className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
    {children}
  </div>
);

// Card Header
export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`flex items-center justify-between mb-6 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// Empty State
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="text-center py-12">
    {Icon && (
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
    )}
    <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
    {description && <p className="text-slate-500 mb-4">{description}</p>}
    {action}
  </div>
);

// Loading Spinner
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
  };
  
  return (
    <div className={`${sizes[size]} border-sky-500 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

// Page Loading State
export const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mx-auto mb-4" />
      <p className="text-slate-500">Loading...</p>
    </div>
  </div>
);

// Section Title
export const SectionTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg font-semibold text-slate-900 mb-4 ${className}`}>
    {children}
  </h2>
);

// Form Section
export const FormSection = ({ title, description, children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {(title || description) && (
      <div className="mb-4">
        {title && <h4 className="text-sm font-semibold text-slate-900">{title}</h4>}
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
    )}
    {children}
  </div>
);
