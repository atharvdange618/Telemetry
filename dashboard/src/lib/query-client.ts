import { keepPreviousData, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

declare module "@tanstack/react-query" {
  interface Register {
    queryMeta: {
      /** The query shows its own error state, so skip the global toast. */
      silentError?: boolean;
    };
  }
}

// Keep the last result on screen while a new period or filter loads, so
// sections don't unmount and the page doesn't jump on every change.
// Any failed query toasts once; the id stops a page of failing stats
// requests from stacking seven copies.
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silentError) return;
        console.error(error);
        toast.error("Couldn't load some data. Refresh to try again.", { id: "query-error" });
      },
    }),
    defaultOptions: { queries: { placeholderData: keepPreviousData } },
  });
}
