"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface ContactFormContextType {
  activeFormId: string | null;
  isOpen: boolean;
  openForm: (formId: string) => void;
  closeForm: () => void;
}

const ContactFormContext = createContext<ContactFormContextType | undefined>(undefined);

export function ContactFormProvider({ children }: { children: ReactNode }) {
  const [activeFormId, setActiveFormId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openForm = (formId: string) => {
    setActiveFormId(formId);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    // Delay clearing the form ID to allow exit animations
    setTimeout(() => setActiveFormId(null), 300);
  };

  return (
    <ContactFormContext.Provider value={{ activeFormId, isOpen, openForm, closeForm }}>
      {children}
    </ContactFormContext.Provider>
  );
}

export function useContactForm() {
  const context = useContext(ContactFormContext);
  if (context === undefined) {
    throw new Error("useContactForm must be used within a ContactFormProvider");
  }
  return context;
}
