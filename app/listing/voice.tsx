import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ArrowLeft,
  Mic,
  Info,
  Lightbulb,
  Pause,
  Square,
  Sparkles,
  FileText,
  Check,
  CheckCircle2,
  PenLine,
  X,
  Circle,
  AlertCircle,
  Camera,
  ArrowRight,
  ListChecks,
} from 'lucide-react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Shared data ───────────────────────────────────────────

const DETAIL_CHIPS = [
  'Building Name',
  'Property Title',
  'Chargeable Area',
  'Pricing',
  'Location',
  'Amenities',
];

const EXAMPLE_PARTS = [
  { text: '"Hi, I want to list a ', highlight: false },
  { text: '1200sq. ft', highlight: true },
  { text: ' spacious ', highlight: false },
  { text: '3BHK', highlight: true },
  { text: ' apartment in ', highlight: false },
  { text: 'Koregaon Park, Pune', highlight: true },
  { text: '. The building name is ', highlight: false },
  { text: 'Sunshine Apartments', highlight: true },
  { text: ". I'm looking for ", highlight: false },
  { text: '45 lakhs', highlight: true },
  { text: '. It has amenities like ', highlight: false },
  { text: 'gym, swimming pool, and parking', highlight: true },
  { text: '."', highlight: false },
];

const QUICK_TIPS = [
  'Speak clearly in a quiet environment',
  'Include as many details as possible for better listing',
  "Don't worry about the order — our AI will organize it",
];

const REQUIRED_FIELDS = [
  { key: 'title', label: 'Property Title & Type' },
  { key: 'category', label: 'Category (2BHK/3BHK/Commercial/Shops/Offices/Plots)' },
  { key: 'area', label: 'Chargeable Area (in Sq. ft)' },
  { key: 'location', label: 'Location (City, Locality)' },
  { key: 'building', label: 'Building Name' },
  { key: 'price', label: 'Price/Rent' },
  { key: 'amenities', label: 'Key Amenities' },
];

const BOTTOM_BAR_HEIGHT = 120;

type RecordingState = 'idle' | 'recording' | 'paused' | 'complete' | 'submitted';

// ─── Mock transcription data ───────────────────────────────

const MOCK_TRANSCRIPT =
  'Hi, I want to list a 3BHK apartment in Koregaon Park, Pune. The building name is Sunshine Apartments. It\'s around 1200 square feet. I\'m looking for 45 lakhs for this property. It has great amenities like gym, swimming pool, and dedicated parking.';

const MOCK_WORDS = MOCK_TRANSCRIPT.split(' ');

// Map word index thresholds to detected field keys
// "3BHK apartment" → title+category, "Koregaon Park, Pune" → location, etc.
const FIELD_DETECTION_AT_WORD: [number, string][] = [
  [6, 'title'],      // "...list a 3BHK"
  [7, 'category'],   // "...3BHK apartment"
  [11, 'location'],  // "...Koregaon Park, Pune."
  [17, 'building'],  // "...Sunshine Apartments."
  [21, 'area'],      // "...1200 square feet."
  [27, 'price'],     // "...45 lakhs"
  [38, 'amenities'], // "...gym, swimming pool, and dedicated parking."
];

// Mock AI-parsed values keyed by field key
const MOCK_PARSED_VALUES: Record<string, string> = {
  title: 'Spacious Apartment',
  category: '3BHK',
  area: '1200 sq.ft',
  location: 'Koregaon Park, Pune',
  building: 'Sunshine Apartments',
  price: '45 Lakhs',
  amenities: 'Gym, Swimming Pool, Dedicated Parking',
};

// Placeholder hints for each field (shown in edit sheet)
const FIELD_PLACEHOLDERS: Record<string, string> = {
  title: 'e.g., Spacious Apartment',
  category: 'e.g., 3BHK, Commercial, Shop',
  area: 'e.g., 1200 sq.ft',
  location: 'e.g., Koregaon Park, Pune',
  building: 'e.g., Sunshine Apartments',
  price: 'e.g., 45 Lakhs or 25,000/month',
  amenities: 'e.g., Gym, Pool, Parking',
};

// Parsed field values type
type ParsedFields = Record<string, string>;

// ─── Shared components ─────────────────────────────────────

function PressableButton({
  onPress,
  children,
  style,
}: {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Blinking cursor for live transcription ────────────────

function BlinkingCursor() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 400 }),
        withTiming(1, { duration: 400 }),
      ),
      -1,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[{ color: colors.primary[600], fontFamily: fontFamilies.body }, style]}>
      |
    </Animated.Text>
  );
}

