import { CodeBlock } from "../CodeBlock";

const Authentication = () => {
  return (
    <section id="authentication" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">Authentication</h2>
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-muted-foreground mb-6">
          Telemetry uses GitHub OAuth2 for user authentication. All dashboard
          and statistics API endpoints require a valid session.
        </p>

        <h3 className="text-xl font-semibold text-foreground mb-3">
          Session Management
        </h3>
        <p className="text-muted-foreground mb-4">
          User sessions are managed via a signed, <code>httpOnly</code> cookie
          named <code>userId</code>. This cookie is set upon successful login
          and has a duration of 7 days. All subsequent authenticated requests to
          the API must include this cookie.
        </p>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Authentication Flow
        </h3>
        <div className="space-y-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-foreground">Initiate OAuth</p>
              <p className="text-muted-foreground text-sm">
                User is redirected to GitHub via <code>/login/github</code> to
                authorize the application.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-foreground">
                Callback & User Provisioning
              </p>
              <p className="text-muted-foreground text-sm">
                GitHub redirects to <code>/login/github/callback</code>. The
                server exchanges the code for an access token, fetches the
                user's profile and verified primary email.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-foreground">First-Time Login</p>
              <p className="text-muted-foreground text-sm">
                If the user is new, a <code>User</code> record, a default{" "}
                <code>Tenant</code> (site), and a linking{" "}
                <code>TenantUser</code> record with an `ADMIN` role are created
                in the database.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-muted text-muted-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0">
              4
            </div>
            <div>
              <p className="font-medium text-foreground">Session Creation</p>
              <p className="text-muted-foreground text-sm">
                A signed <code>userId</code> cookie is set in the user's
                browser, and they are redirected to the dashboard.
              </p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-foreground mt-8 mb-3">
          Authentication Endpoints
        </h3>
        <div className="space-y-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code className="text-foreground">/login/github</code>
            </div>
            <p className="text-muted-foreground text-sm">
              Initiates the GitHub OAuth flow by redirecting the user to GitHub
              for authorization.
            </p>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code className="text-foreground">/login/github/callback</code>
            </div>
            <p className="text-muted-foreground text-sm mb-3">
              Handles the callback from GitHub after authorization. Manages user
              creation/lookup and sets the session cookie. This endpoint is not
              meant to be called directly by clients.
            </p>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                POSSIBLE REDIRECTS
              </p>
              <p className="text-sm text-foreground">
                → <strong>On Success:</strong> Redirects to{" "}
                <code>/dashboard</code>.
              </p>
              <p className="text-sm text-foreground">
                → <strong>On Failure:</strong> Redirects to <code>/</code> (root
                route). This can happen if a user does not have a verified
                primary email on GitHub.
              </p>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code className="text-foreground">/me</code>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Returns the currently authenticated user's information based on
              the session cookie.
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  SUCCESS RESPONSE (200 OK)
                </p>
                <CodeBlock
                  code={`{
  "user": {
    "id": "clx4y...",
    "email": "user@example.com",
    "name": "User Name",
    "image": "https://avatars.githubusercontent.com/..."
  }
}`}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  ERROR RESPONSE (401 UNAUTHORIZED)
                </p>
                <CodeBlock code={`{ "message": "Unauthorized" }`} />
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-blue-500/15 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                GET
              </span>
              <code className="text-foreground">/logout</code>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Clears the session cookie and logs the user out.
            </p>
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              SUCCESS RESPONSE (200 OK)
            </p>
            <CodeBlock code={`{ "message": "Logged out" }`} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Authentication;
