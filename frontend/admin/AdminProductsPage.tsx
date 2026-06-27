import React, { useState, useMemo, ChangeEvent } from 'react';
import { useAppContext } from "../context/AppContext";
import { Product } from '../types';
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Plus, Edit, Trash2, Edit3, UploadCloud, X, Loader2 } from 'lucide-react';
import { BulkUploadModal } from '../components/admin/BulkUploadModal';

const StockUpdateModal = ({
 productCount,
 onClose,
 onSubmit,
}: {
 productCount: number;
 onClose: () => void;
 onSubmit: (value: number, operation: 'set' | 'add') => void;
}) => {
 const [stockValue, setStockValue] = useState(0);
 const [operation, setOperation] = useState<'set' | 'add'>('add');

 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (operation === 'set' && stockValue < 0) {
   alert("Stock value cannot be negative.");
   return;
  }
  onSubmit(stockValue, operation);
 };

 return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
   <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
    <h2 className="text-2xl font-bold mb-4">
     Update Stock for {productCount} Products
    </h2>
    <form onSubmit={handleSubmit}>
     <p className="text-sm text-gray-600 mb-4">
      Choose an operation and enter a value to apply to all selected products.
     </p>
     <div className="mb-4">
      <label className="block text-sm font-medium text-text-secondary mb-1">
       Operation
      </label>
      <div className="flex gap-4">
       <label className="flex items-center p-3 border rounded-md cursor-pointer flex-1">
        <input
         type="radio"
         name="operation"
         value="add"
         checked={operation === 'add'}
         onChange={() => setOperation('add')}
         className="h-4 w-4 text-primary focus:ring-primary"
        />
        <span className="ml-3 text-sm font-medium">Add to Stock</span>
       </label>
       <label className="flex items-center p-3 border rounded-md cursor-pointer flex-1">
        <input
         type="radio"
         name="operation"
         value="set"
         checked={operation === 'set'}
         onChange={() => setOperation('set')}
         className="h-4 w-4 text-primary focus:ring-primary"
        />
        <span className="ml-3 text-sm font-medium">Set New Stock</span>
       </label>
      </div>
     </div>
     <Input
      label="Stock Value"
      type="number"
      placeholder="e.g., 50"
      value={stockValue}
      onChange={(e) => setStockValue(Number(e.target.value))}
      required
     />
     <div className="flex justify-end space-x-4 pt-6">
      <Button type="button" variant="ghost" onClick={onClose}>
       Cancel
      </Button>
      <Button type="submit">Apply Changes</Button>
     </div>
    </form>
   </div>
  </div>
 );
};

