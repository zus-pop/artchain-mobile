import myAxios from "@/constants/custom-axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";
import { UpdateUserRequest } from "../types/user";

export function useUserById(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await myAxios.get(`/users/${id}`);
      return response.data;
    },
  });
}

export function useUpdateUserById(callback?: () => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, ...updateUserRequest }: UpdateUserRequest) => {
      const response = await myAxios.put(`/users/${userId}`, updateUserRequest);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Update user information success");
      client.invalidateQueries({ queryKey: ["me"] });
      if (callback) callback();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
