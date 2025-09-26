import React, { useState, useMemo } from 'react';
import { useAppContext } from "../context/AppContext";
import { Product } from '../../types';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { categories } from "../data/mockData";
import { Plus, Edit, Trash2 } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
    const { products, addProduct, updateProduct, deleteProduct } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        if (!searchQuery) {
            return products;
        }
        return products.filter(product =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const openModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        
        const imageUrls = (formData.get('imageUrls') as string)
            .split(/[\n,]+/)
            .map(url => url.trim())
            .filter(Boolean);

        const productData = {
            name: formData.get('name') as string,
            category: formData.get('category') as string,
            price: Number(formData.get('price')),
            stock: Number(formData.get('stock')),
            description: formData.get('description') as string,
            imageUrl: imageUrls[0] || '',
            relatedImages: imageUrls.slice(1),
        };

        if (editingProduct) {
            updateProduct({ ...editingProduct, ...productData });
        } else {
            addProduct(productData);
        }
        closeModal();
    };

    const handleDelete = (productId: number) => {
        if(window.confirm('Are you sure you want to delete this product?')) {
            deleteProduct(productId);
        }
    }

    return (
        <div className="bg-neutral-light p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-text-primary">Manage Products</h1>
                <Button onClick={() => openModal()}><Plus className="mr-2" size={18} />Add Product</Button>
            </div>
            
            <div className="mb-4">
                <Input
                    type="text"
                    placeholder="Search products by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-neutral-dark">
                        <tr>
                            <th className="text-left p-3 font-semibold text-text-secondary">Image</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Name</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Category</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Price</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Stock</th>
                            <th className="text-left p-3 font-semibold text-text-secondary">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <tr key={product.id} className="border-b border-neutral-dark transition-colors hover:bg-teal-50">
                                    <td className="p-3"><img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded"/></td>
                                    <td className="p-3 font-medium text-text-primary">{product.name}</td>
                                    <td className="p-3 text-text-secondary capitalize">{product.category.replace('-', ' & ')}</td>
                                    <td className="p-3 text-text-primary">₹{product.price.toFixed(2)}</td>
                                    <td className="p-3 text-text-primary">{product.stock}</td>
                                    <td className="p-3">
                                        <div className="flex space-x-2">
                                            <Button variant="ghost" size="sm" onClick={() => openModal(product)}><Edit size={16}/></Button>
                                            <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}><Trash2 size={16}/></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-text-secondary">
                                    No products found matching "{searchQuery}".
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Add/Edit Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in-up">
                        <h2 className="text-2xl font-bold mb-6">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <Input label="Product Name" name="name" defaultValue={editingProduct?.name} required />
                            <div>
                               <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                               <select name="category" id="category" defaultValue={editingProduct?.category} className="w-full px-3 py-2 border border-neutral-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required>
                                   {categories.map(cat => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
                               </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                               <Input label="Price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
                               <Input label="Stock" name="stock" type="number" defaultValue={editingProduct?.stock} required />
                            </div>
                            <div>
                                <label htmlFor="imageUrls" className="block text-sm font-medium text-text-secondary mb-1">Image URLs</label>
                                <textarea 
                                    name="imageUrls" 
                                    id="imageUrls" 
                                    rows={4} 
                                    defaultValue={[editingProduct?.imageUrl, ...(editingProduct?.relatedImages || [])].join('\n')}
                                    className="w-full px-3 py-2 border border-neutral-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
                                    placeholder="Enter image URLs, one per line. The first URL is the main image."
                                    required
                                ></textarea>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                <textarea name="description" id="description" rows={3} defaultValue={editingProduct?.description} className="w-full px-3 py-2 border border-neutral-dark rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" required></textarea>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                                <Button type="submit">{editingProduct ? 'Save Changes' : 'Add Product'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};