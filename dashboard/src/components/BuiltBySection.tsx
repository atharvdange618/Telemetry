import { Github, Linkedin } from "lucide-react";

export function BuiltBySection() {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/atharvdange618",
      icon: Github,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/atharvdange",
      icon: Linkedin,
    },
  ];

  return (
    <section className="bg-stone-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Meet the Maker
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          This project is built and maintained by a solo developer.
        </p>

        <div className="inline-flex flex-col items-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <img
            src="https://avatars.githubusercontent.com/u/103875845?v=4"
            alt="Atharv Dange"
            className="w-32 h-32 rounded-full mb-6 ring-4 ring-offset-4 ring-gray-200"
          />
          <h3 className="text-2xl font-bold text-gray-900">Atharv Dange</h3>
          <p className="text-gray-600 mb-6">
            Software Engineer & Full-Stack Developer
          </p>

          <p className="max-w-md text-gray-700 leading-relaxed mb-8">
            "I started Telemetry because I believe in a more private and
            transparent web. This is my effort to create an analytics tool that
            I would actually want to use myself-one that respects users and
            empowers creators."
          </p>

          <div className="flex space-x-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                aria-label={link.name}
              >
                <link.icon className="w-6 h-6" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
