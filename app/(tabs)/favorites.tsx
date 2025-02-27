import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, Alert, Dimensions, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { favoritesFeed } from '../../placeholder';

const { width } = Dimensions.get('window');

interface FeedItem {
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

const DogCard = ({ item }: { item: FeedItem }) => {
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
  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={favoritesFeed}
        renderItem={({ item }) => <DogCard item={item} />}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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