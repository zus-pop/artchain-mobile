import { useQuery } from "@tanstack/react-query";
import myAxios from "../constants/custom-axios";
import { Contest, ContestFilter } from "../types/contest";

export function useContest(filter: ContestFilter) {
  const params: ContestFilter = {};
  if (filter.status != "ALL") {
    params.status = filter.status;
  }
  return useQuery({
    queryKey: ["contests", filter],
    queryFn: async () => {
      const response = await myAxios.get<Contest[]>("/contests", {
        params,
      });
      return response.data;
    },
    staleTime: 30 * 1000,
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
