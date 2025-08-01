'use client';

import { type Issue } from '@workspace/db/helpers';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Kbd } from '@workspace/ui/components/kbd';
import { useIssues } from '~/hooks/use-issues';

function IssueCard({ issue }: { issue: Issue }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-medium truncate">
            {issue.title}
          </CardTitle>
          <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
            {issue.todo_status || 'backlog'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {issue.description && (
          <p className="text-sm text-muted-foreground truncate mb-3">
            {issue.description}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Created {new Date(issue.createdAt).toLocaleDateString()}</span>
          {issue.todo_priority && issue.todo_priority !== 'no_priority' && (
            <Badge variant="outline" className="text-xs">
              {issue.todo_priority}
            </Badge>
          )}
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
