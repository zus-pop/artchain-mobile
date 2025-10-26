import myAxios from "@/constants/custom-axios";
import { ApiResponse } from "@/types";
import { Post, PostFilters } from "@/types/post";
import { useQuery } from "@tanstack/react-query";

export function usePosts(postFilters?: PostFilters) {
  const params: PostFilters = {};

  if (postFilters && postFilters.account_id) {
    params.account_id = postFilters.account_id;
  }

  if (postFilters && postFilters.tag_id) {
    params.tag_id = postFilters.tag_id;
  }

  if (postFilters && postFilters.search) {
    params.search = postFilters.search;
  }

  if (postFilters && postFilters.page) {
    params.page = postFilters.page;
  }

  if (postFilters && postFilters.limit) {
    params.limit = postFilters.limit;
  }
  return useQuery({
    queryKey: ["posts", postFilters],
    queryFn: async () => {
      const response = await myAxios.get<ApiResponse<Post[]>>("/posts", {
        params,
      });
      return response.data;
    },
  });
}
