import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, User, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { itemCount } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const searchRef = useRef();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) setTimeout(() => searchRef.current.focus(), 300);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/collections?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/collections', label: 'Collections' },
    { to: '/ai-stylist', label: 'AI Stylist', icon: <Sparkles size={13} /> },
    { to: '/virtual-tryon', label: 'Try-On' },
    { to: '/trends', label: 'Trends' },
    { to: '/loyalty', label: 'Rewards' },
  ];

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={`container ${styles.inner}`}>

          <Link to="/" className={styles.logo}>
            STYLE<span>VERSE</span>
          </Link>

          <ul className={`${styles.links} ${mobileOpen ? styles.open : ''}`}>
            {navLinks.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {icon && <span className={styles.linkIcon}>{icon}</span>}
                  {label}
                </NavLink>
              </li>
            ))}
            {isLoggedIn && (
              <li>
                <NavLink to="/analytics" className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`} onClick={() => setMobileOpen(false)}>
                  Analytics
                </NavLink>
              </li>
            )}
          </ul>

          <div className={styles.actions}>
            <button className={styles.iconBtn} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={18} />
            </button>

            {isLoggedIn ? (
              <div className={styles.userMenu}>
                <button className={styles.iconBtn} aria-label="Profile">
                  <User size={18} />
                </button>
                <div className={styles.dropdown}>
                  <div className={styles.dropdownUser}>
                    <p className={styles.dropdownName}>{user?.name}</p>
                    <p className={styles.dropdownTier}>{user?.tier} Member · {user?.style_points?.toLocaleString()} pts</p>
                  </div>
                  <Link to="/dashboard" className={styles.dropdownItem}>My Dashboard</Link>
                  <Link to="/orders" className={styles.dropdownItem}>My Orders</Link>
                  <Link to="/loyalty" className={styles.dropdownItem}>Rewards</Link>
                  <button className={`${styles.dropdownItem} ${styles.logout}`} onClick={logout}>Sign Out</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className={`btn btn-primary btn-sm ${styles.loginBtn}`}>Sign In</Link>
            )}

            <Link to="/cart" className={styles.cartBtn} aria-label="Cart">
              <ShoppingBag size={18} />
              {itemCount > 0 && <span className={styles.cartCount}>{itemCount}</span>}
            </Link>

            <button className={`${styles.hamburger} ${mobileOpen ? styles.active : ''}`}
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className={`${styles.searchBar} ${searchOpen ? styles.searchOpen : ''}`}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <Search size={18} className={styles.searchIcon} />
            <input
              ref={searchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search styles, designers, collections..."
              className={styles.searchInput}
            />
            <button type="button" onClick={() => setSearchOpen(false)} className={styles.searchClose}>
              <X size={18} />
            </button>
          </form>
          <div className={styles.suggestions}>
            {['White Blazer', 'Evening Gowns', 'New Arrivals', 'Sustainable', 'Gold Accessories'].map(s => (
              <button key={s} className={styles.suggTag} onClick={() => { setSearchQuery(s); navigate(`/collections?search=${s}`); setSearchOpen(false); }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <div style={{ height: 'var(--nav-height)' }} />
    </>
  );
}
