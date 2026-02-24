import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const MINUTES_LIST = Array.from({ length: 31 }, (_, i) => i); // 0〜30分
const SECONDS_LIST = [0, 10, 15, 20, 30, 40, 45, 50];

const ITEM_HEIGHT = 52;

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

// ─── Picker column ───────────────────────────────────────────────
function PickerColumn({
  items,
  selected,
  onSelect,
  label,
  renderLabel,
}: {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
  renderLabel: (v: number) => string;
}) {
  const ref = useRef<FlatList>(null);
  const selectedIdx = items.indexOf(selected);

  return (
    <View style={picker.col}>
      <Text style={picker.colLabel}>{label}</Text>
      <View style={picker.listWrap}>
        {/* 選択中ハイライト */}
        <View style={picker.highlight} pointerEvents="none" />
        <FlatList
          ref={ref}
          data={items}
          keyExtractor={(v) => String(v)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          initialScrollIndex={selectedIdx >= 0 ? selectedIdx : 0}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          ListHeaderComponent={<View style={{ height: ITEM_HEIGHT }} />}
          ListFooterComponent={<View style={{ height: ITEM_HEIGHT }} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[picker.item, item === selected && picker.itemSelected]}
              onPress={() => {
                onSelect(item);
                const idx = items.indexOf(item);
                ref.current?.scrollToIndex({ index: idx, animated: true });
              }}
            >
              <Text style={[picker.itemText, item === selected && picker.itemTextSelected]}>
                {renderLabel(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────
export default function WattageConverter() {
  const [fromWatt, setFromWatt] = useState<Wattage>(600);
  const [toWatt, setToWatt] = useState<Wattage>(500);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [manualMin, setManualMin] = useState('');
  const [manualSec, setManualSec] = useState('');
  const [result, setResult] = useState<number | null>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [tempMin, setTempMin] = useState(0);
  const [tempSec, setTempSec] = useState(0);
  const [useManual, setUseManual] = useState(false);

  const openPicker = () => {
    setTempMin(minutes);
    setTempSec(seconds);
    setPickerVisible(true);
  };

  const confirmPicker = () => {
    setMinutes(tempMin);
    setSeconds(tempSec);
    setManualMin(String(tempMin));
    setManualSec(String(tempSec));
    setPickerVisible(false);
  };

  const getEffectiveTime = () => {
    if (useManual) {
      return (parseInt(manualMin || '0') * 60) + parseInt(manualSec || '0');
    }
    return minutes * 60 + seconds;
  };

  const calculate = () => {
    const totalSec = getEffectiveTime();
    if (totalSec <= 0) return;
    setResult(convertTime(fromWatt, toWatt, totalSec));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    const converted = convertTime(preset.baseWatt, toWatt, preset.baseMin * 60 + preset.baseSec);
    setMinutes(preset.baseMin);
    setSeconds(preset.baseSec);
    setManualMin(String(preset.baseMin));
    setManualSec(String(preset.baseSec));
    setFromWatt(preset.baseWatt as Wattage);
    setResult(converted);
  };

  const displayTime = useManual
    ? `${manualMin || '0'}分 ${manualSec || '0'}秒`
    : `${minutes}分 ${seconds}秒`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

      {/* Header */}
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

      {/* Time Input Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>加熱時間を入力</Text>

        {/* ダイヤル表示ボタン */}
        <TouchableOpacity style={styles.timeDisplay} onPress={openPicker}>
          <View style={styles.timeDisplayInner}>
            <View style={styles.timeBlock}>
              <Text style={styles.timeDigit}>{useManual ? (manualMin || '0') : String(minutes)}</Text>
              <Text style={styles.timeUnit}>分</Text>
            </View>
            <Text style={styles.timeSep}>:</Text>
            <View style={styles.timeBlock}>
              <Text style={styles.timeDigit}>{useManual ? (manualSec || '0') : String(seconds)}</Text>
              <Text style={styles.timeUnit}>秒</Text>
            </View>
          </View>
          <Ionicons name="chevron-down-circle-outline" size={22} color="#FF6B35" />
        </TouchableOpacity>

        {/* 手入力トグル */}
        <TouchableOpacity style={styles.toggleBtn} onPress={() => setUseManual(!useManual)}>
          <Ionicons name={useManual ? 'keypad' : 'create-outline'} size={15} color="#FF6B35" />
          <Text style={styles.toggleText}>{useManual ? 'ダイヤル入力に戻す' : '直接入力する'}</Text>
        </TouchableOpacity>

        {/* 手入力フィールド */}
        {useManual && (
          <View style={styles.manualRow}>
            <View style={styles.manualGroup}>
              <TextInput
                style={styles.manualInput}
                value={manualMin}
                onChangeText={setManualMin}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#555"
                maxLength={2}
              />
              <Text style={styles.manualLabel}>分</Text>
            </View>
            <View style={styles.manualGroup}>
              <TextInput
                style={styles.manualInput}
                value={manualSec}
                onChangeText={setManualSec}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#555"
                maxLength={2}
              />
              <Text style={styles.manualLabel}>秒</Text>
            </View>
          </View>
        )}

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

      {/* ─── Picker Modal ─── */}
      <Modal visible={pickerVisible} transparent animationType="slide">
        <View style={picker.backdrop}>
          <View style={picker.sheet}>
            <View style={picker.sheetHeader}>
              <Text style={picker.sheetTitle}>加熱時間を選択</Text>
            </View>
            <View style={picker.body}>
              <PickerColumn
                items={MINUTES_LIST}
                selected={tempMin}
                onSelect={setTempMin}
                label="分"
                renderLabel={(v) => `${v}分`}
              />
              <PickerColumn
                items={SECONDS_LIST}
                selected={tempSec}
                onSelect={setTempSec}
                label="秒"
                renderLabel={(v) => `${v}秒`}
              />
            </View>
            <View style={picker.actions}>
              <TouchableOpacity style={picker.cancelBtn} onPress={() => setPickerVisible(false)}>
                <Text style={picker.cancelText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity style={picker.confirmBtn} onPress={confirmPicker}>
                <Text style={picker.confirmText}>決定</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginTop: 8, textAlign: 'center' },
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
  // Time display button
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#252535',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B3566',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 10,
  },
  timeDisplayInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBlock: { alignItems: 'center' },
  timeDigit: { color: '#fff', fontSize: 32, fontWeight: 'bold', minWidth: 44, textAlign: 'center' },
  timeUnit: { color: '#888', fontSize: 12, marginTop: 2 },
  timeSep: { color: '#FF6B35', fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  // toggle
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#1E1E30',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B3533',
  },
  toggleText: { color: '#FF6B35', fontSize: 12 },
  // manual input
  manualRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  manualGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#252535',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
  },
  manualLabel: { color: '#ccc', fontSize: 16, fontWeight: '600' },
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

const picker = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A3E',
    alignItems: 'center',
  },
  sheetTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  body: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  col: { flex: 1, alignItems: 'center' },
  colLabel: { color: '#FF6B35', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  listWrap: {
    height: ITEM_HEIGHT * 3,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#FF6B3520',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B3566',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  itemSelected: {},
  itemText: { color: '#666', fontSize: 20, fontWeight: '600' },
  itemTextSelected: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#252535',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  cancelText: { color: '#888', fontSize: 16, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
