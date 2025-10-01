import { useQuery } from "@tanstack/react-query";

export interface Ward {
  code: string;
  codename: string;
  division_type: string;
  name: string;
  code_name: string;
}

export function useWards() {
  return useQuery({
    queryKey: ["wards"],
    queryFn: async (): Promise<Ward[]> => {
      const response = await fetch(
        "https://provinces.open-api.vn/api/v2/w/?province=79"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch wards");
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    retry: 2,
  });
}