// ─── Compact recording status bar ──────────────────────────

function RecordingStatusBar({ seconds, isPaused }: { seconds: number; isPaused: boolean }) {
  const dotOpacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isPaused) {
      dotOpacity.value = withTiming(0.3, { duration: 300 });
      pulseScale.value = withTiming(1, { duration: 300 });
      return;
    }
    // Blinking dot
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 600 }),
        withTiming(1, { duration: 600 }),
      ),
      -1,
    );
    // Subtle pulse on mic icon
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 }),
      ),
      -1,
      true,
    );
  }, [isPaused]);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
  }));

  const micPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <View style={rs.statusBar}>
      {/* Mic icon with pulse */}
      <Animated.View style={[rs.statusMicCircle, micPulseStyle]}>
        <Mic size={16} color={colors.white} strokeWidth={2.5} />
      </Animated.View>

      {/* Timer */}
      <Text style={rs.statusTimer}>{mins}:{secs}</Text>

      {/* Divider */}
      <View style={rs.statusDivider} />

      {/* Recording indicator */}
      <Animated.View style={[rs.statusDot, dotStyle]} />
      <Text style={rs.statusLabel}>
        {isPaused ? 'Paused' : 'Recording'}
      </Text>
    </View>
  );
}

// ─── Idle screen (screen 1) ───────────────────────────────

