import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
        onClick={onToggle}
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 py-4 bg-gray-25 border-t border-gray-100">
          <p className="text-gray-700 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
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
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Everything you need to know about privacy-first analytics
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
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

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a
            href="mailto:atharvdange.dev@gmail.com"
            className="text-gray-600 hover:text-gray-800 font-medium underline"
          >
            Contact our team
          </a>
        </div>
      </div>
    </section>
  );
}
