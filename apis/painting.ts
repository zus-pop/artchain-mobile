import myAxios from "@/constants/custom-axios";
import {
  Painting,
  PaintingEvaluation,
  PaintingFilter,
  PaintingUploadRequest,
  ReviewRound1EvaluationRequest,
  Round1EvaluationRequest,
  Round2EvaluationRequest,
} from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  if (filters.roundName) {
    params.roundName = filters.roundName;
  }

  if (filters.is_passed !== undefined) {
    params.is_passed = filters.is_passed;
  }

  if (filters.status) {
    params.status = filters.status;
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

export function useEvaluationPaintingRound1() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evaluationRequest: Round1EvaluationRequest) => {
      const response = await myAxios.post(
        "/paintings/evaluate/preliminary",
        evaluationRequest
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Chấm bài thành công");
      queryClient.invalidateQueries({ queryKey: ["paintings"] });
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

export function useReviewEvaluationRound1() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evaluationRequest: ReviewRound1EvaluationRequest) => {
      const response = await myAxios.post(
        "/paintings/batch/preliminary-review",
        evaluationRequest
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Chấm bài thành công");
      queryClient.invalidateQueries({ queryKey: ["paintings"] });
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

export function useEvaluatePaintingRound2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (evaluationRequest: Round2EvaluationRequest) => {
      const response = await myAxios.post(
        "/paintings/evaluate",
        evaluationRequest
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Chấm bài thành công");
      queryClient.invalidateQueries({ queryKey: ["paintings"] });
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
