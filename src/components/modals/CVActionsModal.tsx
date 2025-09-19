import React, { useState } from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../forms';

interface CVActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cv: {
    id: string;
    title: string;
  } | null;
  onRename: (cvId: string, newTitle: string) => Promise<void>;
  onDelete: (cvId: string) => Promise<void>;
}

const CVActionsModal: React.FC<CVActionsModalProps> = ({
  isOpen,
  onClose,
  cv,
  onRename,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !cv) return null;

  const handleRename = async () => {
    if (!newTitle.trim()) {
      alert('Le titre ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    try {
      await onRename(cv.id, newTitle.trim());
      setIsEditing(false);
      setNewTitle('');
      onClose();
    } catch (error) {
      console.error('Erreur lors du renommage:', error);
      alert('Erreur lors du renommage du CV');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le CV "${cv.title}" ? Cette action est irréversible.`)) {
      return;
    }

    setIsLoading(true);
    try {
      await onDelete(cv.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du CV');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = () => {
    setNewTitle(cv.title);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewTitle('');
  };

  const handleClose = () => {
    if (!isLoading) {
      cancelEditing();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={handleClose}></div>

        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Actions sur le CV
            </h2>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Contenu */}
          <div className="px-6 pb-6">
            {/* Titre du CV */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-900 font-medium">{cv.title}</p>
            </div>

            {/* Mode édition */}
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau titre
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Entrez le nouveau titre"
                    disabled={isLoading}
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    onClick={handleRename}
                    disabled={isLoading || !newTitle.trim()}
                    className="flex-1"
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={cancelEditing}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              /* Mode normal */
              <div className="space-y-3">
                {/* Bouton Modifier */}
                <button
                  onClick={startEditing}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PencilIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Modifier le titre</div>
                    <div className="text-sm text-gray-500">Changer le nom de ce CV</div>
                  </div>
                </button>

                {/* Bouton Supprimer */}
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium">Supprimer le CV</div>
                    <div className="text-sm text-red-500">Cette action est irréversible</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVActionsModal;