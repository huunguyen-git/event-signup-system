import { Text, TextProps, StyleSheet } from "react-native";
import React from "react";

interface CustomTextProps extends TextProps {
  variant?: "regular" | "medium" | "bold";
}

export function CustomText({
  style,
  variant = "regular",
  ...props
}: CustomTextProps) {
  const fontStyle = {
    regular: styles.regular,
    medium: styles.medium,
    bold: styles.bold,
  }[variant];
  return <Text style={[fontStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  regular: {
    fontFamily: "Inter-Regular",
    color: "#1F2937",
  },
  medium: {
    fontFamily: "Inter-Medium",
    color: "#1F2937",
  },
  bold: {
    fontFamily: "Inter-Bold",
    color: "#1F2937",
  },
});
