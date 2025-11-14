import myAxios from "@/constants/custom-axios";
import { AddPushToken, ApiResponse, Notifications } from "@/types";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner-native";

export function useAddPushToken() {
  return useMutation({
    mutationFn: async (addPushToken: AddPushToken) => {
      const response = await myAxios.post(
        "/notifications/tokens",
        addPushToken
      );
      return response.data;
    },
  });
}

export function useGetNotificationsForUser() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => {
      const response = await myAxios.get<ApiResponse<Notifications[]>>(
        "/notifications",
        {
          params: {
            page: pageParam,
            limit: 8,
          },
        }
      );
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? Number(lastPage.meta.page) + 1 : null,
  });
}

export function useUpdateNotificationReadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await myAxios.patch(`/notifications/${notificationId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error) => {
      let message = error.message;
      if (error instanceof AxiosError) {
        message = error.response?.data.message;
      }
      toast.error(message);
    },
  });
}
