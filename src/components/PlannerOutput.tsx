import { ExecutionPlan } from '@/types/agent';
import { ArrowRight, Wrench } from 'lucide-react';

interface PlannerOutputProps {
  plan: ExecutionPlan;
}

export function PlannerOutput({ plan }: PlannerOutputProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-sm text-foreground/80 font-medium">
        {plan.task_summary}
      </div>
      
      <div className="flex flex-wrap gap-2 pb-2">
        {plan.tools_required.map((tool) => (
          <span
            key={tool}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-planner-muted text-planner text-xs font-mono"
          >
            <Wrench className="w-3 h-3" />
            {tool}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {plan.steps.map((step, idx) => (
          <div
            key={step.step_number}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30 animate-slide-in-right"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-planner/20 text-planner flex items-center justify-center text-xs font-bold">
              {step.step_number}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground">
                {step.action}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-xs px-1.5 py-0.5 rounded bg-secondary text-planner font-mono">
                  {step.tool}
                </code>
                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate">
                  {step.expected_output}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
