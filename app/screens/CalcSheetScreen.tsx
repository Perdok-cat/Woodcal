import React, {useState, useRef} from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CalculationTable from 'app/components/CalculationTable';
import {sampleCalculations} from 'app/data/sampleData';
import {CalculationRecord, Record} from 'app/types';
import {useThemeColors} from 'app/hooks/useThemeColors';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {open, type QuickSQLiteConnection} from 'react-native-quick-sqlite';

type RootTabParamList = {
  'Danh sách': undefined;
  'Bảng tính': {fileId: string};
  'Cài đặt': undefined;
  'Thanh toán': {fileId: string};
};

// Mở kết nối SQLite dùng react-native-quick-sqlite (tương thích RN 0.82)
const db: QuickSQLiteConnection = open({name: 'mydb.db'});

type CalcSheetProb = RouteProp<RootTabParamList, 'Bảng tính'>;

function getTableName(fileId: string) {
  return `record_${fileId}`;
}

function createTable(fileId: string) {
  const tableName = getTableName(fileId);
  // dùng execSync với câu lệnh SQL thẳng.
  db.execute(
    `CREATE TABLE IF NOT EXISTS ${tableName} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round INTEGER,
      length REAL,
      headHundreds REAL,
      head789 REAL,
      head56 REAL,
      head4 REAL,
      head3 REAL,
      note TEXT
    );`,
  );
  
  // Migration: Thêm các cột nếu chưa tồn tại (cho bảng đã tạo trước đó)
  migrateTable(fileId);
}

function migrateTable(fileId: string) {
  const tableName = getTableName(fileId);
  
  // Kiểm tra xem bảng có tồn tại không
  try {
    const checkTable = db.execute(
      `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      [tableName]
    );
    const tableExists = Array.isArray(checkTable?.rows) 
      ? checkTable.rows.length > 0
      : (checkTable?.rows?._array?.length ?? 0) > 0;
    
    if (!tableExists) {
      return; // Bảng chưa tồn tại, sẽ được tạo mới bởi createTable
    }
    
    // Kiểm tra schema hiện tại của bảng
    const result = db.execute(`PRAGMA table_info(${tableName})`);
    const columns = Array.isArray(result?.rows) 
      ? result.rows 
      : (result?.rows?._array ?? []);
    
    const columnNames = columns.map((col: any) => 
      (col.name || '').toLowerCase()
    );
    
    // Thêm các cột còn thiếu (bỏ qua lỗi nếu cột đã tồn tại)
    const columnsToAdd = [
      {name: 'head56', type: 'REAL DEFAULT 0'},
      {name: 'head4', type: 'REAL DEFAULT 0'},
      {name: 'head3', type: 'REAL DEFAULT 0'},
      {name: 'head789', type: 'REAL DEFAULT 0'},
      {name: 'headHundreds', type: 'REAL DEFAULT 0'},
    ];
    
    columnsToAdd.forEach(col => {
      if (!columnNames.includes(col.name.toLowerCase())) {
        try {
          db.execute(`ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}`);
        } catch (error) {
          // Bỏ qua lỗi nếu cột đã tồn tại hoặc có lỗi khác
          console.log(`Column ${col.name} might already exist:`, error);
        }
      }
    });
  } catch (error) {
    // Nếu có lỗi, bỏ qua (bảng sẽ được tạo mới hoặc đã có đủ cột)
    console.log('Migration error:', error);
  }
}

// Export hàm xóa table để dùng ở nơi khác
export function deleteTable(fileId: string) {
  const tableName = getTableName(fileId);
  try {
    db.execute(`DROP TABLE IF EXISTS ${tableName}`);
    console.log(`Table ${tableName} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting table ${tableName}:`, error);
  }
}

// ========== File Management Functions ==========

// Tạo table để lưu danh sách files
function createFilesTable() {
  try {
    db.execute(
      `CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        note TEXT,
        date TEXT NOT NULL
      );`,
    );
  } catch (error) {
    console.error('Error creating files table:', error);
  }
}

// Load tất cả files từ database
export function loadFiles(): Record[] {
  createFilesTable();
  try {
    const result = db.execute(`SELECT id, name, note, date FROM files ORDER BY date DESC`);
    const rows = Array.isArray(result?.rows) 
      ? result.rows 
      : (result?.rows?._array ?? []);
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name || '',
      note: row.note || '',
      date: row.date || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error loading files:', error);
    return [];
  }
}

// Lưu file vào database
export function saveFile(file: Record) {
  createFilesTable();
  try {
    db.execute(
      `INSERT OR REPLACE INTO files (id, name, note, date) VALUES (?, ?, ?, ?)`,
      [file.id, file.name, file.note, file.date],
    );
  } catch (error) {
    console.error('Error saving file:', error);
  }
}

// Xóa file khỏi database
export function deleteFile(fileId: string) {
  try {
    db.execute(`DELETE FROM files WHERE id = ?`, [fileId]);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}



function insertRecord(fileId: string, record: Omit<CalculationRecord, 'id'>) {
  const tableName = getTableName(fileId);
  const result = db.execute(
    `INSERT INTO ${tableName} (round, length, headHundreds, head789, head56, head4, head3, note)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      record.round,
      record.length,
      record.headHundreds,
      record.head789,
      record.head56,
      record.head4,
      record.head3,
      record.note,
    ],
  );

  return String(result?.insertId ?? Date.now());
}

