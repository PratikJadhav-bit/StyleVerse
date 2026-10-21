import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, Camera, Plus, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../hooks/useToast';
import styles from './ProductCard.module.css';

const API_BASE = '';

function formatPrice(price) {
  return '₹' + Number(price).toLocaleString('en-IN');
}

export default function ProductCard({ product }) {
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const imgSrc = product.image_url?.startsWith('http')
    ? product.image_url
    : `${API_BASE}${product.image_url || '/assets/collection_white_dress.png'}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    setAdding(true);
    addItem({
      id: product.id,
      name: product.name,
      designer: product.designer,
      price: product.price,
      image: imgSrc,
    });
    showToast(`${product.name} added to cart`, 'success');
    setTimeout(() => setAdding(false), 600);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    setWishlisted(w => !w);
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ♡');
  };

  return (
    <Link to={`/products/${product.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={imgSrc}
          alt={product.name}
          className={styles.image}
          onError={(e) => { e.target.src = `${API_BASE}/assets/collection_white_dress.png`; }}
          loading="lazy"
        />

        {/* Badges */}
        <div className={styles.badges}>
          {product.is_new && <span className="badge badge-black">New</span>}
          {product.is_ai_pick && <span className="badge badge-gold">AI Pick</span>}
          {product.is_exclusive && <span className="badge badge-exclusive">Exclusive</span>}
          {product.is_limited && <span className="badge badge-limited">Limited</span>}
          {product.original_price && (
            <span className="badge" style={{ background: '#fee2e2', color: '#c0392b' }}>
              -{Math.round((1 - product.price / product.original_price) * 100)}%
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className={styles.actions}>
          <button className={`${styles.actionBtn} ${wishlisted ? styles.wishlisted : ''}`}
            onClick={handleWishlist} title="Wishlist">
            <Heart size={15} fill={wishlisted ? '#e74c3c' : 'none'} />
          </button>
          <button className={styles.actionBtn} onClick={(e) => { e.preventDefault(); navigate('/virtual-tryon'); }} title="Try On">
            <Camera size={15} />
          </button>
          <button className={styles.actionBtn} onClick={(e) => { e.preventDefault(); navigate(`/products/${product.id}`); }} title="Quick View">
            <Eye size={15} />
          </button>
        </div>

        {product.tryon_available && (
          <div className={styles.tryonBadge}>Try-On Available</div>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.designer}>{product.designer}</p>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.rating}>
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} fill={i < Math.floor(product.rating) ? '#c9a227' : 'none'} color="#c9a227" />
          ))}
          <span className={styles.ratingCount}>({product.review_count})</span>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.prices}>
            <span className={styles.price}>{formatPrice(product.price)}</span>
            {product.original_price && (
              <span className={styles.originalPrice}>{formatPrice(product.original_price)}</span>
            )}
          </div>
          <button
            className={`${styles.addBtn} ${adding ? styles.adding : ''}`}
            onClick={handleAddToCart}
            aria-label="Add to cart"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}
