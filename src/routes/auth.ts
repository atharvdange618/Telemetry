import { FastifyInstance } from "fastify";
import fastifyOAuth2, { OAuth2Namespace } from "@fastify/oauth2";
import { githubEmailSchema, githubUserSchema } from "../lib/schemas";
import { z } from "zod";
import { prisma } from "../lib/prisma";

declare module "fastify" {
  interface FastifyInstance {
    githubOAuth: OAuth2Namespace;
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.register(fastifyOAuth2, {
    name: "githubOAuth",
    scope: ["read:user", "user:email"],
    credentials: {
      client: {
        id: process.env.GITHUB_CLIENT_ID!,
        secret: process.env.GITHUB_CLIENT_SECRET!,
      },
      auth: fastifyOAuth2.GITHUB_CONFIGURATION,
    },
    startRedirectPath: "/login/github",
    callbackUri: `${process.env.BASE_URL}/login/github/callback`,
  });

  app.get("/login/github/callback", async (request, reply) => {
    // get the access token
    try {
      const { token } =
        await app.githubOAuth.getAccessTokenFromAuthorizationCodeFlow(request);

      // get user info from github
      const githubUserResponse = await fetch(`${process.env.GITHUB_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
          "User-Agent": "Telemetry-App",
        },
      });

      const githubUserData = await githubUserResponse.json();
      const {
        id: githubId,
        login,
        name,
        avatar_url,
      } = githubUserSchema.parse(githubUserData);

      // get user's primary email
      const githubEmailsResponse = await fetch(
        `${process.env.GITHUB_URL}/user/emails`,
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
            "User-Agent": "Telemetry-App",
          },
        },
      );
      const githubEmailsData = await githubEmailsResponse.json();
      const primaryEmail = z
        .array(githubEmailSchema)
        .parse(githubEmailsData)
        .find((email) => email.primary && email.verified);

      if (!primaryEmail) {
        return reply
          .code(400)
          .send({ message: "No verified primary GitHub email found." });
      }

      let user = await prisma.user.findUnique({
        where: { email: primaryEmail.email },
      });

      if (!user) {
        const displayName = name || login || primaryEmail.email.split("@")[0];

        const newUser = await prisma.$transaction(async (tx) => {
          const u = await tx.user.create({
            data: {
              email: primaryEmail.email,
              name: displayName,
              image: avatar_url,
            },
          });

          const t = await tx.tenant.create({
            data: { name: `${displayName}'s Site`, domains: [] },
          });

          await tx.tenantUser.create({
            data: {
              userId: u.id,
              tenantId: t.id,
              role: "ADMIN",
            },
          });

          return u;
        });
        user = newUser;
      }

      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: "github",
            providerAccountId: String(githubId),
          },
        },
      });

      if (!account) {
        await prisma.account.create({
          data: {
            provider: "github",
            providerAccountId: String(githubId),
            userId: user.id,
          },
        });
      }

      reply.setCookie("userId", user.id, {
        path: "/",
        signed: true,
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return reply.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    } catch (error) {
      app.log.error(error, "Error in GitHub OAuth callback");
      return reply.redirect(`${process.env.FRONTEND_URL}/`);
    }
  });

  app.get("/me", async (request, reply) => {
    try {
      const userId = request.unsignCookie(request.cookies.userId || "");
      if (!userId?.valid || !userId.value) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId.value },
      });

      if (!user) {
        return reply.code(401).send({ message: "Unauthorized" });
      }

      return { user };
    } catch (error) {
      app.log.error(error, "Error fetching user");
      return reply.code(500).send({ message: "Internal server error" });
    }
  });

  app.get("/logout", async (_request, reply) => {
    reply.clearCookie("userId", { path: "/" });
    return reply.send({ message: "Logged out" });
  });
}
