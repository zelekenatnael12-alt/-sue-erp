import { useEffect, useRef } from 'react';
import { persistenceService } from '../services/persistenceService';

/**
 * Custom hook to automatically save form state to IndexedDB
 * @param draftId - Unique identifier for the draft (e.g. "new_report")
 * @param data - The form state object
 * @param enabled - Whether auto-save is active
 */
export function useAutoSave(draftId: string, data: any, enabled: boolean = true) {
  const lastSavedRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !data) return;

    // Debounce the save to every 3 seconds
    const timeout = setTimeout(async () => {
      try {
        await persistenceService.saveDraft(draftId, data);
        lastSavedRef.current = Date.now();
        console.log(`[AutoSave] Draft '${draftId}' persisted.`);
      } catch (err) {
        console.error('[AutoSave Error]', err);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, [draftId, data, enabled]);

  return { lastSaved: lastSavedRef.current };
}
