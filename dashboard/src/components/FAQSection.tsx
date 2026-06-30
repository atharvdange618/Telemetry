const faqs = [
  {
    question: "How is Telemetry different from Google Analytics?",
    answer:
      "Telemetry is built with privacy as the foundation. We don't use cookies, don't track users across sites, and give you complete ownership of your data. Unlike Google Analytics, we're open source, self-hostable, and designed to be GDPR compliant by default.",
  },
  {
    question: "Do I need to show cookie banners?",
    answer:
      "No. Since Telemetry doesn't use cookies or persistent identifiers, you typically don't need cookie consent banners. We collect anonymous, aggregated data that doesn't personally identify visitors.",
  },
  {
    question: "How accurate is cookieless tracking?",
    answer:
      "Our cookieless approach provides accurate analytics for understanding your audience and content performance. While we can't track individual user journeys across sessions, we provide comprehensive insights into page views, referrers, and behavior patterns.",
  },
  {
    question: "Can I migrate from Google Analytics?",
    answer:
      "Yes. Historical data can't be directly imported due to different data models, but you can start collecting data with Telemetry immediately. Many users run both systems in parallel during the transition.",
  },
  {
    question: "Is Telemetry suitable for e-commerce?",
    answer:
      "Telemetry tracks page views, conversions, and user flows effectively. You can track product page views, checkout funnel performance, and conversion rates while maintaining customer privacy.",
  },
  {
    question: "How do I install it?",
    answer:
      "Add our lightweight tracking script to your website. The script is less than 1KB and won't slow down your site. We provide installation guides for popular platforms and frameworks.",
  },
  {
    question: "What about bot traffic?",
    answer:
      "Telemetry includes built-in bot detection and filtering. We automatically filter out known bots, crawlers, and suspicious traffic patterns.",
  },
  {
    question: "Can I export my data?",
    answer:
      "Yes. Since you own your data, you can export it anytime in CSV and JSON. If you're self-hosting, you have direct database access.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-24 px-6 lg:px-8 border-t border-border/50">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl text-foreground mb-4 text-balance text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-muted-foreground text-lg mb-12 text-center">
          Everything you need to know about privacy-first analytics
        </p>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          {faqs.map((faq) => (
            <div key={faq.question}>
              <h3 className="font-heading text-base text-foreground mb-1.5">
                {faq.question}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-12">
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