function updateRecord(fileId: string, id: string, record: Partial<CalculationRecord>) {
  const tableName = getTableName(fileId);
  const updates: string[] = [];
  const values: any[] = [];

  if (record.round !== undefined) {
    updates.push('round = ?');
    values.push(record.round);
  }
  if (record.length !== undefined) {
    updates.push('length = ?');
    values.push(record.length);
  }
  if (record.headHundreds !== undefined) {
    updates.push('headHundreds = ?');
    values.push(record.headHundreds);
  }
  if (record.head789 !== undefined) {
    updates.push('head789 = ?');
    values.push(record.head789);
  }
  if (record.head56 !== undefined) {
    updates.push('head56 = ?');
    values.push(record.head56);
  }
  if (record.head4 !== undefined) {
    updates.push('head4 = ?');
    values.push(record.head4);
  }
  if (record.head3 !== undefined) {
    updates.push('head3 = ?');
    values.push(record.head3);
  }
  if (record.note !== undefined) {
    updates.push('note = ?');
    values.push(record.note);
  }

  if (updates.length > 0) {
    values.push(id);
    db.execute(
      `UPDATE ${tableName} SET ${updates.join(', ')} WHERE id = ?;`,
      values,
    );
  }
}

export function loadRecord(fileId: string): CalculationRecord[] {
  const tableName = getTableName(fileId);

  const result = db.execute(
    `SELECT id, round, length, headHundreds, head789, head56, head4, head3, note
     FROM ${tableName}
     `,
  );

  const rows =
    Array.isArray(result?.rows) ? result.rows : (result?.rows?._array ?? []);

  return rows.map(row => ({
    id: String(row.id),
    round: row.round,
    length: row.length,
    headHundreds: row.headHundreds,
    head789: row.head789,
    head56: row.head56,
    head4: row.head4,
    head3: row.head3,
    note: row.note ?? '',
  }));
}

function seedSampleData(fileId: string) {
  const seeded = sampleCalculations.map(sample => {
    const newId = insertRecord(fileId, {
      round: sample.round,
      length: sample.length,
      headHundreds: sample.headHundreds,
      head789: sample.head789,
      head56: sample.head56,
      head4: sample.head4,
      head3: sample.head3,
      note: sample.note,
    });
    return {...sample, id: newId};
  });
  return seeded;
}


