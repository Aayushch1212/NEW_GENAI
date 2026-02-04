import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TaskInputProps {
  onSubmit: (task: string) => void;
  isLoading: boolean;
}

export function TaskInput({ onSubmit, isLoading }: TaskInputProps) {
  const [task, setTask] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (task.trim() && !isLoading) {
      onSubmit(task.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleTasks = [
    "Find trending JavaScript repositories and get weather for San Francisco",
    "Search GitHub for React UI libraries with over 1000 stars",
    "What's the weather in Tokyo and find Python machine learning repos",
  ];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-planner" />
          <h2 className="text-lg font-semibold text-foreground">
            Enter Your Task
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to accomplish in natural language..."
            className="min-h-[120px] bg-muted/50 border-border/50 focus:border-planner/50 focus:ring-planner/20 resize-none font-mono text-sm"
            disabled={isLoading}
          />
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!task.trim() || isLoading}
              className="bg-planner text-planner-foreground hover:bg-planner/90 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Execute Task
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {!isLoading && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {exampleTasks.map((example, i) => (
              <button
                key={i}
                onClick={() => setTask(example)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 text-secondary-foreground hover:bg-secondary transition-colors border border-border/30"
              >
                {example.length > 50 ? example.slice(0, 50) + '...' : example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
