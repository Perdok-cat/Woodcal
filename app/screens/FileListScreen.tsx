import React, {useState, useEffect} from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import FileCard from 'app/components/FileCard';
import SectionHeader from 'app/components/SectionHeader';
import PrimaryButton from 'app/components/PrimaryButton';
import {sampleFiles} from 'app/data/sampleData';
import {Record} from 'app/types';
import {useThemeColors} from 'app/hooks/useThemeColors';
import { NavigationProp, useNavigation, useFocusEffect} from '@react-navigation/native';
import {deleteTable, loadFiles, saveFile, deleteFile} from 'app/screens/CalcSheetScreen';

const FileListScreen = (): React.JSX.Element => {
  const [files, setFiles] = useState<Record[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {palette} = useThemeColors();

  type RootTabParamList = {
    'Danh sách': undefined;
    'Bảng tính': {fileId: string};
    'Cài đặt': undefined;
  };

  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  // Load files từ database khi component mount
  useEffect(() => {
    const loadData = () => {
      try {
        const loadedFiles = loadFiles();
        if (loadedFiles.length > 0) {
          setFiles(loadedFiles);
        } else {
          // Nếu chưa có file nào, seed sample data
          sampleFiles.forEach(file => {
            saveFile(file);
          });
          setFiles(sampleFiles);
        }
      } catch (error) {
        console.error('Error loading files:', error);
        setFiles(sampleFiles);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Reload files khi quay lại màn hình này (sau khi tạo file mới)
  useFocusEffect(
    React.useCallback(() => {
      const reloadFiles = () => {
        try {
          const loadedFiles = loadFiles();
          setFiles(loadedFiles);
        } catch (error) {
          console.error('Error reloading files:', error);
        }
      };
      reloadFiles();
    }, []),
  );

  const handleCreate = () => {
    // Navigate đến màn hình tạo file mới
    (navigation as any).navigate('Tạo file mới');
  };

  const handlePressOnCard = (file: Record) => {
    // Navigate đến tab "Bảng tính", sau đó navigate đến screen "Bảng tính Tab" trong stack
    (navigation as any).navigate('Bảng tính', {
      screen: 'Bảng tính Tab',
      params: {fileId: file.id},
    });
  };

  const handleDeleteFile = (fileId: string) => {
    // Xóa table tính toán trong database
    deleteTable(fileId);
    // Xóa file khỏi database files
    deleteFile(fileId);
    // Xóa file khỏi danh sách (tự động cập nhật UI)
    setFiles(prev => prev.filter(file => file.id !== fileId));
    setSelectedCardId(null);
  };

  const handleCardLongPress = (fileId: string) => {
    setSelectedCardId(fileId);
  };

  const handleCardPress = (file: Record) => {
    if (selectedCardId === file.id) {
      setSelectedCardId(null);
    } else {
      handlePressOnCard(file);
    }
  };


  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: palette.background}]}>
        <View style={[styles.centered, {flex: 1}]}>
          <Text style={[styles.loadingText, {color: palette.text}]}>
            Đang tải dữ liệu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: palette.background}]}>
      <View style={styles.header}>
        <SectionHeader
          title="Danh sách các bảng đo"
          action={<PrimaryButton label="Tạo mới" onPress={handleCreate} />}
        />
      </View>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={files}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <FileCard 
            file={item} 
            onPress={() => handleCardPress(item)}
            onLongPress={() => handleCardLongPress(item.id)}
            onDelete={handleDeleteFile}
            showDeleteButton={selectedCardId === item.id}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, {color: palette.text}]}>
              Chưa có ghi chú nào
            </Text>
            <Text style={[styles.emptySubtitle, {color: palette.subtitle}]}>
              Nhấn "Tạo mới" để bắt đầu
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
});

export default FileListScreen;

