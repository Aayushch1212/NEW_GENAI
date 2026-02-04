import { Header } from '@/components/Header';
import { TaskInput } from '@/components/TaskInput';
import { AgentPipeline } from '@/components/AgentPipeline';
import { FinalOutput } from '@/components/FinalOutput';
import { useAgentOrchestrator } from '@/hooks/useAgentOrchestrator';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

const Index = () => {
  const { state, isProcessing, executeTask, reset } = useAgentOrchestrator();

  const showPipeline = state.planner.status !== 'idle' || isProcessing;
  const showFinalOutput = state.verifier.result?.final_output;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Task Input */}
        <section className="animate-fade-in">
          <TaskInput onSubmit={executeTask} isLoading={isProcessing} />
        </section>

        {/* Agent Pipeline */}
        {showPipeline && (
          <section className="animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground/80">
                Agent Pipeline
              </h2>
              {!isProcessing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={reset}
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  New Task
                </Button>
              )}
            </div>
            <AgentPipeline state={state} />
          </section>
        )}

        {/* Final Output */}
        {showFinalOutput && (
          <section className="max-w-5xl mx-auto animate-fade-in">
            <FinalOutput data={state.verifier.result?.final_output} />
          </section>
        )}

        {/* Footer info */}
        {!showPipeline && (
          <section className="max-w-3xl mx-auto text-center animate-fade-in">
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                How it works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 rounded-lg bg-planner-muted/30 border border-planner/20">
                  <div className="font-medium text-planner mb-1">1. Planner</div>
                  <p className="text-muted-foreground text-xs">
                    AI analyzes your task and creates a step-by-step execution plan
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-executor-muted/30 border border-executor/20">
                  <div className="font-medium text-executor mb-1">2. Executor</div>
                  <p className="text-muted-foreground text-xs">
                    Runs each step, calling GitHub and Weather APIs as needed
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-verifier-muted/30 border border-verifier/20">
                  <div className="font-medium text-verifier mb-1">3. Verifier</div>
                  <p className="text-muted-foreground text-xs">
                    Validates results and formats the final structured output
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
