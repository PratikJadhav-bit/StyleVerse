import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Camera, TrendingUp, Crown, Truck, BarChart3, ChevronRight } from 'lucide-react';
import { productService } from '../../services/api';
import ProductCard from '../../components/ProductCard/ProductCard';
import styles from './Home.module.css';

// Hero slides
const SLIDES = [
  {
    image: '/assets/hero_fashion_banner.png',
    badge: '✦ AI-Powered Fashion Intelligence',
    title: ['Dress the', 'Future.'],
    sub: 'Where artificial intelligence meets haute couture.\nCurated exclusively for you.',
    cta1: { label: 'Explore Collections', to: '/collections' },
    cta2: { label: 'Meet AI Stylist', to: '/ai-stylist' },
  },
  {
    image: '/assets/collection_white_dress.png',
    badge: '✦ New Season SS26',
    title: ['Timeless', 'Elegance.'],
    sub: 'The SS26 Collection is here.\nPure. Refined. Unforgettable.',
    cta1: { label: 'Shop SS26', to: '/collections?is_new=true' },
    cta2: { label: 'Virtual Try-On', to: '/virtual-tryon' },
  },
];

const STATS = [
  { value: 50, suffix: 'K+', label: 'Curated Pieces' },
  { value: 2, suffix: 'M+', label: 'Style Profiles' },
  { value: 98, suffix: '%', label: 'Style Match Rate' },
];

const FEATURES = [
  { icon: <Sparkles size={22} />, title: 'AI Stylist', desc: 'Personalized outfit recommendations powered by advanced AI', to: '/ai-stylist' },
  { icon: <Camera size={22} />, title: 'Virtual Try-On', desc: 'See any piece on you before you buy with AR technology', to: '/virtual-tryon' },
  { icon: <TrendingUp size={22} />, title: 'Trend Analytics', desc: 'Real-time runway and street style trend intelligence', to: '/trends' },
  { icon: <Crown size={22} />, title: 'Loyalty Rewards', desc: 'Earn Style Points on every purchase — unlock exclusive tiers', to: '/loyalty' },
  { icon: <Truck size={22} />, title: 'Live Tracking', desc: 'AI-predicted delivery windows with real-time tracking', to: '/orders' },
  { icon: <BarChart3 size={22} />, title: 'Analytics', desc: 'Sales forecasting and inventory intelligence dashboard', to: '/analytics' },
];

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(Math.floor(current));
      if (current >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatItem({ value, suffix, label }) {
  const count = useCountUp(value);
  return (
    <div className={styles.stat}>
      <div className={styles.statNum}>{count}{suffix}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 5500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    productService.getAll({ is_ai_pick: true, limit: 6 })
      .then(r => setFeaturedProducts(r.data))
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  const current = SLIDES[slide];

  return (
    <div>
      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroSlides}>
          {SLIDES.map((s, i) => (
            <div
              key={i}
              className={`${styles.heroSlide} ${i === slide ? styles.active : ''}`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
          ))}
        </div>
        <div className={styles.heroOverlay} />

        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>{current.badge}</div>
          <h1 className={styles.heroTitle}>
            {current.title[0]}<br />
            <em>{current.title[1]}</em>
          </h1>
          <p className={styles.heroSub}>
            {current.sub.split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}
          </p>
          <div className={styles.heroCta}>
            <Link to={current.cta1.to} className="btn btn-primary btn-lg">{current.cta1.label}</Link>
            <Link to={current.cta2.to} className="btn btn-ghost btn-lg">{current.cta2.label}</Link>
          </div>
          <div className={styles.heroStats}>
            {STATS.map(s => <React.Fragment key={s.label}><StatItem {...s} /><div className={styles.statDivider} /></React.Fragment>).slice(0, -1).concat(STATS.slice(-1).map(s => <StatItem key={s.label} {...s} />))}
          </div>
        </div>

        <div className={styles.heroDots}>
          {SLIDES.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === slide ? styles.dotActive : ''}`} onClick={() => setSlide(i)} />
          ))}
        </div>
        <div className={styles.scrollIndicator}><span>Scroll</span><div className={styles.scrollLine} /></div>
      </section>

      {/* ── Ticker ── */}
      <div className={styles.ticker}>
        <div className={styles.tickerTrack}>
          {['NEW ARRIVALS SS26', 'AI OUTFIT CURATION', 'VIRTUAL TRY-ON LIVE', 'FREE EXPRESS DELIVERY', 'LOYALTY REWARDS', 'SUSTAINABLE LUXURY'].flatMap(t => [t, '✦']).concat(['NEW ARRIVALS SS26', 'AI OUTFIT CURATION', 'VIRTUAL TRY-ON LIVE', 'FREE EXPRESS DELIVERY', 'LOYALTY REWARDS', 'SUSTAINABLE LUXURY'].flatMap(t => [t, '✦'])).map((t, i) => (
            <span key={i} className={t === '✦' ? styles.tickerDot : ''}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Featured AI Picks ── */}
      <section className="section section-light">
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">Curated by AI</p>
            <h2 className="section-title">Featured <em>Collections</em></h2>
            <p className="section-subtitle">Each piece selected by our intelligence engine, refined by our designers.</p>
          </div>
          {loadingProducts ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            <div className={styles.productGrid}>
              {featuredProducts.slice(0, 6).map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
          <div className={styles.viewAll}>
            <Link to="/collections" className="btn btn-outline btn-lg">
              View All Collections <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section className={`section ${styles.featuresSection}`}>
        <div className="container">
          <div className="section-header">
            <p className="section-eyebrow">The Platform</p>
            <h2 className="section-title light">Everything You <em>Need</em></h2>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map(f => (
              <Link to={f.to} key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
                <span className={styles.featureArrow}><ChevronRight size={16} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className={styles.ctaBanner}>
        <div className={`container ${styles.ctaContent}`}>
          <div>
            <h2 className={styles.ctaTitle}>Start Your Style Journey</h2>
            <p className={styles.ctaSub}>Join 2M+ members who've discovered their perfect aesthetic with StyleVerse AI.</p>
          </div>
          <div className={styles.ctaActions}>
            <Link to="/register" className="btn btn-gold btn-lg">Create Free Account</Link>
            <Link to="/ai-stylist" className="btn btn-ghost btn-lg">Try AI Stylist</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
