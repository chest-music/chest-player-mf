import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = ({ 
  onTogglePlay, 
  enabled = true 
}) => {
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Solo manejar la barra espaciadora si no estamos en un input o textarea
    if (event.keyCode === 32 && 
        event.target.tagName !== 'INPUT' && 
        event.target.tagName !== 'TEXTAREA') {
      event.preventDefault();  
      onTogglePlay();
    }
  }, [enabled, onTogglePlay]);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);

  return {
    handleKeyDown
  };
};

export default useKeyboardShortcuts;