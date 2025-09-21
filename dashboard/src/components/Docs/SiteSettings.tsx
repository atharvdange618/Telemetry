import { CodeBlock } from "../CodeBlock";
import { PlusCircle, Edit, Trash2, Users, Shield } from "lucide-react";
import SitesDashboard from "../SitesDashboard";

const SiteSettings = () => {
  return (
    <section id="settings" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Site Settings</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-8">
        <p className="text-gray-700 mb-8 text-lg">
          The settings page is where you manage your websites (tenants), view
          your tracking code, and configure user permissions.
        </p>

        {/* --- Screenshot Placeholder --- */}
        <div className="mb-10 border border-dashed border-stone-300 rounded-lg text-center bg-stone-50">
          <SitesDashboard />
        </div>

        {/* --- Core Actions --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Core Actions
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="border border-stone-200 rounded-lg p-6">
            <PlusCircle className="w-7 h-7 text-green-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">
              Creating a Site
            </h5>
            <p className="text-gray-600 text-sm">
              Add a new website to track by providing a name. A unique tenant ID
              and tracking script will be generated automatically.
            </p>
          </div>
          <div className="border border-stone-200 rounded-lg p-6">
            <Edit className="w-7 h-7 text-blue-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">Editing a Site</h5>
            <p className="text-gray-600 text-sm">
              You can rename your existing sites at any time to keep them
              organized.
            </p>
          </div>
          <div className="border border-stone-200 rounded-lg p-6">
            <Trash2 className="w-7 h-7 text-red-600 mb-3" />
            <h5 className="font-semibold text-gray-900 mb-2">
              Deleting a Site
            </h5>
            <p className="text-gray-600 text-sm">
              Deleting a site is a permanent action that will remove the site
              and all of its associated analytics data. This can only be done by
              users with an `ADMIN` role.
            </p>
          </div>
        </div>

        {/* --- User Roles & Permissions --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          User Roles & Permissions
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="flex items-start gap-4 bg-stone-50 border border-stone-200 p-4 rounded-lg">
            <Shield className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-gray-900">Admin</h5>
              <p className="text-gray-600 text-sm">
                Can view analytics, edit site settings, manage user roles, and
                delete the site.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-stone-50 border border-stone-200 p-4 rounded-lg">
            <Users className="w-6 h-6 text-gray-600 mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-gray-900">Member</h5>
              <p className="text-gray-600 text-sm">
                Can view all analytics data for the site but cannot change any
                settings or manage users.
              </p>
            </div>
          </div>
        </div>

        {/* --- Getting the Tracking Code --- */}
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Getting the Tracking Code
        </h3>
        <p className="text-gray-700 mb-4">
          Each site you create has its own unique tracking script, which can be
          found in its settings.
        </p>
        <CodeBlock
          code={`<script 
  async 
  src="https://your-domain.com/analytics.js" 
  data-tenant-id="abc123def456"
></script>`}
        />
        <p className="text-sm text-gray-600 mt-4">
          For a complete guide on implementation, including SPA tracking and
          goal setting, please see the{" "}
          <a
            href="#tracking-script"
            className="font-medium text-sky-600 hover:underline"
          >
            Tracking Script
          </a>{" "}
          section.
        </p>
      </div>
    </section>
  );
};

export default SiteSettings;
