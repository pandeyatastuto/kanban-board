/**
 * AuthContext — current user identity and board presence.
 * In a real app this would handle authentication; here it provides
 * mock data and tracks which users are actively viewing the board.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, PresenceUser } from '../types/user';
import { getCurrentUser } from '../api/userApi';
import mockWebSocket from '../api/mockWebSocket';
import type { UserPresencePayload } from '../types/events';

interface AuthContextValue {
  currentUser:  User | null;
  activeUsers:  PresenceUser[];
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeUsers, setActiveUsers]  = useState<PresenceUser[]>([]);

  // Load the mock current user on mount
  useEffect(() => {
    getCurrentUser().then(setCurrentUser);
  }, []);

  // Listen for presence events from the mock WebSocket
  useEffect(() => {
    const unsub = mockWebSocket.subscribe(event => {
      if (event.event_type === 'user_joined') {
        const p = event.payload as UserPresencePayload;
        setActiveUsers(prev => {
          // Avoid duplicates
          if (prev.some(u => u.user_id === p.user_id)) return prev;
          return [...prev, { ...p, cursor_position: '', last_seen: p.timestamp }];
        });
      }
      if (event.event_type === 'user_left') {
        const p = event.payload as UserPresencePayload;
        setActiveUsers(prev => prev.filter(u => u.user_id !== p.user_id));
      }
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, activeUsers }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
