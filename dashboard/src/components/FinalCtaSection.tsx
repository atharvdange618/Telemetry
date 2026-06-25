import { Button } from "@/components/ui/button";
import { Github, ArrowRight } from "lucide-react";

export function FinalCtaSection() {
  const API_URL = import.meta.env.VITE_API_URL;

  return (
    <section className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl text-foreground mb-4 text-balance">
          Ready to reclaim your analytics?
        </h2>
        <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
          Free, open source, and privacy-first. Set up in under a minute.
        </p>

        <Button
          size="lg"
          asChild
          className="cursor-pointer rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all h-12 px-8 text-sm font-medium group"
        >
          <a href={`${API_URL}/login/github`}>
            <Github className="h-4 w-4 mr-2" />
            Get Started Free
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-0.5" />
          </a>
        </Button>
      </div>
    </section>
  );
}
