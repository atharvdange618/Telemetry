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
    <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative border border-gray-800 dark:border-gray-700">
      <button
        onClick={onCopy}
        className="absolute top-2 right-2 p-1.5 bg-gray-700 dark:bg-gray-800 hover:bg-gray-600 dark:hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
      >
        {hasCopied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      <pre className="text-green-400 text-sm overflow-x-auto p-2 font-mono">
        {code}
      </pre>
    </div>
  );
}
