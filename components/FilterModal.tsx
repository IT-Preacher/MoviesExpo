import AntDesign from '@expo/vector-icons/AntDesign';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FilterOptions {
  years: { [year: string]: boolean };
  directors: { [director: string]: boolean };
  ratings: { [rating: string]: boolean };
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  availableFilters: {
    years: string[];
    directors: string[];
  }
}

export const FilterModal = ({ isVisible, onClose, onApplyFilters, availableFilters }: FilterModalProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    years: {},
    directors: {},
    ratings: { '7+': false, '8+': false, '9+': false }
  });

  const resetFilters = () => {
    setFilters({
      years: {},
      directors: {},
      ratings: { '7+': false, '8+': false, '9+': false }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  const toggleFilter = (type: 'years' | 'directors' | 'ratings', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [value]: !prev[type][value]
      }
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}>
      <BlurView intensity={20} style={styles.blurView}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Filter Movies</Text>
              <TouchableOpacity onPress={onClose}>
                <AntDesign name="close" size={24} color="black" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.scrollView}>
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Years</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[
                        styles.filterOption,
                        filters.years[year] && styles.selectedFilter
                      ]}
                      onPress={() => toggleFilter('years', year)}>
                      <Text style={filters.years[year] ? styles.selectedFilterText : styles.filterText}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Directors</Text>
                <View style={styles.filterOptions}>
                  {availableFilters.directors.map((director) => (
                    <TouchableOpacity
                      key={director}
                      style={[
                        styles.filterOption,
                        filters.directors[director] && styles.selectedFilter
                      ]}
                      onPress={() => toggleFilter('directors', director)}>
                      <Text style={filters.directors[director] ? styles.selectedFilterText : styles.filterText}>
                        {director}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Rating</Text>
                <View style={styles.filterOptions}>
                  {Object.keys(filters.ratings).map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.filterOption,
                        filters.ratings[rating] && styles.selectedFilter
                      ]}
                      onPress={() => toggleFilter('ratings', rating)}>
                      <Text style={filters.ratings[rating] ? styles.selectedFilterText : styles.filterText}>
                        {rating}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
            
            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.resetButton} 
                onPress={resetFilters}>
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton} 
                onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  blurView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 400,
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  filterOption: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    margin: 5,
  },
  selectedFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#333',
  },
  selectedFilterText: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  resetButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    width: '30%',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#333',
    fontWeight: '500',
  },
  applyButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    width: '65%',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});