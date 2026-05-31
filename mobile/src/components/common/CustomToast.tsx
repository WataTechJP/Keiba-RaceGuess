import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export function SuccessToast({ text1, text2 }: any) {
  return (
    <View className="flex-row items-center bg-keiba-500 px-4 py-3 rounded-xl shadow-lg mt-7">
      <Ionicons name="checkmark-circle" size={22} color="white" />
      <View className="ml-3">
        <Text className="text-white font-semibold">{text1}</Text>
        {text2 ? (
          <Text className="text-white text-xs font-semibold opacity-90">
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ErrorToast({ text1, text2 }: any) {
  return (
    <View className="flex-row items-center bg-accent-red px-4 py-3 rounded-xl shadow-lg mt-7">
      <Ionicons name="close-circle" size={22} color="white" />
      <View className="ml-3">
        <Text className="text-white font-semibold">{text1}</Text>
        {text2 ? (
          <Text className="text-white text-xs font-semibold opacity-90">
            {text2}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
