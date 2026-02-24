import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WATTAGES = [500, 600, 700, 1000] as const;
type Wattage = typeof WATTAGES[number];

const PRESETS = [
  { label: 'ご飯を温める', baseWatt: 600, baseMin: 2, baseSec: 0 },
  { label: 'お肉を解凍', baseWatt: 500, baseMin: 3, baseSec: 0 },
  { label: '冷凍食品（唐揚げ等）', baseWatt: 500, baseMin: 4, baseSec: 0 },
  { label: 'お弁当を温める', baseWatt: 600, baseMin: 2, baseSec: 30 },
  { label: '牛乳を温める', baseWatt: 600, baseMin: 1, baseSec: 30 },
  { label: '冷凍ご飯を解凍', baseWatt: 600, baseMin: 3, baseSec: 0 },
  { label: '野菜を蒸す', baseWatt: 600, baseMin: 3, baseSec: 30 },
  { label: 'パンを解凍', baseWatt: 500, baseMin: 1, baseSec: 30 },
];

function convertTime(fromWatt: number, toWatt: number, seconds: number): number {
  return Math.round((fromWatt / toWatt) * seconds);
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  if (m === 0) return `${s}秒`;
  if (s === 0) return `${m}分`;
  return `${m}分${s}秒`;
}

export default function WattageConverter() {
  const [fromWatt, setFromWatt] = useState<Wattage>(600);
  const [toWatt, setToWatt] = useState<Wattage>(500);
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const totalSec = (parseInt(minutes || '0') * 60) + parseInt(seconds || '0');
    if (totalSec <= 0) return;
    setResult(convertTime(fromWatt, toWatt, totalSec));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const totalSec = preset.baseMin * 60 + preset.baseSec;
    const converted = convertTime(preset.baseWatt, toWatt, totalSec);
    setMinutes(String(preset.baseMin));
    setSeconds(String(preset.baseSec));
    setFromWatt(preset.baseWatt as Wattage);
    setResult(converted);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Ionicons name="flash" size={28} color="#FF6B35" />
        <Text style={styles.headerTitle}>電子レンジ 加熱時間変換</Text>
        <Text style={styles.headerSub}>ワット数が違っても正確な時間に換算</Text>
      </View>

      {/* Wattage Selection */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>変換元ワット数</Text>
        <View style={styles.wattRow}>
          {WATTAGES.map(w => (
            <TouchableOpacity
              key={w}
              style={[styles.wattBtn, fromWatt === w && styles.wattBtnActive]}
              onPress={() => setFromWatt(w)}
            >
              <Text style={[styles.wattBtnText, fromWatt === w && styles.wattBtnTextActive]}>
                {w}W
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.arrowRow}>
          <Ionicons name="arrow-down" size={24} color="#FF6B35" />
        </View>

        <Text style={styles.sectionTitle}>変換先ワット数</Text>
        <View style={styles.wattRow}>
          {WATTAGES.map(w => (
            <TouchableOpacity
              key={w}
              style={[styles.wattBtn, toWatt === w && styles.wattBtnActive]}
              onPress={() => setToWatt(w)}
            >
              <Text style={[styles.wattBtnText, toWatt === w && styles.wattBtnTextActive]}>
                {w}W
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Time Input */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>加熱時間を入力</Text>
        <View style={styles.timeInputRow}>
          <View style={styles.timeInputGroup}>
            <TextInput
              style={styles.timeInput}
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#555"
              maxLength={2}
            />
            <Text style={styles.timeLabel}>分</Text>
          </View>
          <View style={styles.timeInputGroup}>
            <TextInput
              style={styles.timeInput}
              value={seconds}
              onChangeText={setSeconds}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#555"
              maxLength={2}
            />
            <Text style={styles.timeLabel}>秒</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
          <Ionicons name="calculator" size={20} color="#fff" />
          <Text style={styles.calcBtnText}>変換する</Text>
        </TouchableOpacity>

        {result !== null && (
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{fromWatt}W → {toWatt}W</Text>
            <Text style={styles.resultValue}>{formatTime(result)}</Text>
          </View>
        )}
      </View>

      {/* Presets */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>よく使うプリセット</Text>
        <Text style={styles.presetNote}>タップすると現在の変換先ワット数に換算されます</Text>
        {PRESETS.map((preset, i) => (
          <TouchableOpacity key={i} style={styles.presetItem} onPress={() => applyPreset(preset)}>
            <View style={styles.presetLeft}>
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text style={styles.presetBase}>{preset.baseWatt}W: {formatTime(preset.baseMin * 60 + preset.baseSec)}</Text>
            </View>
            <View style={styles.presetRight}>
              <Text style={styles.presetWatt}>{toWatt}W</Text>
              <Text style={styles.presetConverted}>
                {formatTime(convertTime(preset.baseWatt, toWatt, preset.baseMin * 60 + preset.baseSec))}
              </Text>
            </View>
          </TouchableOpacity>
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
    borderColor: '#FF6B3533',
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
  sectionTitle: { color: '#FF6B35', fontSize: 14, fontWeight: '700', marginBottom: 12 },
  wattRow: { flexDirection: 'row', gap: 8 },
  wattBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#252535',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  wattBtnActive: { backgroundColor: '#FF6B35', borderColor: '#FF6B35' },
  wattBtnText: { color: '#888', fontWeight: '700', fontSize: 14 },
  wattBtnTextActive: { color: '#fff' },
  arrowRow: { alignItems: 'center', marginVertical: 12 },
  timeInputRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  timeInputGroup: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeInput: {
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
  timeLabel: { color: '#ccc', fontSize: 16, fontWeight: '600' },
  calcBtn: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calcBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  resultBox: {
    marginTop: 16,
    backgroundColor: '#252535',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B3566',
  },
  resultLabel: { color: '#888', fontSize: 13, marginBottom: 4 },
  resultValue: { color: '#FF6B35', fontSize: 36, fontWeight: 'bold' },
  presetNote: { color: '#666', fontSize: 12, marginBottom: 12 },
  presetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#252535',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  presetLeft: { flex: 1 },
  presetLabel: { color: '#fff', fontSize: 14, fontWeight: '600' },
  presetBase: { color: '#888', fontSize: 12, marginTop: 2 },
  presetRight: { alignItems: 'flex-end', marginLeft: 12 },
  presetWatt: { color: '#FF6B35', fontSize: 11, fontWeight: '700' },
  presetConverted: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
