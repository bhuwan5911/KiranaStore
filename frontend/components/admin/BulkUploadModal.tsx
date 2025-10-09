import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { X, UploadCloud, Loader2 } from 'lucide-react';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
    const { addProductsBulk, addToast } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            if (e.target.files[0].type === 'text/csv') {
                setFile(e.target.files[0]);
            } else {
                addToast('Please select a valid .csv file.', 'error');
            }
        }
    };

    // ✅ FIX: handleUpload function ab JSON nahi, balki poori file bhejega
    const handleUpload = async () => {
        if (!file) {
            addToast('Please select a CSV file first.', 'error');
            return;
        }
        setIsUploading(true);

        // FormData object banayein
        const formData = new FormData();
        // File ko append karein. 'file' key backend se match honi chahiye.
        formData.append('file', file);

        // AppContext mein naye function ko call karein
        const { success, message } = await addProductsBulk(formData);

        if (success) {
            addToast(message, 'success');
            handleClose();
        } else {
            addToast(message, 'error');
        }

        setIsUploading(false);
    };

    const handleClose = () => {
        setFile(null);
        setIsUploading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Add Products</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800"><X /></button>
                </div>
                
                <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center flex flex-col items-center justify-center bg-gray-50"
                >
                    <UploadCloud size={48} className="mx-auto text-gray-400 mb-4" />
                    
                    <label htmlFor="csv-upload" className="cursor-pointer font-semibold text-primary hover:text-primary/80">
                        Choose file
                        <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="hidden"/>
                    </label>
                    
                    {file ? (
                        <p className="mt-2 font-medium text-gray-600 text-sm">{file.name}</p>
                    ) : (
                        <p className="mt-2 text-sm text-gray-500">or drag and drop CSV file</p>
                    )}

                    <p className="mt-4 text-xs text-gray-500">
                        Required headers: name, category, price, stock, description, imageUrl
                    </p>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleUpload} disabled={isUploading || !file}>
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : 'Upload Products'}
                    </Button>
                </div>
            </div>
        </div>
    );
};