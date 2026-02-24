import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// 1 tsp = 5ml, 1 tbsp = 15ml (3 tsp)
const TSP_ML = 5;
const TBSP_ML = 15;

type Unit = 'tsp' | 'tbsp' | 'ml';

const UNIT_LABELS: Record<Unit, string> = {
  tsp: '小さじ (tsp)',
  tbsp: '大さじ (tbsp)',
  ml: 'ml',
};

function toMl(value: number, unit: Unit): number {
  if (unit === 'tsp') return value * TSP_ML;
  if (unit === 'tbsp') return value * TBSP_ML;
  return value;
}

function fromMl(ml: number, unit: Unit): number {
  if (unit === 'tsp') return ml / TSP_ML;
  if (unit === 'tbsp') return ml / TBSP_ML;
  return ml;
}

function formatNum(n: number): string {
  if (Number.isInteger(n)) return String(n);
  const r = Math.round(n * 100) / 100;
  return String(r);
}

// Ingredient gram data: [name, grams per tsp, grams per tbsp]
const INGREDIENTS = [
  { name: '塩', perTsp: 6, perTbsp: 18 },
  { name: '砂糖（上白糖）', perTsp: 3, perTbsp: 9 },
  { name: '砂糖（グラニュー糖）', perTsp: 4, perTbsp: 12 },
  { name: '醤油', perTsp: 6, perTbsp: 18 },
  { name: '味噌', perTsp: 6, perTbsp: 18 },
  { name: '酢', perTsp: 5, perTbsp: 15 },
  { name: 'みりん', perTsp: 6, perTbsp: 18 },
  { name: '酒', perTsp: 5, perTbsp: 15 },
  { name: '小麦粉', perTsp: 3, perTbsp: 9 },
  { name: 'かたくり粉', perTsp: 3, perTbsp: 9 },
  { name: 'サラダ油', perTsp: 4, perTbsp: 12 },
  { name: 'バター', perTsp: 4, perTbsp: 12 },
  { name: 'マヨネーズ', perTsp: 4, perTbsp: 12 },
  { name: 'ケチャップ', perTsp: 5, perTbsp: 15 },
  { name: 'ごま', perTsp: 3, perTbsp: 9 },
  { name: 'ベーキングパウダー', perTsp: 4, perTbsp: 12 },
];

