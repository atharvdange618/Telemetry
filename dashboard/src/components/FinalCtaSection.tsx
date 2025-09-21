import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function FinalCtaSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          Ready to Reclaim Your Analytics?
        </h2>

        <Button
          size="lg"
          asChild
          className="cursor-pointer gradient-bg text-white hover:opacity-90 transition-opacity text-lg px-8 py-4"
        >
          <a
            href="mailto:atharvdange.dev@gmail.com?subject=Telemetry%20Beta%20Access%20Request"
            className="inline-flex items-center justify-center rounded-md text-lg font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-11 px-8 py-4 cursor-pointer gradient-bg text-white hover:opacity-90"
          >
            <Github className="h-5 w-5 mr-2" />
            Join the Private Beta
          </a>
        </Button>
      </div>
    </section>
  );
}
