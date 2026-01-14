/**
 * Simple React Native App
 * Ứng dụng Android đơn giản
 *
 * @format
 */

import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from 'app/navigation/AppNavigator';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <AppNavigator />
    </SafeAreaProvider>
  );
};

export default App;
