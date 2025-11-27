import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_USER_ROLE, USER_ROLES } from '../constants/roles';

const ROLE_STORAGE_KEY = 'vendibook.currentRole';

const readStoredRole = () => {
  if (typeof window === 'undefined') return DEFAULT_USER_ROLE;
  try {
    const stored = window.localStorage.getItem(ROLE_STORAGE_KEY);
    const normalized = stored?.toUpperCase();
    if (normalized && Object.values(USER_ROLES).includes(normalized)) {
      return normalized;
    }
  } catch (error) {
    console.warn('Unable to read stored role', error);
  }
  return DEFAULT_USER_ROLE;
};

/**
 * TODO replace local role state with server side user roles once auth and user profiles are wired.
 */
export const useCurrentRole = () => {
  const [currentRole, setRoleState] = useState(() => readStoredRole());

  const setCurrentRole = useCallback((nextRole) => {
    const normalized = (nextRole || '').toUpperCase();
    const safeRole = Object.values(USER_ROLES).includes(normalized) ? normalized : DEFAULT_USER_ROLE;
    setRoleState(safeRole);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(ROLE_STORAGE_KEY, safeRole);
      } catch (error) {
        console.warn('Unable to persist role', error);
      }
    }
  }, []);

  const helpers = useMemo(() => ({
    isHost: currentRole === USER_ROLES.HOST,
    isEventPro: currentRole === USER_ROLES.EVENT_PRO,
    isSeller: currentRole === USER_ROLES.SELLER,
    isVendorOrganizer: currentRole === USER_ROLES.VENDOR_ORGANIZER
  }), [currentRole]);

  return {
    currentRole,
    setCurrentRole,
    roles: USER_ROLES,
    ...helpers
  };
};
