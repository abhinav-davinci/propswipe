import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User, Settings, ChevronRight, Flame, Target, Award,
  Compass, Heart, Eye, BookOpen, Fingerprint, Radar,
  Swords, LogOut, Pencil, RefreshCw, Building2, Clock,
  CheckCircle2, MoreHorizontal, MapPin, Image as ImageIcon,
  Film, Play, TrendingUp,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/stores/authStore';
import { useOnboardingStore } from '../../src/stores/onboardingStore';
import { useProfileStore } from '../../src/stores/profileStore';
import { usePropertyStore } from '../../src/stores/propertyStore';
import { Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { fontFamilies, fontSizes, lineHeights } from '../../src/theme/typography';
import { formatCurrency } from '../../src/utils/formatCurrency';
import type { JourneyStage } from '../../src/types/user';

// ─── Mock listings data ─────────────────────────────────────

const MOCK_MY_LISTINGS = [
  {
    id: '1',
    title: 'Spacious 3BHK Apartment',
    location: 'Koregaon Park, Pune',
    price: '45L',
    status: 'under_review' as const,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&q=70',
    postedAt: '2 hours ago',
    videoStatus: 'ready' as 'none' | 'generating' | 'ready',
  },
];

const journeyStageLabels: Record<JourneyStage, { label: string; emoji: string }> = {
  explorer: { label: 'Explorer', emoji: '🔍' },
  hunter: { label: 'Active Hunter', emoji: '🎯' },
  shortlister: { label: 'Shortlister', emoji: '📋' },
  negotiator: { label: 'Negotiator', emoji: '🤝' },
  nester: { label: 'Nester', emoji: '🏡' },
};

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <View className="flex-1 bg-white rounded-xl p-3 items-center shadow-sm"
      style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
      <View className="w-8 h-8 rounded-full bg-neutral-50 items-center justify-center mb-1">
        {icon}
      </View>
      <Text className="text-xl font-heading-extrabold text-neutral-900">{value}</Text>
      <Text className="text-[11px] font-body text-neutral-500">{label}</Text>
    </View>
  );
}

function MenuRow({ icon, label, onPress, trailing }: {
  icon: React.ReactNode; label: string; onPress: () => void; trailing?: React.ReactNode;
}) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center py-3.5 px-4">
      <View className="w-8 h-8 rounded-lg bg-primary-50 items-center justify-center mr-3">
        {icon}
      </View>
      <Text className="flex-1 text-base font-body-medium text-neutral-700">{label}</Text>
      {trailing ?? <ChevronRight size={18} color={colors.neutral[400]} />}
    </Pressable>
  );
}

const statusConfig = {
  under_review: { label: 'Under Review', color: colors.accent[500], bg: colors.accent[50], icon: Clock },
  live: { label: 'Live', color: colors.success, bg: '#E8F5E9', icon: CheckCircle2 },
  draft: { label: 'Draft', color: colors.neutral[500], bg: colors.neutral[100], icon: Pencil },
} as const;

const videoStatusConfig = {
  none: null,
  generating: { label: 'Video Generating...', color: colors.accent[600], bg: colors.accent[50], icon: Film },
  ready: { label: 'Video Ready', color: colors.primary[600], bg: colors.primary[50], icon: Play },
} as const;

