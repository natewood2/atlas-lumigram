import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

export default function AddPostScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddPost = () => {
    setImage(null);
    setCaption("");
    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create New Post</Text>

          {!image ? (
            <TouchableOpacity
              style={styles.imagePlaceholder}
              onPress={pickImage}
            >
              <Text style={styles.placeholderTxt}>Tap to select an image</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
            </View>
          )}

          <TextInput
            style={styles.caption}
            placeholder="Add a caption"
            placeholderTextColor="#999999"
            multiline
            value={caption}
            onChangeText={setCaption}
          />

          <TouchableOpacity
            style={[
              styles.button,
              (!image || !caption.trim()) && styles.buttonDisable,
            ]}
            onPress={handleAddPost}
            disabled={!image || !caption.trim()}
          >
            <Text style={styles.addButtonText}>Add Post</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    alignSelf: "flex-start",
  },
  imagePlaceholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4BEBC0",
  },
  placeholderTxt: {
    fontSize: 16,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  caption: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    color: "white",
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4BEBC0",
  },
  button: {
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonDisable: {
    backgroundColor: "#4BEBC080",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
