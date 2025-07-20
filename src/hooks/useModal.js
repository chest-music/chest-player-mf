import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Get modal dependencies from parent app
const getModalDependencies = () => {
  if (typeof window !== 'undefined' && window.__CHEST_PLAYER_DEPS__?.modalActions) {
    return window.__CHEST_PLAYER_DEPS__.modalActions;
  }
  // Return no-op functions if not provided
  return {
    openModal: () => {},
    closeModal: () => {},
    isModalOpen: () => false
  };
};

export function useModal(modalFileName) {
  const dispatch = useDispatch();
  const { openModal, closeModal, isModalOpen } = getModalDependencies();

  const onOpen = useCallback(meta => dispatch(openModal(modalFileName, meta)), [
    dispatch, openModal, modalFileName
  ]);

  const onClose = useCallback(() => dispatch(closeModal(modalFileName)), [
    dispatch, closeModal, modalFileName
  ]);

  const isOpen = useSelector(state => isModalOpen(state, modalFileName));

  return {
    isOpen,
    onOpen,
    onClose,
  }
}