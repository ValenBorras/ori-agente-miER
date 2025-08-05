import { useEffect, useCallback } from "react";

interface UseKeyboardShortcutsOptions {
  onMuteToggle?: () => void;
  onSpacePress?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions = {},
) {
  const { onMuteToggle, onSpacePress, enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Prevent default behavior for these keys
      const preventDefaultKeys = [" ", "m", "M"];

      if (preventDefaultKeys.includes(event.key)) {
        event.preventDefault();
      }

      // Mute/Unmute with 'M' key
      if ((event.key === "m" || event.key === "M") && onMuteToggle) {
        onMuteToggle();
      }

      // Space bar for additional action (like push-to-talk)
      if (event.key === " " && onSpacePress) {
        onSpacePress();
      }
    },
    [enabled, onMuteToggle, onSpacePress],
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}