function IdleView({ onStartRecording }: { onStartRecording: () => void }) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* How to record card */}
        <LinearGradient
          colors={[colors.primary[700], colors.primary[900]]}
          style={s.infoCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={s.infoCardIcon}>
            <Mic size={18} color={colors.primary[200]} />
          </View>
          <View style={s.infoCardContent}>
            <Text style={s.infoCardTitle}>How to record your property</Text>
            <Text style={s.infoCardSubtitle}>
              Simply speak naturally and include these details in your voice note.
            </Text>
          </View>
        </LinearGradient>

        {/* Details to include */}
        <View style={s.sectionHeader}>
          <Info size={16} color={colors.neutral[500]} />
          <Text style={s.sectionTitle}>Details to include</Text>
        </View>

        {/* Detail chips */}
        <View style={s.chipsContainer}>
          {DETAIL_CHIPS.map((chip) => (
            <View key={chip} style={s.chip}>
              <Text style={s.chipText}>{chip}</Text>
            </View>
          ))}
        </View>

        {/* Example voice note card */}
        <View style={s.exampleCard}>
          <View style={s.exampleHeader}>
            <View style={s.exampleIconCircle}>
              <Mic size={12} color={colors.accent[600]} />
            </View>
            <Text style={s.exampleLabel}>Example voice note:</Text>
          </View>
          <Text style={s.exampleText}>
            {EXAMPLE_PARTS.map((part, i) => (
              <Text
                key={i}
                style={part.highlight ? s.exampleHighlight : undefined}
              >
                {part.text}
              </Text>
            ))}
          </Text>
        </View>

        {/* Quick Tips */}
        <View style={s.tipsCard}>
          <View style={s.tipsHeader}>
            <Lightbulb size={16} color={colors.accent[500]} />
            <Text style={s.tipsTitle}>Quick Tips</Text>
          </View>
          {QUICK_TIPS.map((tip, index) => (
            <View key={index} style={s.tipRow}>
              <View style={s.tipBullet} />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={[
          s.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <PressableButton onPress={onStartRecording} style={s.recordButtonWrapper}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={s.recordButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Mic size={20} color={colors.white} strokeWidth={2.5} />
            <Text style={s.recordButtonText}>Start Recording</Text>
          </LinearGradient>
        </PressableButton>
        <Text style={s.bottomHint}>
          Tap to start  ·  Typically takes 30–60 seconds
        </Text>
      </View>
    </>
  );
}

// ─── Recording screen (screen 2) ──────────────────────────

function RecordingView({
  recordingState,
  seconds,
  transcribedText,
  detectedFields,
  onPause,
  onResume,
  onStopSubmit,
}: {
  recordingState: 'recording' | 'paused';
  seconds: number;
  transcribedText: string;
  detectedFields: Set<string>;
  onPause: () => void;
  onResume: () => void;
  onStopSubmit: () => void;
}) {
  const insets = useSafeAreaInsets();
  const remainingCount = REQUIRED_FIELDS.length - detectedFields.size;

  return (
    <>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          rs.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Compact recording status bar */}
        <Animated.View entering={FadeIn.duration(300)}>
          <RecordingStatusBar seconds={seconds} isPaused={recordingState === 'paused'} />
        </Animated.View>

        {/* Transcribed text card */}
        <Animated.View entering={SlideInDown.duration(400).delay(100)} style={rs.card}>
          <View style={rs.cardHeader}>
            <FileText size={16} color={colors.primary[600]} />
            <Text style={rs.cardTitle}>Transcribed Text</Text>
          </View>
          <View style={rs.transcriptionBox}>
            {transcribedText ? (
              <Text style={rs.transcriptionText}>
                {transcribedText}
                {recordingState === 'recording' && <BlinkingCursor />}
              </Text>
            ) : (
              <Text style={rs.transcriptionPlaceholder}>
                Start speaking — your words will appear here...
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Speak following details card */}
        <Animated.View entering={SlideInDown.duration(400).delay(200)} style={rs.card}>
          <View style={rs.cardHeader}>
            <Sparkles size={16} color={colors.accent[500]} />
            <Text style={rs.cardTitle}>Speak Following Details</Text>
          </View>
          <View style={rs.fieldsList}>
            {REQUIRED_FIELDS.map((field) => {
              const isDetected = detectedFields.has(field.key);
              return (
                <View key={field.key} style={rs.fieldRow}>
                  <View
                    style={[
                      rs.fieldCircle,
                      isDetected && rs.fieldCircleDetected,
                    ]}
                  >
                    {isDetected && (
                      <Check size={12} color={colors.white} strokeWidth={3} />
                    )}
                  </View>
                  <Text
                    style={[
                      rs.fieldLabel,
                      isDetected && rs.fieldLabelDetected,
                    ]}
                  >
                    {field.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {remainingCount > 0 && (
            <Text style={rs.fieldsHint}>
              Keep speaking to complete remaining fields...
            </Text>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={[
          s.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <View style={rs.actionRow}>
          {/* Pause / Resume button */}
          <PressableButton
            onPress={recordingState === 'recording' ? onPause : onResume}
            style={rs.pauseButtonWrapper}
          >
            <View style={rs.pauseButton}>
              <Pause size={18} color={colors.neutral[800]} strokeWidth={2.5} />
              <Text style={rs.pauseButtonText}>
                {recordingState === 'recording' ? 'Pause' : 'Resume'}
              </Text>
            </View>
          </PressableButton>

          {/* Stop & Submit button */}
          <PressableButton onPress={onStopSubmit} style={rs.submitButtonWrapper}>
            <LinearGradient
              colors={[colors.primary[600], colors.primary[800]]}
              style={rs.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Square size={16} color={colors.white} strokeWidth={2.5} fill={colors.white} />
              <Text style={rs.submitButtonText}>Stop & Submit</Text>
            </LinearGradient>
          </PressableButton>
        </View>
        <Text style={s.bottomHint}>
          Minimum 15 seconds recommended for better results
        </Text>
      </View>
    </>
  );
}

// ─── Edit fields bottom sheet ──────────────────────────────

function EditFieldsSheet({
  visible,
  onClose,
  parsedFields,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  parsedFields: ParsedFields;
  onSave: (updated: ParsedFields) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<ParsedFields>({});

  // Sync draft with parsedFields when sheet opens
  useEffect(() => {
    if (visible) {
      setDraft({ ...parsedFields });
    }
  }, [visible]);

  const missingCount = REQUIRED_FIELDS.filter((f) => !draft[f.key]?.trim()).length;
  const sheetTitle = missingCount > 0 ? 'Complete Missing Fields' : 'Edit Property Details';
  const sheetSubtitle = missingCount > 0
    ? `${missingCount} field${missingCount > 1 ? 's' : ''} remaining`
    : `${REQUIRED_FIELDS.length} fields captured`;

  const handleUpdateField = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSave(draft);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={es.backdrop} onPress={onClose}>
        <View />
      </Pressable>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={es.sheetWrapper}
      >
        <View style={[es.sheet, { paddingBottom: insets.bottom + 16 }]}>
          {/* Handle */}
          <View style={es.handleContainer}>
            <View style={es.handle} />
          </View>

          {/* Header */}
          <View style={es.sheetHeader}>
            <View>
              <Text style={es.sheetTitle}>{sheetTitle}</Text>
              <Text style={es.sheetSubtitle}>{sheetSubtitle}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12} style={es.closeButton}>
              <X size={20} color={colors.neutral[600]} />
            </Pressable>
          </View>

          {/* Fields list */}
          <ScrollView
            style={es.fieldsScroll}
            contentContainerStyle={es.fieldsContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {REQUIRED_FIELDS.map((field) => {
              const value = draft[field.key] || '';
              const isFilled = value.trim().length > 0;
              return (
                <View key={field.key} style={es.fieldGroup}>
                  <Text style={es.fieldLabel}>{field.label}</Text>
                  <TextInput
                    style={[es.fieldInput, isFilled && es.fieldInputFilled]}
                    value={value}
                    onChangeText={(text) => handleUpdateField(field.key, text)}
                    placeholder={FIELD_PLACEHOLDERS[field.key] || `Enter ${field.label}`}
                    placeholderTextColor={colors.neutral[400]}
                    autoCorrect={false}
                  />
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom actions */}
          <View style={es.sheetActions}>
            <PressableButton onPress={onClose} style={es.cancelBtnWrapper}>
              <View style={es.cancelBtn}>
                <Text style={es.cancelBtnText}>Cancel</Text>
              </View>
            </PressableButton>
            <PressableButton onPress={handleConfirm} style={es.confirmBtnWrapper}>
              <LinearGradient
                colors={[colors.primary[600], colors.primary[800]]}
                style={es.confirmBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={es.confirmBtnText}>Confirm & Add</Text>
              </LinearGradient>
            </PressableButton>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Complete screen (screen 3) ────────────────────────────

function CompleteView({
  transcribedText,
  seconds,
  parsedFields,
  onRecordAgain,
  onConfirm,
  onUpdateFields,
}: {
  transcribedText: string;
  seconds: number;
  parsedFields: ParsedFields;
  onRecordAgain: () => void;
  onConfirm: () => void;
  onUpdateFields: (updated: ParsedFields) => void;
}) {
  const insets = useSafeAreaInsets();
  const [editSheetVisible, setEditSheetVisible] = useState(false);

  const capturedFields = REQUIRED_FIELDS.filter((f) => parsedFields[f.key]?.trim());
  const missingFields = REQUIRED_FIELDS.filter((f) => !parsedFields[f.key]?.trim());
  const totalFields = REQUIRED_FIELDS.length;
  const capturedCount = capturedFields.length;
  const percentage = Math.round((capturedCount / totalFields) * 100);

  const mins = Math.floor(seconds / 60).toString();
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          cs.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success banner */}
        <Animated.View entering={FadeIn.duration(400)} style={cs.successBanner}>
          <View style={cs.successIconCircle}>
            <Check size={20} color={colors.white} strokeWidth={3} />
          </View>
          <View style={cs.successContent}>
            <Text style={cs.successTitle}>Recording Complete!</Text>
            <Text style={cs.successDuration}>Duration: {mins}:{secs}</Text>
          </View>
          <View style={cs.progressSection}>
            <Text style={cs.progressLabel}>Fields Captured</Text>
            <View style={cs.progressRow}>
              <Text style={cs.progressPercent}>{percentage}%</Text>
              <View style={cs.progressBarBg}>
                <View style={[cs.progressBarFill, { width: `${percentage}%` }]} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Missing fields warning banner */}
        {missingFields.length > 0 && (
          <Animated.View entering={FadeIn.duration(400).delay(100)}>
            <Pressable
              style={cs.warningBanner}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditSheetVisible(true);
              }}
            >
              <View style={cs.warningIconCircle}>
                <AlertCircle size={18} color={colors.warning} />
              </View>
              <View style={cs.warningContent}>
                <Text style={cs.warningTitle}>
                  {missingFields.length} field{missingFields.length > 1 ? 's' : ''} missing
                </Text>
                <Text style={cs.warningSubtitle}>
                  {missingFields.map((f) => f.label.split(' (')[0]).join(', ')}
                </Text>
              </View>
              <View style={cs.warningCta}>
                <Text style={cs.warningCtaText}>Complete</Text>
              </View>
            </Pressable>
          </Animated.View>
        )}

        {/* Transcribed text card */}
        <Animated.View entering={SlideInDown.duration(400).delay(missingFields.length > 0 ? 200 : 100)} style={cs.card}>
          <View style={cs.cardHeader}>
            <FileText size={16} color={colors.primary[600]} />
            <Text style={cs.cardTitle}>Transcribed Text</Text>
          </View>
          <Text style={cs.transcriptText}>"{transcribedText}"</Text>
        </Animated.View>

        {/* Captured property details */}
        <Animated.View entering={SlideInDown.duration(400).delay(missingFields.length > 0 ? 300 : 200)} style={cs.card}>
          <View style={cs.cardHeaderRow}>
            <View style={cs.cardHeader}>
              <Sparkles size={16} color={colors.accent[500]} />
              <Text style={cs.cardTitle}>Captured Property Details</Text>
            </View>
            <Pressable
              style={cs.editButton}
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditSheetVisible(true);
              }}
            >
              <PenLine size={14} color={colors.primary[600]} />
              <Text style={cs.editButtonText}>Edit</Text>
            </Pressable>
          </View>

          <View style={cs.fieldsList}>
            {/* Captured fields */}
            {capturedFields.map((field, index) => (
              <Animated.View
                key={field.key}
                entering={SlideInDown.duration(300).delay(300 + index * 60)}
                style={cs.fieldCard}
              >
                <View style={cs.fieldLabelRow}>
                  <CheckCircle2
                    size={16}
                    color={colors.success}
                    strokeWidth={2.5}
                    fill={colors.success}
                  />
                  <Text style={cs.fieldLabel}>{field.label}</Text>
                </View>
                <Text style={cs.fieldValue}>{parsedFields[field.key]}</Text>
              </Animated.View>
            ))}

            {/* Missing fields */}
            {missingFields.map((field, index) => (
              <Animated.View
                key={field.key}
                entering={SlideInDown.duration(300).delay(300 + (capturedCount + index) * 60)}
                style={cs.missingFieldCard}
              >
                <View style={cs.missingFieldRow}>
                  <View style={cs.missingFieldLeft}>
                    <Circle size={16} color={colors.neutral[300]} strokeWidth={1.5} />
                    <View>
                      <Text style={cs.missingFieldLabel}>{field.label}</Text>
                      <Text style={cs.missingFieldHint}>Not captured</Text>
                    </View>
                  </View>
                  <Pressable
                    style={cs.addButton}
                    hitSlop={8}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setEditSheetVisible(true);
                    }}
                  >
                    <PenLine size={12} color={colors.primary[600]} />
                    <Text style={cs.addButtonText}>Add</Text>
                  </Pressable>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          s.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <View style={cs.actionRow}>
          <PressableButton onPress={onRecordAgain} style={cs.secondaryBtnWrapper}>
            <View style={cs.secondaryBtn}>
              <Mic size={16} color={colors.neutral[800]} strokeWidth={2.5} />
              <Text style={cs.secondaryBtnText}>Record Again</Text>
            </View>
          </PressableButton>
          <PressableButton onPress={onConfirm} style={cs.primaryBtnWrapper}>
            <LinearGradient
              colors={[colors.primary[600], colors.primary[800]]}
              style={cs.primaryBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Check size={16} color={colors.white} strokeWidth={2.5} />
              <Text style={cs.primaryBtnText}>Confirm & Continue</Text>
            </LinearGradient>
          </PressableButton>
        </View>
        <Text style={s.bottomHint}>
          Review your transcription or record again for better accuracy
        </Text>
      </View>

      {/* Edit fields sheet */}
      <EditFieldsSheet
        visible={editSheetVisible}
        onClose={() => setEditSheetVisible(false)}
        parsedFields={parsedFields}
        onSave={onUpdateFields}
      />
    </>
  );
}

// ─── Submitted screen (screen 4) ────────────────────────────

function AnimatedCheckIcon() {
  const scale = useSharedValue(0);
  const rotation = useSharedValue(-90);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180, mass: 0.8 });
    rotation.value = withSpring(0, { damping: 14, stiffness: 160 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[ss.heroIconCircle, animStyle]}>
      <CheckCircle2 size={32} color={colors.primary[600]} strokeWidth={2.5} />
    </Animated.View>
  );
}

function SubmittedView({ onDone }: { onDone: () => void }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <>
      <ScrollView
        style={s.scrollView}
        contentContainerStyle={[
          ss.scrollContent,
          { paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero success card */}
        <Animated.View entering={FadeIn.duration(500)}>
          <LinearGradient
            colors={[colors.primary[600], colors.primary[900]]}
            style={ss.heroCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <AnimatedCheckIcon />
            <Text style={ss.heroTitle}>Recording Submitted!</Text>
            <Text style={ss.heroSubtitle}>
              Your property listing is being processed by our AI. We'll notify you once it's live in hours!
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Boost section */}
        <Animated.View entering={FadeIn.duration(400).delay(200)}>
          <Text style={ss.boostTitle}>Boost Your Listing</Text>
          <Text style={ss.boostSubtitle}>Add more details to get more enquiries</Text>
        </Animated.View>

        {/* Add Photos card */}
        <Animated.View entering={SlideInDown.duration(400).delay(300)} style={ss.boostCard}>
          <View style={ss.boostCardTop}>
            <View style={ss.boostIconCircle}>
              <Camera size={20} color={colors.primary[600]} />
            </View>
            <View style={ss.boostCardContent}>
              <View style={ss.boostCardTitleRow}>
                <Text style={ss.boostCardTitle}>Add Photos / Videos</Text>
                <View style={ss.boostBadge}>
                  <Text style={ss.boostBadgeText}>+500% views</Text>
                </View>
              </View>
              <Text style={ss.boostCardDesc}>
                Properties with photos get 5x more views
              </Text>
            </View>
          </View>
          <View style={ss.boostCardActions}>
            <Pressable
              style={ss.boostLinkBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/listing/preview');
              }}
            >
              <Text style={ss.boostLinkTextAccent}>Upload Later</Text>
              <ArrowRight size={14} color={colors.accent[500]} />
            </Pressable>
            <Pressable
              style={ss.boostLinkBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/listing/upload-photos');
              }}
            >
              <Text style={ss.boostLinkText}>Add Now</Text>
              <ArrowRight size={14} color={colors.primary[600]} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Add Amenities card */}
        <Animated.View entering={SlideInDown.duration(400).delay(400)} style={ss.boostCard}>
          <View style={ss.boostCardTop}>
            <View style={[ss.boostIconCircle, { backgroundColor: colors.accent[50] }]}>
              <ListChecks size={20} color={colors.accent[500]} />
            </View>
            <View style={ss.boostCardContent}>
              <Text style={ss.boostCardTitle}>Add Detailed Amenities</Text>
              <Text style={ss.boostCardDesc}>
                Complete listings rank higher in search
              </Text>
            </View>
          </View>
          <View style={ss.boostCardActions}>
            <Pressable
              style={ss.boostLinkBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/listing/amenities');
              }}
            >
              <Text style={ss.boostLinkText}>Add Now</Text>
              <ArrowRight size={14} color={colors.primary[600]} />
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={[
          s.bottomBar,
          { paddingBottom: Math.max(insets.bottom, 16) + 8 },
        ]}
      >
        <PressableButton
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/listing/preview');
          }}
          style={ss.doneBtnWrapper}
        >
          <LinearGradient
            colors={[colors.primary[600], colors.primary[800]]}
            style={ss.doneBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={ss.doneBtnText}>Upload & Proceed</Text>
          </LinearGradient>
        </PressableButton>
        <Text style={s.bottomHint}>
          We'll notify you when your listing is live in few hours
        </Text>
      </View>
    </>
  );
}

// ─── Main screen ───────────────────────────────────────────

export default function VoiceListingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [transcribedText, setTranscribedText] = useState('');
  const [detectedFields, setDetectedFields] = useState<Set<string>>(new Set());
  const [parsedFields, setParsedFields] = useState<ParsedFields>({});
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordIndexRef = useRef(0);
  const transcriptRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer — ticks every second
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Mock transcription — adds a word every ~300ms while recording
  useEffect(() => {
    if (recordingState === 'recording') {
      transcriptRef.current = setInterval(() => {
        const idx = wordIndexRef.current;
        if (idx >= MOCK_WORDS.length) {
          if (transcriptRef.current) clearInterval(transcriptRef.current);
          return;
        }
        wordIndexRef.current = idx + 1;

        // Build text from words up to current index
        const text = MOCK_WORDS.slice(0, idx + 1).join(' ');
        setTranscribedText(text);

        // Check if we've hit a field detection threshold
        for (const [wordIdx, fieldKey] of FIELD_DETECTION_AT_WORD) {
          if (idx + 1 === wordIdx) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDetectedFields((prev) => new Set([...prev, fieldKey]));
          }
        }
      }, 300);
    } else if (transcriptRef.current) {
      clearInterval(transcriptRef.current);
      transcriptRef.current = null;
    }
    return () => {
      if (transcriptRef.current) clearInterval(transcriptRef.current);
    };
  }, [recordingState]);

  const handleStartRecording = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    wordIndexRef.current = 0;
    setTranscribedText('');
    setDetectedFields(new Set());
    setParsedFields({});
    setSeconds(0);
    setRecordingState('recording');
  }, []);

  const handlePause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecordingState('paused');
  }, []);

  const handleResume = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRecordingState('recording');
  }, []);

  const handleStopSubmit = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Build parsed fields from whatever was detected so far
    const detected = new Set(detectedFields);
    const parsed: ParsedFields = {};
    for (const key of detected) {
      if (MOCK_PARSED_VALUES[key]) {
        parsed[key] = MOCK_PARSED_VALUES[key];
      }
    }
    setParsedFields(parsed);
    setRecordingState('complete');
  }, [detectedFields]);

  const handleRecordAgain = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    wordIndexRef.current = 0;
    setTranscribedText('');
    setDetectedFields(new Set());
    setParsedFields({});
    setSeconds(0);
    setRecordingState('recording');
  }, []);

  const handleConfirm = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRecordingState('submitted');
  }, []);

  const handleDone = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  }, [router]);

  const isRecording = recordingState === 'recording' || recordingState === 'paused';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <Pressable
          onPress={() => {
            if (recordingState === 'submitted') {
              setRecordingState('complete');
              return;
            }
            if (recordingState === 'complete') {
              setRecordingState('idle');
              return;
            }
            if (isRecording) {
              // TODO: confirm discard dialog
              setRecordingState('idle');
              return;
            }
            router.back();
          }}
          hitSlop={12}
          style={s.backButton}
        >
          <ArrowLeft size={22} color={colors.neutral[800]} strokeWidth={2} />
        </Pressable>
        <Text style={s.headerTitle}>List Your Property By Voice</Text>
        <View style={{ width: 36 }} />
      </View>

      {recordingState === 'submitted' ? (
        <SubmittedView onDone={handleDone} />
      ) : recordingState === 'complete' ? (
        <CompleteView
          transcribedText={transcribedText}
          seconds={seconds}
          parsedFields={parsedFields}
          onRecordAgain={handleRecordAgain}
          onConfirm={handleConfirm}
          onUpdateFields={setParsedFields}
        />
      ) : isRecording ? (
        <RecordingView
          recordingState={recordingState}
          seconds={seconds}
          transcribedText={transcribedText}
          detectedFields={detectedFields}
          onPause={handlePause}
          onResume={handleResume}
          onStopSubmit={handleStopSubmit}
        />
      ) : (
        <IdleView onStartRecording={handleStartRecording} />
      )}
    </View>
  );
}

