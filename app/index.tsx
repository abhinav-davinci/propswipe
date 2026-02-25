import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useOnboardingStore } from '../src/stores/onboardingStore';
import { LoadingSpinner } from '../src/components/feedback/LoadingSpinner';

export default function Index() {
  const { isAuthenticated, isGuest, isLoading } = useAuthStore();
  const { isComplete } = useOnboardingStore();

  if (isLoading) {
    return <LoadingSpinner message="Loading PropSwipe..." />;
  }

  // Not authenticated and not guest → show auth flow
  if (!isAuthenticated && !isGuest) {
    return <Redirect href="/(auth)/splash" />;
  }

  // Authenticated but onboarding not complete → onboarding
  if (isAuthenticated && !isComplete) {
    return <Redirect href="/(onboarding)/name" />;
  }

  // Fully onboarded OR guest → main app
  return <Redirect href="/(tabs)/discover" />;
}
