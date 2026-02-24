import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import WattageConverter from './screens/WattageConverter';
import MeasurementConverter from './screens/MeasurementConverter';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;
            if (route.name === 'Wattage') {
              iconName = focused ? 'flash' : 'flash-outline';
            } else {
              iconName = focused ? 'restaurant' : 'restaurant-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B35',
          tabBarInactiveTintColor: '#888',
          tabBarStyle: {
            backgroundColor: '#1A1A2E',
            borderTopColor: '#333',
            paddingBottom: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#1A1A2E',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen
          name="Wattage"
          component={WattageConverter}
          options={{ title: '電子レンジ変換', tabBarLabel: 'レンジ変換' }}
        />
        <Tab.Screen
          name="Measurement"
          component={MeasurementConverter}
          options={{ title: '計量スプーン変換', tabBarLabel: 'スプーン変換' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
