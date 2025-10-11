import myAxios from "@/constants/custom-axios";
import { useQuery } from "@tanstack/react-query";

export function useUserById(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await myAxios.get(`/users/${id}`);
      return response.data;
    },
  });
}
