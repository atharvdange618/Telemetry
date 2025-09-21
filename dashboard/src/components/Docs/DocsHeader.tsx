import { FileText } from "lucide-react";

export function DocsHeader() {
  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-gradient-bg p-2 rounded-lg">
            <FileText className="h-6 w-6 text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Documentation</h1>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl">
          Everything you need to get started with Telemetry, a privacy-first
          analytics platform that respects your visitors and gives you
          meaningful insights.
        </p>
      </div>
    </div>
  );
}
