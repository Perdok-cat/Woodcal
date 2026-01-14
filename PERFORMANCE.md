# Performance Optimization Guide

## Các vấn đề đã khắc phục

### 1. **useEffect không cleanup** ⚠️
- **Vấn đề**: useEffect chạy lại nhiều lần khi component re-render, gây tải database liên tục
- **Giải pháp**: 
  - Thêm cleanup function với `isMounted` flag
  - Bọc logic load data trong try-catch
  - Thêm loading state để tránh render sớm

### 2. **Re-render không cần thiết** ⚠️
- **Vấn đề**: Component render lại toàn bộ bảng mỗi khi thêm/sửa 1 dòng
- **Giải pháp**:
  - Dùng `React.memo` cho TableRow và TableHeader
  - Dùng `useCallback` cho handleAddRow
  - Implement proper memoization comparison

### 3. **FlatList thay ScrollView** 🚀
- **Vấn đề**: ScrollView render tất cả items cùng lúc → lag với nhiều dòng
- **Giải pháp**:
  - Chuyển sang FlatList với virtualization
  - Set `initialNumToRender={10}` - chỉ render 10 dòng đầu
  - Set `windowSize={5}` - giữ 5 màn hình content trong memory
  - Set `removeClippedSubviews={true}` - xóa views ngoài viewport
  - Implement `getItemLayout` để tối ưu scroll performance

### 4. **Metro bundler optimization** 📦
- **Vấn đề**: Bundle size lớn, load chậm
- **Giải pháp**:
  - Enable `inlineRequires` - lazy load modules
  - Metro config tối ưu transform

### 5. **Gradle build optimization** 🔧
- **Vấn đề**: Build Android chậm
- **Giải pháp**:
  - Enable parallel build
  - Enable Gradle daemon
  - Enable build cache
  - Configure on demand

## Kết quả

### Trước tối ưu:
- ❌ App "đơ" khi thêm dòng mới
- ❌ Lag khi scroll bảng > 20 dòng
- ❌ useEffect chạy liên tục

### Sau tối ưu:
- ✅ Thêm dòng mượt mà
- ✅ Scroll mượt với 100+ dòng
- ✅ useEffect chỉ chạy khi cần
- ✅ Loading state rõ ràng

## Tips để tránh lag trong tương lai

1. **Luôn dùng FlatList** thay vì ScrollView cho danh sách dài
2. **Memoize components** với React.memo
3. **Dùng useCallback** cho event handlers
4. **Cleanup useEffect** đúng cách
5. **Tránh inline functions** trong render
6. **Monitor performance** với Flipper/React DevTools

## Test performance

```bash
# Xem FPS và render time
npx react-native run-android --variant=release

# Profile với Flipper
npx react-native start
# Mở Flipper > React DevTools > Profiler
```

## Monitoring

Để kiểm tra app có lag:
```bash
# Xem logcat
adb logcat | grep -E "SimpleApp|fps|choreographer"

# Xem memory usage
adb shell dumpsys meminfo com.simpleapp
```
