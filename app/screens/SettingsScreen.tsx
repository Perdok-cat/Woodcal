import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import SectionHeader from 'app/components/SectionHeader';
import SettingRow from 'app/components/SettingRow';
import PrimaryButton from 'app/components/PrimaryButton';
import {defaultSettings} from 'app/data/sampleData';
import {SettingOption} from 'app/types';
import {useThemeColors} from 'app/hooks/useThemeColors';

const SettingsScreen = (): React.JSX.Element => {
  const [settings, setSettings] = useState<SettingOption[]>(defaultSettings);
  const {palette} = useThemeColors();

  const updateSetting = (id: string, value: boolean) => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id ? {...setting, value} : setting,
      ),
    );
  };

  const handleSync = () => {
    // Placeholder cho hành động sync thực tế
    console.log('Đã yêu cầu đồng bộ dữ liệu');
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: palette.background}]}>
      <View style={styles.body}>
        <SectionHeader
          title="Cài đặt ứng dụng"
          subtitle="Tùy chỉnh trải nghiệm ghi chú"
        />
        <View style={styles.card}>
          {settings.map(setting => (
            <SettingRow
              key={setting.id}
              label={setting.label}
              description={setting.description}
              value={setting.value}
              onChange={value => updateSetting(setting.id, value)}
            />
          ))}
        </View>
        <View style={styles.footer}>
          <PrimaryButton label="Đồng bộ ngay" onPress={handleSync} />
          <Text style={[styles.version, {color: palette.subtitle}]}>
            Phiên bản 0.1.0 • dữ liệu lưu cục bộ
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};                                                                      

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  card: {
    marginTop: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: 12,
  },
  version: {
    fontSize: 12,
  },
});

export default SettingsScreen;

