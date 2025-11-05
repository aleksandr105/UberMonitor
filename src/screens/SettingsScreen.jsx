import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { loadSettings, saveSettings } from '../storage/settingsStorage';

// простая генерация id без uuid
const generateId = () => Date.now().toString() + Math.floor(Math.random() * 1000);

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    minPrice: '',
    minPricePerKm: '',
    blockedCities: [],
    minClientRating: '',
    cityExcludes: [],
  });

  const [blockedCitiesInput, setBlockedCitiesInput] = useState('');
  const [cityName, setCityName] = useState('');
  const [streetsInput, setStreetsInput] = useState('');

  useEffect(() => {
    (async () => {
      const s = await loadSettings();
      setSettings(s);
      setBlockedCitiesInput((s.blockedCities || []).join(', '));
    })();
  }, []);

  const handleSave = async () => {
    const bc = blockedCitiesInput
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    const newSettings = { ...settings, blockedCities: bc };
    await saveSettings(newSettings);
    setSettings(newSettings);
    Alert.alert('✅ Настройки сохранены');
  };

  const addCityExclude = () => {
    const city = cityName.trim();
    const streets = streetsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!city) {
      Alert.alert('Ошибка', 'Введите название города');
      return;
    }

    const newItem = {
      id: generateId(),
      city,
      streets,
    };

    const newList = [newItem, ...settings.cityExcludes];
    const newSettings = { ...settings, cityExcludes: newList };
    setSettings(newSettings);
    setCityName('');
    setStreetsInput('');
  };

  const removeCityExclude = (id) => {
    const newList = settings.cityExcludes.filter((it) => it.id !== id);
    setSettings({ ...settings, cityExcludes: newList });
  };

  const renderCityItem = ({ item }) => (
    <View style={styles.cityItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cityTitle}>{item.city}</Text>
        <Text style={styles.cityStreets}>{item.streets.join(', ')}</Text>
      </View>
      <TouchableOpacity
        style={[styles.smallBtn, { backgroundColor: '#c33' }]}
        onPress={() => removeCityExclude(item.id)}
      >
        <Text style={{ color: '#fff' }}>Удалить</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Минимальная цена:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={settings.minPrice}
          onChangeText={(v) => setSettings({ ...settings, minPrice: v })}
          placeholder="Например, 10"
        />

        <Text style={styles.label}>Минимальная цена за км:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={settings.minPricePerKm}
          onChangeText={(v) => setSettings({ ...settings, minPricePerKm: v })}
          placeholder="Например, 2.5"
        />

        <Text style={styles.label}>Минимальный рейтинг клиента:</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={settings.minClientRating}
          onChangeText={(v) => setSettings({ ...settings, minClientRating: v })}
          placeholder="Например, 4.7"
        />

        <Text style={styles.label}>Блокированные города (через запятую):</Text>
        <TextInput
          style={styles.input}
          value={blockedCitiesInput}
          onChangeText={setBlockedCitiesInput}
          placeholder="Пример: Krakow, Warszawa"
        />

        <View style={styles.separator} />

        <Text style={[styles.label, { fontWeight: '700' }]}>
          Исключённые улицы по городам
        </Text>
        <Text style={styles.help}>
          Добавь город и улицы через запятую — они будут исключены.
        </Text>

        <TextInput
          style={styles.input}
          value={cityName}
          onChangeText={setCityName}
          placeholder="Название города"
        />
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={streetsInput}
          onChangeText={setStreetsInput}
          placeholder="Улицы через запятую"
        />
        <View style={{ marginBottom: 10 }}>
          <Button title="Добавить" onPress={addCityExclude} />
        </View>

        {settings.cityExcludes.length === 0 ? (
          <Text style={{ color: '#666', marginBottom: 12 }}>Список пуст</Text>
        ) : (
          <FlatList
            data={settings.cityExcludes}
            keyExtractor={(i) => i.id}
            renderItem={renderCityItem}
          />
        )}

        <View style={styles.buttonContainer}>
          <Button title="💾 Сохранить настройки" onPress={handleSave} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 15, marginBottom: 6, color: '#222' },
  help: { color: '#666', fontSize: 13, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  separator: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  buttonContainer: { marginTop: 10 },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
  },
  cityTitle: { fontWeight: '700', fontSize: 16 },
  cityStreets: { color: '#555', marginTop: 4 },
  smallBtn: {
    backgroundColor: '#2a9d8f',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
});
