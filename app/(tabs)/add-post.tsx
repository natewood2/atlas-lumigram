import React, { useState } from "react"
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
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router"
import { auth, storage, firestore } from "../../firebaseConfig"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { collection, addDoc } from "firebase/firestore"

export default function AddPostScreen() {
  const [image, setImage] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)

  const pickImage = async () => {
    Keyboard.dismiss()
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality for smaller file size
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleAddPost = async () => {
    Keyboard.dismiss()
    
    if (!image || !caption.trim()) {
      Alert.alert("Error", "Please select an image and add a caption")
      return
    }

    try {
      setUploading(true)
      const currentUser = auth.currentUser
      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to create a post")
        setUploading(false)
        return
      }
      
      await addDoc(collection(firestore, "posts"), {
        imageUrl: image,
        caption: caption,
        createdAt: new Date(),
        userId: currentUser.uid,
        userEmail: currentUser.email,
        isLocalImage: true
      })

      Alert.alert("Success", "I am become post.", [
        { text: "OK", onPress: () => {
          setImage(null)
          setCaption("")
          router.replace("/(tabs)/home")
        }}
      ])
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Failed to create post")
    } finally {
      setUploading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              disabled={uploading}
            >
              <Text style={styles.placeholderTxt}>Tap to select an image</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.image} />
              <TouchableOpacity
                style={styles.changeImageBtn}
                onPress={pickImage}
                disabled={uploading}
              >
                <Text style={styles.changeImageText}>Change</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            style={styles.caption}
            placeholder="Add a caption"
            placeholderTextColor="#999999"
            multiline
            value={caption}
            returnKeyType="done"
            onChangeText={setCaption}
            editable={!uploading}
            onSubmitEditing={Keyboard.dismiss}
          />

          <TouchableOpacity
            style={[
              styles.button,
              (uploading || !image || !caption.trim()) && styles.buttonDisabled
            ]}
            onPress={handleAddPost}
            disabled={uploading || !image || !caption.trim()}
          >
            {uploading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.addButtonText}>Add Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#00003C",
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
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4BEBC0",
    backgroundColor: "rgba(75, 235, 192, 0.1)",
  },
  placeholderTxt: {
    fontSize: 16,
    color: "white",
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  changeImageBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeImageText: {
    color: "white",
    fontSize: 12,
  },
  caption: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 15,
    color: "white",
    textAlignVertical: "top",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#4BEBC0",
    minHeight: 80,
  },
  button: {
    width: "60%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#4BEBC0",
  },
  buttonDisabled: {
    backgroundColor: "rgba(75, 235, 192, 0.5)",
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  note: {
    marginTop: 20,
    color: "#AAA",
    fontSize: 12,
    textAlign: "center",
  }
})
