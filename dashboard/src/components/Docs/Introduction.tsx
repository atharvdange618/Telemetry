const Introduction = () => {
  return (
    <section id="introduction" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Introduction</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-6 mb-6">
        <p className="text-lg text-gray-700 mb-4">
          Telemetry is a privacy-focused, open-source analytics platform
          designed to provide meaningful insights without compromising user
          privacy. Built for creators, developers, and anyone who believes in a
          more transparent and honest web.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Privacy-first, cookieless tracking</li>
              <li>• Self-hosted data ownership</li>
              <li>• Clean, intuitive dashboard</li>
              <li>• Real-time analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Technology Stack
            </h4>
            <ul className="text-gray-600 space-y-1">
              <li>• Fastify backend</li>
              <li>• React + TypeScript frontend</li>
              <li>• Prisma ORM</li>
              <li>• GitHub OAuth authentication</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;
