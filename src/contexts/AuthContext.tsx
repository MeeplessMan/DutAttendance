// File: src/contexts/AuthContext.tsx
// --- FINAL VERSION USING YOUR ACTUAL DATABASE COLUMNS ---

import React, { createContext, useContext, useState } from 'react';
import { SupabaseService } from '../services/supabaseService';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const demoUsers = [
  { email: '22382901@dut4life.ac.za', password: 'password123' },
  { email: '22332308@dut4life.ac.za', password: 'password123' },
  { email: '22208776@dut4life.ac.za', password: 'password123' }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadUserProfile = async (email: string) => {
    try {
      const userData = await SupabaseService.getStudentByEmail(email);
      
      if (userData) {
        // Use the exact column names from your database
        const userProfile: User = {
          id: userData.id,
          name: `${userData.first_name} ${userData.surname}`,
          first_name: userData.first_name,
          surname: userData.surname,
          email: userData.email,
          studentId: userData.student_num,
          student_number: userData.student_num,
          role: userData.role as 'student' | 'admin' | 'lecturer',
          isEnrolled: !!userData.face_embedding, 
          avatar: userData.image || undefined
        };
        
        console.log("User profile created:", userProfile); // Debug log
        setUser(userProfile);
        return true;
      } else {
        console.warn(`User ${email} not found in the database.`);
        return false;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const demoUser = demoUsers.find(u => u.email === email && u.password === password);
      if (!demoUser) {
        setIsLoading(false);
        return false;
      }
      const success = await loadUserProfile(email);
      setIsLoading(false);
      return success;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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