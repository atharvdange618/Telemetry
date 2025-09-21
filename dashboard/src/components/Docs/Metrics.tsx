import { Eye, Users, MoveRight } from "lucide-react";

const Metrics = () => {
  return (
    <section id="metrics" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Key Metrics Explained
      </h2>
      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <p className="text-gray-700 mb-8 text-lg">
          Telemetry focuses on a few essential metrics to give you a clear
          understanding of your website's performance without overwhelming you
          with data.
        </p>

        <div className="space-y-6">
          {/* --- Page Views --- */}
          <div className="border border-stone-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="h-6 w-6 text-blue-700" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xl">
                Page Views
              </h4>
            </div>
            <p className="text-gray-700 mb-2">
              The total number of times pages on your website were viewed during
              the selected period.
            </p>
            <p className="text-gray-500 text-sm italic">
              <strong>How it's counted:</strong> Each time a visitor loads a
              page, it counts as one page view. Multiple views of the same page
              by the same visitor are counted as separate page views. This
              metric represents the total traffic volume to your site.
            </p>
          </div>

          {/* --- Unique Visitors --- */}
          <div className="border border-stone-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-700" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xl">
                Unique Visitors
              </h4>
            </div>
            <p className="text-gray-700 mb-2">
              The number of distinct individuals who visited your website during
              the selected period.
            </p>
            <p className="text-gray-500 text-sm italic">
              <strong>How it's counted:</strong> This is the total count of
              unique <code>visitorId</code> hashes. Each hash is an anonymous
              signature generated for a 24-hour period from the visitor's IP,
              User-Agent, and a server-side salt. This provides an accurate,
              privacy-safe way to measure your audience size.
            </p>
          </div>

          {/* --- Bounce Rate --- */}
          <div className="border border-stone-200 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MoveRight className="h-6 w-6 text-blue-700" />
              </div>
              <h4 className="font-semibold text-gray-900 text-xl">
                Bounce Rate
              </h4>
            </div>
            <p className="text-gray-700 mb-2">
              The percentage of visitors who leave your website after viewing
              only one page.
            </p>
            <p className="text-gray-500 text-sm italic mb-2">
              <strong>How it's calculated:</strong>{" "}
              <code>
                (Visitors with only one page view / Total unique visitors) * 100
              </code>
              . A "bounce" is a session consisting of a single page view.
            </p>
            <p className="text-gray-500 text-sm italic">
              <strong>How to interpret it:</strong> A lower bounce rate
              generally indicates that visitors find your content engaging and
              navigate to other pages. A high bounce rate might suggest that the
              page content isn't meeting visitor expectations or that the user
              found what they needed immediately.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Metrics;
