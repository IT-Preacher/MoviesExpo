import AntDesign from '@expo/vector-icons/AntDesign';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { fetchMovies } from '../../api/movies/movies';
import { FilterModal } from '../../components/FilterModal';

import AsyncStorage from '@react-native-async-storage/async-storage';

interface Movie {
  id: number;
  title: string;
  director: string;
  poster: string;
  year: number;
  rating: number;
}

export const Movies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [availableFilters, setAvailableFilters] = useState({
    years: [],
    directors: []
  });
  const [favorites, setFavorites] = useState<{[key: number]: boolean}>({});
  
  const navigation = useNavigation();
  
  const showOnlyFavorites = useCallback(() => {
    const anyFavoritesShown = Object.keys(favorites).some(id => favorites[parseInt(id)]);
    const isShowingOnlyFavorites = filteredMovies.length < movies.length && 
                                  filteredMovies.every(movie => favorites[movie.id]);
    
    if (isShowingOnlyFavorites) {
      setFilteredMovies(movies);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (anyFavoritesShown) {
      const favoriteMovies = movies.filter(movie => favorites[movie.id]);
      setFilteredMovies(favoriteMovies);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [filteredMovies, movies, favorites]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <AntDesign 
            name="heart" 
            size={24} 
            color="black" 
            onPress={() => showOnlyFavorites()}
            style={{ marginRight: 15 }}
          />
          <AntDesign 
            name="filter" 
            size={24} 
            color="black" 
            onPress={() => setIsFilterVisible(true)}
            style={{ marginRight: 15 }}
          />
        </View>
      ),
    });
  }, [navigation, favorites, showOnlyFavorites]);

  useEffect(() => {
    const getMovies = async () => {
      try {
        const data = await fetchMovies();
        setMovies(data);
        setFilteredMovies(data);
        
        const years = [...new Set(data.map(movie => movie.year.toString()))].sort();
        const directors = [...new Set(data.map(movie => movie.director))].sort();
        
        setAvailableFilters({
          years,
          directors
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch movies');
        setLoading(false);
      }
    };

    getMovies();
  }, []);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavorites = await AsyncStorage.getItem('favorites');
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }
      } catch (error) {
        console.error('Ошибка при загрузке избранных фильмов:', error);
      }
    };
    
    loadFavorites();
  }, []);

  const toggleFavorite = async (id: number) => {
    try {
      const newFavorites = { ...favorites };
      newFavorites[id] = !favorites[id];
      
      // Тактильная обратная связь
      if (newFavorites[id]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      setFavorites(newFavorites);
      
      // Сохраняем в AsyncStorage
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Ошибка при сохранении избранных фильмов:', error);
    }
  };

  const applyFilters = (filters) => {
    let result = [...movies];
    
    const selectedYears = Object.entries(filters.years)
      .filter(([_, selected]) => selected)
      .map(([year]) => year);
      
    if (selectedYears.length > 0) {
      result = result.filter(movie => selectedYears.includes(movie.year.toString()));
    }
    
    const selectedDirectors = Object.entries(filters.directors)
      .filter(([_, selected]) => selected)
      .map(([director]) => director);
      
    if (selectedDirectors.length > 0) {
      result = result.filter(movie => selectedDirectors.includes(movie.director));
    }
    
    const selectedRatings = Object.entries(filters.ratings)
      .filter(([_, selected]) => selected)
      .map(([rating]) => parseInt(rating));
      
    if (selectedRatings.length > 0) {
      result = result.filter(movie => {
        return selectedRatings.some(minRating => {
          const value = parseInt(minRating);
          return movie.rating >= value;
        });
      });
    }
    
    setFilteredMovies(result);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.movieItem}>
            <Image 
              source={{ uri: item.poster }}
              style={styles.poster}
              contentFit="cover"
              transition={300}
            />
            <View style={styles.info}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleFavorite(item.id)}>
                  <AntDesign 
                    name={favorites[item.id] ? "heart" : "hearto"} 
                    size={24} 
                    color={favorites[item.id] ? "#ff2d55" : "black"} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.detail}>Director: {item.director}</Text>
              <Text style={styles.detail}>Year: {item.year}</Text>
              <Text style={styles.detail}>Rating: {item.rating}</Text>
            </View>
          </View>
        )}
      />
      
      <FilterModal 
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        onApplyFilters={applyFilters}
        availableFilters={availableFilters}
      />
    </View>
  );
};

export default Movies;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
  movieItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginLeft: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});