import { CodeBlock } from "../CodeBlock";

const DatabaseSchema = () => {
  return (
    <section id="database" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Database Schema</h2>
      <div className="bg-white rounded-lg border border-stone-200 p-6">
        <p className="text-gray-700 mb-6">
          Telemetry uses a PostgreSQL database with a clean, normalized schema
          designed for performance and scalability. The schema is defined using
          Prisma.
        </p>

        {/* ERD Image Placeholder */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Entity Relationship Diagram
          </h3>
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">
              A visual diagram helps understand the relationships between the
              core tables.
            </p>

            <p className="text-sm text-gray-500 mt-2">
              User ↔ Tenant (via TenantUser) | User → Account | Tenant → Event
            </p>
          </div>
        </div>

        {/* Core Tables Section */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Core Models
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">User</h4>
                <p className="text-gray-600 text-sm mb-3">
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
                <h4 className="font-medium text-gray-900 mb-2">Tenant</h4>
                <p className="text-gray-600 text-sm mb-3">
                  Represents a single website or project being tracked. Each
                  tenant is isolated.
                </p>
                <CodeBlock
                  code={`model Tenant {
  id        String       @id @default(cuid())
  name      String
  createdAt DateTime     @default(now())

  users     TenantUser[]
  events    Event[]
}`}
                />
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Event</h4>
                <p className="text-gray-600 text-sm mb-3">
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

  // Goal Tracking Fields
  type         String    @default("pageview") // 'pageview' or 'goal'
  goalName     String?

  // Location Fields
  country      String?
  city         String?

  // UTM Fields
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  utmTerm      String?
  utmContent   String?

  tenant       Tenant    @relation(fields: [tenantId], references: [id])

  @@index([tenantId, createdAt])
  @@index([tenantId, visitorId])
  // ... and 6 other indexes for performance
}`}
                />
              </div>
            </div>
          </div>

          {/* Join Tables Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Relational / Join Tables
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Account</h4>
                <p className="text-gray-600 text-sm mb-3">
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
                <h4 className="font-medium text-gray-900 mb-2">TenantUser</h4>
                <p className="text-gray-600 text-sm mb-3">
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

          {/* Performance & Indexing Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Performance & Indexing
            </h3>
            <div className="border border-stone-200 rounded-lg p-4">
              <p className="text-gray-700 mb-4">
                The `Event` table is heavily indexed to ensure that dashboard
                queries remain fast, even with millions of rows. Indexes are
                placed on columns commonly used for filtering and sorting, such
                as `createdAt`, `path`, `referrer`, and UTM parameters.
              </p>
              <h4 className="font-semibold text-gray-900 mb-3">
                Key Indexes on `Event` Table
              </h4>
              <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                <li>
                  `@@index([tenantId, createdAt])`: For time-series data and
                  filtering by period.
                </li>
                <li>
                  `@@index([tenantId, visitorId])`: For querying unique visitor
                  information.
                </li>
                <li>
                  `@@index([tenantId, path])`: For generating "Top Pages"
                  reports.
                </li>
                <li>
                  `@@index([tenantId, referrer])`: For generating "Top
                  Referrers" reports.
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
