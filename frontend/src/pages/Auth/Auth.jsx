import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import styles from './Auth.module.css';

export function LoginPage() {
  const [email, setEmail] = useState('priya@styleverse.com');
  const [password, setPassword] = useState('StyleVerse@2026');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      showToast('Welcome back to StyleVerse! ✨', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>STYLE<span>VERSE</span></Link>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.sub}>Sign in to your StyleVerse account</p>

        <div className={styles.demoHint}>
          <strong>Demo:</strong> priya@styleverse.com / StyleVerse@2026
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <div className={styles.pwWrap}>
              <input className="input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(p => !p)}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><Loader size={16} className={styles.spin} /> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className={styles.switchText}>
          Don't have an account? <Link to="/register" className={styles.switchLink}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    const result = await register(name, email, password);
    if (result.success) {
      showToast('Welcome to StyleVerse! 200 bonus points added! 🎉', 'success');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>STYLE<span>VERSE</span></Link>
        <h1 className={styles.title}>Join StyleVerse</h1>
        <p className={styles.sub}>Create your account and get 200 welcome points</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" required />
          </div>
          <div className="form-group">
            <label className="label">Email Address</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
            {loading ? <><Loader size={16} className={styles.spin} /> Creating account...</> : 'Create Account'}
          </button>
        </form>
        <p className={styles.switchText}>
          Already a member? <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
