import { ReactNode } from 'react';
import { Loader2, CheckCircle2, XCircle, Circle } from 'lucide-react';
import { AgentStatus } from '@/types/agent';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  status: AgentStatus;
  variant: 'planner' | 'executor' | 'verifier';
  children?: ReactNode;
}

export function AgentCard({ 
  title, 
  description, 
  icon, 
  status, 
  variant,
  children 
}: AgentCardProps) {
  const variantStyles = {
    planner: {
      border: 'border-planner/30',
      bg: 'bg-planner-muted/20',
      glow: 'glow-planner',
      text: 'text-planner',
      gradient: 'gradient-planner',
    },
    executor: {
      border: 'border-executor/30',
      bg: 'bg-executor-muted/20',
      glow: 'glow-executor',
      text: 'text-executor',
      gradient: 'gradient-executor',
    },
    verifier: {
      border: 'border-verifier/30',
      bg: 'bg-verifier-muted/20',
      glow: 'glow-verifier',
      text: 'text-verifier',
      gradient: 'gradient-verifier',
    },
  };

  const styles = variantStyles[variant];

  const statusIcon = {
    idle: <Circle className="w-4 h-4 text-muted-foreground" />,
    running: <Loader2 className="w-4 h-4 animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4 text-success" />,
    error: <XCircle className="w-4 h-4 text-destructive" />,
  };

  return (
    <div
      className={cn(
        'glass-card overflow-hidden transition-all duration-300',
        status === 'running' && styles.glow,
        status === 'running' && 'animate-pulse-subtle'
      )}
    >
      {/* Header */}
      <div className={cn('p-4 border-b', styles.border, styles.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', styles.gradient)}>
              <div className="text-background">{icon}</div>
            </div>
            <div>
              <h3 className={cn('font-semibold', styles.text)}>{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-2', styles.text)}>
            {statusIcon[status]}
            <span className="text-xs font-medium capitalize">{status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[100px]">
        {children || (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            {status === 'idle' && 'Waiting for task...'}
            {status === 'running' && 'Processing...'}
          </div>
        )}
      </div>
    </div>
  );
}
