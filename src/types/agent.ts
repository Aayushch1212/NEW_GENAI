export type AgentStatus = 'idle' | 'running' | 'completed' | 'error';

export interface PlanStep {
  step_number: number;
  action: string;
  tool: string;
  parameters: Record<string, string>;
  expected_output: string;
}

export interface ExecutionPlan {
  task_summary: string;
  steps: PlanStep[];
  tools_required: string[];
}

export interface ToolResult {
  tool: string;
  success: boolean;
  data: unknown;
  error?: string;
}

export interface ExecutionResult {
  step_number: number;
  tool: string;
  result: ToolResult;
  timestamp: string;
}

export interface VerificationResult {
  is_complete: boolean;
  missing_data: string[];
  corrections: string[];
  final_output: unknown;
  summary: string;
}

export interface AgentState {
  planner: {
    status: AgentStatus;
    plan: ExecutionPlan | null;
  };
  executor: {
    status: AgentStatus;
    results: ExecutionResult[];
    currentStep: number;
  };
  verifier: {
    status: AgentStatus;
    result: VerificationResult | null;
  };
}

export interface TaskRequest {
  task: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
