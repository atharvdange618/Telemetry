import { Button } from "@/components/ui/button";
import { Github, ArrowRight } from "lucide-react";

export function FinalCtaSection() {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 tracking-tight">
          Ready to reclaim your analytics?
        </h2>
        <p className="text-lg text-stone-600 dark:text-gray-400 mb-10 max-w-xl mx-auto">
          Free, open source, and privacy-first. Set up in under a minute.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-all text-lg px-8 py-4 h-auto rounded-xl shadow-lg shadow-primary/20"
          >
            <a href={`${API_URL}/login/github`}>
              <Github className="h-5 w-5 mr-2" />
              Get Started - it's free
              <ArrowRight className="h-5 w-5 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
