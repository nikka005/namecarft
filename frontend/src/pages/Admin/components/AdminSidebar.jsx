import React from 'react';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, Settings, Tags,
  LogOut, X, TrendingUp, Star, RefreshCw, UserCheck, Download, 
  Menu, Image, ChevronRight
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp, badge: 'PRO' },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'coupons', label: 'Coupons', icon: Tags },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'refunds', label: 'Refunds', icon: RefreshCw },
  { id: 'bulk', label: 'Bulk Operations', icon: Package },
  { id: 'staff', label: 'Staff', icon: UserCheck },
  { id: 'reports', label: 'Reports', icon: Download },
  { id: 'navigation', label: 'Navigation', icon: Menu },
  { id: 'media', label: 'Media Library', icon: Image },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const AdminSidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen, admin }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-72 
          bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 
          transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          border-r border-slate-800/50
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">NameCraft</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="lg:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* User info */}
        {admin && (
          <div className="px-4 py-4 border-b border-slate-800/50">
            <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-medium text-sm">
                {admin.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{admin.name || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{admin.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          <div className="mb-2 px-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</span>
          </div>
          
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                data-testid={`sidebar-${item.id}`}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-gradient-to-r from-sky-500/20 to-blue-500/10 text-white border border-sky-500/30' 
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  }
                `}
              >
                <div className={`
                  w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30' 
                    : 'bg-slate-800/80 group-hover:bg-slate-700'
                  }
                `}>
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className={`
                    px-2 py-0.5 text-xs font-semibold rounded-md
                    ${item.badge === 'PRO' 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                      : 'bg-emerald-500/20 text-emerald-400'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-4 h-4 text-sky-400" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <button 
            onClick={onLogout} 
            data-testid="logout-btn"
            className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
