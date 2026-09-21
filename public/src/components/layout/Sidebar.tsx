// src/components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

// Import your icons. Using react-icons is a great choice.
import { 
  FiGrid, 
  FiPackage, 
  FiBox, 
  FiTag, 
  FiUsers, 
  FiTrendingUp, 
  FiArchive, 
  FiFileText, 
  FiChevronDown,
  FiLogOut
} from 'react-icons/fi';

// Define the type for our navigation items
type NavItem = {
  label: string;
  icon: React.ElementType;
  path?: string;
  submenu?: NavItem[];
  adminOnly?: boolean;
};

// --- Data-Driven Navigation ---
// This makes the sidebar incredibly easy to update. Just modify this array.
const navItems: NavItem[] = [
  { label: 'Dashboard', icon: FiGrid, path: '/dashboard' },
  {
    label: 'Parts',
    icon: FiPackage,
    submenu: [
      { label: 'Upload Part', icon: FiPackage, path: '/dashboard/parts/upload' },
      { label: 'My Parts', icon: FiPackage, path: '/dashboard/parts/mine' },
     
    ],
  },
  {
    label: 'Modules',
    icon: FiBox,
    adminOnly: true,
    submenu: [
      { label: 'Brands', icon: FiTag, path: '/dashboard/brands' },
      { label: 'Categories', icon: FiBox, path: '/dashboard/categories' },
          {
            label: 'Agents',
            icon: FiUsers,
            path: '/dashboard/agents',
            submenu: [
              { label: 'Agents', icon: FiUsers, path: '/dashboard/agents' },
              { label: 'Spare Part Shops', icon: FiPackage, path: '/dashboard/spare-part-shops' },
            ],
          },
      { label: 'Users', icon: FiUsers, path: '/dashboard/users' },
          
    ],
  },
  {
    label: 'Expenses',
    icon: FiBox,
    adminOnly: true,
    submenu: [
      { label: 'Expense List', icon: FiTag, path: '/dashboard/expenses' },
      { label: 'Expense Form', icon: FiBox, path: '/dashboard/expenses/new' },
        
          
    ],
  },
  // Also provide a top-level quick link to Shops for easier access
  { label: 'Shops', icon: FiPackage, path: '/dashboard/spare-part-shops', adminOnly: true },
  { label: 'Sales', icon: FiTrendingUp, path: '/dashboard/sales' },
  { label: 'Inventory', icon: FiArchive, path: '/dashboard/inventory' },
  { label: 'Reports', icon: FiFileText, path: '/dashboard/reports' },
];

// --- Sub-component for clarity ---
const NavItemLink: React.FC<{ item: NavItem; }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  if (item.submenu) {
    return (
      <>
        <div className="w-full flex items-center justify-between px-4 py-3 text-gray-300 rounded-lg transition-colors duration-200">
          <div className="flex items-center gap-4">
            {/* If the parent has a path, clicking the label navigates there. Otherwise render as span. */}
            {item.path ? (
              <NavLink
                to={item.path}
                onClick={() => window.dispatchEvent(new CustomEvent('sidebar:close'))}
                className={({ isActive }) => `flex items-center gap-4 w-full ${isActive ? 'text-white font-semibold' : 'text-gray-300 hover:text-white'}`}
                end
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ) : (
              <button
                onClick={() => setSubmenuOpen(!submenuOpen)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSubmenuOpen(!submenuOpen); } }}
                aria-expanded={submenuOpen}
                className="flex items-center gap-4 w-full text-gray-300 hover:text-white"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )}

            {/* Chevron toggles submenu open/close */}
          </div>

          <div className="ml-2">
            <button
              onClick={() => setSubmenuOpen(!submenuOpen)}
              aria-label={submenuOpen ? 'Collapse submenu' : 'Expand submenu'}
              className="p-1 rounded hover:bg-gray-700/50"
            >
              <motion.div animate={{ rotate: submenuOpen ? 180 : 0 }}>
                <FiChevronDown />
              </motion.div>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {submenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-8"
            >
              <div className="flex flex-col border-l border-gray-600">
                {item.submenu.map((subItem) => (
                  <NavLink
                    key={subItem.label}
                    to={subItem.path!}
                    onClick={() => window.dispatchEvent(new CustomEvent('sidebar:close'))}
                    className={({ isActive }) =>
                      `block w-full flex items-center gap-4 py-3 px-4 transition-colors duration-200 ${
                        isActive
                          ? 'text-white font-semibold'
                          : 'text-gray-400 hover:text-white'
                      }`
                    }
                  >
                    <subItem.icon className="h-4 w-4" />
                    <span>{subItem.label}</span>
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <NavLink
      to={item.path!}
      end // Use 'end' for the Dashboard link to avoid it being active for all child routes
      onClick={() => window.dispatchEvent(new CustomEvent('sidebar:close'))}
      className={({ isActive }) =>
        `flex items-center gap-4 px-4 py-3 rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-purple-600 text-white shadow-lg'
            : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'
        }`
      }
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
    </NavLink>
  );
};


// --- The Main Sidebar Component ---
const Sidebar: React.FC<{ isOpen: boolean; }> = ({ isOpen }) => {
  const { user, isAdmin, logout } = useAuth();
  const visibleNavItems = navItems
    .filter((item) => !item.adminOnly || isAdmin)
    .map((item) => ({
      ...item,
      submenu: item.submenu?.filter((subItem) => !subItem.adminOnly || isAdmin),
    }));

  return (
    // On mobile, this will be a fixed overlay. On desktop (md:), it will be part of the layout.
    <>
      {/* Backdrop for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => window.dispatchEvent(new CustomEvent('sidebar:close'))}
          aria-hidden
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 z-40
        flex flex-col 
        bg-gray-800 text-white
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        w-64 shrink-0
      `}
      >
      {/* Logo Section */}
      <div className="flex items-center justify-center gap-3 p-6 border-b border-gray-700">
        <FiPackage className="h-8 w-8 text-purple-400" />
        <span className="font-bold text-xl whitespace-nowrap">Central Spare Part</span>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavItems.map((item) => (
          <NavItemLink key={item.label} item={item} />
        ))}
      </nav>
      
      {/* User/Footer Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-4">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_EcAlu9QmQHAWsGXDYAO9O2id042QM4OUZEAAhn_V1cXPYFNM8J6WX__qQegasyqERXI&usqp=CAU" // Placeholder avatar
            alt="User Avatar"
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-white">{user?.name || 'User'}</p>
            <p className="text-sm text-gray-400">{user?.role || 'user'}</p>
          </div>
          <button onClick={logout} className="ml-auto text-gray-400 hover:text-white">
             <FiLogOut />
          </button>
        </div>
      </div>
      </aside>
    </>
  );
};

export default Sidebar;

