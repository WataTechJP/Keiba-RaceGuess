import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Tab = {
  key: string;
  label: string;
};

type TabSwitchProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
};

export function TabSwitch({ tabs, activeTab, onTabChange }: TabSwitchProps) {
  const compact = tabs.length >= 4;

  return (
    <View className="flex-row bg-white mt-4 mb-1 rounded-2xl p-1 shadow-lg">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.key}
          className={`flex-1 ${compact ? "py-2 px-1" : "py-2"} rounded-xl ${
            activeTab === tab.key ? "bg-keiba-500" : "bg-transparent"
          }`}
          onPress={() => onTabChange(tab.key)}
          activeOpacity={0.7}
        >
          <Text
            className={`${compact ? "text-xs" : "text-base"} text-center font-bold ${
              activeTab === tab.key ? "text-white" : "text-text-secondary"
            }`}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
