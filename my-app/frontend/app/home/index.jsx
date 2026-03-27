import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {homeStyles} from './homeStyles';
//import { Pressable, StyleSheet, Text, TextInput, View} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
export default function HomeScreen() {
  const handleLogout = () => {
    router.replace('/');
  };
  const [search, setSearch] = useState('');


  return (
    <View style={homeStyles.container}>
        <View style = {homeStyles.header}>
          <Text style={homeStyles.title}>My Craft</Text>
          <View style = {homeStyles.headerRight}>
            <View style = {homeStyles.searchContainer}>
              <Ionicons name = "search-outline" size = {16} color = "#888"/>
              <TextInput
              style = {homeStyles.searchInput}
              placeholder = "Search!"
              placeholderTextColor = "#888"
              value = {search}
                onChangeText = {setSearch}
            />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name = "close-circle" size = {16} color = "#888"/>
                </Pressable>
              )}
            </View>
            
            <Pressable style={homeStyles.button} onPress={handleLogout}>
              <Text style={homeStyles.buttonText}>Log Out</Text>
            </Pressable>
          </View>
      </View>
      
      <Text style = {homeStyles.welcome}>Welcome back, !</Text>


      <Text style={homeStyles.subtitle}>You are logged in.</Text>

     
    </View>
  );
}
