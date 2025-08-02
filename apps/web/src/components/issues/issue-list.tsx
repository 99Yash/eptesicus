'use client';

import React from 'react';

import { type Issue } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
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
import {
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  Circle,
  CircleDashed,
  CircleDot,
  Clock,
  Copy as CopyIcon,
  Flag,
  Flame,
  Minus,
  XCircle,
} from 'lucide-react';
import { useIssues, useUpdateIssue } from '~/hooks/use-issues';
import {
  IssuePriority,
  IssueStatus,
  ISSUE_PRIORITY_OPTIONS as PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS as STATUS_OPTIONS,
} from '~/lib/constants';

// -------------------- Icon Mappings --------------------
const STATUS_ICONS: Record<
  IssueStatus,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  backlog: CircleDashed,
  todo: Circle,
  in_progress: Clock,
  in_review: CircleDot,
  done: CheckCircle2,
  cancelled: XCircle,
  duplicate: CopyIcon,
};

const PRIORITY_ICONS: Record<
  IssuePriority,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  no_priority: Flag,
  urgent: Flame,
  high: ArrowUp,
  medium: Minus,
  low: ArrowDown,
};

function StatusDropdown({ issue }: { issue: Issue }) {
  const updateIssue = useUpdateIssue();
  const CurrentIcon = STATUS_ICONS[issue.todo_status || 'backlog'] || Circle;
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
          <CurrentIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search status..." className="h-8" />
          <CommandList>
            <CommandEmpty>No status found.</CommandEmpty>
            <CommandGroup>
              {STATUS_OPTIONS.map((option) => {
                const OptionIcon = STATUS_ICONS[option.value] || Circle;
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
                    <OptionIcon size={14} />
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

function PriorityDropdown({ issue }: { issue: Issue }) {
  const updateIssue = useUpdateIssue();
  const CurrentIcon =
    PRIORITY_ICONS[issue.todo_priority || 'no_priority'] || Flag;
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
          <CurrentIcon size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[160px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search priority..." className="h-8" />
          <CommandList>
            <CommandEmpty>No priority found.</CommandEmpty>
            <CommandGroup>
              {PRIORITY_OPTIONS.map((option) => {
                const OptionIcon = PRIORITY_ICONS[option.value] || Flag;
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
                    <OptionIcon size={14} />
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

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium truncate">
            {issue.title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {formatDate(issue.createdAt, 'MMM d, yyyy')}</span>
          <div className="flex items-center gap-1">
            <StatusDropdown issue={issue} />
            <PriorityDropdown issue={issue} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IssueList() {
  const { data: issues, isLoading, error } = useIssues();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-3 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </CardContent>
          </Card>
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

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