// ─── Idle screen styles ────────────────────────────────────

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 20,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    marginBottom: 4,
  },
  infoCardSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: 'rgba(255,255,255,0.75)',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[800],
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: -8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  chipText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[700],
  },

  // Example card
  exampleCard: {
    backgroundColor: colors.accent[50],
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  exampleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accent[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  exampleLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  exampleText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  exampleHighlight: {
    fontFamily: fontFamilies.bodyMedium,
    color: colors.primary[700],
    backgroundColor: colors.primary[50],
    fontStyle: 'italic',
  },

  // Tips
  tipsCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  tipsTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[800],
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.neutral[400],
    marginTop: 7,
  },
  tipText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[600],
  },

  // Bottom bar (shared between idle and recording)
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  recordButtonWrapper: {
    alignSelf: 'stretch',
  },
  recordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    borderRadius: 14,
  },
  recordButtonText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
  bottomHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    marginTop: 10,
  },
});

// ─── Recording screen styles ───────────────────────────────

const rs = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Compact status bar
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  statusMicCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.accent[500],
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statusTimer: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.xl,
    lineHeight: lineHeights.xl,
    color: colors.neutral[900],
    letterSpacing: 0.5,
  },
  statusDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.neutral[200],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  statusLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.error,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },

  // Transcription
  transcriptionBox: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: 14,
    minHeight: 48,
    maxHeight: 120,
  },
  transcriptionText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[800],
  },
  transcriptionPlaceholder: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[400],
    fontStyle: 'italic',
  },

  // Fields checklist
  fieldsList: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldCircleDetected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[600],
  },
  fieldLabel: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
  },
  fieldLabelDetected: {
    color: colors.neutral[800],
    fontFamily: fontFamilies.bodyMedium,
    textDecorationLine: 'line-through',
    textDecorationColor: colors.neutral[400],
  },
  fieldsHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    textAlign: 'center',
    marginTop: 14,
    fontStyle: 'italic',
  },

  // Bottom action row
  actionRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  pauseButtonWrapper: {
    flex: 1,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  pauseButtonText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[800],
  },
  submitButtonWrapper: {
    flex: 1.4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  submitButtonText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
});

