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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Kbd } from '@workspace/ui/components/kbd';
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
  ISSUE_PRIORITY_OPTIONS as PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS as STATUS_OPTIONS,
} from '~/lib/constants';

// -------------------- Icon Mappings --------------------
const STATUS_ICONS: Record<
  string,
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
  string,
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="transparent"
          size="icon"
          aria-label={`Status: ${issue.todo_status}`}
          title={`Status: ${issue.todo_status}`}
        >
          <CurrentIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {STATUS_OPTIONS.map((option) => {
          const OptionIcon = STATUS_ICONS[option.value] || Circle;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                if (option.value !== issue.todo_status) {
                  updateIssue.mutate({
                    id: issue.id,
                    data: { todo_status: option.value },
                  });
                }
              }}
              className="capitalize flex items-center gap-2"
            >
              <OptionIcon size={16} />
              {option.label}
              {option.value === issue.todo_status && (
                <Check size={16} className="ml-auto" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PriorityDropdown({ issue }: { issue: Issue }) {
  const updateIssue = useUpdateIssue();
  const CurrentIcon =
    PRIORITY_ICONS[issue.todo_priority || 'no_priority'] || Flag;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="transparent"
          size="icon"
          aria-label={`Priority: ${issue.todo_priority}`}
          title={`Priority: ${issue.todo_priority}`}
        >
          <CurrentIcon size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {PRIORITY_OPTIONS.map((option) => {
          const OptionIcon = PRIORITY_ICONS[option.value] || Flag;
          return (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => {
                if (option.value !== issue.todo_priority) {
                  updateIssue.mutate({
                    id: issue.id,
                    data: { todo_priority: option.value },
                  });
                }
              }}
              className="capitalize flex items-center gap-2"
            >
              <OptionIcon size={16} />
              {option.label}
              {option.value === issue.todo_priority && (
                <Check size={16} className="ml-auto" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
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
          <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
          <div className="flex items-center gap-2">
            {/* Status icon */}
            <StatusDropdown issue={issue} />
            {/* Priority icon */}
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
