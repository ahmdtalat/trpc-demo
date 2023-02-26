import { z } from "zod";
import { observable } from "@trpc/server/observable";
import type { User, Message } from "@prisma/client";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export type UserMessage = Message & {
  User: User;
};

export const chatRouter = createTRPCRouter({
  onAdd: protectedProcedure.subscription(({ ctx }) => {
    return observable<UserMessage>((emit) => {
      const onAdd = (data: UserMessage) => {
        emit.next(data);
      };

      ctx.ee.on("add", onAdd);

      return () => {
        ctx.ee.off("add", onAdd);
      };
    });
  }),

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

      ctx.ee.emit("add", msg);

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
