// AccountSidebar.tsx
import React from 'react';
import { FiUser, FiUsers, FiShoppingCart, FiMessageSquare, FiBell, FiSettings, FiX } from 'react-icons/fi';
import { FaRegChartBar } from 'react-icons/fa';
import { NavItem } from './NavItem';
import { User, Connection, Message, Notification } from './types';

interface AccountSidebarProps {
  user: User;
  activeTab: string;
  connections: Connection[];
  messages: Message[];
  notifications: Notification[];
  onTabChange: (tab: string) => void;
  showMobileMenu: boolean;
  onCloseMobileMenu: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  user,
  activeTab,
  connections,
  messages,
  notifications,
  onTabChange,
  showMobileMenu,
  onCloseMobileMenu
}) => {
  const navItems = [
    {
      id: 'overview',
      icon: <FiUser />,
      label: 'Profile Overview',
      badge: 0
    },
    {
      id: 'connections',
      icon: <FiUsers />,
      label: 'My Connections',
      badge: connections.filter(c => c.status === 'pending').length
    },
    ...(user.role === 'seller' ? [{
      id: 'listings',
      icon: <FiShoppingCart />,
      label: 'My Listings',
      badge: 0
    }] : []),
    {
      id: 'messages',
      icon: <FiMessageSquare />,
      label: 'Messages',
      badge: messages.filter(m => !m.read).length
    },
    {
      id: 'notifications',
      icon: <FiBell />,
      label: 'Notifications',
      badge: notifications.filter(n => !n.read).length
    },
    {
      id: 'analytics',
      icon: <FaRegChartBar />,
      label: 'Analytics',
      badge: 0
    },
    {
      id: 'settings',
      icon: <FiSettings />,
      label: 'Account Settings',
      badge: 0
    }
  ];

  const content = (
    <nav>
      <ul className="space-y-1">
        {navItems.map(item => (
          <NavItem 
            key={item.id}
            icon={item.icon}
            active={activeTab === item.id}
            onClick={() => {
              onTabChange(item.id);
              onCloseMobileMenu();
            }}
            badge={item.badge}
          >
            {item.label}
          </NavItem>
        ))}
      </ul>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="md:col-span-1 hidden md:block">
        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-6">
          {content}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {showMobileMenu && (
        <div className="fixed inset-0 bg-black/50 z-20 md:hidden">
          <div className="bg-white h-full w-4/5 max-w-sm p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Menu</h2>
              <button 
                onClick={onCloseMobileMenu}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <FiX />
              </button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
};