import { useState, useEffect } from 'react';
import { isEmailValid, isPhoneValid } from '../constants';

interface ValidationRules {
  required?: boolean;
  email?: boolean;
  phone?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
}

interface FieldValidation {
  value: string;
  rules: ValidationRules;
}

interface ValidationErrors {
  [key: string]: string;
}

// Hook pour la validation de formulaires
export const useFormValidation = (fields: { [key: string]: FieldValidation }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (value: string, rules: ValidationRules): string => {
    if (rules.required && !value.trim()) {
      return 'Ce champ est requis';
    }

    if (value && rules.email && !isEmailValid(value)) {
      return 'Format d\'email invalide';
    }

    if (value && rules.phone && !isPhoneValid(value)) {
      return 'Format de téléphone invalide';
    }

    if (value && rules.minLength && value.length < rules.minLength) {
      return `Minimum ${rules.minLength} caractères requis`;
    }

    if (value && rules.maxLength && value.length > rules.maxLength) {
      return `Maximum ${rules.maxLength} caractères autorisés`;
    }

    if (value && rules.pattern && !rules.pattern.test(value)) {
      return 'Format invalide';
    }

    return '';
  };

  const validateAllFields = () => {
    const newErrors: ValidationErrors = {};
    
    Object.entries(fields).forEach(([fieldName, field]) => {
      const error = validateField(field.value, field.rules);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSingleField = (fieldName: string) => {
    const field = fields[fieldName];
    if (!field) return;

    const error = validateField(field.value, field.rules);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const clearFieldError = (fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasEmptyRequiredFields = Object.entries(fields).some(([_, field]) => 
      field.rules.required && !field.value.trim()
    );
    
    setIsValid(!hasErrors && !hasEmptyRequiredFields);
  }, [fields, errors]);

  return {
    errors,
    isValid,
    validateAllFields,
    validateSingleField,
    clearErrors,
    clearFieldError
  };
};