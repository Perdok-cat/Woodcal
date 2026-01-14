import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useThemeColors} from 'app/hooks/useThemeColors';
import {useNavigation} from '@react-navigation/native';
import {saveFile} from './CalcSheetScreen';
import {Record} from 'app/types';

const CreateFileScreen = (): React.JSX.Element => {
  const {palette} = useThemeColors();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({name: '', note: ''});

  const validateForm = () => {
    let isValid = true;
    const newErrors = {name: '', note: ''};

    if (name.trim() === '') {
      newErrors.name = 'Nhập tên:';
      isValid = false;
    } else if (name.trim().length < 3) {
      newErrors.name = 'Tên file phải có ít nhất 3 ký tự';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleCreate = () => {
    if (!validateForm()) {
      return;
    }

    const newFile: Record = {
      id: `${Date.now()}`,
      name: name.trim(),
      note: note.trim(),
      date: new Date().toISOString(),
    };

    // Lưu file vào database
    saveFile(newFile);

    // Navigate về màn hình danh sách
    navigation.goBack();
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: palette.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, {color: palette.text}]}>
              Khởi tạo bảng đo mới
            </Text>
            <Text style={[styles.headerSubtitle, {color: palette.subtitle}]}>
              Nhập thông tin dữ liệu khách hàng
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Tên file */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, {color: palette.text}]}>
                Tên khách hàng:  <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: errors.name ? '#e74c3c' : palette.subtitle,
                    color: palette.text,
                  },
                ]}
                value={name}
                onChangeText={text => {
                  setName(text);
                  if (errors.name) setErrors(prev => ({...prev, name: ''}));
                }}
                placeholder="Ví dụ: Ông 6"
                placeholderTextColor={palette.subtitle}
                maxLength={50}
              />
              {errors.name ? (
                <Text style={styles.errorText}>{errors.name}</Text>
              ) : null}
            </View>

            {/* Ghi chú */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, {color: palette.text}]}>
                Ghi chú <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  {
                    backgroundColor: palette.surface,
                    borderColor: errors.note ? '#e74c3c' : palette.subtitle,
                    color: palette.text,
                  },
                ]}
                value={note}
                onChangeText={text => {
                  setNote(text);
                  if (errors.note) setErrors(prev => ({...prev, note: ''}));
                }}
                placeholder="Ví dụ: Chưa trả nợ, cần theo dõi..."
                placeholderTextColor={palette.subtitle}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={200}
              />
              {errors.note ? (
                <Text style={styles.errorText}>{errors.note}</Text>
              ) : null}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                {borderColor: palette.subtitle},
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}>
              <Text style={[styles.cancelButtonText, {color: palette.text}]}>
                Hủy
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                {backgroundColor: palette.primary},
              ]}
              onPress={handleCreate}
              activeOpacity={0.7}>
              <Text style={styles.createButtonText}>Tạo mới</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
    paddingBottom: 12,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 13,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CreateFileScreen;
