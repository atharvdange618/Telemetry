import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code }: { code: string }) {
  const [hasCopied, setHasCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="bg-secondary rounded-lg p-4 relative border border-border">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 p-1.5 bg-muted hover:bg-muted/80 rounded-md text-muted-foreground transition-colors"
      >
        {hasCopied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <pre className="text-green-500/90 text-sm overflow-x-auto p-2 font-mono">
        {code}
      </pre>
    </div>
  );
}
