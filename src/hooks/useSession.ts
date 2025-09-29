import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

/**
 * Custom hook to use session context
 * 
 * Provides access to the session state and methods.
 * Must be used within a SessionProvider.
 * 
 * @returns SessionContextType
 * @throws Error if used outside SessionProvider
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};