const CalcSheetScreen = (): React.JSX.Element => {
  const route = useRoute<CalcSheetProb>();
  const navigation = useNavigation();
  const fileId = route.params?.fileId;
  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const {palette} = useThemeColors();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Nếu không có fileId, không load data
    if (!fileId) {
      setIsLoading(false);
      return;
    }
    
    // Tiếp tục với logic load data như cũ
    let isMounted = true;

    const loadData = () => {
      try {
        createTable(fileId);
        const data = loadRecord(fileId);

        if (!isMounted) return;

        if (data.length > 0) {
          setRecords(data);
        } else {
          const emptyRecord: Omit<CalculationRecord, 'id'> = {
            round: 0,
            length: 0,
            headHundreds: 0,
            head789: 0,
            head56: 0,
            head4: 0,
            head3: 0,
            note: '',
          };
          const newId = insertRecord(fileId, emptyRecord);
          setRecords([{...emptyRecord, id: newId}]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fileId]);

  const addNewRow = React.useCallback(() => {
    try {
      const nextRound = records.length + 1;
      const nextRecordData: Omit<CalculationRecord, 'id'> = {
        round: 0,
        length: 0,
        headHundreds: 0,
        head789: 0,
        head56: 0,
        head4: 0,
        head3: 0,
        note: '',
      };

      const insertedId = insertRecord(fileId, nextRecordData);
      const nextRecord: CalculationRecord = {...nextRecordData, id: insertedId};

      setRecords(prev => [...prev, nextRecord]);
      return nextRecord.id;
    } catch (error) {
      console.error('Error adding row:', error);
      return null;
    }
  }, [records.length, fileId]);

  const handleUpdateRecord = React.useCallback(
    (id: string, updates: Partial<CalculationRecord>) => {
      try {
        updateRecord(fileId, id, updates);
        setRecords(prev =>
          prev.map(record =>
            record.id === id ? {...record, ...updates} : record,
          ),
        );
      } catch (error) {
        console.error('Error updating record:', error);
      }
    },
    [fileId],
  );

  const handleCalculateAndAddRow = React.useCallback(
    (id: string, round: number, length: number) => {
      // Tính toán: vòng x vòng x dài x 8
      const calculation = round * round * length * 8;
      
      // Lấy 3 số đầu tiên: chuyển sang string, lấy 3 ký tự đầu, chuyển lại số
      const calculationStr = String(Math.floor(calculation));
      // (Code block there had errors—fix comparison and .length usage)
      let result: string = "0";
      if (calculationStr.length === 6) {
        result = calculationStr.slice(0, 2);
      } else if (calculationStr.length === 7) {
        result = calculationStr.slice(0, 3);
      } else if (calculationStr.length === 8) {
        result = calculationStr.slice(0,4)
      } else if (calculationStr.length === 5) {
        result = calculationStr.slice(0,1)
      }else {
        result = "0"
      }

      if(round >= 20 && round < 30){
        const head3 = parseInt(result, 10) || 0;
        handleUpdateRecord(id, {round, length, head3});
      } else if(round >= 40 && round < 50){
        const head4 = parseInt(result, 10) || 0;
        handleUpdateRecord(id, {round, length, head4});
      } else if(round >= 50 && round < 70) {
        const head56 = parseInt(result, 10) || 0;
        handleUpdateRecord(id, {round, length, head56});
      } else if (round >= 70 && round < 100) {
        const head789 = parseInt(result, 10)|| 0 ;
        handleUpdateRecord(id, {round, length, head789})
      }else if (round >= 100) {
        const headHundreds = parseInt(result, 10) || 0;
        handleUpdateRecord(id, {round, length, headHundreds})
      }else {
         
      }
      // Tự động thêm dòng mới
      setTimeout(() => {
        addNewRow();
      }, 300);
    },
    [handleUpdateRecord, addNewRow],
  );

  // Hiển thị thông báo nếu không có fileId
  if (!fileId) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: palette.background}]}>
        <View style={[styles.body, styles.centered]}>
          <Text style={[styles.loadingText, {color: palette.text}]}>
            Không tìm thấy file. Vui lòng chọn file từ danh sách.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: palette.background}]}>
        <View style={[styles.body, styles.centered]}>
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
      <View style={styles.body}>
        <View style={styles.compactHeader}>
          <Text style={[styles.compactTitle, {color: palette.text}]}>
            Bảng tính
          </Text>
          <TouchableOpacity
            style={[styles.payButton, {backgroundColor: palette.primary}]}
            activeOpacity={0.7}
            onPress={() => {
              (navigation as any).navigate('Thanh toán', {fileId});
            }}>
            <Text style={styles.payButtonText}>Thanh toán</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tableWrapper}>
          <CalculationTable
            records={records}
            onUpdateRecord={handleUpdateRecord}
            onCalculateAndAddRow={handleCalculateAndAddRow}
          />
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
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingVertical: 4,
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  tableWrapper: {
    flex: 1,
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  hintWrapper: {
    marginTop: 16,
  },
  hintText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});

export default CalcSheetScreen;

