import { useQuery } from "@tanstack/react-query";
import { ContestFilter } from "../types/contest";
import { mockContestApi } from "./mock-contest-api";

export function useContest(filter: ContestFilter) {
  return useQuery({
    queryKey: ["contest", filter],
    queryFn: () => {
      return mockContestApi(filter);
    },
  });
}
