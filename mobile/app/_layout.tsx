import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { SuccessToast, ErrorToast } from "@/components/common/CustomToast";
import { AuthProvider } from "../src/contexts/AuthContext";
import { AppBackground } from "../src/components/AppBackground";

import { ThemeProvider, DefaultTheme } from "@react-navigation/native";

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent", // ← これが効く
    card: "transparent", // ← ヘッダー/カード背景も透明にしたい時
  },
};

const toastConfig = {
  success: (props: any) => <SuccessToast {...props} />,
  error: (props: any) => <ErrorToast {...props} />,
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppBackground>
        <ThemeProvider value={TransparentTheme}>
          <Slot />
        </ThemeProvider>
      </AppBackground>
      <StatusBar style="dark" />
      <Toast config={toastConfig} />
    </AuthProvider>
  );
}
