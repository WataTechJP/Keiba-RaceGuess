import React from "react";
import { Snackbar } from "react-native-paper";

type Props = {
  visible: boolean;
  message: string;
  onDismiss: () => void;
  duration?: number;
  variant?: "success" | "error" | "info";
};

export function AppSnackbar({
  visible,
  message,
  onDismiss,
  duration = 3000,
  variant = "info",
}: Props) {
  const backgroundColor =
    variant === "success"
      ? "#16a34a"
      : variant === "error"
      ? "#dc2626"
      : "#111827";

  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      style={{ backgroundColor }}
    >
      {message}
    </Snackbar>
  );
}
