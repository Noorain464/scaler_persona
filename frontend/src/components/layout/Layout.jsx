import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Calendar, PhoneCall } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare size={18} /> },
    { name: 'Book Call', path: '/book', icon: <Calendar size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <h1 className="text-xl font-bold text-indigo-700 tracking-tight flex items-center">
              <span className="bg-indigo-600 text-white rounded-lg p-1.5 mr-2">
                <PhoneCall size={18} />
              </span>
              Syeda Noorain
            </h1>
            <p className="text-xs text-gray-500 mt-1 pl-9">Autonomous Representative</p>
          </div>
          <div className="px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  location.pathname === item.path
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className={`mr-3 ${location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="p-6">
          {/* Status block */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <div>
              <p className="text-xs font-semibold text-gray-700">Systems Online</p>
              <p className="text-[10px] text-gray-500 mt-0.5">Voice Engine: Ready</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </main>
    </div>
  );
};

export default Layout;
