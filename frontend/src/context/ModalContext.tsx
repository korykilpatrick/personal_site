import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ModalContextProps {
  isOpen: boolean;
  imageUrl: string | null;
  altText: string | undefined;
  openModal: (url: string, alt?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [altText, setAltText] = useState<string | undefined>(undefined);

  const openModal = useCallback((url: string, alt?: string) => {
    setImageUrl(url);
    setAltText(alt);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Delay clearing image URL to allow for fade-out animation if desired
    // setTimeout(() => {
    //   setImageUrl(null);
    //   setAltText(undefined);
    // }, 300); // Match animation duration
    setImageUrl(null); // Clear immediately for simplicity
    setAltText(undefined);
  }, []);

  return (
    <ModalContext.Provider value={{ isOpen, imageUrl, altText, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextProps => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
}; 