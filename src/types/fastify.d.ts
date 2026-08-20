import "fastify";
import { FastifyCorsOptions } from "@fastify/cors";

declare module "fastify" {
  export interface FastifyRequest {
    userId?: string;
    corsPreflightEnabled: boolean;
  }

  export interface FastifyContextConfig {
    cors?: Partial<FastifyCorsOptions> | false;
  }
}
