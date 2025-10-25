import myAxios from "@/constants/custom-axios";
import { AssignChildRequest, GuardianChild } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner-native";

export function useGuardianChildren(guardianId: string | undefined) {
  return useQuery({
    queryKey: ["/guardians/competitors", guardianId],
    queryFn: async () => {
      const response = await myAxios.get(
        `/guardians/competitors/${guardianId}`
      );
      return response.data.data as GuardianChild[];
    },
    enabled: !!guardianId,
  });
}

export function useAssignCompetitors(callback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignChildRequest: AssignChildRequest) => {
      const response = await myAxios.post(
        "/guardians/assign-competitors",
        assignChildRequest
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Thêm con em thành công");
      queryClient.invalidateQueries({ queryKey: ["/guardians/competitors"] });
      if (callback) callback();
    },
    onError: (err) => {
      toast.error(err.message);
      if (callback) callback();
    },
  });
}
