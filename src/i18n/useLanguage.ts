import { useAppSelector } from '@/store/hooks';

import { localeTags } from './resources';

export function useLocaleTag() {
  return localeTags[useAppSelector((state) => state.preferences.language)];
}
