import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const IMAGE_SIZE = (width - 48) / 2;

interface GalleryImage {
  id: string;
  title: string;
  artist: string;
  image: string;
}

const galleryImages: GalleryImage[] = [
  {
    id: "1",
    title: "Sài Gòn Xanh",
    artist: "Nguyễn Văn Nam",
    image: "https://images.pexels.com/photos/1061588/pexels-photo-1061588.jpeg",
  },
  {
    id: "2",
    title: "Nghệ Thuật Đường Phố",
    artist: "Trần Thị Hoa",
    image: "https://images.pexels.com/photos/1690351/pexels-photo-1690351.jpeg",
  },
  {
    id: "3",
    title: "Di Sản Văn Hóa",
    artist: "Lê Văn Bình",
    image: "https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg",
  },
  {
    id: "4",
    title: "Thiên Nhiên Việt Nam",
    artist: "Phạm Minh Tuấn",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg",
  },
  {
    id: "5",
    title: "Tương Lai Trẻ Em",
    artist: "Ngô Thị Lan",
    image: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg",
  },
];

export default function GalleryScreen() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const themedStyles = getThemedStyles(colorScheme);

  const renderItem = ({ item }: { item: GalleryImage }) => (
    <TouchableOpacity
      style={themedStyles.imageCard}
      onPress={() => setSelectedImage(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={themedStyles.image} />
      <View style={themedStyles.imageInfo}>
        <Text style={themedStyles.imageTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={themedStyles.imageArtist} numberOfLines={1}>
          {item.artist}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={themedStyles.container}>
      <Text style={themedStyles.header}>Gallery</Text>
      <FlatList
        data={galleryImages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={themedStyles.listContent}
        showsVerticalScrollIndicator={false}
      />
      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <View style={themedStyles.modalBackdrop}>
          <View style={themedStyles.modalContent}>
            {selectedImage && (
              <>
                <Image
                  source={{ uri: selectedImage.image }}
                  style={themedStyles.modalImage}
                  resizeMode="contain"
                />
                <Text style={themedStyles.modalTitle}>
                  {selectedImage.title}
                </Text>
                <Text style={themedStyles.modalArtist}>
                  by {selectedImage.artist}
                </Text>
                <TouchableOpacity
                  style={themedStyles.closeButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={themedStyles.closeButtonText}>Đóng</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function getThemedStyles(scheme: "light" | "dark") {
  const { width } = Dimensions.get("window");
  const IMAGE_SIZE = (width - 48) / 2;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors[scheme].background,
    },
    header: {
      fontSize: 28,
      fontWeight: "bold",
      color: Colors[scheme].primary,
      marginTop: 24,
      marginBottom: 16,
      textAlign: "center",
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 24,
    },
    imageCard: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      margin: 6,
      overflow: "hidden",
      shadowColor: Colors[scheme].shadow,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
      width: IMAGE_SIZE,
    },
    image: {
      width: "100%",
      height: IMAGE_SIZE,
    },
    imageInfo: {
      padding: 10,
      backgroundColor: Colors[scheme].input,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    imageTitle: {
      fontSize: 15,
      fontWeight: "bold",
      color: Colors[scheme].foreground,
      marginBottom: 2,
    },
    imageArtist: {
      fontSize: 13,
      color: Colors[scheme].mutedForeground,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 20,
      padding: 24,
      alignItems: "center",
      maxWidth: width - 48,
    },
    modalImage: {
      width: width - 96,
      height: width - 96,
      borderRadius: 12,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: Colors[scheme].primary,
      marginBottom: 4,
      textAlign: "center",
    },
    modalArtist: {
      fontSize: 16,
      color: Colors[scheme].mutedForeground,
      marginBottom: 16,
      textAlign: "center",
    },
    closeButton: {
      backgroundColor: Colors[scheme].primary,
      borderRadius: 16,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    closeButtonText: {
      color: Colors[scheme].primaryForeground,
      fontWeight: "bold",
      fontSize: 16,
    },
  });
}
