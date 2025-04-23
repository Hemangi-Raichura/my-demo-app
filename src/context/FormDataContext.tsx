import React, { createContext, useContext, useEffect, useState } from 'react';

type FormData = {
  [key: string]: any;
};

type FormDataContextType = {
  formData: FormData;
  setFormData: (data: FormData) => void;
};

const FormDataContext = createContext<FormDataContextType | undefined>(undefined);

export const FormDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormDataState] = useState<FormData>({});

  // Load from localStorage safely
  useEffect(() => {
    try {
      const stored = localStorage.getItem('financialFormData');
      if (stored && stored !== 'undefined') {
        setFormDataState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading form data from localStorage:', error);
      setFormDataState({});
    }
  }, []);

  const setFormData = (data: FormData) => {
    setFormDataState(data);
    localStorage.setItem('financialFormData', JSON.stringify(data));
  };

  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export const useFormData = () => {
  const context = useContext(FormDataContext);
  if (!context) {
    throw new Error('useFormData must be used within a FormDataProvider');
  }
  return context;
};
