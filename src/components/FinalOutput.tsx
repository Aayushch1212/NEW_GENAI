import { useState } from 'react';
import { Copy, Check, FileJson, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FinalOutputProps {
  data: unknown;
}

export function FinalOutput({ data }: FinalOutputProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const jsonString = JSON.stringify(data, null, 2);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-verifier-muted/20">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-verifier" />
          <h3 className="font-semibold text-verifier">Final Output</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="h-8 w-8 p-0"
          >
            {expanded ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div
        className={cn(
          'overflow-auto bg-background/50 transition-all duration-300',
          expanded ? 'max-h-[600px]' : 'max-h-[300px]'
        )}
      >
        <pre className="p-4 text-xs font-mono text-foreground/90 leading-relaxed">
          <code>{jsonString}</code>
        </pre>
      </div>
    </div>
  );
}
