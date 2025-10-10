import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Button } from '../ui/Button';
import { X, UploadCloud, Loader2, FileText } from 'lucide-react';

interface BulkUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ isOpen, onClose }) => {
    const { addProductsBulk, addToast } = useAppContext();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            validateAndSetFile(selectedFile);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        // Check file type
        if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
            addToast('Please select a valid .csv file.', 'error');
            return;
        }

        // Check file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (selectedFile.size > maxSize) {
            addToast('File size should not exceed 5MB.', 'error');
            return;
        }

        setFile(selectedFile);
        addToast('File selected successfully!', 'success');
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            addToast('Please select a CSV file first.', 'error');
            return;
        }

        setIsUploading(true);

        try {
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('file', file);

            // Call the context function
            const { success, message } = await addProductsBulk(formData);

            if (success) {
                addToast(message, 'success');
                handleClose();
            } else {
                // Show detailed error message
                console.error('Upload error:', message);
                addToast(message, 'error');
            }
        } catch (error: any) {
            console.error('Upload exception:', error);
            addToast(error.message || 'Upload failed. Please try again.', 'error');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setIsUploading(false);
        setDragActive(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[999]">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Bulk Add Products</h2>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        disabled={isUploading}
                    >
                        <X size={24} />
                    </button>
                </div>
                
                <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        dragActive 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-300 bg-gray-50'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <UploadCloud 
                        size={48} 
                        className={`mx-auto mb-4 transition-colors ${
                            dragActive ? 'text-primary' : 'text-gray-400'
                        }`} 
                    />
                    
                    {!file ? (
                        <>
                            <label 
                                htmlFor="csv-upload" 
                                className="cursor-pointer font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                Choose CSV file
                                <input 
                                    id="csv-upload" 
                                    type="file" 
                                    accept=".csv,text/csv" 
                                    onChange={handleFileChange} 
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                            <p className="mt-2 text-sm text-gray-500">or drag and drop</p>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <FileText size={40} className="text-primary" />
                            <div>
                                <p className="font-medium text-gray-700">{file.name}</p>
                                <p className="text-sm text-gray-500">
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                                disabled={isUploading}
                            >
                                Remove file
                            </button>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-gray-600 font-medium mb-1">Required CSV Headers:</p>
                        <p className="text-xs text-gray-700 font-mono">
                            name, category, price, stock, description, imageUrl
                        </p>
                    </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs text-yellow-800">
                        <strong>Note:</strong> Make sure your CSV file is properly formatted. 
                        The first row should contain the headers, and each subsequent row should 
                        contain product data.
                    </p>
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                    <Button 
                        variant="ghost" 
                        onClick={handleClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleUpload} 
                        disabled={isUploading || !file}
                        className="min-w-[140px]"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <UploadCloud className="mr-2 h-4 w-4" />
                                Upload Products
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};