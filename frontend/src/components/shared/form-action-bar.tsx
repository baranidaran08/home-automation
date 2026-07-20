'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FormActionBarProps {
  /** Reveal the bar only when there are unsaved changes. */
  visible: boolean;
  /** In-flight save — keeps the bar shown and disables its buttons. */
  saving?: boolean;
  onCancel: () => void;
  saveLabel?: string;
  cancelLabel?: string;
}

/**
 * Cancel / Save action bar that mounts only when a form has unsaved changes and
 * fades+slides in/out. Placed inside a `<form>`, so its Save button submits it
 * (the parent owns the actual save + reset logic). Shared by My Profile and User
 * Details so the reveal behaviour is identical. Respects reduced-motion.
 */
export function FormActionBar({
  visible,
  saving = false,
  onCancel,
  saveLabel = 'Save Changes',
  cancelLabel = 'Cancel',
}: FormActionBarProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          key="form-actions"
          initial={{ opacity: 0, height: 0, y: reduce ? 0 : -4 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: reduce ? 0 : -4 }}
          transition={{ duration: reduce ? 0 : 0.22, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              {cancelLabel}
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saveLabel}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
