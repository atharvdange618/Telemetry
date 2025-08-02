import { FastifyRequest, FastifyReply } from "fastify";

export async function authHook(request: FastifyRequest, reply: FastifyReply) {
  try {
    const userId = request.unsignCookie(request.cookies.userId || "");
    if (!userId.valid || !userId.value) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    request.userId = userId.value;
  } catch (error) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
}
