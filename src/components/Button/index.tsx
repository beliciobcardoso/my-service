import React from "react";
import { TouchableOpacity, TouchableOpacityProps, Text } from "react-native";
import { styles } from "./styles";

type ButtonProps = {
  title: string;
  isLoading?: boolean;
  loadingText?: string;
} & TouchableOpacityProps;

export function Button({
  title,
  isLoading,
  loadingText,
  ...rest
}: ButtonProps) {
  return (
    <TouchableOpacity
      disabled={isLoading}
      style={[
        styles.button,
        styles.primaryButton,
        isLoading && styles.disabledButton,
      ]}
      {...rest}
    >
      <Text style={styles.buttonText}>{isLoading ? loadingText : title}</Text>
    </TouchableOpacity>
  );
}
