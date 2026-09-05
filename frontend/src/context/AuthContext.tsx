import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'Consultant' | 'Manager' | 'HR' | 'Finance' | 'Administrator';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('Consultant');

  // Simple mock user names based on role
  const roleToName: Record<Role, string> = {
    Consultant: 'Alex (Consultant)',
    Manager: 'Sam (Manager)',
    HR: 'Jordan (HR)',
    Finance: 'Taylor (Finance)',
    Administrator: 'Admin User',
  };

  return (
    <AuthContext.Provider value={{ role, setRole, userName: roleToName[role] }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
