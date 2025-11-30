import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/auth-provider";
import type { Branch } from "./types";
import { fetchBranches, branchesKeys } from "./api";

export function useBranches() {
  const { token } = useAuth();

  return useQuery<Branch[], Error>({
    queryKey: branchesKeys.all,
    queryFn: () => fetchBranches(token),
    enabled: Boolean(token)
  });
}
