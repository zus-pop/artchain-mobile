import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_SIZE = (width - 48) / 2;

/* ========= Types ========= */
type Season = "Xuân" | "Hạ" | "Thu" | "Đông";
type Award = "Gold" | "Silver" | "Bronze" | "Top 10";

interface GalleryImage {
  id: string;
  title: string;
  artist: string;
  image: string;
  season: Season;
  award: Award;
  w?: number;
  h?: number;
}

/* ========= Data mẫu ========= */
const galleryImages: GalleryImage[] = [
  {
    id: "1",
    title: "Sài Gòn Xanh",
    artist: "Nguyễn Văn Nam",
    season: "Xuân",
    award: "Gold",
    image: "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
  },
  {
    id: "2",
    title: "Nghệ Thuật Đường Phố",
    artist: "Trần Thị Hoa",
    season: "Hạ",
    award: "Silver",
    image: "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
  },
  {
    id: "3",
    title: "Di Sản Văn Hóa",
    artist: "Lê Văn Bình",
    season: "Thu",
    award: "Bronze",
    image: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
  },
  {
    id: "4",
    title: "Thiên Nhiên Việt Nam",
    artist: "Phạm Minh Tuấn",
    season: "Đông",
    award: "Top 10",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
  },
  {
    id: "5",
    title: "Tương Lai Trẻ Em",
    artist: "Ngô Thị Lan",
    season: "Xuân",
    award: "Top 10",
    image: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
  },
];

/* ========= Frame assets ========= */
const FRAME_LANDSCAPE = require("@/assets/khungTranh/khungNgang.png");
const FRAME_PORTRAIT = require("@/assets/khungTranh/khungDoc.png");

/** capInsets: tránh méo viền khi stretch */
const FRAME_CAP_INSETS = { top: 180, left: 180, bottom: 180, right: 180 };

/** Inset khít cửa sổ khung (không tạo viền), có “bleed” 0.2% để che đường chỉ */
const PCT_INSET_PORTRAIT = {
  top: "15.2%",
  bottom: "15.1%",
  left: "24.7%",
  right: "24.7%",
};
const PCT_INSET_LANDSCAPE = {
  top: "28.2%",
  bottom: "32.2%",
  left: "19.9%",
  right: "17%",
};

/* ========= Badge ========= */
function AwardBadge({
  award,
  scheme,
}: { 
  award: Award;
  scheme: "light" | "dark";
}) {
  const bg =
    award === "Gold"
      ? "#C9A227"
      : award === "Silver"
      ? "#BFC7D5"
      : award === "Bronze"
      ? "#B87333"
      : Colors[scheme].muted;
  return (
    <View
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: bg,
        opacity: 0.92,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#111" }}>
        {award}
      </Text>
    </View>
  );
}

