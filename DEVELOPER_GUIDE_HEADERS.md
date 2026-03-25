# ArtChain Mobile - Developer Guide: Using Unified Headers & Tab Bar

## 📖 Quick Start

### Using UnifiedHeader in a New Screen

```tsx
import UnifiedHeader from "@/components/headers/UnifiedHeader";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

export default function MyScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="My Screen Title"
        showBack={true}
        scheme={scheme}
        onBack={() => router.back()}
      />

      {/* Rest of your content */}
    </View>
  );
}
```

---

## 🎨 Header API Reference

### **UnifiedHeader Props**

```typescript
interface HeaderConfig {
  title?: string; // Screen title (auto-centered on iOS)
  showBack?: boolean; // Show back button
  onBack?: () => void; // Back button callback (default: router.back())
  rightAction?: React.ReactNode; // Single element on right (icon, etc)
  rightActions?: Array<{
    // Multiple actions on right
    icon: string; // Ionicons name
    onPress: () => void;
    testID?: string;
  }>;
  variant?: HeaderVariant; // 'DEFAULT' | 'TRANSLUCENT' | 'SOLID'
  backgroundColor?: string; // Override bg color
  borderBottom?: boolean; // Show bottom divider
  translucent?: boolean; // Transparent background
  scheme?: "light" | "dark"; // User's color scheme
}
```

### **Simple Header Examples**

```tsx
// Basic header with back button
<UnifiedHeader title="Details" showBack={true} scheme={scheme} />

// Header with custom back handler
<UnifiedHeader
  title="Edit Profile"
  showBack={true}
  onBack={() => {
    // Custom logic
    router.back();
  }}
  scheme={scheme}
/>

// Header with right action
<UnifiedHeader
  title="Search Results"
  showBack={true}
  rightAction={
    <Pressable onPress={() => alert('Share')}>
      <Ionicons name="share-social" size={24} color={colors.foreground} />
    </Pressable>
  }
  scheme={scheme}
/>

// Header with multiple right actions
<UnifiedHeader
  title="Settings"
  showBack={true}
  rightActions={[
    {
      icon: "search",
      onPress: () => console.log("Search"),
    },
    {
      icon: "ellipsis-vertical",
      onPress: () => console.log("More"),
    },
  ]}
  scheme={scheme}
/>
```

---

## 🔧 Configuration Reference

### **Header Dimensions** (from `constants/headerConfig.ts`)

```typescript
HEADER_HEIGHT = 56; // Content height
BACK_BUTTON_SIZE = 36; // iOS, 48 on Android
RIGHT_ACTION_SIZE = 36; // iOS, 48 on Android
HEADER_PADDING_HORIZONTAL = 12; // Left/right padding
```

### **Platform-Specific Configs**

```typescript
// iOS (refined, elegant)
- Safe area padding: 12px
- Title align: center
- Back icon: chevron-back
- Animation scale: 1.06

// Android (Material Design)
- Safe area padding: 8px
- Title align: left (after back button)
- Back icon: arrow-back
- Animation scale: 1.12
```

---

## 📱 Platform-Aware Styling

The header **automatically adapts** based on the platform:

```tsx
// You DON'T need to do this:
if (Platform.OS === "ios") {
  // iOS specific
} else {
  // Android specific
}

// The UnifiedHeader handles it internally:
const platformConfig = Platform.select({
  ios: {
    /* iOS config */
  },
  android: {
    /* Android config */
  },
});
```

---

## 🎬 Tab Bar Animations

The new `EnhancedTabBar` in `app/(tabs)/_layout.tsx` automatically provides:

### **iOS Animation** (subtle, refined)

- Scale: 1 → 1.06
- Duration: 200ms
- Spring: { damping: 16, stiffness: 220 }

### **Android Animation** (strong, Material-style)

- Scale: 1 → 1.12
- Duration: 220ms
- Spring: { damping: 14, stiffness: 180 }
- Icon highlighting
- Subtle background highlight

**No configuration needed** - it's automatic!

---

## ✅ Best Practices

### Do's ✓

```tsx
// ✓ Always pass scheme to UnifiedHeader
<UnifiedHeader title="Title" scheme={scheme} showBack={true} />

// ✓ Use for all detail/modal screens
// ✓ Use for screens with back navigation
// ✓ Leverage rightAction for custom buttons
// ✓ Let platform detect dimensions automatically
```

