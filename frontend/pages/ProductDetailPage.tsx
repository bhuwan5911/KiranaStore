import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Rating } from '../components/Rating';
import { useAppContext } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Loader, Plus, Minus, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { 
      products, addToCart, updateQuantity, addRecentlyViewed, 
      fetchReviewsForProduct, addReview, user, cart
  } = useAppContext();
  
  const productId = parseInt(id || '0');
  const product = products.find(p => p.id === productId);
  const cartItem = cart.find(item => item.id === productId);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);

  useEffect(() => {
    if (product) {
        window.scrollTo(0, 0); // Scroll to top on product change
        addRecentlyViewed(product);
        setCurrentImageIndex(0);
        
        const loadReviews = async () => {
            setIsLoadingReviews(true);
            const fetchedReviews = await fetchReviewsForProduct(product.id);
            setReviews(fetchedReviews);
            setIsLoadingReviews(false);
        }
        loadReviews();
    }
  }, [product, addRecentlyViewed, fetchReviewsForProduct]);

  if (!product) {
    return <div className="text-center py-16">Product not found.</div>;
  }
  
  const allImages = [product.imageUrl, ...(product.relatedImages || [])].filter(Boolean);
  
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % allImages.length);
  };

  const prevImage = () => {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + allImages.length) % allImages.length);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && newReview.comment && newReview.rating > 0) {
        setIsSubmittingReview(true);
        const submittedReview = await addReview(product.id, {
            author: user.name,
            ...newReview
        });

        if (submittedReview) {
            setReviews(prev => [submittedReview, ...prev]);
            setNewReview({ rating: 0, comment: '' });
        }
        setIsSubmittingReview(false);
    }
  };

  const colors = ['bg-cyan-300', 'bg-yellow-400', 'bg-orange-500'];
  const sizes = ['37', '38', '39', '40', '41', '42'];

  return (
    <div className="animate-slide-in-up">
        <div className="bg-gradient-to-br from-brand-yellow to-brand-orange rounded-4xl p-6 md:p-10">
          <div className="flex justify-between items-center text-brand-black/80 font-medium mb-4">
            <p className="truncate"><Link to="/">Home</Link> / <Link to="/products/all">Shop</Link> / <span className="font-semibold">{product.name}</span></p>
            {products.find(p => p.id > product.id) &&
              <Link to={`/product/${products.find(p => p.id > product.id)!.id}`} className="flex items-center gap-2 flex-shrink-0 ml-4">Next <ArrowRight size={16}/></Link>
            }
          </div>
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              {/* Left Column: Image Carousel */}
              <div className="flex flex-col gap-4">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-lightest shadow-inner">
                      <img
                          key={currentImageIndex}
                          src={allImages[currentImageIndex]}
                          alt={`${product.name} image ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain animate-fade-in"
                      />
                      {allImages.length > 1 && (
                          <>
                              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 z-10 transition shadow-md">
                                  <ChevronLeft size={24} />
                              </button>
                              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 z-10 transition shadow-md">
                                  <ChevronRight size={24} />
                              </button>
                          </>
                      )}
                  </div>
                  {allImages.length > 1 && (
                      <div className="flex items-center justify-center gap-3">
                          {allImages.map((img, index) => (
                              <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-xl p-1 transition-all ${currentImageIndex === index ? 'ring-2 ring-primary' : 'ring-2 ring-transparent'}`}>
                                  <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-contain bg-neutral-lightest rounded-lg"/>
                              </button>
                          ))}
                      </div>
                  )}
              </div>

              {/* Right Column: Product Details & Actions */}
              <div className="flex flex-col">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-brand-black leading-tight">{product.name}</h1>
                  <div className="mt-4 flex items-center gap-4">
                      <Rating rating={product.rating}/>
                      <a href="#reviews" className="text-sm text-text-secondary hover:underline">({product.reviews} Reviews)</a>
                  </div>
                  <p className="text-text-secondary mt-4 max-w-md">{product.description}</p>
                  
                  <div className="flex-grow"></div>

                  <div className="mt-6">
                      <h3 className="font-semibold mb-2">Color:</h3>
                      <div className="flex gap-3">
                          {colors.map((color, index) => (
                              <button key={index} onClick={() => setSelectedColor(index)} className={`w-8 h-8 rounded-full transition-all ${color} ${selectedColor === index ? 'ring-2 ring-offset-2 ring-brand-black' : ''}`}/>
                          ))}
                      </div>
                  </div>
                  <div className="mt-6">
                      <h3 className="font-semibold mb-2">Size:</h3>
                      <div className="flex flex-wrap gap-3">
                          {sizes.map((size, index) => (
                              <button key={index} onClick={() => setSelectedSize(index)} className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${selectedSize === index ? 'bg-brand-black text-white' : 'bg-neutral-lightest text-brand-black hover:bg-white'}`}>{size}</button>
                          ))}
                      </div>
                  </div>

                  <div className="mt-8 flex items-center gap-4 flex-wrap">
                      <p className="text-4xl font-bold">₹{product.price.toFixed(2)}</p>
                      <div className="flex-grow">
                        {product.stock > 0 ? (
                            cartItem ? (
                                <div className="flex items-center justify-between border-2 border-brand-black rounded-full text-brand-black font-bold h-14 w-full max-w-xs">
                                    <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="px-5 h-full rounded-l-full hover:bg-black/10 transition-colors" aria-label="Decrease quantity"><Minus size={20} /></button>
                                    <span className="px-3 text-xl">{cartItem.quantity}</span>
                                    <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} disabled={cartItem.quantity >= product.stock} className="px-5 h-full rounded-r-full hover:bg-black/10 transition-colors disabled:opacity-50" aria-label="Increase quantity"><Plus size={20} /></button>
                                </div>
                            ) : (
                                <Button onClick={() => addToCart(product, 1)} size="lg" className="w-full h-14 text-lg max-w-xs">Add to Cart</Button>
                            )
                        ) : (
                            <Button size="lg" disabled className="w-full h-14 text-lg max-w-xs">Out of Stock</Button>
                        )}
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-12 bg-white/70 p-8 rounded-2xl shadow-soft">
            <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    {isLoadingReviews ? (
                        <p>Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                         <div className="space-y-6 max-h-96 overflow-y-auto pr-4">
                            {reviews.map((review) => (
                                <div key={review.id} className="border-b border-neutral-dark/50 pb-6 last:border-b-0">
                                    <div className="flex items-center mb-2">
                                       <Rating rating={review.rating} />
                                       <p className="font-bold ml-4">{review.author}</p>
                                       <p className="text-sm text-gray-500 ml-auto">{new Date(review.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-text-secondary">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center py-8 text-text-secondary">No reviews yet. Be the first to share your thoughts!</p>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                     {user ? (
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Your Rating</label>
                                <div className="flex space-x-1">
                                    {[...Array(5)].map((_, i) => (
                                        <button type="button" key={i} onClick={() => setNewReview({...newReview, rating: i+1})}>
                                            <Star size={24} className={`transition-colors ${i < newReview.rating ? 'text-secondary fill-current' : 'text-gray-300'}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <textarea
                                id="comment"
                                rows={3}
                                className="w-full px-4 py-2 border border-neutral-dark/50 bg-white/60 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="Share your thoughts..."
                                value={newReview.comment}
                                onChange={e => setNewReview({...newReview, comment: e.target.value})}
                                required
                                disabled={isSubmittingReview}
                            ></textarea>
                            <Button type="submit" disabled={isSubmittingReview || newReview.rating === 0 || !newReview.comment}>
                                {isSubmittingReview ? <Loader className="animate-spin" /> : 'Submit Review'}
                            </Button>
                        </form>
                    ) : (
                        <p className="text-text-secondary">Please <Link to="/login" className="text-primary underline">log in</Link> to write a review.</p>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};