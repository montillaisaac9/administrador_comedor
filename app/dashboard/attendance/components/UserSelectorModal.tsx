'use client';

import { useState, useEffect } from 'react';
import { X, Search, UserPlus } from 'lucide-react';
import { ISelect } from '@/app/types/auth';
import { getUser } from '@/app/service/user.service';
import { createAttendance } from '@/app/service/attendance.service';

export default function UserSelectorModal({ 
  isOpen, 
  onClose, 
  menuItemId,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  menuItemId: number;
  onSuccess: () => void;
}) {
  const [users, setUsers] = useState<ISelect[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ISelect[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch users on modal open
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isOpen) return;
      
      try {
        setIsLoading(true);
        const data = await getUser();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError('Error al cargar los usuarios');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // Filter users based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleAddAttendance = async (userId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await createAttendance({
        userId,
        menuItemId
      });
      
      setSuccess('Asistencia registrada exitosamente');
      setTimeout(() => {
        setSuccess(null);
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Error al registrar la asistencia');
      console.error('Error creating attendance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">Agregar asistencia</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 border-b">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-800" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border text-gray-800 border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {isLoading && !filteredUsers.length ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    </div>
                    <button
                      onClick={() => handleAddAttendance(Number(user.id))}
                      disabled={isLoading}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1" />
                      Agregar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {(error || success) && (
          <div className={`p-3 ${error ? 'bg-red-50' : 'bg-green-50'} border-t`}>
            <p className={`text-sm ${error ? 'text-red-700' : 'text-green-700'}`}>
              {error || success}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
