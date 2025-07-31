import { useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
}

interface Organization {
  id: string;
  name: string;
  currency: string;
}

interface AuthState {
  user: User | null;
  organizations: Organization[];
  currentOrganization: Organization | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    organizations: [],
    currentOrganization: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for stored auth data
    const storedUser = localStorage.getItem('user');
    const storedOrgs = localStorage.getItem('organizations');
    const storedCurrentOrg = localStorage.getItem('currentOrganization');

    if (storedUser && storedOrgs) {
      setAuthState({
        user: JSON.parse(storedUser),
        organizations: JSON.parse(storedOrgs),
        currentOrganization: storedCurrentOrg ? JSON.parse(storedCurrentOrg) : null,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = (user: User, organizations: Organization[]) => {
    const currentOrganization = organizations[0] || null;
    
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('organizations', JSON.stringify(organizations));
    if (currentOrganization) {
      localStorage.setItem('currentOrganization', JSON.stringify(currentOrganization));
    }

    setAuthState({
      user,
      organizations,
      currentOrganization,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('organizations');
    localStorage.removeItem('currentOrganization');

    setAuthState({
      user: null,
      organizations: [],
      currentOrganization: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const switchOrganization = (organization: Organization) => {
    localStorage.setItem('currentOrganization', JSON.stringify(organization));
    setAuthState(prev => ({ ...prev, currentOrganization: organization }));
  };

  return {
    ...authState,
    login,
    logout,
    switchOrganization,
  };
}
