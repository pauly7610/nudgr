import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTopFormErrors } from '@/hooks/useFormAnalytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle } from 'lucide-react';

export const FormErrorsPanel = () => {
  const { data: formErrors, isLoading } = useTopFormErrors(5);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Top Form Errors
        </CardTitle>
        <CardDescription>
          Fields with the highest error rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {formErrors && formErrors.length > 0 ? (
            formErrors.map((field) => (
              <div
                key={field.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{field.field_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {field.form_selector}
                    </div>
                  </div>
                  <Badge variant="destructive">
                    {field.error_rate.toFixed(1)}% errors
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Error Rate</span>
                    <span className="font-medium">
                      {field.total_errors} / {field.total_interactions}
                    </span>
                  </div>
                  <Progress value={field.error_rate} className="h-2" />
                </div>
                {field.common_error_messages && field.common_error_messages.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Common errors: </span>
                    <span>{field.common_error_messages.slice(0, 2).join(', ')}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No form error data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