export const AdminProductsPage: React.FC = () => {
 const { products, categories, addProduct, updateProduct, deleteProduct, bulkUpdateStock, addToast } = useAppContext();
 const [isModalOpen, setIsModalOpen] = useState(false);
 const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
 const [editingProduct, setEditingProduct] = useState<Product | null>(null);
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
 const [isStockModalOpen, setIsStockModalOpen] = useState(false);
 const [selectedCategory, setSelectedCategory] = useState('all');

 const [imageFile, setImageFile] = useState<File | null>(null);
 const [imagePreview, setImagePreview] = useState<string | null>(null);
 const [isUploading, setIsUploading] = useState(false);

 const filteredProducts = useMemo(() => {
    let tempProducts = products;
    if (selectedCategory !== 'all') {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }
    if (searchQuery) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return tempProducts;
 }, [products, searchQuery, selectedCategory]);

 const handleSelectProduct = (productId: number) => {
  setSelectedProducts((prevSelected) =>
   prevSelected.includes(productId)
    ? prevSelected.filter((id) => id !== productId)
    : [...prevSelected, productId]
  );
 };

 const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.checked) {
   setSelectedProducts(filteredProducts.map((p) => p.id));
  } else {
   setSelectedProducts([]);
  }
 };

 const handleDeleteSelected = () => {
  if (selectedProducts.length === 0) return;
  const confirmDelete = window.confirm(
   `Are you sure you want to delete ${selectedProducts.length} selected product(s)?`
  );
  if (confirmDelete) {
   selectedProducts.forEach((productId) => deleteProduct(productId));
   addToast(`${selectedProducts.length} products deleted successfully!`, 'success');
   setSelectedProducts([]);
  }
 };

 const handleBulkStockUpdate = (value: number, operation: 'set' | 'add') => {
  if (selectedProducts.length === 0) return;
  bulkUpdateStock(selectedProducts, value, operation);
  setIsStockModalOpen(false);
  setSelectedProducts([]);
 };
 
 const openModal = (product: Product | null = null) => {
  setEditingProduct(product);
  if (product) {
      // Assuming your image URLs are relative, e.g., /uploads/image.png
      // If they are absolute, you don't need to add the localhost part.
      setImagePreview(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.imageUrl}`);
  }
  setIsModalOpen(true);
 };

 const closeModal = () => {
  setIsModalOpen(false);
  setEditingProduct(null);
  setImageFile(null);
  setImagePreview(null);
 };

 const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    }
 };

 // ✅ FIX: handleFormSubmit function ko poori tarah se theek kiya gaya hai
 const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsUploading(true);

  // Step 1: Form se saara data pehle hi nikal lein
  const formEl = e.currentTarget;
  const name = (formEl.elements.namedItem('name') as HTMLInputElement).value;
  const category = (formEl.elements.namedItem('category') as HTMLSelectElement).value;
  const price = Number((formEl.elements.namedItem('price') as HTMLInputElement).value);
  const stock = Number((formEl.elements.namedItem('stock') as HTMLInputElement).value);
  const description = (formEl.elements.namedItem('description') as HTMLTextAreaElement).value;

  let imageUrl = editingProduct?.imageUrl || '';

  // Step 2: Agar nayi image hai, toh use upload karein
  if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/upload`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: formData,
          });

          if (!res.ok) {
              const errorData = await res.json();
              throw new Error(errorData.message || 'Image upload failed');
          }
          
          const data = await res.json();
          imageUrl = data.imageUrl; // Naya URL save karein

      } catch (error: any) {
          addToast(error.message, 'error');
          setIsUploading(false);
          return;
      }
  }
  
  // Step 3: Naye/Purane image URL ke saath product data taiyaar karein
  const productData = {
   name,
   category,
   price,
   stock,
   description,
   imageUrl,
   relatedImages: [], // Simplified for now
  };

  // Step 4: Product ko add ya update karein
  try {
      if (editingProduct) {
          await updateProduct({ ...editingProduct, ...productData });
          addToast("Product updated successfully!", "success");
      } else {
          if (!imageUrl) {
              addToast("Product image is required.", "error");
              setIsUploading(false);
              return;
          }
          await addProduct(productData as Omit<Product, 'id' | 'rating' | 'reviews' | '_id'>);
          addToast("New product added successfully!", "success");
      }
  } catch (error) {
       addToast("Failed to save product.", "error");
  }
  
  setIsUploading(false);
  closeModal();
 };

 const handleDelete = (productId: number) => {
  if (window.confirm('Are you sure you want to delete this product?')) {
   deleteProduct(productId);
  }
 };

 return (
  <div className="bg-white p-6 rounded-2xl shadow-soft">
   <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
    <h1 className="text-2xl font-bold text-text-primary">Manage Products</h1>
    <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
     {selectedProducts.length > 0 && (
      <>
       <Button variant="outline" onClick={() => setIsStockModalOpen(true)}>
        <Edit3 className="mr-2" size={16} /> Update Stock
       </Button>
       <Button variant="danger" onClick={handleDeleteSelected}>
        <Trash2 className="mr-2" size={16} /> Delete ({selectedProducts.length})
       </Button>
      </>
     )}
     <Button variant="ghost" onClick={() => setIsBulkModalOpen(true)}>Bulk Add</Button>
     <Button onClick={() => openModal()}>
      <Plus className="mr-2" size={18} /> Add Product
     </Button>
    </div>
   </div>

   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <Input
     type="text"
     placeholder="Search products by name..."
     value={searchQuery}
     onChange={(e) => setSearchQuery(e.target.value)}
     className="md:col-span-2"
    />
    <select
     value={selectedCategory}
     onChange={(e) => setSelectedCategory(e.target.value)}
     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
    >
     <option value="all">All Categories</option>
     {categories.map((cat) => (
      <option key={cat.slug} value={cat.slug}>
       {cat.name}
      </option>
     ))}
    </select>
   </div>

   <div className="overflow-x-auto">
    <table className="min-w-full">
     <thead className="bg-gray-50">
      <tr>
       <th className="p-3">
        <input
         type="checkbox"
         className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
         onChange={handleSelectAll}
         checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
        />
       </th>
       <th className="text-left p-3 font-semibold text-text-secondary">Image</th>
       <th className="text-left p-3 font-semibold text-text-secondary">Name</th>
       <th className="text-left p-3 font-semibold text-text-secondary">Category</th>
       <th className="text-left p-3 font-semibold text-text-secondary">Price</th>
       <th className="text-left p-3 font-semibold text-text-secondary">Stock</th>
       <th className="text-left p-3 font-semibold text-text-secondary">Actions</th>
      </tr>
     </thead>
     <tbody>
      {filteredProducts.map((product) => (
       <tr key={product.id} className={`border-b border-gray-200 hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-primary/10' : ''}`}>
        <td className="p-3">
         <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          checked={selectedProducts.includes(product.id)}
          onChange={() => handleSelectProduct(product.id)}
         />
        </td>
        <td className="p-3">
         <img
          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${product.imageUrl}`}
          alt={product.name}
          className="w-12 h-12 object-cover rounded"
         />
        </td>
        <td className="p-3 font-medium text-text-primary">{product.name}</td>
        <td className="p-3 text-text-secondary capitalize">{product.category.replace('-', ' & ')}</td>
        <td className="p-3 text-text-primary">₹{product.price.toFixed(2)}</td>
        <td className="p-3 text-text-primary">{product.stock}</td>
        <td className="p-3">
         <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openModal(product)}><Edit size={16} /></Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(product.id)}><Trash2 size={16} /></Button>
         </div>
        </td>
       </tr>
      ))}
     </tbody>
    </table>
   </div>

   {isModalOpen && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
     <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
       <h2 className="text-2xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
       <Button variant="ghost" size="icon" onClick={closeModal}><X /></Button>
      </div>
      <form onSubmit={handleFormSubmit} className="space-y-4">
       <Input label="Product Name" name="name" defaultValue={editingProduct?.name} required />
       <div>
        <label htmlFor="category" className="block text-sm font-medium text-text-secondary mb-1">Category</label>
        <select name="category" id="category" defaultValue={editingProduct?.category} className="w-full px-3 py-2 border border-gray-300 rounded-md" required>
         {categories.map((cat) => (<option key={cat.slug} value={cat.slug}>{cat.name}</option>))}
        </select>
       </div>
       <div className="grid grid-cols-2 gap-4">
        <Input label="Price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required />
        <Input label="Stock" name="stock" type="number" defaultValue={editingProduct?.stock} required />
       </div>
       <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Product Image</label>
        <div className="mt-1 flex items-center gap-4">
         {imagePreview ? (
          <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded-md border" />
         ) : (
          <div className="w-24 h-24 bg-gray-100 rounded-md flex items-center justify-center"><UploadCloud className="text-gray-400" /></div>
         )}
         <label htmlFor="image-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md">
          <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
          <input id="image-upload" name="image" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
         </label>
        </div>
       </div>
       <div>
        <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-1">Description</label>
        <textarea name="description" id="description" rows={3} defaultValue={editingProduct?.description} className="w-full px-3 py-2 border border-gray-300 rounded-md" required></textarea>
       </div>
       <div className="flex justify-end space-x-4 pt-4">
        <Button type="button" variant="ghost" onClick={closeModal} disabled={isUploading}>Cancel</Button>
        <Button type="submit" disabled={isUploading}>
         {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : (editingProduct ? 'Save Changes' : 'Add Product')}
        </Button>
       </div>
      </form>
     </div>
    </div>
   )}

   {isStockModalOpen && (<StockUpdateModal productCount={selectedProducts.length} onClose={() => setIsStockModalOpen(false)} onSubmit={handleBulkStockUpdate} />)}
   <BulkUploadModal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} />
  </div>
 );
};

