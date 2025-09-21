import { Card, CardContent } from "@/components/ui/card";
import { Shield, Database, Eye } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Privacy is Paramount",
    description:
      "No cookies, no tracking, no personal data collection. Just clean, anonymous insights.",
  },
  {
    icon: Database,
    title: "You Own Your Data",
    description:
      "Open-source and self-hosted. Your analytics live on your infrastructure, under your control.",
  },
  {
    icon: Eye,
    title: "Clarity Over Clutter",
    description:
      "Beautiful, intuitive dashboards that focus on what matters most to your business.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our Guiding Principles
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <CardContent className="p-8 text-center">
                <div className="bg-gradient-bg p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center text-primary">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
