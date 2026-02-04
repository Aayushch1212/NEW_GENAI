import { VerificationResult } from '@/types/agent';
import { CheckCircle2, AlertCircle, FileJson } from 'lucide-react';

interface VerifierOutputProps {
  result: VerificationResult;
}

export function VerifierOutput({ result }: VerifierOutputProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-2">
        {result.is_complete ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">
              Verification Complete
            </span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5 text-warning" />
            <span className="text-sm font-medium text-warning">
              Partial Results
            </span>
          </>
        )}
      </div>

      <p className="text-sm text-foreground/80">{result.summary}</p>

      {result.missing_data.length > 0 && (
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
          <p className="text-xs font-medium text-warning mb-1">Missing Data:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {result.missing_data.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}

      {result.corrections.length > 0 && (
        <div className="p-3 rounded-lg bg-info/10 border border-info/30">
          <p className="text-xs font-medium text-info mb-1">Corrections Applied:</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            {result.corrections.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
