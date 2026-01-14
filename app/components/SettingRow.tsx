import React from 'react';
import {StyleSheet, Switch, Text, View} from 'react-native';
import {useThemeColors} from 'app/hooks/useThemeColors';

type SettingRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  value,
  onChange,
}) => {
  const {palette} = useThemeColors();
  return (
    <View style={[styles.container, {backgroundColor: palette.surface}]}>
      <View style={styles.textWrapper}>
        <Text style={[styles.label, {color: palette.text}]}>{label}</Text>
        {description ? (
          <Text style={[styles.description, {color: palette.subtitle}]}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        thumbColor={value ? '#ffffff' : '#f4f3f4'}
        trackColor={{false: '#767577', true: palette.primary}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
  },
});

export default SettingRow;

