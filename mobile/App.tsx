import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import RaceListScreen from './src/screens/RaceListScreen';

const Stack = createNativeStackNavigator();

const AuthenticatedNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Races"
      component= {RaceListScreen}
      options={{ title: 'レース' }}
    />
  </Stack.Navigator>
);

const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
      options={{ title: 'サインアップ' }}
    />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { token } = useAuth();
  return token ? <AuthenticatedNavigator /> : <AuthNavigator />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </AuthProvider>
  );
}
