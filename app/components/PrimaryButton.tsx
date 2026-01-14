import React from 'react';
import {Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import {useThemeColors} from 'app/hooks/useThemeColors';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  style?: ViewStyle;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  style,
}) => {
  const {palette} = useThemeColors();
  const isOutline = variant === 'outline';
  const paletteStyles = StyleSheet.create({
    primaryButton: {
      backgroundColor: palette.primary,
      borderColor: palette.primary,
    },
    outlineButton: {
      backgroundColor: 'transparent',
      borderColor: palette.primary,
    },
    primaryLabel: {
      color: '#ffffff',
    },
    outlineLabel: {
      color: palette.primary,
    },
  });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.button,
        isOutline ? paletteStyles.outlineButton : paletteStyles.primaryButton,
        style,
      ]}>
      <Text
        style={[
          styles.label,
          isOutline ? paletteStyles.outlineLabel : paletteStyles.primaryLabel,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
});

export default PrimaryButton;

