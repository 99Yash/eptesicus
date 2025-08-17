'use client';

import { Organization } from '@workspace/db/helpers';
import { createContext, useContext, useEffect, useState } from 'react';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  switchOrganization: (orgId: Organization['id']) => void;
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      'useOrganization must be used within an OrganizationProvider'
    );
  }
  return context;
}

interface OrganizationProviderProps {
  children: React.ReactNode;
  organizations: Organization[];
}

export function OrganizationProvider({
  children,
  organizations,
}: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize with first organization or from localStorage
  useEffect(() => {
    try {
      console.log(
        '[OrganizationProvider] Organizations changed:',
        organizations
      );

      if (!organizations || organizations.length === 0) {
        console.log('[OrganizationProvider] No organizations available');
        setCurrentOrganization(null);
        setError(null);
        return;
      }

      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId) {
        const savedOrg = organizations.find((org) => org.id === savedOrgId);
        if (savedOrg) {
          console.log(
            '[OrganizationProvider] Restored saved organization:',
            savedOrg.name
          );
          setCurrentOrganization(savedOrg);
          setError(null);
          return;
        } else {
          console.log(
            '[OrganizationProvider] Saved organization not found, clearing localStorage'
          );
          localStorage.removeItem('currentOrganizationId');
        }
      }

      // Fallback to first organization
      if (organizations[0]) {
        console.log(
          '[OrganizationProvider] Setting first organization as default:',
          organizations[0].name
        );
        setCurrentOrganization(organizations[0]);
        setError(null);
      }
    } catch (err) {
      console.error(
        '[OrganizationProvider] Error initializing organization context:',
        err
      );
      setError('Failed to initialize organization context');
      setCurrentOrganization(null);
    }
  }, [organizations]);

  const switchOrganization = (orgId: string) => {
    try {
      const org = organizations.find((o) => o.id === orgId);
      if (org) {
        console.log(
          '[OrganizationProvider] Switching to organization:',
          org.name
        );
        setCurrentOrganization(org);
        localStorage.setItem('currentOrganizationId', org.id);
        setError(null);
      } else {
        console.error('[OrganizationProvider] Organization not found:', orgId);
        setError('Organization not found');
      }
    } catch (err) {
      console.error(
        '[OrganizationProvider] Error switching organization:',
        err
      );
      setError('Failed to switch organization');
    }
  };

  const value: OrganizationContextType = {
    currentOrganization,
    setCurrentOrganization,
    switchOrganization,
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
