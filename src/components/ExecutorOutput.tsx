import { ExecutionResult } from '@/types/agent';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExecutorOutputProps {
  results: ExecutionResult[];
  currentStep: number;
  totalSteps: number;
}

export function ExecutorOutput({ results, currentStep, totalSteps }: ExecutorOutputProps) {
  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Progress: {currentStep} / {totalSteps} steps
        </span>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                i < results.length
                  ? results[i]?.result.success
                    ? 'bg-success'
                    : 'bg-destructive'
                  : i === currentStep - 1
                  ? 'bg-executor animate-pulse-ring'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {results.map((execution, idx) => (
          <div
            key={idx}
            className={cn(
              'p-3 rounded-lg border animate-slide-in-right',
              execution.result.success
                ? 'bg-verifier-muted/10 border-verifier/30'
                : 'bg-destructive/10 border-destructive/30'
            )}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-start gap-2">
              {execution.result.success ? (
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-executor">
                    {execution.tool}
                  </code>
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {new Date(execution.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
                  {execution.result.success
                    ? JSON.stringify(execution.result.data).slice(0, 100) + '...'
                    : execution.result.error}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
