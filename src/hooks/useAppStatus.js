import { useContext } from 'react';
import { AppStatusContext } from '../components/AppStatusProvider.jsx';

export function useAppStatus() {
  const ctx = useContext(AppStatusContext);
  if (!ctx) {
    throw new Error('useAppStatus must be used within an AppStatusProvider');
  }
  return ctx;
}