// ─── Complete screen styles ────────────────────────────────

const cs = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 16,
  },

  // Warning banner (missing fields)
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[50],
    borderRadius: 14,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  warningIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
  },
  warningSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[500],
    marginTop: 2,
  },
  warningCta: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.warning,
  },
  warningCtaText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.white,
  },

  // Success banner
  successBanner: {
    backgroundColor: colors.primary[50],
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  successIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successContent: {
    marginBottom: 14,
  },
  successTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
  },
  successDuration: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  progressSection: {
    borderTopWidth: 1,
    borderTopColor: colors.primary[100],
    paddingTop: 12,
  },
  progressLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[600],
    marginBottom: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressPercent: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.success,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[100],
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: colors.primary[50],
  },
  editButtonText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[600],
  },

  // Transcript
  transcriptText: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: colors.neutral[600],
    fontStyle: 'italic',
  },

  // Parsed fields
  fieldsList: {
    gap: 10,
  },
  fieldCard: {
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  fieldLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.success,
  },
  fieldValue: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[900],
    marginLeft: 22,
  },

  // Missing fields
  missingFieldCard: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderStyle: 'dashed',
    backgroundColor: colors.white,
  },
  missingFieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missingFieldLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  missingFieldLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  missingFieldHint: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.neutral[400],
    marginTop: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  addButtonText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[600],
  },

  // Bottom action row
  actionRow: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 12,
  },
  secondaryBtnWrapper: {
    flex: 1,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  secondaryBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[800],
  },
  primaryBtnWrapper: {
    flex: 1.4,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    borderRadius: 14,
  },
  primaryBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.white,
    letterSpacing: 0.3,
  },
});

