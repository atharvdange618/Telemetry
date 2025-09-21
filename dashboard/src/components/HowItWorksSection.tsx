import { GradientText } from "./HeroSection";

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50"
    >
      <div className="max-w-4xl mx-auto text-center">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            <GradientText>One Line</GradientText> of Code
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get powerful analytics up and running in under 60 seconds. No
            complex setup, no cookies, no tracking.
          </p>
        </div>

        <div className="bg-gray-900 rounded-xl p-8 mb-8 text-left overflow-x-auto">
          <div className="flex items-center mb-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <span className="ml-4 text-gray-400 text-sm">index.html</span>
          </div>
          <code className="text-green-400 font-mono text-sm md:text-base">
            {
              '<script async defer src="https://analytics.telemetry.dev/analytics.js" data-tenant-id="YOUR_TENANT_ID"></script>'
            }
          </code>
        </div>

        <div className="inline-flex items-center bg-green-50 text-green-800 px-6 py-3 rounded-full border border-green-200">
          <span className="text-2xl mr-2">✨</span>
          <span className="font-medium">
            That's it! You're now tracking privacy-friendly analytics.
          </span>
        </div>
      </div>
    </section>
  );
}
