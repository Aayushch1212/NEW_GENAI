import { Brain, Cog, ShieldCheck, ArrowRight } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { PlannerOutput } from './PlannerOutput';
import { ExecutorOutput } from './ExecutorOutput';
import { VerifierOutput } from './VerifierOutput';
import { AgentState } from '@/types/agent';
import { cn } from '@/lib/utils';

interface AgentPipelineProps {
  state: AgentState;
}

export function AgentPipeline({ state }: AgentPipelineProps) {
  const { planner, executor, verifier } = state;

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Pipeline connector line */}
      <div className="hidden md:flex items-center justify-center mb-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              planner.status === 'completed'
                ? 'bg-planner'
                : planner.status === 'running'
                ? 'bg-planner animate-pulse-ring'
                : 'bg-muted'
            )}
          />
          <ArrowRight
            className={cn(
              'w-6 h-6 transition-colors',
              planner.status === 'completed' ? 'text-planner' : 'text-muted'
            )}
          />
          <div
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              executor.status === 'completed'
                ? 'bg-executor'
                : executor.status === 'running'
                ? 'bg-executor animate-pulse-ring'
                : 'bg-muted'
            )}
          />
          <ArrowRight
            className={cn(
              'w-6 h-6 transition-colors',
              executor.status === 'completed' ? 'text-executor' : 'text-muted'
            )}
          />
          <div
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              verifier.status === 'completed'
                ? 'bg-verifier'
                : verifier.status === 'running'
                ? 'bg-verifier animate-pulse-ring'
                : 'bg-muted'
            )}
          />
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AgentCard
          title="Planner Agent"
          description="Analyzes task & creates execution plan"
          icon={<Brain className="w-5 h-5" />}
          status={planner.status}
          variant="planner"
        >
          {planner.plan && <PlannerOutput plan={planner.plan} />}
        </AgentCard>

        <AgentCard
          title="Executor Agent"
          description="Executes plan steps & calls APIs"
          icon={<Cog className="w-5 h-5" />}
          status={executor.status}
          variant="executor"
        >
          {executor.results.length > 0 && planner.plan && (
            <ExecutorOutput
              results={executor.results}
              currentStep={executor.currentStep}
              totalSteps={planner.plan.steps.length}
            />
          )}
        </AgentCard>

        <AgentCard
          title="Verifier Agent"
          description="Validates & formats final output"
          icon={<ShieldCheck className="w-5 h-5" />}
          status={verifier.status}
          variant="verifier"
        >
          {verifier.result && <VerifierOutput result={verifier.result} />}
        </AgentCard>
      </div>
    </div>
  );
}
