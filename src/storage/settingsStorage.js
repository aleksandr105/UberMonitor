import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'user_settings_v2';

const defaultSettings = {
  minPrice: '',
  minPricePerKm: '',
  blockedCities: [],
  minClientRating: '',
  cityExcludes: [],
};

export const saveSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Ошибка при сохранении настроек', e);
  }
};

export const loadSettings = async () => {
  try {
    const s = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!s) return defaultSettings;
    const parsed = JSON.parse(s);
    parsed.blockedCities = parsed.blockedCities || [];
    parsed.cityExcludes = parsed.cityExcludes || [];
    return parsed;
  } catch (e) {
    console.error('Ошибка при загрузке настроек', e);
    return defaultSettings;
  }
};

export const resetSettings = async () => {
  try {
    await AsyncStorage.removeItem(SETTINGS_KEY);
  } catch (e) {
    console.error('Ошибка при сбросе настроек', e);
  }
};
