"use client";

import {
  QueryClientProvider,
  type QueryClientProviderProps,
} from "@tanstack/react-query";
import { getQueryClient } from "@/lib/query/get-query-client";

type QueryProviderProps = Omit<QueryClientProviderProps, "client">;

export function QueryProvider({ children, ...props }: QueryProviderProps) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient} {...props}>
      {children}
    </QueryClientProvider>
  );
}
