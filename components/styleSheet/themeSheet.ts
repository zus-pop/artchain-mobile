import { Colors } from "@/constants/theme";
import { Appearance, Dimensions, StyleSheet } from "react-native";

const colorScheme: keyof typeof Colors = Appearance.getColorScheme() ?? "light";
const headerHeight = 60;
 const GRID_PAD_H = 20;
const themedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors[colorScheme].background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 8,
    backgroundColor: Colors[colorScheme].background,
    marginTop: 12,
  },
  greeting: {
    fontSize: 20,
    color: Colors[colorScheme].primary,
    fontWeight: "800",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  appName: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors[colorScheme].primary,
    marginTop: 2,
    letterSpacing: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: Colors[colorScheme].primary,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 80, // Account for bottom tab bar
  },
  heroSlider: {
    width: "100%",
    height: Dimensions.get("window").height - headerHeight, // Full screen minus safe area and tabs
  },
  heroContainer: {
    position: "relative",
    width: "100%",
    height: Dimensions.get("window").height - headerHeight,
  },
  heroHeaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingTop: 25,
    borderBottomStartRadius: 12,
    borderBottomEndRadius: 12,
  },
  heroContentOverlay: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroSlide: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
    backgroundColor: Colors[colorScheme].muted,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroOverlay: {
    flex: 1,
    justifyContent: "space-between",
    padding: 20,
  },
  heroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors[colorScheme].primaryForeground,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 1,
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors[colorScheme].primaryForeground,
    lineHeight: 20,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 1,
  },
  indicatorsContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  activeIndicator: {
    backgroundColor: Colors[colorScheme].primaryForeground,
  },
  section: {
    backgroundColor: Colors[colorScheme].card,
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 6,
    paddingVertical: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors[colorScheme].primary,
    marginBottom: 12,
    paddingHorizontal: 20,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingLeft: 20,
  },
  categoryCard: {
    alignItems: "center",
    justifyContent: "center",
    width: 80,
    height: 80,
    marginRight: 12,
    borderWidth: 2,
    backgroundColor: Colors[colorScheme].card,
    borderColor: Colors[colorScheme].border,
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: Colors[colorScheme].foreground,
  },
  announcementCard: {
    backgroundColor: Colors[colorScheme].card,
    marginHorizontal: 8,
    marginBottom: 8,
    overflow: "hidden",
    shadowColor: Colors[colorScheme].border,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: "row",
    borderColor: Colors[colorScheme].border,
    borderWidth: 0.5,
  },
  announcementImage: {
    width: 90,
    height: "100%",
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  announcementContent: {
    flex: 1,
    padding: 8,
    justifyContent: "center",
  },
  announcementTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors[colorScheme].primary,
    marginBottom: 4,
  },
  announcementSummary: {
    fontSize: 13,
    color: Colors[colorScheme].mutedForeground,
    marginBottom: 6,
  },
  announcementMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors[colorScheme].mutedForeground,
    fontStyle: "italic",
  },
  announcementType: {
    fontSize: 12,
    color: Colors[colorScheme].accentForeground,
    fontWeight: "600",
  },
  showAllButton: {
    alignSelf: "center",
    padding: 12,
    marginTop: 8,
  },
  showAllText: {
    color: Colors[colorScheme].primaryForeground,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  quickActionButton: {
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors[colorScheme].card,
    borderWidth: 2,
    borderColor: Colors[colorScheme].border,
    borderRadius: 16,
    minWidth: 100,
  },
  quickActionIcon: {
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors[colorScheme].foreground,
    textAlign: "center",
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors[colorScheme].muted,
  },
  seeAllText: {
    marginRight: 4,
    fontSize: 13,
    fontWeight: "700",
    color: Colors[colorScheme].accentForeground,
  },
  utilitiesGrid: {
    paddingHorizontal: GRID_PAD_H,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between", // <- chia đều khoảng trống trong từng hàng
    rowGap: 10, // RN >= 0.71 sẽ hỗ trợ; nếu chưa có, xem fallback ở dưới
  },

  utilTile: {
    alignItems: "center",
    marginBottom: 18,
  },

  // khối chứa icon – bo tròn + đổ bóng rất nhẹ
  utilCircleWrap: {
    width: 72,
    height: 72,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  // nền tròn
  utilCircle: {
    position: "absolute",
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  // viền nét đứt tạo cảm giác “cọ vẽ”
  utilRing: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderStyle: "dashed",
  },

  utilLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors[colorScheme].foreground,
    textAlign: "center",
    lineHeight: 16,
  },

  // badge “Mới”
  utilBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#fff",
  },
  utilBadgeTxt: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.2,
  },
});

export default themedStyles;
