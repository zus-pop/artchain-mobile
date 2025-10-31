import { useQuery } from "@tanstack/react-query";
import myAxios from "../constants/custom-axios";
import { ApiResponse, Schedule } from "../types";

export function useSchedules(examinerId: string | undefined) {
  return useQuery({
    queryKey: ["schedules", examinerId],
    queryFn: async () => {
      const response = await myAxios.get<ApiResponse<Schedule[]>>(
        "/examiners/schedules"
      );
      return response.data;
    },
  });
}
