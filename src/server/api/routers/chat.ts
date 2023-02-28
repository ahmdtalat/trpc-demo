import { z } from "zod";
import type { User, Message } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export type UserMessage = Message & {
  User: User;
};

export const chatRouter = createTRPCRouter({
  sendMsg: protectedProcedure
    .input(z.object({ body: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const msg = await ctx.prisma.message.create({
        data: {
          body: input.body,
          userId: ctx.session.user.id,
        },
        include: {
          User: true,
        },
      });

      return msg;
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.message.findMany({
      include: {
        User: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }),
});
