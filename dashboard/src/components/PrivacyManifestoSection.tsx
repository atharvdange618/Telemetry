import { Shield, Heart, Code, Users } from "lucide-react";

export function PrivacyManifestoSection() {
  const principles = [
    {
      icon: Shield,
      title: "Privacy by Design",
      description:
        "We believe privacy isn't a feature—it's a fundamental right. Every line of code is written with user privacy as the primary consideration.",
    },
    {
      icon: Heart,
      title: "Analytics with Soul",
      description:
        "Data should serve humanity, not exploit it. We create meaningful insights while respecting the dignity and autonomy of every website visitor.",
    },
    {
      icon: Code,
      title: "Transparency Through Code",
      description:
        "Open source isn't just about free software—it's about trust. Our code is open for inspection, contribution, and verification by anyone.",
    },
    {
      icon: Users,
      title: "Community Over Profit",
      description:
        "We're building for the web we want to see: one where small sites can compete with giants, where privacy is the default, and where users come first.",
    },
  ];

  return (
    <section className="py-20 bg-stone-50 text-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
            Our Privacy Manifesto
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed text-balance">
            In a world where surveillance capitalism has become the norm, we
            choose a different path. We believe the web can be both insightful
            and respectful, powerful and private.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {principles.map((principle, index) => {
            const Icon = principle.icon;
            return (
              <div
                key={index}
                className="bg-stone-50 backdrop-blur-sm rounded-2xl p-8 border border-white/20"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-gray-600 p-3 rounded-lg flex-shrink-0">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">
                      {principle.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="bg-stone-50 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-white/20">
            <blockquote className="text-2xl md:text-3xl font-light italic text-gray-900 mb-6 text-balance">
              "The web was built to be decentralized, open, and empowering.
              Let's build analytics that honor those original values."
            </blockquote>
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-gray-700">
                  The Telemetry Team
                </div>
                <div className="text-gray-900 text-sm">
                  Building a better web, one site at a time
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
