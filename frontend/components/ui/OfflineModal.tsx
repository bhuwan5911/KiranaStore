import React from 'react';
import { WifiOff } from 'lucide-react';
import { Button } from './Button';

interface OfflineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineModal: React.FC<OfflineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[110] animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="offline-modal-title"
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center transform transition-all animate-slide-in-up">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
          <WifiOff className="h-8 w-8 text-red-600" aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-bold text-text-primary" id="offline-modal-title">
          You are offline
        </h3>
        <div className="mt-2 px-7 py-3">
          <p className="text-base text-text-secondary">
            It looks like you're not connected to the internet. The app is now in offline mode and will use sample data.
          </p>
        </div>
        <div className="mt-6">
          <Button
            size="lg"
            onClick={onClose}
            className="w-full"
            aria-label="Close offline notification"
          >
            Okay, I understand
          </Button>
        </div>
      </div>
    </div>
  );
};