### Don'ts ✗

```tsx
// ✗ Don't create custom headers when UnifiedHeader exists
// ✗ Don't override backgroundColor unless necessary
// ✗ Don't set Platform-specific styles - it's automatic
// ✗ Don't use AppHeader anymore (deprecated)
```

---

## 🔌 Integration Checklist

When converting an old screen to use UnifiedHeader:

- [ ] Import `UnifiedHeader` from `@/components/headers/UnifiedHeader`
- [ ] Import `useColorScheme` hook and `Colors`
- [ ] Add `const scheme = (useColorScheme() ?? "light") as "light" | "dark"`
- [ ] Replace old header component with `<UnifiedHeader />`
- [ ] Pass `title`, `showBack`, and `scheme` props
- [ ] Add `onBack` handler if needed
- [ ] Test on both iOS and Android
- [ ] Verify safe area handling

---

## 🎨 Color Integration

Headers automatically use your app's theme colors:

```tsx
// From constants/theme.ts
const colors = Colors[scheme]; // "light" | "dark"

// UnifiedHeader reads from:
- colors.card (background)
- colors.border (divider)
- colors.foreground (title/icons)
- colors.primary (for theme accents)
```

No need to manually pass colors!

---

## 🚀 Advanced: Custom Right Actions

```tsx
import { Ionicons } from "@expo/vector-icons";

<UnifiedHeader
  title="Custom Actions"
  showBack={true}
  scheme={scheme}
  rightActions={[
    {
      icon: "filter",
      onPress: () => openFilterMenu(),
      testID: "filter-btn",
    },
    {
      icon: "arrow-redo",
      onPress: () => refreshData(),
      testID: "refresh-btn",
    },
  ]}
/>;
```

---

## 📊 Common Patterns

### Modal/Detail Screen

```tsx
export default function ModalScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader title="Details" showBack={true} scheme={scheme} />
      <ScrollView>{/* Content */}</ScrollView>
    </View>
  );
}
```

### Search Results Screen

```tsx
export default function SearchScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="Search Results"
        showBack={true}
        rightAction={<SearchIcon onPress={refineSearch} />}
        scheme={scheme}
      />
      <FlatList data={results} renderItem={renderResult} />
    </View>
  );
}
```

### Settings/Admin Screen

```tsx
export default function SettingsScreen() {
  const scheme = (useColorScheme() ?? "light") as "light" | "dark";

  return (
    <View style={{ flex: 1 }}>
      <UnifiedHeader
        title="Settings"
        showBack={true}
        rightActions={[
          { icon: "help-circle", onPress: showHelp },
          { icon: "notifications", onPress: openNotifications },
        ]}
        scheme={scheme}
      />
      <ScrollView>{/* Settings */}</ScrollView>
    </View>
  );
}
```

---

## 🐛 Troubleshooting

### Header not showing

- [ ] Check if `headerShown: false` is set in Stack options
- [ ] Ensure UnifiedHeader is inside the component returned

### Back button not working

- [ ] Add `showBack={true}` prop
- [ ] Ensure `router` is imported from `expo-router`
- [ ] Test with `onBack={() => alert('works!')}`

### Safe area not respecting insets

- [ ] The component auto-reads from `useSafeAreaInsets()`
- [ ] Ensure `SafeAreaProvider` wraps your app (done in \_layout.tsx)

### Animations not smooth

- [ ] Check device performance
- [ ] Verify `react-native-reanimated` is installed
- [ ] Test on actual device (not just simulator)

---

## 📚 Related Files

- Header component: `components/headers/UnifiedHeader.tsx`
- Tab bar: `components/tabs/EnhancedTabBar.tsx`
- Config: `constants/headerConfig.ts`
- Using screens: `app/(tabs)/_layout.tsx`, `app/contest-detail.tsx`, etc.

---

## ✨ Summary

The new unified header system provides:

- ✅ One component for all screens
- ✅ Automatic platform optimization
- ✅ Consistent theming
- ✅ Smooth animations
- ✅ Type-safe props
- ✅ Easy integration

Just import, pass props, and focus on your content! 🚀
