export interface Post {
  post_id: number;
  account_id: string;
  title: string;
  content: string;
  image_url: string;
  status: string;
  published_at: Date;
  created_at: Date;
  updated_at: Date;
  creator: {
    userId: string;
    username: string;
    fullName: string;
    email: string;
    phone: string | null;
    role: "STAFF";
    status: 1 | 0;
    createdAt: Date;
    positionLevel: string | null;
  };
  postTags: PostTag[];
}

interface PostTag {
  post_id: number;
  tag_id: number;
  tag: {
    tag_id: number;
    tag_name: string;
    created_at: Date;
  };
}

export interface PostFilters {
  page?: number;
  limit?: number;
  search?: string;
  tag_id?: number;
  account_id?: string;
}