function MyListingCard({ listing, onPress, onVideoPress }: {
  listing: typeof MOCK_MY_LISTINGS[0];
  onPress: () => void;
  onVideoPress?: () => void;
}) {
  const statusInfo = statusConfig[listing.status];
  const StatusIcon = statusInfo.icon;
  const videoInfo = videoStatusConfig[listing.videoStatus];

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: colors.white,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.neutral[100],
        shadowColor: '#094E4C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row' }}>
        {/* Thumbnail */}
        {listing.image ? (
          <Image
            source={{ uri: listing.image }}
            style={{ width: 100, height: 100 }}
          />
        ) : (
          <View style={{
            width: 100,
            height: 100,
            backgroundColor: colors.neutral[50],
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ImageIcon size={24} color={colors.neutral[300]} />
          </View>
        )}

        {/* Details */}
        <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
          <View>
            <Text style={{
              fontFamily: fontFamilies.heading,
              fontSize: fontSizes.sm,
              lineHeight: lineHeights.sm,
              color: colors.neutral[900],
              marginBottom: 4,
            }}>
              {listing.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} color={colors.neutral[400]} />
              <Text style={{
                fontFamily: fontFamilies.body,
                fontSize: fontSizes.xs,
                lineHeight: lineHeights.xs,
                color: colors.neutral[500],
              }}>
                {listing.location}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{
              fontFamily: fontFamilies.headingSemibold,
              fontSize: fontSizes.sm,
              lineHeight: lineHeights.sm,
              color: colors.neutral[900],
            }}>
              {'\u20B9'}{listing.price}
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              backgroundColor: statusInfo.bg,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 8,
            }}>
              <StatusIcon size={11} color={statusInfo.color} />
              <Text style={{
                fontFamily: fontFamilies.bodyMedium,
                fontSize: 10,
                color: statusInfo.color,
              }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Video status bar */}
      {videoInfo && (
        <Pressable
          onPress={onVideoPress}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderTopWidth: 1,
            borderTopColor: colors.neutral[100],
            backgroundColor: videoInfo.bg,
          }}
        >
          <videoInfo.icon size={14} color={videoInfo.color} />
          <Text style={{
            flex: 1,
            fontFamily: fontFamilies.bodyMedium,
            fontSize: fontSizes.xs,
            lineHeight: lineHeights.xs,
            color: videoInfo.color,
          }}>
            {videoInfo.label}
          </Text>
          {listing.videoStatus === 'ready' && (
            <Text style={{
              fontFamily: fontFamilies.headingSemibold,
              fontSize: fontSizes.xs,
              color: colors.primary[600],
            }}>
              View →
            </Text>
          )}
        </Pressable>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isGuest, signOut } = useAuthStore();
  const { name, selectedAreas, transactionType, propertyType, budgetMin, budgetMax } = useOnboardingStore();
  const { journeyStage, visitStreak, stats } = useProfileStore();
  const { savedProperties } = usePropertyStore();

  const stage = journeyStageLabels[journeyStage];
  const displayName = name || user?.name || 'Guest User';

  const budgetLabel = transactionType === 'rent'
    ? `${formatCurrency(budgetMin)} - ${formatCurrency(budgetMax)}/mo`
    : `${formatCurrency(budgetMin)} - ${formatCurrency(budgetMax)}`;

  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-neutral-50" style={{ paddingLeft: insets.left, paddingRight: insets.right }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* ─── Header Gradient ─── */}
        <LinearGradient colors={['#094E4C', '#147A78']} style={{ paddingTop: insets.top + 16, paddingHorizontal: 16, paddingBottom: 20 }}>
          {/* Top row */}
          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-xl font-heading-extrabold text-white">Profile</Text>
            <Pressable
              onPress={() => router.push('/settings/')}
              className="w-9 h-9 rounded-full bg-white/10 items-center justify-center"
            >
              <Settings size={18} color="white" />
            </Pressable>
          </View>

          {/* User info */}
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-white/15 items-center justify-center mr-3"
              style={{ borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' }}>
              <User size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-heading-extrabold text-white">{displayName}</Text>
              {isGuest && (
                <Text className="text-sm font-body text-white/50">Guest Mode</Text>
              )}
              {isAuthenticated && user?.phone && (
                <Text className="text-sm font-body text-white/50">+91 {user.phone}</Text>
              )}
            </View>
          </View>

          {/* Journey Stage */}
          <View className="mt-4 bg-white/10 rounded-xl p-3 flex-row items-center"
            style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <Text className="text-xl mr-2.5">{stage.emoji}</Text>
            <View className="flex-1">
              <Text className="text-[10px] font-heading-semibold text-white/50 uppercase tracking-wider">Journey Stage</Text>
              <Text className="text-base font-heading-semibold text-white">{stage.label}</Text>
            </View>
            <View className="flex-row items-center bg-white/10 rounded-lg px-2.5 py-1.5"
              style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Flame size={15} color="#F7B84E" />
              <Text className="text-sm font-heading-semibold text-white ml-1">
                {visitStreak.currentStreak}d
              </Text>
            </View>
          </View>

          {/* ─── Stats Grid (inside gradient, no overlap) ─── */}
          <View className="flex-row gap-2.5 mt-4">
            <StatCard
              icon={<Compass size={16} color={colors.primary[600]} />}
              value={stats.totalSwipes}
              label="Swipes"
            />
            <StatCard
              icon={<Heart size={16} color={colors.success} />}
              value={savedProperties.length}
              label="Saved"
            />
            <StatCard
              icon={<Eye size={16} color={colors.accent[500]} />}
              value={stats.propertiesViewed}
              label="Viewed"
            />
            <StatCard
              icon={<BookOpen size={16} color={colors.info} />}
              value={stats.insightsRead}
              label="Read"
            />
          </View>
        </LinearGradient>

        {/* ─── Preferences Summary ─── */}
        {(propertyType || selectedAreas.length > 0) && (
          <View className="mx-4 mt-4 mb-4 bg-white rounded-xl p-4 shadow-sm"
            style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-heading-semibold text-neutral-900">Your Preferences</Text>
              <Pressable
                onPress={() => router.push('/settings/edit-preferences')}
                className="flex-row items-center bg-primary-50 rounded-lg px-2.5 py-1.5"
              >
                <Pencil size={13} color={colors.primary[600]} />
                <Text className="text-xs font-heading-semibold text-primary-600 ml-1">Edit</Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap gap-1.5">
              {propertyType && (
                <View className="bg-primary-50 rounded-md px-2.5 py-1">
                  <Text className="text-xs font-body-medium text-primary-700 capitalize">{propertyType}</Text>
                </View>
              )}
              {transactionType && (
                <View className="bg-accent-50 rounded-md px-2.5 py-1">
                  <Text className="text-xs font-body-medium text-accent-700 capitalize">{transactionType}</Text>
                </View>
              )}
              {selectedAreas.slice(0, 4).map((area) => (
                <View key={area} className="bg-neutral-100 rounded-md px-2.5 py-1">
                  <Text className="text-xs font-body text-neutral-600">{area}</Text>
                </View>
              ))}
              {selectedAreas.length > 4 && (
                <View className="bg-neutral-100 rounded-md px-2.5 py-1">
                  <Text className="text-xs font-body text-neutral-500">+{selectedAreas.length - 4} more</Text>
                </View>
              )}
            </View>
            {budgetMin > 0 && (
              <View className="mt-2.5 pt-2.5" style={{ borderTopWidth: 1, borderTopColor: '#F0F2F2' }}>
                <Text className="text-xs font-body text-neutral-500">
                  Budget: <Text className="font-body-medium text-neutral-700">{budgetLabel}</Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── My Listings ─── */}
        {MOCK_MY_LISTINGS.length > 0 && (
          <View className="mx-4 mt-4 mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Building2 size={18} color={colors.primary[600]} />
                <Text className="text-sm font-heading-semibold text-neutral-900">My Listings</Text>
              </View>
              <Pressable
                onPress={() => {}}
                className="flex-row items-center"
              >
                <Text className="text-xs font-body-medium text-primary-600">View All</Text>
                <ChevronRight size={14} color={colors.primary[600]} />
              </Pressable>
            </View>
            <View style={{ gap: 10 }}>
              {MOCK_MY_LISTINGS.map((listing) => (
                <MyListingCard
                  key={listing.id}
                  listing={listing}
                  onPress={() => {}}
                  onVideoPress={listing.videoStatus === 'ready' ? () => router.push(`/listing/videos?listingId=${listing.id}`) : undefined}
                />
              ))}
            </View>
          </View>
        )}

        {/* ─── Reset Preferences ─── */}
        <Pressable
          onPress={() => router.push('/settings/edit-preferences')}
          className="mx-4 mb-4 bg-white rounded-xl p-4 flex-row items-center shadow-sm"
          style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}
        >
          <View className="w-10 h-10 rounded-xl bg-accent-50 items-center justify-center mr-3">
            <RefreshCw size={20} color={colors.accent[500]} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-heading-semibold text-neutral-800">Reset Preferences</Text>
            <Text className="text-xs font-body text-neutral-500 mt-0.5">Change location, budget & property type</Text>
          </View>
          <ChevronRight size={18} color={colors.neutral[400]} />
        </Pressable>

        {/* ─── Feature Menu ─── */}
        <View className="mx-4 bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
          style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
          <MenuRow icon={<TrendingUp size={18} color={colors.primary[600]} />} label="Market Insights" onPress={() => router.push('/(tabs)/insights')} />
          <View className="h-px bg-neutral-100 ml-14" />
          <MenuRow icon={<Fingerprint size={18} color={colors.primary[600]} />} label="Personality Profile" onPress={() => router.push('/personality/')} />
          <View className="h-px bg-neutral-100 ml-14" />
          <MenuRow icon={<Award size={18} color={colors.accent[500]} />} label="Achievements" onPress={() => {}} />
          <View className="h-px bg-neutral-100 ml-14" />
          <MenuRow icon={<Radar size={18} color={colors.primary[600]} />} label="Deal Radar" onPress={() => router.push('/deal-radar/')} />
          <View className="h-px bg-neutral-100 ml-14" />
          <MenuRow icon={<Swords size={18} color={colors.accent[500]} />} label="Property Duel" onPress={() => router.push('/duel/')} />
        </View>

        {/* ─── Settings ─── */}
        <View className="mx-4 bg-white rounded-xl mb-4 shadow-sm overflow-hidden"
          style={{ shadowColor: '#094E4C', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
          <MenuRow icon={<Settings size={18} color={colors.neutral[600]} />} label="Settings & Preferences" onPress={() => router.push('/settings/')} />
        </View>

        {/* ─── Sign out / Sign in ─── */}
        <View className="mx-4 mt-2 mb-4">
          {isAuthenticated ? (
            <Pressable
              onPress={() => {
                signOut();
                router.replace('/(auth)/sign-in');
              }}
              className="flex-row items-center justify-center py-3"
            >
              <LogOut size={18} color={colors.error} />
              <Text className="text-base font-body-medium text-error ml-2">Sign Out</Text>
            </Pressable>
          ) : isGuest ? (
            <Pressable
              onPress={() => router.replace('/(auth)/sign-in')}
              className="bg-primary-600 rounded-xl py-3.5 items-center"
            >
              <Text className="text-base font-heading-semibold text-white">Sign In for Full Access</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
