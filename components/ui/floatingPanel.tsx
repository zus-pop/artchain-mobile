import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";

function FloatingPanel({ colorScheme }: { colorScheme: "light" | "dark" }) {
  const C = Colors[colorScheme];

  return (
    <View style={[
      stylesFP.card,
      {
        backgroundColor: C.card,
        borderColor: C.border,
        shadowColor: C.border,
      }
    ]}>
      {/* hàng tài khoản */}
      <View style={stylesFP.rowTop}>
        <Text style={[stylesFP.tab, { color: C.mutedForeground }]}>FUTAPay</Text>
        <View style={stylesFP.vertDivider} />
        <Text style={[stylesFP.tab, { color: C.mutedForeground }]}>TK khuyến mãi</Text>
      </View>

      {/* 3 option lớn (icon + text) – trùng với options của CollapsibleHeader */}
      <View style={stylesFP.rowOptions}>
        <OptionBig icon="create-outline" label="Nạp tiền" />
        <OptionBig icon="sync-outline"   label="Rút tiền" />
        <OptionBig icon="card-outline"   label="FUTAPay" />
      </View>
    </View>
  );
}

function OptionBig({ icon, label }: { icon: any; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 8 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={22} color="#f97316" />
      </View>
      <Text style={{ fontSize: 13, marginTop: 6 }}> {label} </Text>
    </View>
  );
}

const stylesFP = StyleSheet.create({
  card: {
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  tab: { fontSize: 14, fontWeight: "600" },
  vertDivider: { width: 1, height: 14, backgroundColor: "rgba(0,0,0,0.1)", marginHorizontal: 10 },
  rowOptions: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
});

export default FloatingPanel;