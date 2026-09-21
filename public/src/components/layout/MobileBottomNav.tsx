import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiArchive, FiList, FiTrendingUp, FiUploadCloud } from 'react-icons/fi';

const mobileNavItems = [
  {
    label: 'Upload Parts',
    path: '/dashboard/parts/upload',
    icon: FiUploadCloud,
  },
  {
    label: 'See Parts',
    path: '/dashboard/parts/list',
    icon: FiList,
  },
  {
    label: 'Sales',
    path: '/dashboard/sales',
    icon: FiTrendingUp,
  },
  {
    label: 'Inventory',
    path: '/dashboard/inventory',
    icon: FiArchive,
  },
];

const MobileBottomNav: React.FC = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[11px] font-semibold transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-purple-700'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span className="w-full truncate text-center leading-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
