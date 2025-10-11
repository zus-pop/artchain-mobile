import { PaintingUploadRequest } from "@/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner-native";
import myAxios from "../constants/custom-axios";

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
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}
