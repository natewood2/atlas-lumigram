import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, Alert, Dimensions, SafeAreaView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { homeFeed } from '../../placeholder';

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

const DogCard1 = ({ item }: { item: FeedItem }) => {
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
      Alert.alert('You like that dwag!', 'The dog might need a second like!');
    });
  };

  return (
    <View style={styles.card}>
      <TouchableWithoutFeedback
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          {showCaption && (
            <View style={styles.captionOverlay}>
              <Text style={styles.captionText}>{item.caption}</Text>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <FlashList
        data={homeFeed}
        renderItem={({ item }) => <DogCard1 item={item} />}
        estimatedItemSize={400}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  },
  cardFooter: {
    padding: 12,
  },
  footerText: {
    color: 'black',
  },
});