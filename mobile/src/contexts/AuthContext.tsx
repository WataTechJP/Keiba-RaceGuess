// src/contexts/AuthContext.tsx (既存画面対応版)
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import client from "../api/client";

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signIn: (params: { username: string; password: string }) => Promise<void>;
  signUp: (params: {
    username: string;
    email?: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // アプリ起動時にトークンを復元
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // トークンが変更されたらヘッダーにセット
  useEffect(() => {
    if (token) {
      client.defaults.headers.common["Authorization"] = `Token ${token}`;
      console.log("🔑 Token set in headers");
    } else {
      delete client.defaults.headers.common["Authorization"];
      console.log("🔓 Token removed from headers");
    }
  }, [token]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("authToken");
      const storedUser = await AsyncStorage.getItem("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        console.log("✅ Auth restored from storage");
      }
    } catch (error) {
      console.error("❌ Error loading auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔐 Logging in:", username);

      const response = await client.post("/api/auth/login/", {
        username,
        password,
      });

      const { token: newToken, user: newUser } = response.data;

      // 保存
      await AsyncStorage.setItem("authToken", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      console.log("✅ Login successful:", newUser.username);
    } catch (err: any) {
      console.error("❌ Login error:", err.response?.data);
      const errorMessage =
        err.response?.data?.error || "ログインに失敗しました";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async ({
    username,
    email,
    password,
  }: {
    username: string;
    email?: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("📝 Registering:", username);

      const response = await client.post("/api/auth/register/", {
        username,
        email: email || "",
        password,
      });

      const { token: newToken, user: newUser } = response.data;

      // 保存
      await AsyncStorage.setItem("authToken", newToken);
      await AsyncStorage.setItem("user", JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);

      console.log("✅ Registration successful:", newUser.username);
    } catch (err: any) {
      console.error("❌ Registration error:", err.response?.data);
      const errorMessage = err.response?.data?.error || "登録に失敗しました";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // サーバー側のトークンを削除
      await client.post("/api/auth/logout/");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      // ローカルのデータをクリア
      await AsyncStorage.multiRemove(["authToken", "user"]);
      setToken(null);
      setUser(null);
      setError(null);
      console.log("🔓 Logged out");
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    signIn,
    signUp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
