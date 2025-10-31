import myAxios from "@/constants/custom-axios";
import {
  EvaluationRequest,
  Painting,
  PaintingEvaluation,
  PaintingFilter,
  PaintingUploadRequest,
} from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
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

export function useGetPaintings(filters: PaintingFilter) {
  const params: PaintingFilter = {};

  if (filters.contestId) {
    params.contestId = filters.contestId;
  }
  return useQuery({
    queryKey: ["paintings", filters],
    queryFn: async () => {
      const response = await myAxios.get<Painting[]>("/paintings", {
        params,
      });
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
      let message = error.message;
      if (error instanceof AxiosError) {
        message = error.response?.data.message;
      }
      toast.error(message);
    },
  });
}

export function useEvaluatePainting() {
  return useMutation({
    mutationFn: async (evaluationRequest: EvaluationRequest) => {
      const response = await myAxios.post(
        "/paintings/evaluate",
        evaluationRequest
      );
      return response.data;
    },
    onSuccess: (value) => {
      toast.success("Chấm bài thành công");
      router.back();
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

export function usePaintingEvaluations(paintingId: string) {
  return useQuery({
    queryKey: ["paintings/evaluations", paintingId],
    queryFn: async () => {
      const response = await myAxios.get<PaintingEvaluation[]>(
        `/paintings/${paintingId}/evaluations`
      );
      return response.data;
    },
    enabled: !!paintingId,
  });
}
