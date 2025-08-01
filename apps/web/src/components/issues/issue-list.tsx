'use client';

import React from 'react';

import { type IssueWithOrganization } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@workspace/ui/components/command';
import { Kbd } from '@workspace/ui/components/kbd';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import { cn } from '@workspace/ui/lib/utils';
import { formatDate } from 'date-fns';
import { Check, Plus } from 'lucide-react';
import { useIssues, useUpdateIssue } from '~/hooks/use-issues';
import {
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITY_OPTIONS as PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS as STATUS_OPTIONS,
  getPriorityIcon,
  getPriorityTextColor,
  getStatusIcon,
  getStatusTextColor,
} from '~/lib/constants';

function StatusDropdown({ issue }: { issue: IssueWithOrganization }) {
  const updateIssue = useUpdateIssue();
  const CurrentIcon = getStatusIcon(issue.todo_status);
  const [open, setOpen] = React.useState(false);

  const currentStatus = STATUS_OPTIONS.find(
    (option) => option.value === issue.todo_status
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="transparent"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-8"
          aria-label={`Status: ${currentStatus?.label || 'Select status'}`}
          title={`Status: ${currentStatus?.label || 'Select status'}`}
        >
          <CurrentIcon
            size={16}
            className={getStatusTextColor(issue.todo_status)}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search status..." className="h-8" />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {STATUS_OPTIONS.map((option) => {
                const OptionIcon = getStatusIcon(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      if (currentValue !== issue.todo_status) {
                        updateIssue.mutate({
                          id: issue.id,
                          data: {
                            todo_status: currentValue as IssueStatus,
                          },
                        });
                      }
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <OptionIcon
                      size={14}
                      className={getStatusTextColor(option.value)}
                    />
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto h-3 w-3',
                        option.value === issue.todo_status
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function PriorityDropdown({ issue }: { issue: IssueWithOrganization }) {
  const updateIssue = useUpdateIssue();
  const CurrentIcon = getPriorityIcon(issue.todo_priority);
  const [open, setOpen] = React.useState(false);

  const currentPriority = PRIORITY_OPTIONS.find(
    (option) => option.value === issue.todo_priority
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="transparent"
          size="icon"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-8"
          aria-label={`Priority: ${currentPriority?.label || 'Select priority'}`}
          title={`Priority: ${currentPriority?.label || 'Select priority'}`}
        >
          <CurrentIcon
            size={16}
            className={getPriorityTextColor(issue.todo_priority)}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search priority..." className="h-8" />
          <CommandList>
            <CommandEmpty>No priority found.</CommandEmpty>
            <CommandGroup>
              {PRIORITY_OPTIONS.map((option) => {
                const OptionIcon = getPriorityIcon(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      if (currentValue !== issue.todo_priority) {
                        updateIssue.mutate({
                          id: issue.id,
                          data: {
                            todo_priority: currentValue as IssuePriority,
                          },
                        });
                      }
                      setOpen(false);
                    }}
                    className="text-xs"
                  >
                    <OptionIcon
                      size={14}
                      className={getPriorityTextColor(option.value)}
                    />
                    {option.label}
                    <Check
                      className={cn(
                        'ml-auto h-3 w-3',
                        option.value === issue.todo_priority
                          ? 'opacity-100'
                          : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function IssueRow({ issue }: { issue: IssueWithOrganization }) {
  const PriorityIcon = getPriorityIcon(issue.todo_priority);

  // Generate a readable issue ID from the database ID and organization name
  const orgPrefix =
    issue.organization?.name?.slice(0, 3).toUpperCase() || 'ISSUE';
  const issueId = `${orgPrefix}-${issue.id.slice(-2)}`;

  return (
    <div className="group flex items-center gap-3 py-1.5 px-2 hover:bg-muted/30 rounded-sm transition-colors">
      {/* Priority Icon */}
      <div className="flex items-center min-w-fit">
        <PriorityIcon
          size={14}
          className={getPriorityTextColor(issue.todo_priority)}
        />
      </div>

      {/* Issue ID */}
      <span className="text-xs text-muted-foreground font-mono font-medium min-w-fit">
        {issueId}
      </span>

      {/* Issue Title */}
      <span className="text-sm text-foreground truncate flex-1">
        {issue.title}
      </span>

      {/* Date */}
      <span className="text-xs text-muted-foreground min-w-fit">
        {formatDate(issue.createdAt, 'MMM d')}
      </span>

      {/* Dropdowns on hover */}
      <div className="flex items-center gap-1">
        <StatusDropdown issue={issue} />
        <PriorityDropdown issue={issue} />
      </div>
    </div>
  );
}

function StatusGroup({
  status,
  issues,
  onAddIssue,
}: {
  status: (typeof STATUS_OPTIONS)[number];
  issues: IssueWithOrganization[];
  onAddIssue?: () => void;
}) {
  const StatusIcon = getStatusIcon(status.value);

  return (
    <div className="space-y-1">
      {/* Status Header */}
      <div className="flex items-center gap-2 py-1.5 px-2 text-sm group/header">
        <div className="flex items-center gap-2 flex-1">
          <StatusIcon size={16} className={getStatusTextColor(status.value)} />
          <span className="font-medium text-foreground">{status.label}</span>
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
            {issues.length}
          </span>
        </div>
        {onAddIssue && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover/header:opacity-100 transition-opacity"
            onClick={onAddIssue}
          >
            <Plus size={12} />
          </Button>
        )}
      </div>

      {/* Issues */}
      <div className="space-y-0">
        {issues.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}

export function IssueList() {
  const { data: issues, isLoading, error } = useIssues();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {STATUS_OPTIONS.slice(0, 3).map((status) => (
          <div key={status.value} className="space-y-1">
            {/* Status header skeleton */}
            <div className="flex items-center gap-2 py-1.5 px-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded-full w-6" />
            </div>
            {/* Issue rows skeleton */}
            {Array.from({ length: Math.floor(Math.random() * 3) + 1 }).map(
              (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-1.5 px-2 animate-pulse"
                >
                  <div className="h-3 w-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-12" />
                  <div className="h-3 bg-muted rounded flex-1" />
                  <div className="h-3 bg-muted rounded w-10" />
                </div>
              )
            )}
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load issues</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground tracking-tight font-medium text-sm">
          No issues found
        </p>
        <p className="text-muted-foreground mt-1 text-xs">
          Press <Kbd>C</Kbd> to create your first issue
        </p>
      </div>
    );
  }

  // Group issues by status
  const groupedIssues = STATUS_OPTIONS.reduce(
    (acc, status) => {
      acc[status.value] = issues.filter(
        (issue) => issue.todo_status === status.value
      );
      return acc;
    },
    {} as Record<IssueStatus, IssueWithOrganization[]>
  );

  return (
    <div className="space-y-6">
      {STATUS_OPTIONS.map((status) => {
        const statusIssues = groupedIssues[status.value] || [];

        // Only show status groups that have issues
        if (statusIssues.length === 0) return null;

        return (
          <StatusGroup
            key={status.value}
            status={status}
            issues={statusIssues}
            onAddIssue={() => {
              // TODO: Implement add issue functionality
              console.log(`Add issue to ${status.label}`);
            }}
          />
        );
      })}
    </div>
  );
}
