import { ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";
import myAxios from "../constants/custom-axios";
import { Contest, ContestFilter, Pagination } from "../types/contest";

export const normalizePagination = (
  p: ApiResponse<any>["meta"]
): Pagination => ({
  page: Number(p.page ?? 1),
  limit: Number(p.limit ?? 10),
  total: Number(p.total ?? 0),
  totalPages: Number(p.totalPages ?? 0),
  hasNext: Boolean(p.hasNextPage),
  hasPrev: Boolean(p.hasPreviousPage),
});

export function useContest(
  page = 1,
  limit = 10,
  filter: ContestFilter = { status: "ALL" }
) {
  const params: Record<string, string | number> = { page, limit };
  if (filter?.status && filter.status !== "ALL") params.status = filter.status;

  return useQuery({
    queryKey: ["contests", page, limit, params.status ?? "ALL"],
    queryFn: async () => {
      const response = await myAxios.get<ApiResponse<Contest>>("/contests", {
        params,
      });
      return response.data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    select: (res) => ({
      items:
        ((params.status ?? "ALL") === "ALL"
          ? res.data.filter((d) => d.status !== "DRAFT")
          : res.data) ?? [],
      pagination: normalizePagination(res.meta),
    }),
  });
}

export function useContestById(id: string) {
  return useQuery({
    queryKey: ["contest", id],
    queryFn: async () => {
      const response = await myAxios.get(`/contests/${id}`);
      return response.data.data as Contest;
    },
  });
}

export function useExaminerContest(examinerId: string | undefined) {
  return useQuery({
    queryKey: ["/contests/examiner", examinerId],
    queryFn: async () => {
      const response = await myAxios.get(`/contests/examiner/${examinerId}`);
      return response.data.data as Contest[];
    },
    enabled: !!examinerId,
  });
}


