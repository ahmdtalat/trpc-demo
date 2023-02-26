/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import superjson from "superjson";
import { EventEmitter } from "events";
import { initTRPC, TRPCError } from "@trpc/server";
import type ws from "ws";
import type { IncomingMessage } from "http";
import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { NodeHTTPCreateContextFnOptions } from "@trpc/server/adapters/node-http";

import { prisma } from "~/server/db";
import { getSession } from "next-auth/react";

const ee = new EventEmitter();

export const createTRPCContext = async (
  opts:
    | CreateNextContextOptions
    | NodeHTTPCreateContextFnOptions<IncomingMessage, ws>
) => {
  const session = await getSession(opts);

  return {
    ee,
    prisma,
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
