import myAxios from "@/constants/custom-axios";
import { Painting, PaintingUploadRequest } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { toast } from "sonner-native";

export function useMySubmission() {
  return useQuery({
    queryKey: ["me/submissions"],
    queryFn: async () => {
      const response = await myAxios.get<Painting[]>("/users/me/submissions");
      return response.data;
    },
  });
}

export function useUploadPainting() {
  return useMutation({
    mutationFn: async (paintingUploadRequest: PaintingUploadRequest) => {
      const formData = new FormData();
      formData.append("title", paintingUploadRequest.title);
      if (paintingUploadRequest.description) {
        formData.append("description", paintingUploadRequest.description);
      }
      formData.append("file", paintingUploadRequest.file as any);
      formData.append("competitorId", paintingUploadRequest.competitorId);
      formData.append("contestId", paintingUploadRequest.contestId);
      formData.append("roundId", paintingUploadRequest.roundId);
      const response = await myAxios.post("/paintings/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(`Upload painting successfully!`);
      // TODO: Navigate to my submission
      router.navigate("/(tabs)/profile");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
