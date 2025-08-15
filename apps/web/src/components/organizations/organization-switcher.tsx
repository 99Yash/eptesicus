'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Organization } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { cn } from '@workspace/ui/lib/utils';
import { Building2, Check, ChevronsUpDownIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { useOrganization } from '~/components/layouts/organization-provider';

interface OrganizationSwitcherProps {
  organizations: Organization[];
  className?: string;
  onCreateOrganization?: () => void;
}

export function OrganizationSwitcher({
  organizations,
  className,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const { currentOrganization, switchOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Don't render if no organizations
  if (!organizations || organizations.length === 0) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-8 gap-2 px-3 text-sm font-normal', className)}
        onClick={onCreateOrganization}
      >
        <Plus className="h-4 w-4" />
        <span className="max-w-[120px] truncate">Create Organization</span>
      </Button>
    );
  }

  if (!currentOrganization) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn('h-8 gap-2 px-3 text-sm font-normal', className)}
        disabled
      >
        <Building2 className="h-4 w-4" />
        <span className="max-w-[120px] truncate">Loading...</span>
      </Button>
    );
  }

  const handleOrganizationSwitch = (orgId: string) => {
    console.log('[OrganizationSwitcher] Switching to organization:', orgId);
    switchOrganization(orgId);

    // Invalidate issues query to refetch with new organization
    queryClient.invalidateQueries({ queryKey: ['issues'] });

    // Close the dropdown after selection
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('h-8 gap-2 px-3 text-sm font-normal', className)}
          data-org-switcher
          aria-label={`Current organization: ${currentOrganization.name}. Click to switch organizations.`}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {currentOrganization.logo_url ? (
            <img
              src={currentOrganization.logo_url}
              alt={currentOrganization.name}
              className="rounded self-center border border-main-muted size-6"
            />
          ) : (
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          )}
          <span className="max-w-[120px] truncate text-sm">
            {currentOrganization.name}
          </span>
          <ChevronsUpDownIcon className="size-2.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
          Switch Organization
        </div>
        <DropdownMenuSeparator />
        {organizations.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => handleOrganizationSwitch(org.id)}
            className="flex items-start gap-2 px-2 py-2"
            aria-label={`Switch to ${org.name}${org.bio ? ` - ${org.bio}` : ''}`}
          >
            <div className="flex flex-1 items-start gap-2">
              {org.logo_url ? (
                <img
                  src={org.logo_url}
                  alt={org.name}
                  className="rounded self-center border border-main-muted size-6"
                />
              ) : (
                <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-foreground">
                  {org.name}
                </span>
                {org.bio && (
                  <span className="text-xs text-muted-foreground line-clamp-1 break-words">
                    {org.bio}
                  </span>
                )}
              </div>
            </div>
            {currentOrganization.id === org.id && (
              <Check
                className="h-4 w-4 text-primary flex-shrink-0"
                aria-label="Current organization"
              />
            )}
          </DropdownMenuItem>
        ))}
        {organizations.length === 1 && onCreateOrganization && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 px-2 py-2 text-muted-foreground"
              onClick={onCreateOrganization}
              aria-label="Create another organization"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create another organization</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
