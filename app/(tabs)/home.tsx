import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableWithoutFeedback, 
  Alert, 
  Dimensions, 
  SafeAreaView,
  ActivityIndicator,
  RefreshControl
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { firestore, auth } from '../../firebaseConfig'
import { 
  collection, 
  getDocs, 
  orderBy, 
  query, 
  startAfter, 
  limit,
  doc,
  setDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore'
import { homeFeed } from '../../placeholder'

const { width } = Dimensions.get('window')

// pagination 
const POSTS_PER_PAGE = 5

interface Post {
  id: string
  imageUrl: string
  caption: string
  userEmail: string
  createdAt: any
}

class DoubleTapDetector {
  lastTap: number = 0
  
  detectDoubleTap(callback: () => void) {
    const now = Date.now()
    const DOUBLE_TAP_DELAY = 300
    
    if (this.lastTap && (now - this.lastTap) < DOUBLE_TAP_DELAY) {
      callback()
    } else {
      this.lastTap = now
    }
  }
}

const PostCard = ({ item, onToggleFavorite, isFavorite }: { 
  item: Post | any, 
  onToggleFavorite: (post: Post | any) => void,
  isFavorite: boolean
}) => {
  const [showCaption, setShowCaption] = useState(false)
  const doubleTapDetector = new DoubleTapDetector()

  const handleLongPress = () => {
    setShowCaption(true)
  }
  
  const handlePressOut = () => {
    setShowCaption(false)
  }
  
  const handlePress = () => {
    doubleTapDetector.detectDoubleTap(() => {
      onToggleFavorite(item)
    })
  }

  const imageSource = item.imageUrl ? item.imageUrl : item.image
  const captionText = item.caption || ''
  const authorText = item.userEmail || item.createdBy || 'Anonymous'

  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: imageSource }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          {showCaption && (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText}>{captionText}</Text>
              <Text style={styles.authorText}>Posted by: {authorText}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  )
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [noMorePosts, setNoMorePosts] = useState(false)

  const fetchUserFavorites = async () => {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return

      const userFavoritesRef = collection(firestore, "users", currentUser.uid, "favorites")
      const querySnapshot = await getDocs(userFavoritesRef)
      
      const favoriteIds = new Set<string>()
      querySnapshot.forEach((doc) => {
        favoriteIds.add(doc.data().postId)
      })
      
      setFavorites(favoriteIds)
    } catch (error) {
      console.error(error)
    }
  }

  const toggleFavorite = async (post: Post | any) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return
    }

    try {
      const postId = post.id
      const userFavoriteDocRef = doc(firestore, "users", currentUser.uid, "favorites", postId)

      const docSnap = await getDoc(userFavoriteDocRef)
      const isFavorite = docSnap.exists()

      if (isFavorite) {
        await deleteDoc(userFavoriteDocRef)
        setFavorites(prevFavorites => {
          const newFavorites = new Set(prevFavorites)
          newFavorites.delete(postId)
          return newFavorites
        })
      } else {
        // issue
        await setDoc(userFavoriteDocRef, {
          postId: postId,
          addedAt: new Date()
        })
        setFavorites(prevFavorites => {
          const newFavorites = new Set(prevFavorites)
          newFavorites.add(postId)
          return newFavorites
        })
        Alert.alert("Added", "Post added to favorites")
      }
    } catch (error) {
      return null
    }
  }

  const fetchInitialPosts = async () => {
    try {
      setLoading(true)

      await fetchUserFavorites()

      const q = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        limit(POSTS_PER_PAGE)
      )

      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setPosts(homeFeed)
        setNoMorePosts(true)
      } else {
        const fetchedPosts: Post[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          fetchedPosts.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            caption: data.caption,
            userEmail: data.userEmail,
            createdAt: data.createdAt
          })
        })

        setPosts(fetchedPosts)

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        setLastVisible(lastDoc)

        setNoMorePosts(fetchedPosts.length < POSTS_PER_PAGE)
      }
    } catch (error) {
      console.error(error)
      setPosts(homeFeed)
      setNoMorePosts(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchMorePosts = async () => {
    if (loadingMore || noMorePosts || !lastVisible) return
    
    try {
      setLoadingMore(true)
      const q = query(
        collection(firestore, "posts"),
        orderBy("createdAt", "desc"),
        startAfter(lastVisible),
        limit(POSTS_PER_PAGE)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        setNoMorePosts(true)
      } else {
        const morePosts: Post[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          morePosts.push({
            id: doc.id,
            imageUrl: data.imageUrl,
            caption: data.caption,
            userEmail: data.userEmail,
            createdAt: data.createdAt
          })
        })

        setPosts((currentPosts) => [...currentPosts, ...morePosts])
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        setLastVisible(lastDoc)
        setNoMorePosts(morePosts.length < POSTS_PER_PAGE)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingMore(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    setNoMorePosts(false)
    fetchInitialPosts()
  }

  const handleEndReached = () => {
    if (!loadingMore && !noMorePosts) {
      fetchMorePosts()
    }
  }

  useEffect(() => {
    fetchInitialPosts()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4BEBC0" />
      </View>
    )
  }

  const isPostFavorite = (postId: string) => {
    return favorites.has(postId)
  }

  return (
    <SafeAreaView style={styles.container}>
      {posts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>Post something</Text>
        </View>
      ) : (
        <FlashList
          data={posts}
          renderItem={({ item }) => (
            <PostCard 
              item={item} 
              onToggleFavorite={toggleFavorite}
              isFavorite={isPostFavorite(item.id)}
            />
          )}
          estimatedItemSize={400}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={["#4BEBC0"]}
              tintColor="#4BEBC0"
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color="#4BEBC0" />
                <Text style={styles.footerText}>Loading more posts...</Text>
              </View>
            ) : noMorePosts && posts.length > POSTS_PER_PAGE ? (
              <Text style={styles.footerText}>No more posts to load</Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  )
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
  listContent: {
    paddingVertical: 8,
  },
  card: {
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  imageContainer: {
    width: '100%',
    height: width,
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    fontSize: 16,
  },
  captionOverlay: {
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
    marginBottom: 4,
  },
  authorText: {
    color: 'white',
    fontSize: 12,
    fontStyle: 'italic',
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  footerText: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
    fontSize: 14,
    marginLeft: 8,
  },
})
