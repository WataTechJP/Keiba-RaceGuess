import { useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: Props) => {
  const { signIn, loading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      return;
    }
    try {
      await signIn({ username, password });
    } catch {
      // noop (エラーメッセージは context が保持)
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Keiba Battle</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        placeholder="ユーザー名"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title={loading ? 'ログイン中...' : 'ログイン'} onPress={handleSubmit} />
      <View style={styles.linkContainer}>
        <Text>アカウントが無い？</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          サインアップ
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  error: {
    color: 'red',
    textAlign: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  link: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});

export default LoginScreen;

