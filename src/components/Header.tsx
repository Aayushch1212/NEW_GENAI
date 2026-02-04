import { Bot, Github, Cloud } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-planner via-executor to-verifier">
              <Bot className="w-6 h-6 text-background" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-planner via-executor to-verifier bg-clip-text text-transparent">
                AI Operations Assistant
              </h1>
              <p className="text-xs text-muted-foreground">
                Multi-Agent Task Orchestration System
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30">
              <Github className="w-4 h-4 text-planner" />
              <span className="text-xs text-muted-foreground">GitHub API</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/30">
              <Cloud className="w-4 h-4 text-executor" />
              <span className="text-xs text-muted-foreground">Weather API</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
