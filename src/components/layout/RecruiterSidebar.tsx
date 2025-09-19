import { NavLink } from 'react-router-dom';
import { 
  DocumentTextIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function RecruiterSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: 'CVs reçus',
      href: '/recruiter/dashboard',
      icon: DocumentTextIcon,
      description: 'Tous les CVs consultés'
    },
    {
      name: 'Profil',
      href: '/profil',
      icon: UserIcon,
      description: 'Mes informations'
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CV</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">CV App</h1>
                <p className="text-xs text-gray-500">Espace Recruteur</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <Bars3Icon className="h-5 w-5 text-gray-600" />
            ) : (
              <XMarkIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center px-3 py-3 rounded-lg transition-colors group ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className={`h-5 w-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500 group-hover:text-gray-600">
                        {item.description}
                      </div>
                    </div>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer info */}
        {!isCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 text-sm">🏢</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-900">Espace Recruteur</p>
                  <p className="text-xs text-indigo-600">Gestion des CVs reçus</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spacer pour le contenu principal */}
      <div className={`${isCollapsed ? 'ml-16' : 'ml-72'} transition-all duration-300`} />
    </>
  );
}