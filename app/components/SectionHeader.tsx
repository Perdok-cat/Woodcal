import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useThemeColors} from 'app/hooks/useThemeColors';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const {palette} = useThemeColors();
  return (
    <View style={styles.container}>
      <View>
        <Text style={[styles.title, {color: palette.text}]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, {color: palette.subtitle}]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  action: {
    marginLeft: 12,
  },
});

export default SectionHeader;

