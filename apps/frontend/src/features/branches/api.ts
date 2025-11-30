import { apiFetch } from "@/lib/api-client";
import type { Branch } from "./types";

export const branchesKeys = {
  all: ["branches"] as const
};

export async function fetchBranches(token?: string | null) {
  return apiFetch<Branch[]>("/branches", { token });
}
