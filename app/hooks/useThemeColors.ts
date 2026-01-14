import {useColorScheme} from 'react-native';
import {darkTheme, lightTheme, ThemeColors} from 'app/theme/colors';

type ThemeState = {
  isDarkMode: boolean;
  palette: ThemeColors;
};

export const useThemeColors = (): ThemeState => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return {
    isDarkMode,
    palette: isDarkMode ? darkTheme : lightTheme,
  };
};

