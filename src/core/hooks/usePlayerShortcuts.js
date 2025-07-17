import { useCallback } from 'react';
import useKeyboardShortcuts from './useKeyboardShortcuts';
import { usePlayer } from '../context/PlayerProvider';

const usePlayerShortcuts = ({ enabled = true } = {}) => {
  const {
    play
  } = usePlayer();

  // Simple toggle play matching original behavior
  const handleTogglePlay = useCallback(() => {
    play();
  }, [play]);

  const shortcuts = useKeyboardShortcuts({
    onTogglePlay: handleTogglePlay,
    enabled
  });

  return {
    ...shortcuts,
    handleTogglePlay
  };
};

export default usePlayerShortcuts;