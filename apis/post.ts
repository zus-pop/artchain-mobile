import myAxios from "@/constants/custom-axios";
import { ApiResponse } from "@/types";
import { Post, PostFilters, Tag } from "@/types/post";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

export function usePosts(filters?: PostFilters) {
  const params: PostFilters = {};

  if (filters && filters.account_id) {
    params.account_id = filters.account_id;
  }

  if (filters && filters.tag_id) {
    params.tag_id = filters.tag_id;
  }

  if (filters && filters.search) {
    params.search = filters.search;
  }

  if (filters && filters.limit) {
    params.limit = filters.limit;
  }
  return useInfiniteQuery({
    queryKey: ["posts", filters],
    queryFn: async ({ pageParam }) => {
      params.page = pageParam;
      const response = await myAxios.get<ApiResponse<Post[]>>("/posts", {
        params,
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNextPage ? Number(lastPage.meta.page) + 1 : null,
  });
}

export function useGetPostTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await myAxios.get<ApiResponse<Tag[]>>("posts/tags");
      return response.data;
    },
  });
}
