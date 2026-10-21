import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Collections.module.css';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'New Arrivals', value: 'new-arrivals' },
  { label: 'Dresses', value: 'dresses' },
  { label: 'Outerwear', value: 'outerwear' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Evening Wear', value: 'eveningwear' },
  { label: 'Sustainable', value: 'sustainable' },
];

const SORTS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

export default function Collections() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search] = useState(searchParams.get('search') || '');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { sort, limit: 24 };
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (search) params.search = search;
      const res = await productService.getAll(params);
      setProducts(res.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [category, sort, minPrice, maxPrice, search]);

  return (
    <div>
      {/* Page Header */}
      <div className={styles.header}>
        <div className="container">
          <p className="section-eyebrow">Our Selection</p>
          <h1 className={`section-title ${styles.pageTitle}`}>
            {search ? `Results for "${search}"` : (category ? CATEGORIES.find(c => c.value === category)?.label || 'Collections' : 'All Collections')}
          </h1>
          <p className={styles.productCount}>{products.length} pieces found</p>
        </div>
      </div>

      <div className="container">
        {/* Filter & Sort Bar */}
        <div className={styles.toolbar}>
          <div className={styles.catTabs}>
            {CATEGORIES.map(c => (
              <button key={c.value}
                className={`${styles.catTab} ${category === c.value ? styles.catTabActive : ''}`}
                onClick={() => setCategory(c.value)}
              >{c.label}</button>
            ))}
          </div>
          <div className={styles.toolRight}>
            <button className={styles.filterBtn} onClick={() => setFiltersOpen(f => !f)}>
              <SlidersHorizontal size={15} /> Filters
            </button>
            <select className={styles.sortSelect} value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {filtersOpen && (
          <div className={styles.filtersPanel}>
            <div className={styles.filterGroup}>
              <label className="label">Min Price (₹)</label>
              <input className="input" type="number" placeholder="e.g. 5000" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            </div>
            <div className={styles.filterGroup}>
              <label className="label">Max Price (₹)</label>
              <input className="input" type="number" placeholder="e.g. 100000" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
              <X size={14} /> Clear Filters
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <h3>No pieces found</h3>
            <p>Try adjusting your filters or browse all collections.</p>
            <button className="btn btn-primary" onClick={() => { setCategory(''); setMinPrice(''); setMaxPrice(''); }}>Browse All</button>
          </div>
        ) : (
          <div className={styles.grid}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
