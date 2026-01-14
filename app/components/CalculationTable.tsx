import React, {useRef, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
} from 'react-native';
import {CalculationRecord} from 'app/types';
import {useThemeColors} from 'app/hooks/useThemeColors';

type CalculationTableProps = {
  records: CalculationRecord[];
  onUpdateRecord: (id: string, updates: Partial<CalculationRecord>) => void;
  onCalculateAndAddRow: (id: string, round: number, length: number) => void;
};

const PAGE_SIZE = 16;
const COLUMN_CONFIG = {
  round: {label: 'Vòng', width: 60},
  length: {label: 'Dài', width: 60},
  headHundreds: {label: 'Đ 100', width: 60},
  head789: {label: 'Đ 789', width: 60},
  head56: {label: 'Đ 56', width: 60},
  head4: {label: 'Đ 4', width: 60},
  head3: {label: 'Đ 3', width: 60},
  note: {label: 'Ghi chú', width: 100},
};
const columnKeys = Object.keys(COLUMN_CONFIG) as (keyof typeof COLUMN_CONFIG)[];
const NOTE_OPTIONS = ['xuống đầu', 'cong', 'xấu', 'sâu'];

const NotePicker = React.memo(
  ({
    value,
    onSelect,
    palette,
  }: {
    value: string;
    onSelect: (note: string) => void;
    palette: any;
  }) => {
    const [showModal, setShowModal] = useState(false);

    const handleSelect = (note: string) => {
      onSelect(note);
      setShowModal(false);
    };

    return (
      <>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          style={styles.noteButton}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.noteText,
              {
                color: value ? palette.text : palette.subtitle,
                fontStyle: value ? 'normal' : 'italic',
              },
            ]}>
            {value || 'Chọn...'}
          </Text>
        </TouchableOpacity>
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}>
            <View
              style={[
                styles.modalContent,
                {backgroundColor: palette.surface, borderColor: palette.subtitle},
              ]}>
              <TouchableOpacity
                onPress={() => handleSelect('')}
                style={[
                  styles.optionItem,
                  {
                    backgroundColor: !value ? palette.highlight : 'transparent',
                    borderBottomColor: palette.subtitle,
                  },
                ]}>
                <Text style={[styles.optionText, {color: palette.text}]}>
                  (Trống)
                </Text>
              </TouchableOpacity>
              {NOTE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleSelect(option)}
                  style={[
                    styles.optionItem,
                    {
                      backgroundColor:
                        value === option ? palette.highlight : 'transparent',
                      borderBottomColor: palette.subtitle,
                    },
                  ]}>
                  <Text style={[styles.optionText, {color: palette.text}]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  },
);

const TableHeader = React.memo(({palette}: {palette: any}) => (
  <View style={[styles.row, {backgroundColor: palette.highlight}]}>
    {columnKeys.map(key => (
      <View
        key={key}
        style={[
          styles.cell,
          {
            width: COLUMN_CONFIG[key].width,
            borderColor: palette.subtitle,
            justifyContent: 'center',
            alignItems: 'center',
          },
        ]}>
        <Text style={[styles.headerText, {color: palette.text}]}>
          {COLUMN_CONFIG[key].label}
        </Text>
      </View>
    ))}
  </View>
));

// Hàm xử lý tự động giảm giá trị khi có ghi chú
const handleNoteChangeWithAutoDecrease = (
  record: CalculationRecord,
  note: string,
  onUpdateRecord: (id: string, updates: Partial<CalculationRecord>) => void,
) => {
  const updates: Partial<CalculationRecord> = {note};

  // Nếu note khác trống, tự động giảm giá trị xuống một cấp
  if (note && note.trim() !== '') {
    if (record.headHundreds > 0) {
      // Đ 100 → Đ 789
      updates.headHundreds = 0;
      updates.head789 = record.headHundreds;
      updates.head56 = 0;
      updates.head4 = 0;
      updates.head3 = 0;
    } else if (record.head789 > 0) {
      // Đ 789 → Đ 56
      updates.head789 = 0;
      updates.head56 = record.head789;
      updates.head4 = 0;
      updates.head3 = 0;
    } else if (record.head56 > 0) {
      // Đ 56 → Đ 4
      updates.head56 = 0;
      updates.head4 = record.head56;
      updates.head3 = 0;
    } else if (record.head4 > 0) {
      // Đ 4 → Đ 3
      updates.head4 = 0;
      updates.head3 = record.head4;
    }
    // Nếu là Đ 3 thì bỏ qua, không xuống nữa
  }

  onUpdateRecord(record.id, updates);
};

