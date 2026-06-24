import { CodeBlock } from "../CodeBlock";

const Installation = () => {
  return (
    <section id="installation" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">Installation</h2>
      <div className="bg-card dark:bg-gray-900 rounded-lg border border-border p-6">
        <p className="text-muted-foreground mb-6">
          Telemetry is designed to be self-hosted, giving you complete control
          over your analytics data. Follow these steps to get your own instance
          running.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-3">
          Prerequisites
        </h3>
        <ul className="text-muted-foreground mb-8 space-y-2 list-disc list-inside">
          <li>Node.js 18+ and npm</li>
          <li>A PostgreSQL database and its connection URL</li>
          <li>A GitHub account to create an OAuth application</li>
        </ul>

        <h3 className="text-xl font-semibold text-foreground mb-3">
          Step 1: Create a GitHub OAuth Application
        </h3>
        <p className="text-muted-foreground mb-4">
          Telemetry uses GitHub for authentication. You'll need to create your
          own OAuth app.
        </p>
        <div className="space-y-4 text-muted-foreground border border-border rounded-lg p-4">
          <p>
            1. Go to your GitHub <strong>Settings</strong> →{" "}
            <strong>Developer settings</strong> → <strong>OAuth Apps</strong>.
          </p>
          <p>
            2. Click <strong>"New OAuth App"</strong>.
          </p>
          <p>3. Fill out the form with the following details:</p>
          <ul className="text-sm space-y-2 list-decimal list-inside pl-4 bg-muted p-3 rounded-md">
            <li>
              <strong>Application name:</strong> Telemetry (or any name you
              prefer)
            </li>
            <li>
              <strong>Homepage URL:</strong> The URL where you will host
              Telemetry (e.g., <code>http://localhost:3000</code> for local
              dev).
            </li>
            <li>
              <strong>Authorization callback URL:</strong> This is crucial. It
              must be <code>{`{YOUR_BASE_URL}/login/github/callback`}</code>.
              For local development, this is{" "}
              <code>http://localhost:3000/login/github/callback</code>.
            </li>
          </ul>
          <p>
            4. Click <strong>"Register application"</strong>. On the next page,
            generate a new client secret and copy both the{" "}
            <strong>Client ID</strong> and the <strong>Client Secret</strong>.
            You will need them in the next step.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Step 2: Local Setup & Installation
        </h3>
        <p className="text-muted-foreground mb-4">
          Clone the repository and install the dependencies.
        </p>
        <CodeBlock
          code={`# 1. Clone the repository
git clone https://github.com/atharvdange618/Telemetry.git
cd telemetry

# 2. Install dependencies
npm install`}
        />

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Step 3: Environment Configuration
        </h3>
        <p className="text-muted-foreground mb-4">
          Create a <code>.env</code> file by copying the example file. Then,
          fill in the values you obtained in the previous steps.
        </p>
        <CodeBlock
          code={`# Create the .env file
cp .env.example .env`}
        />
        <p className="text-muted-foreground mt-4 mb-4">
          Now, open the <code>.env</code> file and add the following values:
        </p>
        <div className="text-sm border border-border rounded-lg p-4">
          <p className="mb-2">
            <code>DATABASE_URL</code>: Your full PostgreSQL connection string.
          </p>
          <p className="mb-2">
            <code>GITHUB_CLIENT_ID</code>: Your GitHub OAuth App Client ID.
          </p>
          <p className="mb-2">
            <code>GITHUB_CLIENT_SECRET</code>: Your GitHub OAuth App Client
            Secret.
          </p>
          <p className="mb-2">
            <code>BASE_URL</code>: The base URL of your backend server (e.g.,{" "}
            <code>http://localhost:3000</code>).
          </p>
          <p className="mb-2">
            <code>FRONTEND_URL</code>: The URL of your frontend application
            (e.g., <code>http://localhost:5173</code>).
          </p>
          <p className="mb-2">
            <code>SESSION_SECRET</code>: A long, random string used to sign
            session cookies.
          </p>
          <p className="mb-2">
            <code>VISITOR_SALT</code>: Another long, random string used for
            hashing visitor IDs.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Step 4: Run the Application
        </h3>
        <p className="text-muted-foreground mb-4">
          First, run the database migrations to set up your schema. Then, start
          the server.
        </p>
        <CodeBlock
          code={`# 1. Run database migrations
npx prisma migrate dev

# 2. Start the development server
npm run dev`}
        />
        <p className="text-muted-foreground mt-4">
          Your Telemetry instance should now be running! The backend will be on
          port 3000 and the frontend on port 5173 by default.
        </p>
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
          <h5 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
            Running in Production
          </h5>
          <p className="text-blue-600/80 dark:text-blue-300/80 text-sm mb-4">
            To run in a production environment, you'll need to build the
            frontend first. Use <code>npx prisma migrate deploy</code> for
            production database migrations.
          </p>
          <CodeBlock
            code={`# 1. Build the frontend
npm run build

# 2. Start the production server
npm start`}
          />
        </div>
      </div>
    </section>
  );
};

export default Installation;
