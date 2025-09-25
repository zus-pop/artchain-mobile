// Mock API call for contests with filter
import { Contest, ContestFilter } from "../types/contest";

export async function mockContestApi(filter: ContestFilter) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  const allContests: Contest[] = [
    {
      id: "1",
      title: "Vẽ Sài Gòn Xanh",
      description:
        "Cuộc thi vẽ về một thành phố xanh, bền vững và thân thiện với môi trường. Hãy thể hiện tầm nhìn của bạn về một Sài Gòn trong tương lai.",
      category: "Môi trường",
      prize: "50,000,000 VNĐ",
      participants: 1247,
      deadline: "2025-02-15",
      startDate: "2025-01-01",
      status: "active",
      image:
        "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
      location: "TP. Hồ Chí Minh",
      organizer: "Sở Văn hóa và Thể thao TPHCM",
    },
    {
      id: "2",
      title: "Nghệ Thuật Đường Phố",
      description:
        "Thể hiện tinh thần sáng tạo qua nghệ thuật đường phố và graffiti. Tôn vinh văn hóa hip-hop và street art.",
      category: "Đương đại",
      prize: "30,000,000 VNĐ",
      participants: 892,
      deadline: "2025-01-30",
      startDate: "2024-12-15",
      status: "active",
      image:
        "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
      location: "Quận 1, TPHCM",
      organizer: "Trung tâm Văn hóa Quận 1",
    },
    {
      id: "3",
      title: "Di Sản Văn Hóa",
      description:
        "Bảo tồn và quảng bá di sản văn hóa Việt Nam qua tranh vẽ. Khám phá vẻ đẹp truyền thống qua góc nhìn hiện đại.",
      category: "Truyền thống",
      prize: "40,000,000 VNĐ",
      participants: 567,
      deadline: "2025-03-01",
      startDate: "2025-02-01",
      status: "upcoming",
      image:
        "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
      location: "Quận 3, TPHCM",
      organizer: "Bảo tàng Mỹ thuật TPHCM",
    },
    {
      id: "4",
      title: "Thiên Nhiên Việt Nam",
      description:
        "Vẽ về cảnh đẹp thiên nhiên Việt Nam, từ núi rừng đến biển cả. Tôn vinh vẻ đẹp quê hương.",
      category: "Môi trường",
      prize: "25,000,000 VNĐ",
      participants: 423,
      deadline: "2025-02-28",
      startDate: "2025-01-15",
      status: "active",
      image:
        "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
      location: "Quận 7, TPHCM",
      organizer: "Hội Mỹ thuật TPHCM",
    },
    {
      id: "5",
      title: "Tương Lai Trẻ Em",
      description:
        "Cuộc thi dành cho các em nhỏ từ 6-12 tuổi. Vẽ về ước mơ và tương lai của các em.",
      category: "Thiếu nhi",
      prize: "15,000,000 VNĐ",
      participants: 1156,
      deadline: "2025-01-25",
      startDate: "2024-12-20",
      status: "active",
      image:
        "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
      location: "Quận Bình Thạnh, TPHCM",
      organizer: "Trung tâm Giáo dục Nghệ thuật",
    },
  ];
  if (filter.status === "all") return allContests;
  return allContests.filter((c) => c.status === filter.status);
}
