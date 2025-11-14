import myAxios from "@/constants/custom-axios";
import { ApiResponse } from "@/types";
import { Contest, ContestFilter, ExaminerContest } from "@/types/contest";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function useContest(filters: ContestFilter = { status: "ALL" }) {
  const params: ContestFilter = {};
  if (filters.status && filters.status !== "ALL")
    params.status = filters.status;
  if (filters.limit) params.limit = filters.limit;

  return useInfiniteQuery({
    queryKey: ["contests", filters],
    queryFn: async ({ pageParam }) => {
      params.page = pageParam;
      const response = await myAxios.get<ApiResponse<Contest[]>>("/contests", {
        params,
      });
      const filteredData = response.data.data.filter(
        (contest) => contest.status !== "DRAFT"
      );
      return { ...response.data, data: filteredData };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? Number(lastPage.meta.page) + 1 : null,
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
      return response.data.data as ExaminerContest[];
    },
    enabled: !!examinerId,
  });
}
