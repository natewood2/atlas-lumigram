import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, Alert, Dimensions, SafeAreaView, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { favoritesFeed } from '../../placeholder';
import { firestore, auth } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface FavoriteItem {
  id: string;
  image: string;
  caption: string;
  createdBy: string;
}

class DoubleTapDetector {
  lastTap: number = 0;
  
  detectDoubleTap(callback: () => void) {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (this.lastTap && (now - this.lastTap) < DOUBLE_TAP_DELAY) {
      callback();
    } else {
      this.lastTap = now;
    }
  }
}

const DogCard = ({ item }: { item: FavoriteItem }) => {
  const [showCaption, setShowCaption] = useState(false);
  const doubleTapDetector = new DoubleTapDetector();

  const handleLongPress = () => {
    setShowCaption(true);
  };
  
  const handlePressOut = () => {
    setShowCaption(false);
  };
  
  const handlePress = () => {
    doubleTapDetector.detectDoubleTap(() => {
      Alert.alert('Double Tap', 'You love this dog!');
    });
  };

  return (
    <View style={styles.DogCard}>
      <TouchableWithoutFeedback
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.imageStyle} 
            resizeMode="cover"
          />
          
          {showCaption && (
            <View style={styles.captionBox}>
              <Text style={styles.captionText}>{item.caption}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setFavorites(favoritesFeed);
          return;
        }

        const userFavoritesRef = collection(firestore, "users", currentUser.uid, "favorites");
        const querySnapshot = await getDocs(userFavoritesRef);

        if (querySnapshot.empty) {

          setFavorites(favoritesFeed);
        } else {
          const favoritePosts: FavoriteItem[] = [];

          for (const document of querySnapshot.docs) {
            const favoriteData = document.data();
            const postId = favoriteData.postId;

            try {
              const postDoc = await getDoc(doc(firestore, "posts", postId));
              
              if (postDoc.exists()) {
                const postData = postDoc.data();
                favoritePosts.push({
                  id: postDoc.id,
                  image: postData.imageUrl || postData.image,
                  caption: postData.caption || "",
                  createdBy: postData.userEmail || postData.createdBy || "Anonymous"
                });
              }
            } catch (error) {
              console.error("Error fetching post:", error);
            }
          }
          
          if (favoritePosts.length > 0) {
            setFavorites(favoritePosts);
          } else {
            setFavorites(favoritesFeed);
          }
        }
      } catch (error) {
        console.error(error);
        setFavorites(favoritesFeed);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4BEBC0" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorites yet</Text>
          <Text style={styles.emptySubtext}>Maybe double tap?</Text>
        </View>
      ) : (
        <FlashList
          data={favorites}
          renderItem={({ item }) => <DogCard item={item} />}
          estimatedItemSize={400}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'gray',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    marginTop: 8,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  DogCard: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageWrapper: {
    width: '100%',
    height: width,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  captionBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(179, 157, 219, 0.7)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  captionText: {
    color: 'white',
    fontSize: 16,
  },
  bottomArea: {
    padding: 12,
  },
  captionLabel: {
    color: 'black',
  },
});