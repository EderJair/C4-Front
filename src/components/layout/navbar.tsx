'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Actualizar fecha y hora en tiempo real
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Formato de fecha en español
      const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      // Formato de hora
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      };
      
      setCurrentDate(now.toLocaleDateString('es-ES', dateOptions));
      setCurrentTime(now.toLocaleTimeString('es-ES', timeOptions));
    };

    // Actualizar inmediatamente
    updateDateTime();
    
    // Actualizar cada segundo
    const interval = setInterval(updateDateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Notificaciones de ejemplo
  const notifications = [
    {
      id: 1,
      title: 'Proyecto Casa Miraflores',
      message: 'Fase de excavación completada al 75%',
      time: '10 min',
      type: 'success' as const,
      unread: true
    },
    {
      id: 2,
      title: 'Nuevo ingeniero asignado',
      message: 'Carlos Rodríguez ha sido asignado al proyecto',
      time: '1 h',
      type: 'info' as const,
      unread: true
    },
    {
      id: 3,
      title: 'Reporte semanal',
      message: 'Reporte de progreso disponible',
      time: '2 h',
      type: 'warning' as const,
      unread: false
    }
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <nav className="bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 border-b border-blue-800/50 backdrop-blur-lg shadow-2xl shadow-blue-900/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo y marca */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {/* Logo */}
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 mr-3">
                <Image 
                  src="/c4logosinfondo.png" 
                  alt="C4 Logo" 
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
              </div>
              
              {/* Texto del logo */}
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  CONSTRUCTICON
                </h1>
                <p className="text-xs text-blue-200 -mt-1">Sistema de Gestión</p>
              </div>
            </div>
          </div>

          {/* Centro - Fecha y hora */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="text-center">
              <div className="text-white font-medium text-sm">
                {currentDate}
              </div>
              <div className="text-blue-200 text-xs flex items-center justify-center gap-1">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                {currentTime}
              </div>
            </div>
          </div>

          {/* Derecha - Usuario y notificaciones */}
          <div className="flex items-center space-x-4">
            
            {/* Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-blue-200 hover:text-white hover:bg-blue-800/50 rounded-xl transition-all duration-200 group"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                
                {/* Badge de notificaciones */}
                {unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg animate-pulse">
                    {unreadCount}
                  </div>
                )}
              </button>

              {/* Dropdown de notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-xl border border-blue-200/20 rounded-2xl shadow-2xl shadow-blue-900/20 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/50">
                    <h3 className="text-lg font-semibold text-blue-900">Notificaciones</h3>
                    <p className="text-sm text-blue-600">{unreadCount} nuevas</p>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div key={notification.id} className={`p-4 border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${notification.unread ? 'bg-blue-50/30' : ''}`}>
                        <div className="flex items-start space-x-3">
                          {/* Icono según tipo */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                            notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {notification.type === 'success' && (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {notification.type === 'info' && (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            {notification.type === 'warning' && (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500">{notification.time}</p>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                          </div>
                          
                          {notification.unread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-3 bg-gray-50 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Ver todas las notificaciones
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Usuario */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 text-white hover:bg-blue-800/50 rounded-xl px-3 py-2 transition-all duration-200 group"
              >
                {/* Avatar */}
                <div className="h-8 w-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                
                {/* Info del usuario */}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-blue-200 capitalize">
                    {user?.role}
                  </div>
                </div>
                
                {/* Flecha */}
                <svg className={`h-4 w-4 text-blue-200 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown de usuario */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-blue-200/20 rounded-2xl shadow-2xl shadow-blue-900/20 overflow-hidden z-50">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200/50">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.firstName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {user?.role}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Mi Perfil</span>
                    </button>
                    
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Configuración</span>
                    </button>
                    
                    <hr className="my-2 border-gray-200" />
                    
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Móvil - Fecha y hora */}
      <div className="md:hidden border-t border-blue-800/50 px-4 py-2 bg-blue-900/50">
        <div className="text-center">
          <div className="text-white text-sm font-medium">
            {currentDate}
          </div>
          <div className="text-blue-200 text-xs flex items-center justify-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
            {currentTime}
          </div>
        </div>
      </div>
    </nav>
  );
}