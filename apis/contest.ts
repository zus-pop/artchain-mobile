import { useQuery } from "@tanstack/react-query";
import myAxios from "../constants/custom-axios";
import { Contest, ContestFilter } from "../types/contest";

export function useContest(filter: ContestFilter) {
  // cái filter Tất cả không ra gì hết là do API dưới đang lỏ,
  // còn mấy filter khác bình thường nha em Trí
  return useQuery({
    queryKey: ["contest", filter],
    queryFn: async () => {
      const response = await myAxios.get<Contest[]>("/contests", {
        params: filter,
      });
      return response.data;
    },
  });
}