const TableRow = React.memo(
  ({
    record,
    palette,
    onUpdateRecord,
    onCalculateAndAddRow,
  }: {
    record: CalculationRecord;
    palette: any;
    onUpdateRecord: (id: string, updates: Partial<CalculationRecord>) => void;
    onCalculateAndAddRow: (id: string, round: number, length: number) => void;
    isLastRow: boolean;
  }) => {
    const [roundValue, setRoundValue] = React.useState(
      String(record.round || ''),
    );
    const [lengthValue, setLengthValue] = React.useState(
      String(record.length || ''),
    );
    const lengthInputRef = useRef<TextInput>(null);
    const hasCalculatedRef = useRef(false);

    React.useEffect(() => {
      setRoundValue(record.round ? String(record.round) : '');
      setLengthValue(record.length ? String(record.length) : '');
      if (!record.round && !record.length) {
        hasCalculatedRef.current = false;
      }
    }, [record.round, record.length]);

    const handleRoundChange = (text: string) => {
      setRoundValue(text);
      const numValue = parseFloat(text) || 0;
      onUpdateRecord(record.id, {round: numValue});
      if (numValue === 0) {
        hasCalculatedRef.current = false;
      }
    };

    const handleLengthChange = (text: string) => {
      setLengthValue(text);
      const numValue = parseFloat(text) || 0;
      onUpdateRecord(record.id, {length: numValue});
      if (numValue === 0) {
        hasCalculatedRef.current = false;
      }
    };

    const handleLengthEndEditing = () => {
      const roundNum = parseFloat(roundValue) || 0;
      const numValue = parseFloat(lengthValue) || 0;
      if (roundNum > 0 && numValue > 0 && !hasCalculatedRef.current) {
        hasCalculatedRef.current = true;
        setTimeout(() => {
          onCalculateAndAddRow(record.id, roundNum, numValue);
        }, 30);
      }
    };

    return (
      <View style={[styles.row, {backgroundColor: palette.surface}]}>
        {columnKeys.map(key => {
          const cellWidth = COLUMN_CONFIG[key].width;
          if (key === 'round') {
            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  {width: cellWidth, borderColor: palette.subtitle},
                ]}>
                <TextInput
                  value={roundValue}
                  onChangeText={handleRoundChange}
                  style={[styles.input, {color: palette.text}]}
                  keyboardType="numeric"
                  returnKeyType="next"
                  onSubmitEditing={() => lengthInputRef.current?.focus()}
                  selectTextOnFocus
                  textAlign="center"
                  placeholder="0"
                  placeholderTextColor={palette.subtitle}
                />
              </View>
            );
          }
          if (key === 'length') {
            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  {width: cellWidth, borderColor: palette.subtitle},
                ]}>
                <TextInput
                  ref={lengthInputRef}
                  value={lengthValue}
                  onChangeText={handleLengthChange}
                  onEndEditing={handleLengthEndEditing}
                  style={[styles.input, {color: palette.text}]}
                  keyboardType="numeric"
                  returnKeyType="done"
                  selectTextOnFocus
                  textAlign="center"
                  placeholder="0"
                  placeholderTextColor={palette.subtitle}
                />
              </View>
            );
          }
          if (key === 'note') {
            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  {
                    width: cellWidth,
                    borderColor: palette.subtitle,
                    backgroundColor: palette.background,
                  },
                ]}>
                <NotePicker
                  value={record.note || ''}
                  onSelect={(note: string) =>
                    handleNoteChangeWithAutoDecrease(record, note, onUpdateRecord)
                  }
                  palette={palette}
                />
              </View>
            );
          }
          return (
            <View
              key={key}
              style={[
                styles.cell,
                {
                  width: cellWidth,
                  borderColor: palette.subtitle,
                  backgroundColor: palette.background,
                },
              ]}>
              <Text style={[styles.cellText, {color: palette.text}]}>
                {record[key as keyof CalculationRecord]}
              </Text>
            </View>
          );
        })}
      </View>
    );
  },
);

const TotalRow = React.memo(
  ({
    totals,
    palette,
  }: {
    totals: {
      headHundreds: number;
      head789: number;
      head56: number;
      head4: number;
      head3: number;
    };
    palette: any;
  }) => {
    return (
      <View
        style={[
          styles.row,
          styles.totalRow,
          {backgroundColor: palette.highlight, borderColor: palette.subtitle},
        ]}>
        {columnKeys.map(key => {
          const cellWidth = COLUMN_CONFIG[key].width;
          if (key === 'round' || key === 'length' || key === 'note') {
            return (
              <View
                key={key}
                style={[
                  styles.cell,
                  {
                    width: cellWidth,
                    borderColor: palette.subtitle,
                    backgroundColor: palette.highlight,
                  },
                ]}>
                <Text style={[styles.totalText, {color: palette.text}]}>
                  {key === 'round' ? 'Tổng' : ''}
                </Text>
              </View>
            );
          }
          const totalValue =
            key === 'headHundreds'
              ? totals.headHundreds
              : key === 'head789'
              ? totals.head789
              : key === 'head56'
              ? totals.head56
              : key === 'head4'
              ? totals.head4
              : key === 'head3'
              ? totals.head3
              : '';
          return (
            <View
              key={key}
              style={[
                styles.cell,
                {
                  width: cellWidth,
                  borderColor: palette.subtitle,
                  backgroundColor: palette.highlight,
                },
              ]}>
              <Text style={[styles.totalText, {color: palette.text}]}>
                {totalValue}
              </Text>
            </View>
          );
        })}
      </View>
    );
  },
);

