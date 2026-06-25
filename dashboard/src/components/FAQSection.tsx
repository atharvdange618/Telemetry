import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        className="w-full py-5 text-left flex items-center justify-between gap-4 group"
        onClick={onToggle}
      >
        <span className={cn(
          "text-base font-medium transition-colors",
          isOpen ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
        )}>
          {question}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-48 pb-5" : "max-h-0"
        )}
      >
        <p className="text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };

  const faqs = [
    {
      question: "How is Telemetry different from Google Analytics?",
      answer:
        "Telemetry is built with privacy as the foundation. We don't use cookies, don't track users across sites, and give you complete ownership of your data. Unlike Google Analytics, we're open source, self-hostable, and designed to be GDPR compliant by default.",
    },
    {
      question: "Do I need to show cookie banners with Telemetry?",
      answer:
        "No! Since Telemetry doesn't use cookies or persistent identifiers, you typically don't need cookie consent banners. We collect anonymous, aggregated data that doesn't personally identify visitors, making compliance much simpler.",
    },
    {
      question: "How accurate is cookieless tracking?",
      answer:
        "Our cookieless approach provides highly accurate analytics for understanding your audience and content performance. While we can't track individual user journeys across sessions, we provide comprehensive insights into page views, referrers, and user behavior patterns.",
    },
    {
      question: "Can I migrate from Google Analytics?",
      answer:
        "Yes! While historical data can't be directly imported due to different data models, you can start collecting data with Telemetry immediately. Many users run both systems in parallel during the transition period.",
    },
    {
      question: "Is Telemetry suitable for e-commerce sites?",
      answer:
        "Telemetry tracks page views, conversions, and user flows effectively. For e-commerce, you can track product page views, checkout funnel performance, and conversion rates while maintaining customer privacy.",
    },
    {
      question: "How do I install Telemetry on my website?",
      answer:
        "Installation is simple - just add our lightweight tracking script to your website. The script is less than 1KB and won't slow down your site. We provide detailed installation guides for popular platforms and frameworks.",
    },
    {
      question: "What about bot traffic and spam?",
      answer:
        "Telemetry includes built-in bot detection and filtering to ensure your analytics data represents real human visitors. We automatically filter out known bots, crawlers, and suspicious traffic patterns.",
    },
    {
      question: "Can I export my data?",
      answer:
        "Yes! Since you own your data, you can export it anytime in various formats including CSV and JSON. If you're self-hosting, you have direct database access to your analytics data.",
    },
  ];

  return (
    <section id="faq" className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4 text-balance text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-lg mb-12 text-center">
          Everything you need to know about privacy-first analytics
        </p>

        <div className="rounded-2xl border border-border bg-card px-6">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openItems.includes(index)}
              onToggle={() => toggleItem(index)}
            />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Still have questions?{" "}
          <a
            href="mailto:atharvdange.dev@gmail.com"
            className="text-primary hover:text-primary/80 transition-colors"
          >
            Contact us
          </a>
        </p>
      </div>
    </section>
  );
}
