import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {Record} from 'app/types';
import {useThemeColors} from 'app/hooks/useThemeColors';
import {formatRelativeDate} from 'app/utils/date';


type FileCardProps = {
  file: Record;
  onPress: any;
  onLongPress?: () => void;
  onDelete?: (fileId: string) => void;
  showDeleteButton?: boolean;
};

const FileCard: React.FC<FileCardProps> = ({
  file,
  onPress,
  onLongPress,
  onDelete,
  showDeleteButton = false,
}) => {
  const {palette} = useThemeColors();

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id);
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View style={[styles.container, {backgroundColor: palette.surface}]}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: palette.text}]}>{file.name}</Text>
          {showDeleteButton ? (
            <TouchableOpacity
              onPress={handleDelete}
              style={[styles.deleteButton, {backgroundColor: '#ff4444'}]}
            >
              <Text style={styles.deleteButtonText}>Xóa</Text>
            </TouchableOpacity>
          ) : (
            <Text style={[styles.size, {color: palette.subtitle}]}>{file.name}</Text>
          )}
        </View>
        <Text style={[styles.description, {color: palette.subtitle}]}>
          {file.note}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.meta, {color: palette.subtitle}]}>
            Cập nhật: {formatRelativeDate(file.date)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 4},
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    paddingRight: 16,
  },
  size: {
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  meta: {
    fontSize: 12,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'flex-end',
    maxWidth: '50%',
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  deleteButton: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FileCard;

