import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  AgentState, 
  ExecutionPlan, 
  ExecutionResult, 
  VerificationResult 
} from '@/types/agent';
import { toast } from 'sonner';

const initialState: AgentState = {
  planner: { status: 'idle', plan: null },
  executor: { status: 'idle', results: [], currentStep: 0 },
  verifier: { status: 'idle', result: null },
};

export function useAgentOrchestrator() {
  const [state, setState] = useState<AgentState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalTask, setOriginalTask] = useState<string>('');

  const reset = useCallback(() => {
    setState(initialState);
    setOriginalTask('');
  }, []);

  const executeTask = useCallback(async (task: string) => {
    reset();
    setIsProcessing(true);
    setOriginalTask(task);

    try {
      // Step 1: Planner Agent
      setState(prev => ({
        ...prev,
        planner: { status: 'running', plan: null },
      }));

      const plannerResponse = await supabase.functions.invoke('planner-agent', {
        body: { task },
      });

      if (plannerResponse.error) {
        throw new Error(plannerResponse.error.message || 'Planner failed');
      }

      const plan: ExecutionPlan = plannerResponse.data.plan;
      
      setState(prev => ({
        ...prev,
        planner: { status: 'completed', plan },
      }));

      toast.success('Plan created', {
        description: `${plan.steps.length} steps to execute`,
      });

      // Step 2: Executor Agent
      setState(prev => ({
        ...prev,
        executor: { status: 'running', results: [], currentStep: 1 },
      }));

      const executionResults: ExecutionResult[] = [];

      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        
        setState(prev => ({
          ...prev,
          executor: { 
            ...prev.executor, 
            currentStep: i + 1,
          },
        }));

        const executorResponse = await supabase.functions.invoke('executor-agent', {
          body: { step },
        });

        if (executorResponse.error) {
          executionResults.push({
            step_number: step.step_number,
            tool: step.tool,
            result: {
              tool: step.tool,
              success: false,
              data: null,
              error: executorResponse.error.message,
            },
            timestamp: new Date().toISOString(),
          });
        } else {
          executionResults.push({
            step_number: executorResponse.data.step_number,
            tool: executorResponse.data.result.tool,
            result: executorResponse.data.result,
            timestamp: executorResponse.data.timestamp,
          });
        }

        setState(prev => ({
          ...prev,
          executor: { 
            ...prev.executor, 
            results: [...executionResults],
          },
        }));

        // Small delay between steps for visual feedback
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setState(prev => ({
        ...prev,
        executor: { 
          status: 'completed', 
          results: executionResults,
          currentStep: plan.steps.length,
        },
      }));

      const successCount = executionResults.filter(r => r.result.success).length;
      toast.success('Execution complete', {
        description: `${successCount}/${plan.steps.length} steps succeeded`,
      });

      // Step 3: Verifier Agent
      setState(prev => ({
        ...prev,
        verifier: { status: 'running', result: null },
      }));

      const verifierResponse = await supabase.functions.invoke('verifier-agent', {
        body: { 
          task, 
          plan, 
          results: executionResults,
        },
      });

      if (verifierResponse.error) {
        throw new Error(verifierResponse.error.message || 'Verification failed');
      }

      const verificationResult: VerificationResult = verifierResponse.data.result;

      setState(prev => ({
        ...prev,
        verifier: { status: 'completed', result: verificationResult },
      }));

      toast.success('Task completed!', {
        description: verificationResult.is_complete 
          ? 'All steps verified successfully' 
          : 'Completed with some missing data',
      });

    } catch (error) {
      console.error('Orchestration error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update the currently running agent to error state
      setState(prev => {
        if (prev.planner.status === 'running') {
          return { ...prev, planner: { ...prev.planner, status: 'error' } };
        }
        if (prev.executor.status === 'running') {
          return { ...prev, executor: { ...prev.executor, status: 'error' } };
        }
        if (prev.verifier.status === 'running') {
          return { ...prev, verifier: { ...prev.verifier, status: 'error' } };
        }
        return prev;
      });

      toast.error('Task failed', { description: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  }, [reset]);

  return {
    state,
    isProcessing,
    originalTask,
    executeTask,
    reset,
  };
}
