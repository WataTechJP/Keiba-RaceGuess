import type { PropsWithChildren } from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function AppBackground({ children }: PropsWithChildren) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#87CEEB", "#4CAF50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      {children}
    </View>
  );
}