export default function MeasurementConverter() {
  const [fromUnit, setFromUnit] = useState<Unit>('tsp');
  const [toUnit, setToUnit] = useState<Unit>('tbsp');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const v = parseFloat(inputValue);
    if (isNaN(v) || v <= 0) return;
    const ml = toMl(v, fromUnit);
    setResult(fromMl(ml, toUnit));
  };

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setResult(null);
    setInputValue('');
  };

  const UNITS: Unit[] = ['tsp', 'tbsp', 'ml'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerCard}>
        <Ionicons name="restaurant" size={28} color="#4ECDC4" />
        <Text style={styles.headerTitle}>計量スプーン変換</Text>
        <Text style={styles.headerSub}>小さじ・大さじ・ml を相互変換</Text>
      </View>

      {/* Converter */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>変換元の単位</Text>
        <View style={styles.unitRow}>
          {UNITS.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, fromUnit === u && styles.unitBtnActive]}
              onPress={() => setFromUnit(u)}
            >
              <Text style={[styles.unitBtnText, fromUnit === u && styles.unitBtnTextActive]}>
                {u === 'tsp' ? '小さじ' : u === 'tbsp' ? '大さじ' : 'ml'}
              </Text>
              <Text style={[styles.unitBtnSub, fromUnit === u && styles.unitBtnTextActive]}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.swapBtn} onPress={swap}>
          <Ionicons name="swap-vertical" size={20} color="#4ECDC4" />
          <Text style={styles.swapText}>入れ替え</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>変換先の単位</Text>
        <View style={styles.unitRow}>
          {UNITS.map(u => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, toUnit === u && styles.unitBtnActive]}
              onPress={() => setToUnit(u)}
            >
              <Text style={[styles.unitBtnText, toUnit === u && styles.unitBtnTextActive]}>
                {u === 'tsp' ? '小さじ' : u === 'tbsp' ? '大さじ' : 'ml'}
              </Text>
              <Text style={[styles.unitBtnSub, toUnit === u && styles.unitBtnTextActive]}>
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>数量を入力</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.numInput}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="decimal-pad"
            placeholder="例: 1.5"
            placeholderTextColor="#555"
          />
          <Text style={styles.unitLabel}>{UNIT_LABELS[fromUnit]}</Text>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
          <Ionicons name="swap-horizontal" size={20} color="#fff" />
          <Text style={styles.calcBtnText}>変換する</Text>
        </TouchableOpacity>

        {result !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{UNIT_LABELS[fromUnit]} → {UNIT_LABELS[toUnit]}</Text>
            <Text style={styles.resultValue}>{formatNum(result)}</Text>
            <Text style={styles.resultUnit}>{UNIT_LABELS[toUnit]}</Text>
          </View>
        )}
      </View>

      {/* Reference */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>単位の目安</Text>
        <View style={styles.refGrid}>
          <View style={styles.refItem}>
            <Text style={styles.refUnit}>小さじ1 (1 tsp)</Text>
            <Text style={styles.refValue}>= 5ml</Text>
          </View>
          <View style={styles.refItem}>
            <Text style={styles.refUnit}>大さじ1 (1 tbsp)</Text>
            <Text style={styles.refValue}>= 15ml = 小さじ3</Text>
          </View>
        </View>
      </View>

      {/* Ingredient Presets */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>食材別 グラム換算</Text>
        <Text style={styles.presetNote}>一般的な食材の重量目安（g）</Text>
        <View style={styles.ingredientHeader}>
          <Text style={[styles.ingCol, { flex: 2 }]}>食材</Text>
          <Text style={styles.ingCol}>小さじ1</Text>
          <Text style={styles.ingCol}>大さじ1</Text>
        </View>
        {INGREDIENTS.map((ing, i) => (
          <View key={i} style={[styles.ingredientRow, i % 2 === 0 && styles.ingredientRowAlt]}>
            <Text style={[styles.ingName, { flex: 2 }]}>{ing.name}</Text>
            <Text style={styles.ingGram}>{ing.perTsp}g</Text>
            <Text style={styles.ingGram}>{ing.perTbsp}g</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4ECDC433',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  headerSub: { color: '#888', fontSize: 13, marginTop: 4 },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  sectionTitle: { color: '#4ECDC4', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  unitRow: { flexDirection: 'row', gap: 8 },
  unitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#252535',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  unitBtnActive: { backgroundColor: '#4ECDC4', borderColor: '#4ECDC4' },
  unitBtnText: { color: '#ccc', fontWeight: '700', fontSize: 13 },
  unitBtnSub: { color: '#888', fontSize: 11, marginTop: 2 },
  unitBtnTextActive: { color: '#0F0F1A' },
  swapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 12,
    paddingVertical: 8,
    backgroundColor: '#252535',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4ECDC433',
  },
  swapText: { color: '#4ECDC4', fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  numInput: {
    flex: 1,
    backgroundColor: '#252535',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333',
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 12,
  },
  unitLabel: { color: '#ccc', fontSize: 14, fontWeight: '600' },
  calcBtn: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calcBtnText: { color: '#0F0F1A', fontSize: 16, fontWeight: 'bold' },
  resultBox: {
    marginTop: 16,
    backgroundColor: '#252535',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4ECDC466',
  },
  resultLabel: { color: '#888', fontSize: 13, marginBottom: 4 },
  resultValue: { color: '#4ECDC4', fontSize: 40, fontWeight: 'bold' },
  resultUnit: { color: '#ccc', fontSize: 14, marginTop: 4 },
  refGrid: { flexDirection: 'row', gap: 8 },
  refItem: {
    flex: 1,
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  refUnit: { color: '#4ECDC4', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  refValue: { color: '#ccc', fontSize: 12, marginTop: 4, textAlign: 'center' },
  presetNote: { color: '#666', fontSize: 12, marginBottom: 12 },
  ingredientHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#252535',
    borderRadius: 6,
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
  },
  ingredientRowAlt: { backgroundColor: '#1E1E30' },
  ingCol: { flex: 1, color: '#4ECDC4', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  ingName: { color: '#ccc', fontSize: 13 },
  ingGram: { flex: 1, color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' },
});
