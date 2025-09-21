import { Check, X } from "lucide-react";

interface ComparisonRowProps {
  feature: string;
  telemetry: boolean | string;
  googleAnalytics: boolean | string;
  description?: string;
}

function ComparisonRow({
  feature,
  telemetry,
  googleAnalytics,
  description,
}: ComparisonRowProps) {
  const renderValue = (value: boolean | string) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="w-5 h-5 text-green-600 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-red-500 mx-auto" />
      );
    }
    return <span className="text-sm text-center">{value}</span>;
  };

  return (
    <tr className="border-b border-gray-100">
      <td className="py-4 px-6 text-left">
        <div>
          <div className="font-medium text-gray-900">{feature}</div>
          {description && (
            <div className="text-sm text-gray-600 mt-1">{description}</div>
          )}
        </div>
      </td>
      <td className="py-4 px-6 text-center">{renderValue(telemetry)}</td>
      <td className="py-4 px-6 text-center">{renderValue(googleAnalytics)}</td>
    </tr>
  );
}

export function ComparisonSection() {
  const comparisons: ComparisonRowProps[] = [
    {
      feature: "Cookie-Free Tracking",
      telemetry: true,
      googleAnalytics: false,
      description: "No cookies or persistent identifiers",
    },
    {
      feature: "Data Ownership",
      telemetry: "100% Yours",
      googleAnalytics: "Google's",
      description: "Who controls your analytics data",
    },
    {
      feature: "GDPR Compliant",
      telemetry: true,
      googleAnalytics: "Requires consent",
      description: "Built-in privacy compliance",
    },
    {
      feature: "Open Source",
      telemetry: true,
      googleAnalytics: false,
      description: "Transparent, auditable code",
    },
    {
      feature: "Self-Hosted Option",
      telemetry: true,
      googleAnalytics: false,
      description: "Keep data on your infrastructure",
    },
    {
      feature: "Real-time Analytics",
      telemetry: true,
      googleAnalytics: true,
      description: "Live visitor tracking",
    },
    {
      feature: "Page Load Impact",
      telemetry: "< 1KB",
      googleAnalytics: "~45KB",
      description: "Script size and performance impact",
    },
    {
      feature: "Data Retention Control",
      telemetry: "Your choice",
      googleAnalytics: "Google's terms",
      description: "How long data is stored",
    },
  ];

  return (
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Telemetry?
          </h2>
          <p className="text-lg text-gray-900 max-w-2xl mx-auto">
            See how we compare to traditional analytics solutions
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-4 px-6 text-left font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-gray-900">
                    Telemetry
                    <div className="text-sm text-gray-600 mt-1">
                      Privacy-First
                    </div>
                  </th>
                  <th className="py-4 px-6 text-center font-semibold text-gray-900">
                    Google Analytics
                    <div className="text-sm text-gray-600 mt-1">
                      Traditional
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((comparison, index) => (
                  <ComparisonRow key={index} {...comparison} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-6">
              Ready to make the switch to privacy-first analytics?
            </p>
            <a
              href="mailto:atharvdange.dev@gmail.com?subject=Telemetry%20Beta%20Access%20Request"
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Request Early Access
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
