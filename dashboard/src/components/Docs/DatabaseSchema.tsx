import { CodeBlock } from "../CodeBlock";

const DatabaseSchema = () => {
  return (
    <section id="database" className="mb-16">
      <h2 className="text-3xl font-bold text-foreground mb-6">Database Schema</h2>
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-muted-foreground mb-6">
          Telemetry uses a PostgreSQL database with a clean, normalized schema
          designed for performance and scalability. The schema is defined using
          Prisma.
        </p>

        <div className="mb-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">
            Entity Relationships
          </h3>
          <div className="bg-muted border border-border rounded-lg p-6 font-mono text-sm text-muted-foreground space-y-2">
            <p>User ── TenantUser ── Tenant</p>
            <p>User ── Account (OAuth provider link)</p>
            <p>Tenant ── Event (all analytics events)</p>
            <p className="text-xs text-muted-foreground mt-3">Many-to-many: Users access Tenants via TenantUser with role (ADMIN / MEMBER)</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Core Models
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">User</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Stores user account information, typically synced from GitHub
                  OAuth.
                </p>
                <CodeBlock
                  code={`model User {
  id        String       @id @default(cuid())
  email     String       @unique
  name      String?
  image     String?
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  accounts  Account[]
  tenants   TenantUser[]
}`}
                />
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Tenant</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Represents a single website or project being tracked. Each
                  tenant is isolated.
                </p>
                <CodeBlock
                  code={`model Tenant {
  id        String       @id @default(cuid())
  name      String
  domains   String[]
  createdAt DateTime     @default(now())

  users     TenantUser[]
  events    Event[]
}`}
                />
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">Event</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  The central table storing all incoming analytics events
                  (pageviews and goals). It's optimized with multiple indexes
                  for fast querying.
                </p>
                <CodeBlock
                  code={`model Event {
  id           String    @id @default(cuid())
  tenantId     String
  hostname     String?
  path         String?
  referrer     String?
  screenWidth  Int?
  screenHeight Int?
  visitorId    String
  createdAt    DateTime  @default(now())

  type         String    @default("pageview")
  goalName     String?

  country      String?
  city         String?

  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmTerm      String?
  utmContent   String?

  tenant       Tenant    @relation(fields: [tenantId], references: [id])

  @@index([tenantId, createdAt])
  @@index([tenantId, visitorId])
  @@index([tenantId, path])
  @@index([tenantId, referrer])
  @@index([tenantId, utmSource])
  @@index([tenantId, utmCampaign])
  @@index([tenantId, type, goalName])
  @@index([tenantId, country])
}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Relational / Join Tables
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-2">Account</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  Links a `User` to a specific OAuth provider account (e.g.,
                  their GitHub account).
                </p>
                <CodeBlock
                  code={`model Account {
  id                String  @id @default(cuid())
  provider          String
  providerAccountId String
  userId            String
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}`}
                />
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-2">TenantUser</h4>
                <p className="text-muted-foreground text-sm mb-3">
                  A many-to-many join table that connects `User`s and `Tenant`s,
                  assigning a role to each user for a specific tenant.
                </p>
                <CodeBlock
                  code={`model TenantUser {
  id       String @id @default(cuid())
  userId   String
  tenantId String
  role     String @default("MEMBER")

  user     User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  tenant   Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([userId, tenantId])
}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Performance & Indexing
            </h3>
            <div className="border border-border rounded-lg p-4">
              <p className="text-muted-foreground mb-4">
                The `Event` table is heavily indexed to ensure that dashboard
                queries remain fast, even with millions of rows. Indexes are
                placed on columns commonly used for filtering and sorting, such
                as `createdAt`, `path`, `referrer`, and UTM parameters.
              </p>
              <h4 className="font-semibold text-foreground mb-3">
                Key Indexes on `Event` Table
              </h4>
              <ul className="text-muted-foreground text-sm space-y-1 list-disc list-inside">
                <li>
                  `@@index([tenantId, createdAt])`: Time-series queries and
                  period filtering.
                </li>
                <li>
                  `@@index([tenantId, visitorId])`: Unique visitor counting
                  and engagement metrics.
                </li>
                <li>
                  `@@index([tenantId, path])`: Top pages reports.
                </li>
                <li>
                  `@@index([tenantId, referrer])`: Top referrers reports.
                </li>
                <li>
                  `@@index([tenantId, utmSource])`: UTM source reports.
                </li>
                <li>
                  `@@index([tenantId, utmCampaign])`: Campaign performance
                  reports.
                </li>
                <li>
                  `@@index([tenantId, type, goalName])`: Goal tracking
                  queries.
                </li>
                <li>
                  `@@index([tenantId, country])`: Location-based reports.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DatabaseSchema;
