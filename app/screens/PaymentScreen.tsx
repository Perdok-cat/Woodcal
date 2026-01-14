import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {useThemeColors} from 'app/hooks/useThemeColors';
import {RouteProp, useRoute, useNavigation} from '@react-navigation/native';
import {loadRecord} from './CalcSheetScreen';
import {CalculationRecord} from 'app/types';

type RootTabParamList = {
  'Danh sách': undefined;
  'Bảng tính': {fileId: string};
  'Cài đặt': undefined;
  'Thanh toán': {fileId: string};
};

type PaymentScreenRouteProp = RouteProp<RootTabParamList, 'Thanh toán'>;

const PaymentScreen = (): React.JSX.Element => {
  const route = useRoute<PaymentScreenRouteProp>();
  const navigation = useNavigation();
  const {fileId} = route.params;
  const {palette} = useThemeColors();

  const [records, setRecords] = useState<CalculationRecord[]>([]);
  const [prices, setPrices] = useState({
    headHundreds: '',
    head789: '',
    head56: '',
    head4: '',
    head3: '',
  });

  // Tính tổng các đầu từ records
  const totals = {
    headHundreds: records.reduce((sum, r) => sum + (r.headHundreds || 0), 0),
    head789: records.reduce((sum, r) => sum + (r.head789 || 0), 0),
    head56: records.reduce((sum, r) => sum + (r.head56 || 0), 0),
    head4: records.reduce((sum, r) => sum + (r.head4 || 0), 0),
    head3: records.reduce((sum, r) => sum + (r.head3 || 0), 0),
  };

  // Tính kết quả (tổng x giá)
  const results = {
    headHundreds: totals.headHundreds * (parseFloat(prices.headHundreds) || 0),
    head789: totals.head789 * (parseFloat(prices.head789) || 0),
    head56: totals.head56 * (parseFloat(prices.head56) || 0),
    head4: totals.head4 * (parseFloat(prices.head4) || 0),
    head3: totals.head3 * (parseFloat(prices.head3) || 0),
  };

  // Tổng cuối cùng
  const grandTotal =
    results.headHundreds +
    results.head789 +
    results.head56 +
    results.head4 +
    results.head3;

  useEffect(() => {
    const loadData = () => {
      try {
        const data = loadRecord(fileId);
        setRecords(data);
      } catch (error) {
        console.error('Error loading records:', error);
      }
    };
    loadData();
  }, [fileId]);

  const handlePriceChange = (field: keyof typeof prices, value: string) => {
    setPrices(prev => ({...prev, [field]: value}));
  };

  const renderRow = (
    label: string,
    total: number,
    priceKey: keyof typeof prices,
  ) => {
    const price = prices[priceKey];
    const result = results[priceKey];

    return (
      <View key={priceKey} style={styles.row}>
        <Text style={[styles.label, {color: palette.text}]}>{label}:</Text>
        <View style={styles.inputContainer}>
          <View style={[styles.inputBox, {borderColor: palette.subtitle}]}>
            <Text style={[styles.inputText, {color: '#000000'}]}>
              {total}
            </Text>
          </View>
          <Text style={[styles.operator, {color: palette.text}]}>x</Text>
          <TextInput
            style={[
              styles.inputBox,
              styles.inputEditable,
              {borderColor: palette.subtitle, color: '#000000'},
            ]}
            value={price}
            onChangeText={value => handlePriceChange(priceKey, value)}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.subtitle}
          />
          <Text style={[styles.operator, {color: palette.text}]}>=</Text>
          <View style={[styles.inputBox, {borderColor: palette.subtitle}]}>
            <Text style={[styles.inputText, {color: "#000000"}]}>
              {result.toFixed(0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: palette.background}]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, {color: palette.text}]}>
          Thanh toán
        </Text>
      </View>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}>
        {renderRow('Đầu 100', totals.headHundreds, 'headHundreds')}
        {renderRow('Đầu 789', totals.head789, 'head789')}
        {renderRow('Đầu 56', totals.head56, 'head56')}
        {renderRow('Đầu 4', totals.head4, 'head4')}
        {renderRow('Đầu 3', totals.head3, 'head3')}

        <View style={[styles.divider, {backgroundColor: palette.subtitle}]} />

        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, {color: palette.text}]}>
            Tổng :
          </Text>
          <View style={[styles.totalInputBox, {borderColor: palette.subtitle}]}>
            <Text style={[styles.totalText, {color: "#000000"}]}>
              {grandTotal.toFixed(0)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
    color: "#FF5733"
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputBox: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  inputEditable: {
    backgroundColor: '#f9f9f9',
  },
  inputText: {
    fontSize: 14,
    fontWeight: '500',
  },
  operator: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 4,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    width: 80,
  },
  totalInputBox: {
    flex: 1,
    height: 50,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  totalText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default PaymentScreen;