// ─── Edit fields sheet styles ──────────────────────────────

const es = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '90%',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
  },
  sheetTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
  },
  sheetSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
  },
  fieldsScroll: {
    maxHeight: 400,
  },
  fieldsContent: {
    gap: 16,
    paddingBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  fieldInput: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  fieldInputFilled: {
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  cancelBtnWrapper: {
    flex: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  cancelBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[700],
  },
  confirmBtnWrapper: {
    flex: 1.4,
  },
  confirmBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
  },
  confirmBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.white,
    letterSpacing: 0.3,
  },
});

// ─── Submitted screen styles ────────────────────────────────

const ss = StyleSheet.create({
  scrollContent: {
    padding: 20,
    gap: 20,
  },

  // Hero card
  heroCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroTitle: {
    fontFamily: fontFamilies.headingExtrabold,
    fontSize: fontSizes['2xl'],
    lineHeight: lineHeights['2xl'],
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.base,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },

  // Boost section
  boostTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: fontSizes.lg,
    lineHeight: lineHeights.lg,
    color: colors.neutral[900],
  },
  boostSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 2,
  },

  // Boost cards
  boostCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  boostCardTop: {
    flexDirection: 'row',
    gap: 14,
  },
  boostIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  boostCardContent: {
    flex: 1,
  },
  boostCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  boostCardTitle: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.neutral[900],
  },
  boostBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  boostBadgeText: {
    fontFamily: fontFamilies.bodyMedium,
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    color: colors.primary[700],
  },
  boostCardDesc: {
    fontFamily: fontFamilies.body,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.neutral[500],
    marginTop: 4,
  },
  boostCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  boostLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  boostLinkText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.primary[600],
  },
  boostLinkTextAccent: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.sm,
    lineHeight: lineHeights.sm,
    color: colors.accent[500],
  },

  // Bottom CTA
  doneBtnWrapper: {
    alignSelf: 'stretch',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
  },
  doneBtnText: {
    fontFamily: fontFamilies.headingSemibold,
    fontSize: fontSizes.base,
    lineHeight: lineHeights.base,
    color: colors.white,
    letterSpacing: 0.3,
  },
});
