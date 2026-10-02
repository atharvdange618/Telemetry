import { useQuery } from "@tanstack/react-query";
import { API_URL, fetchJSON } from "@/lib/api";
import type { User } from "@/lib/state/auth";

interface MeResponse {
  user: User;
}

// The session lives in a cookie, so asking the server is the only way to
// know who is signed in. ProtectedRoute and the landing page share this key.
export function useMe() {
  return useQuery<MeResponse>({
    queryKey: ["me"],
    queryFn: () => fetchJSON<MeResponse>(`${API_URL}/me`),
    retry: false,
    // Signed out is a normal answer here, not an error to toast.
    meta: { silentError: true },
  });
}
