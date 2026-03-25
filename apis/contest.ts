import myAxios from "@/constants/custom-axios";
import { ApiResponse } from "@/types";
import { Contest, ContestFilter, ExaminerContest } from "@/types/contest";
import { UserUploadStatus } from "@/types/contest-upload";
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
        (contest) => contest.status !== "DRAFT",
      );
      return { ...response.data, data: filteredData };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? Number(lastPage.meta.page) + 1 : null,
  });
}

/**
 * Hook for searching contests by keyword
 * Uses simple query (single page) for search suggest feature
 */
export function useSearchContest(keyword?: string) {
  return useQuery({
    queryKey: ["contests", "search", keyword],
    queryFn: async () => {
      const response = await myAxios.get<ApiResponse<Contest[]>>("/contests", {
        params: {
          suggest: keyword,
        },
      });
      const filteredData = response.data.data.filter(
        (contest) => contest.status !== "DRAFT",
      );
      return filteredData;
    },
    enabled: !!keyword && keyword.length >= 2,
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

// export function useCheckUploadCompetitor(
//   contestId?: number,
//   userIds: string[] = []
// ) {
//   const enabled = !!contestId && userIds.length > 0;

//   return useQuery<UserUploadStatus[]>({
//     queryKey: ["/contests/check-uploaded", contestId, userIds],
//     enabled,
//     queryFn: async () => {
//       const response = await myAxios.get(
//         `/contests/${contestId}/check-uploaded`,
//         {
//           params: {
//             userIds,
//           },
//         }
//       );
//       return response.data.data as UserUploadStatus[];
//     },
//   });
// }

export function useCheckUploadCompetitor(
  contestId?: number,
  userIds: string[] = [],
) {
  const enabled = !!contestId && userIds.length > 0;

  return useQuery({
    queryKey: ["/contests/check-uploaded", contestId, userIds],
    enabled,
    queryFn: async () => {
      const params = new URLSearchParams();
      userIds.forEach((id) => params.append("userIds", id));

      const { data } = await myAxios.get<ApiResponse<UserUploadStatus[]>>(
        `/contests/${contestId}/check-uploaded`,
        { params },
      );

      return data.data;
    },
  });
}
