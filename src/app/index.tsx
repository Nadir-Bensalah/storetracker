import { Redirect } from 'expo-router';

import { useAppSelector } from '@/store/hooks';

export default function Index() {
  const onboarded = useAppSelector((state) => state.preferences.onboardingCompleted);
  return <Redirect href={onboarded ? '/stores' : '/onboarding'} />;
}
