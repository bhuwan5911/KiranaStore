import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';
import { X, Scale, Trash2 } from 'lucide-react';
import { Rating } from './Rating';

export const ComparisonTray: React.FC = () => {
    const { comparisonList, clearCompare, toggleCompare } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (comparisonList.length === 0) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-4 right-4 z-40">
                <Button size="lg" onClick={() => setIsModalOpen(true)} className="shadow-2xl rounded-full">
                    <Scale className="mr-2" />
                    Compare ({comparisonList.length})
                </Button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] animate-fade-in">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-slide-in-up">
                        <div className="flex justify-between items-center border-b pb-4 mb-4">
                            <h2 className="text-2xl font-bold">Compare Products</h2>
                            <div className="flex items-center space-x-4">
                               <Button variant="danger" size="sm" onClick={clearCompare} disabled={comparisonList.length === 0}>
                                 <Trash2 className="mr-2" size={16}/> Clear All
                               </Button>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-200"><X /></button>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto flex-grow">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold text-text-secondary w-1/5">Feature</th>
                                        {comparisonList.map(product => (
                                            <th key={product.id} className="p-3 relative">
                                                <img src={product.imageUrl} alt={product.name} className="w-24 h-24 object-cover mx-auto rounded-md mb-2" />
                                                <p className="font-semibold">{product.name}</p>
                                                <button onClick={() => toggleCompare(product)} className="absolute top-1 right-1 p-1 bg-red-100 text-red-500 rounded-full hover:bg-red-200">
                                                    <X size={14}/>
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="p-3 font-semibold">Price</td>
                                        {comparisonList.map(p => <td key={p.id} className="p-3 text-center text-lg font-bold text-primary">₹{p.price.toFixed(2)}</td>)}
                                    </tr>
                                    <tr className="bg-neutral-dark/30 border-b">
                                        <td className="p-3 font-semibold">Rating</td>
                                        {comparisonList.map(p => <td key={p.id} className="p-3"><div className="flex justify-center"><Rating rating={p.rating} reviews={p.reviews} /></div></td>)}
                                    </tr>
                                    <tr className="border-b">
                                        <td className="p-3 font-semibold">Stock</td>
                                        {comparisonList.map(p => (
                                            <td key={p.id} className={`p-3 text-center font-semibold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                            </td>
                                        ))}
                                    </tr>
                                    <tr className="bg-neutral-dark/30">
                                        <td className="p-3 font-semibold align-top">Description</td>
                                        {comparisonList.map(p => <td key={p.id} className="p-3 text-sm text-text-secondary align-top">{p.description}</td>)}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                         <div className="border-t pt-4 mt-4 text-center">
                            <Button size="lg" onClick={() => setIsModalOpen(false)}>Close</Button>
                         </div>
                    </div>
                </div>
            )}
        </>
    );
};