const CalculationTable: React.FC<CalculationTableProps> = ({
  records,
  onUpdateRecord,
  onCalculateAndAddRow,
}) => {
  const {palette} = useThemeColors();
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const prevLengthRef = React.useRef(records.length);

  const totalPages = Math.max(1, Math.ceil(records.length / PAGE_SIZE));

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  React.useEffect(() => {
    if (records.length > prevLengthRef.current) {
      const newTotalPages = Math.max(
        1,
        Math.ceil(records.length / PAGE_SIZE),
      );
      setCurrentPage(newTotalPages);
    }
    prevLengthRef.current = records.length;
  }, [records.length]);

  const paginatedRecords = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return records.slice(startIndex, startIndex + PAGE_SIZE);
  }, [records, currentPage]);

  // Tính tổng cho các dòng trong trang hiện tại
  const totalsForCurrentPage = React.useMemo(() => {
    return {
      headHundreds: paginatedRecords.reduce((sum, r) => sum + (r.headHundreds || 0), 0),
      head789: paginatedRecords.reduce((sum, r) => sum + (r.head789 || 0), 0),
      head56: paginatedRecords.reduce((sum, r) => sum + (r.head56 || 0), 0),
      head4: paginatedRecords.reduce((sum, r) => sum + (r.head4 || 0), 0),
      head3: paginatedRecords.reduce((sum, r) => sum + (r.head3 || 0), 0),
    };
  }, [paginatedRecords]);

  React.useEffect(() => {
    if (paginatedRecords.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 400);
    }
  }, [paginatedRecords.length, currentPage]);

  return (
    <View
      style={[styles.mainContainer, {backgroundColor: palette.background}]}>
      <View style={{flex: 1}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.tableContainer}>
            <View
              style={{
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: palette.subtitle,
              }}>
              <TableHeader palette={palette} />
              <FlatList
                ref={flatListRef}
                data={paginatedRecords}
                renderItem={({item, index}) => (
                  <TableRow
                    record={item}
                    palette={palette}
                    onUpdateRecord={onUpdateRecord}
                    onCalculateAndAddRow={onCalculateAndAddRow}
                    isLastRow={index === paginatedRecords.length - 1}
                  />
                )}
                keyExtractor={item => item.id}
                initialNumToRender={15}
                windowSize={5}
                removeClippedSubviews={true}
                getItemLayout={(_data, index) => ({
                  length: 45,
                  offset: 45 * index,
                  index,
                })}
                contentContainerStyle={{paddingBottom: 20}}
                ListFooterComponent={
                  paginatedRecords.length > 0 ? (
                    <TotalRow totals={totalsForCurrentPage} palette={palette} />
                  ) : null
                }
              />
            </View>
          </View>
        </ScrollView>
      </View>

      <View
        style={[
          styles.paginationFooter,
          {borderTopColor: palette.subtitle, backgroundColor: palette.surface},
        ]}>
        <View style={styles.paginationContent}>
          <TouchableOpacity
            onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={[styles.pageButton, currentPage === 1 && {opacity: 0.4}]}>
            <Text style={[styles.pageButtonText, {color: palette.text}]}>
              Trước
            </Text>
          </TouchableOpacity>

          <Text style={[styles.pageInfoText, {color: palette.text}]}>
            Trang {currentPage}/{totalPages}
          </Text>

          <TouchableOpacity
            onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={[
              styles.pageButton,
              currentPage === totalPages && {opacity: 0.4},
            ]}>
            <Text style={[styles.pageButtonText, {color: palette.text}]}>
              Sau
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  tableContainer: {
    padding: 6,
  },
  row: {
    flexDirection: 'row',
    height: 45,
  },
  cell: {
    borderRightWidth: 1,
    borderBottomWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  cellText: {
    fontSize: 14,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: '100%',
    padding: 0,
    fontSize: 14,
    fontWeight: '500',
  },
  paginationFooter: {
    width: '100%',
    paddingVertical: 6,
    borderTopWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  paginationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pageButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pageButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pageInfoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  noteText: {
    fontSize: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    minWidth: 200,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CalculationTable;


