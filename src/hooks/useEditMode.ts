import { useState, useEffect } from 'react';

// Hook pour gérer l'état d'édition des formulaires
export const useEditMode = <T>(initialData: T) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<T>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  // Mettre à jour editData quand initialData change
  useEffect(() => {
    setEditData(initialData);
    setHasChanges(false);
  }, [initialData]);

  // Détecter les changements
  useEffect(() => {
    const hasChange = JSON.stringify(editData) !== JSON.stringify(initialData);
    setHasChanges(hasChange);
  }, [editData, initialData]);

  const startEditing = () => {
    setIsEditing(true);
    setEditData(initialData);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData(initialData);
    setHasChanges(false);
  };

  const saveEditing = () => {
    setIsEditing(false);
    setHasChanges(false);
  };

  const updateEditData = (updates: Partial<T>) => {
    setEditData(prev => ({ ...prev, ...updates }));
  };

  const updateEditField = <K extends keyof T>(field: K, value: T[K]) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  return {
    isEditing,
    editData,
    hasChanges,
    startEditing,
    cancelEditing,
    saveEditing,
    updateEditData,
    updateEditField,
    setEditData
  };
};