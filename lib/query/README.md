# TanStack Query Setup

This project uses TanStack Query with support for both **client-side** and **server-side** rendering in Next.js App Router.

## Client-side usage

Use `useQuery`, `useMutation`, etc. in any Client Component (`"use client"`):

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });
  // ...
}
```

## Server-side prefetching (SSR)

Prefetch data in a Server Component and hydrate it on the client:

```tsx
// app/users/page.tsx (Server Component)
import {
  dehydrate,
  getQueryClient,
  HydrationBoundary,
} from "@/lib/query";

async function getUsers() {
  const res = await fetch("...");
  return res.json();
}

export default async function UsersPage() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserList />
    </HydrationBoundary>
  );
}
```

```tsx
// app/users/UserList.tsx (Client Component)
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data } = useQuery({
    queryKey: ["users"],
    queryFn: () => fetch("/api/users").then((r) => r.json()),
  });
  // Data is available immediately from server prefetch
  return <ul>{/* ... */}</ul>;
}
```

## Key points

- **Server**: `getQueryClient()` creates a new QueryClient per request (no cross-request leakage).
- **Client**: `getQueryClient()` reuses a single QueryClient.
- **Prefetching**: Use `queryClient.prefetchQuery()` in Server Components, wrap children with `HydrationBoundary` and `dehydrate(queryClient)`.
- **Client-only queries**: Queries not prefetched will fetch on the client after hydration.
- **staleTime**: Default is 60s to avoid immediate refetch after SSR.
