import { CodeBlock } from "../CodeBlock";
import { PlusCircle, Edit, Trash2, Users, Shield, Globe } from "lucide-react";

const SiteSettings = () => {
  return (
    <section id="settings" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">Site Settings</h2>
      <div className="bg-card dark:bg-gray-900 rounded-lg border border-border p-8">
        <p className="text-muted-foreground mb-8 text-lg">
          The settings page is where you manage your websites (tenants), view
          your tracking code, configure allowed domains, and manage user
          permissions.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          Core Actions
        </h3>
        <div className="grid md:grid-cols-4 gap-6 mb-10">
          <div className="border border-border rounded-lg p-6">
            <PlusCircle className="w-7 h-7 text-green-600 dark:text-green-400 mb-3" />
            <h5 className="font-semibold text-foreground mb-2">
              Creating a Site
            </h5>
            <p className="text-muted-foreground text-sm">
              Add a new website by providing a name and optional allowed
              domains. A unique tenant ID and tracking script are generated
              automatically.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6">
            <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400 mb-3" />
            <h5 className="font-semibold text-foreground mb-2">
              Managing Domains
            </h5>
            <p className="text-muted-foreground text-sm">
              Add or remove allowed domains for CORS. Only requests from
              registered domains will be accepted by the tracking API.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6">
            <Edit className="w-7 h-7 text-blue-600 dark:text-blue-400 mb-3" />
            <h5 className="font-semibold text-foreground mb-2">Editing a Site</h5>
            <p className="text-muted-foreground text-sm">
              Rename your sites and update domain settings at any time.
            </p>
          </div>
          <div className="border border-border rounded-lg p-6">
            <Trash2 className="w-7 h-7 text-red-600 dark:text-red-400 mb-3" />
            <h5 className="font-semibold text-foreground mb-2">
              Deleting a Site
            </h5>
            <p className="text-muted-foreground text-sm">
              Permanent action that removes the site and all analytics data.
              Admin role required.
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          User Roles & Permissions
        </h3>
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="flex items-start gap-4 bg-muted border border-border p-4 rounded-lg">
            <Shield className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">Admin</h5>
              <p className="text-muted-foreground text-sm">
                Can view analytics, edit site settings, manage domains, and
                delete the site.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 bg-muted border border-border p-4 rounded-lg">
            <Users className="w-6 h-6 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">Member</h5>
              <p className="text-muted-foreground text-sm">
                Can view all analytics data but cannot change settings or
                manage users.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-6">
          Getting the Tracking Code
        </h3>
        <p className="text-muted-foreground mb-4">
          Each site has a unique tracking script displayed in its settings card.
          Copy and paste it before the closing <code>&lt;/body&gt;</code> tag.
        </p>
        <CodeBlock
          code={`<script 
  async 
  src="https://your-domain.com/analytics.js" 
  data-tenant-id="abc123def456"
></script>`}
        />
        <p className="text-sm text-muted-foreground mt-4">
          For SPA tracking and goal tracking, see the{" "}
          <a
            href="#tracking-script"
            className="font-medium text-primary hover:underline"
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
