import React from 'react';
import {Text} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FileListScreen from 'app/screens/FileListScreen';
import CalcSheetScreen from 'app/screens/CalcSheetScreen';
import PaymentScreen from 'app/screens/PaymentScreen';
import SettingsScreen from 'app/screens/SettingsScreen';
import CreateFileScreen from 'app/screens/CreateFileScreen';
import {useThemeColors} from 'app/hooks/useThemeColors';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabBarIcon = ({color, routeName}: {color: string; routeName: string}) => {
  const icon =
    routeName === 'Danh sách' ? '📁' : routeName === 'Bảng tính' ? '📐' : '⚙️';
  return <Text style={{color}}>{icon}</Text>;
};

const createTabBarIcon =
  (routeName: string) =>
  ({color}: {color: string}) =>
    <TabBarIcon color={color} routeName={routeName} />;

// Stack Navigator cho Danh sách và Tạo file mới
const FileListStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen 
        name="Danh sách Tab" 
        component={FileListScreen}
        options={{title: 'Danh sách'}}
      />
      <Stack.Screen 
        name="Tạo file mới" 
        component={CreateFileScreen}
        options={{title: 'Tạo file mới'}}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator cho Bảng tính và Thanh toán
const CalcStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen 
        name="Bảng tính Tab" 
        component={CalcSheetScreen}
        options={{title: 'Bảng tính'}}
      />
      <Stack.Screen name="Thanh toán" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = (): React.JSX.Element => {
  const {palette, isDarkMode} = useThemeColors();

  const baseTheme = isDarkMode ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    dark: isDarkMode,
    colors: {
      ...baseTheme.colors,
      background: palette.background,
      border: palette.subtitle,
      card: palette.surface,
      notification: palette.primary,
      primary: palette.primary,
      text: palette.text,
    },
  };

  return (
    <NavigationContainer
      theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({route}) => ({
          headerShown: false,
          tabBarActiveTintColor: palette.primary,
          tabBarInactiveTintColor: palette.subtitle,
          tabBarStyle: {
            backgroundColor: palette.surface,
            borderTopColor: palette.subtitle,
          },
          tabBarIcon: createTabBarIcon(route.name),
        })}>
        <Tab.Screen name="Danh sách" component={FileListStackNavigator} />
        <Tab.Screen 
          name="Bảng tính" 
          component={CalcStackNavigator} 
          options={{tabBarButton: () => null, tabBarStyle: {display: 'none'}}} 
        />
        <Tab.Screen name="Cài đặt" component={SettingsScreen}  />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

