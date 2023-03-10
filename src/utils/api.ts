import superjson from "superjson";
import { createTRPCNext } from "@trpc/next";
import {
  loggerLink,
  httpBatchLink,
  createWSClient,
  wsLink,
} from "@trpc/client";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { type AppRouter } from "~/server/api/root";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

const getBaseWssUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_URL)
    return `wss://${process.env.NEXT_PUBLIC_VERCEL_URL}`; // SSR should use vercel url
  return `ws://localhost:${process.env.PORT ?? 3001}`; // dev SSR should use localhost
};

function getEndingLink() {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
    });
  }
  const client = createWSClient({
    url: getBaseWssUrl(),
  });
  return wsLink<AppRouter>({
    client,
  });
}

/** A set of type-safe react-query hooks for your tRPC API. */
export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        // adds pretty logs to your console in development and logs errors in production
        loggerLink({
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(),
      ],
      queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  ssr: false,
});

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
