import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import client, { setAuthToken } from '../api/client';

type User = {
  id: number;
  username: string;
  email: string | null;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type Credentials = {
  username: string;
  password: string;
};

type AuthContextValue = AuthState & {
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (payload: Credentials & { email?: string }) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type ProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: ProviderProps) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    // フック時は未ログイン状態から開始
    setAuthToken(null);
  }, []);

  const handleAuthSuccess = (token: string, user: User) => {
    setAuthToken(token);
    setState({
      user,
      token,
      loading: false,
      error: null,
    });
  };

  const signIn = async ({ username, password }: Credentials) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const { data } = await client.post('auth/login/', { username, password });
      handleAuthSuccess(data.token, data.user);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'ログインに失敗しました',
      }));
      throw error;
    }
  };

  const signUp = async ({
    username,
    password,
    email,
  }: Credentials & { email?: string }) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await client.post('auth/signup/', { username, password, email });
      await signIn({ username, password });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'サインアップに失敗しました',
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await client.post('auth/logout/');
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
      setState({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

