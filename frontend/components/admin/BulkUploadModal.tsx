import React, { useState } from 'react';
import Papa from 'papaparse';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { X, UploadCloud } from 'lucide-react';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
    const { addProductsBulk, addToast } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = () => {
        if (!file) {
            addToast('Please select a file first.', 'error');
            return;
        }
        setIsUploading(true);
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const { success, message } = await addProductsBulk(results.data);
                if (success) {
                    addToast(message, 'success');
                    onClose();
                } else {
                    addToast(message, 'error');
                }
                setIsUploading(false);
            },
            error: (error) => {
                addToast(`CSV Parse Error: ${error.message}`, 'error');
                setIsUploading(false);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Bulk Add Products</h2>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <UploadCloud size={48} className="mx-auto text-gray-400" />
                    <input type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 mt-4"/>
                    <p className="mt-2 text-xs text-gray-500">Upload a CSV file with headers: name, category, price, stock, description, imageUrl</p>
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isUploading || !file}>
                        {isUploading ? 'Uploading...' : 'Upload Products'}
                    </Button>
                </div>
            </div>
        </div>
    );
};