/* ========= Khung tranh component ========= */
function FramedArtwork({
  uri,
  w,
  h,
  size,
  scheme,
  award,
}: {
  uri: string;
  w?: number;
  h?: number;
  size: number;
  scheme: "light" | "dark";
  award: Award;
}) {
  const [dim, setDim] = useState<{ w?: number; h?: number }>({ w, h });

  // Đo ảnh nếu chưa có kích thước
  useEffect(() => {
    if (!w || !h) {
      Image.getSize(
        uri,
        (mw, mh) => setDim({ w: mw, h: mh }),
        () => {}
      );
    }
  }, [uri]);

  const isPortrait = useMemo(() => {
    const iw = dim.w ?? w,
      ih = dim.h ?? h;
    if (iw && ih) return ih >= iw;
    return true;
  }, [dim, w, h]);

  const frameSrc = isPortrait ? FRAME_PORTRAIT : FRAME_LANDSCAPE;
  const insetPct = isPortrait ? PCT_INSET_PORTRAIT : PCT_INSET_LANDSCAPE;
  const frameRatio = isPortrait ? 3 / 4 : 4 / 3; // sửa nếu PNG có tỉ lệ khác

  return (
    <View style={{ width: size, aspectRatio: frameRatio, alignSelf: "center" }}>
      <ImageBackground
        source={frameSrc}
        style={{ flex: 1 }}
        imageStyle={{ resizeMode: "stretch" }}
        capInsets={FRAME_CAP_INSETS}
      >
        {/* Cửa sổ khung: không nền, không bo góc, ảnh lấp kín */}
        <View
          style={{
            position: "absolute",
            top: insetPct.top as any,
            bottom: insetPct.bottom as any,
            left: insetPct.left as any,
            right: insetPct.right as any,
            overflow: "hidden",
            backgroundColor: "transparent", // không tạo viền
            borderRadius: 0, // không bo, sát khung
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover" // lấp kín cửa sổ (không hở viền). Dùng "contain" nếu muốn thấy toàn bộ ảnh.
          />
        </View>

        <AwardBadge award={award} scheme={scheme} />
      </ImageBackground>
    </View>
  );
}

export default function GalleryScreen() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeSeason, setActiveSeason] = useState<Season>("Xuân");
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";
  const styles = getThemedStyles(scheme);

  const data = useMemo(
    () => galleryImages.filter((g) => g.season === activeSeason),
    [activeSeason]
  );

  const renderItem = ({ item }: { item: GalleryImage }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.9}
    >
      <FramedArtwork
        uri={item.image}
        w={item.w}
        h={item.h}
        size={CARD_SIZE + 20} // khung to hơn một chút trong card
        scheme={scheme}
        award={item.award}
      />
      <View style={styles.meta}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Tác phẩm đoạt giải – {activeSeason}</Text>

      {/* Tabs theo mùa */}
      <View style={styles.tabs}>
        {(["Xuân", "Hạ", "Thu", "Đông"] as Season[]).map((s) => {
          const active = s === activeSeason;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setActiveSeason(s)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>Chưa có tác phẩm đoạt giải mùa này.</Text>
        }
      />

      {/* Modal xem lớn */}
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            {selectedImage && (
              <>
                <FramedArtwork
                  uri={selectedImage.image}
                  w={selectedImage.w}
                  h={selectedImage.h}
                  size={width - 48} // gần full chiều rộng
                  scheme={scheme}
                  award={selectedImage.award}
                />
                <Text style={styles.modalTitle}>{selectedImage.title}</Text>
                <Text style={styles.modalArtist}>
                  by {selectedImage.artist}
                </Text>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.closeText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ========= Styles ========= */
function getThemedStyles(scheme: "light" | "dark") {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[scheme].background },
    header: {
      fontSize: 22,
      fontWeight: "800",
      textAlign: "center",
      color: Colors[scheme].primary,
      marginTop: 16,
      marginBottom: 10,
    },
    tabs: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginBottom: 8,
      paddingHorizontal: 12,
      flexWrap: "wrap",
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: Colors[scheme].muted,
      opacity: 0.7,
    },
    tabActive: { backgroundColor: Colors[scheme].primary, opacity: 1 },
    tabText: { color: Colors[scheme].foreground, fontWeight: "600" },
    tabTextActive: { color: Colors[scheme].primaryForeground },

    list: { paddingHorizontal: 12, paddingBottom: 24 },
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 12,
      margin: 6,
      overflow: "hidden",
      shadowColor: Colors[scheme].mutedForeground,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
      width: CARD_SIZE,
      alignItems: "center", // khung ở giữa card
    },
    meta: { padding: 10, width: "100%" },
    title: {
      fontSize: 15,
      fontWeight: "700",
      color: Colors[scheme].foreground,
    },
    artist: {
      fontSize: 13,
      color: Colors[scheme].mutedForeground,
      marginTop: 2,
    },

    empty: {
      textAlign: "center",
      color: Colors[scheme].mutedForeground,
      marginTop: 24,
    },

    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modal: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 20,
      alignItems: "center",
      maxWidth: width - 32,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: Colors[scheme].primary,
      marginTop: 12,
      textAlign: "center",
    },
    modalArtist: {
      fontSize: 14,
      color: Colors[scheme].mutedForeground,
      marginBottom: 12,
    },
    closeBtn: {
      backgroundColor: Colors[scheme].primary,
      borderRadius: 14,
      paddingHorizontal: 22,
      paddingVertical: 10,
    },
    closeText: { color: Colors[scheme].primaryForeground, fontWeight: "700" },
  });
}
