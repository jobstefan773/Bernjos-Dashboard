import { useQuery } from "@tanstack/react-query";
import type { Employee } from "@/components/employee-table";

export function useEmployeesQuery() {
  return useQuery<Employee[]>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("http://localhost:8000/users");
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = await res.json();
      // Map API data to Employee shape
      return data.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role,
        position: user.position ?? "",
        username: user.account?.username ?? "",
      }));
    },
  });
}