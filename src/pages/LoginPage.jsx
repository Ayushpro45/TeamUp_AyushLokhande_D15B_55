import React, { useEffect } from 'react';
import {
  Mail, Lock, LogIn, ArrowRight, User, Sparkles,
  Users, Shield, Zap, Eye, EyeOff, Loader2,
  AlertCircle, CheckCircle2,
} from 'lucide-react';
import { useForm } from '../hooks/useForm';
import { useAuthContext } from '../context/AuthContext';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppContext } from '../context/AppContext';

// ─── Validation rules ───────────────────────────────────────────────────────
const loginRules = {
  email: (v) => {
    if (!v) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
    return null;
  },
  password: (v) => {
    if (!v) return 'Password is required';
    if (v.length < 8) return 'Password must be at least 8 characters';
    return null;
  },
};

const signupRules = {
  ...loginRules,
  name: (v) => {
    if (!v || !v.trim()) return 'Full name is required';
    if (v.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },
};

function FieldError({ message }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default function LoginPage() {
  const { setActivePage, authMode, setAuthMode } = React.useContext(AppContext);
  const [isSignUp, setIsSignUp] = React.useState(authMode === 'signup');
  const [showPassword, setShowPassword] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const [rememberedEmail, setRememberedEmail] = useLocalStorage('teamup_remembered_email', '');
  const { user, loading, error: authError, login, signup, isAdmin } = useAuthContext();

  useEffect(() => {
    setIsSignUp(authMode === 'signup');
  }, [authMode]);

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, reset } =
    useForm(
      { name: '', email: rememberedEmail || '', password: '', rememberMe: !!rememberedEmail },
      isSignUp ? signupRules : loginRules
    );

  useEffect(() => {
    reset();
    setSuccess(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignUp]);

  // Redirect after successful login
  useEffect(() => {
    if (success && user) {
      const timer = setTimeout(() => {
        setActivePage(isAdmin ? 'admin' : 'dashboard');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [success, user, isAdmin, setActivePage]);

  const onSubmit = async (vals) => {
    let ok = false;
    if (isSignUp) {
      ok = await signup({ name: vals.name, email: vals.email, password: vals.password });
    } else {
      ok = await login({ email: vals.email, password: vals.password });
    }
    if (ok) {
      if (vals.rememberMe) setRememberedEmail(vals.email);
      else setRememberedEmail(null);
      setSuccess(true);
    }
  };

  const benefits = [
    { icon: Users, title: 'Find Your Dream Team', desc: 'Match with skilled hackers based on role, tech stack & synergy scores.' },
    { icon: Zap, title: 'Ship in 48 Hours', desc: 'Coordinated sprints, live dashboards, and built-in momentum tracking.' },
    { icon: Shield, title: 'Trusted Community', desc: 'Verified profiles, skill endorsements, and transparent team histories.' },
  ];

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 sm:px-6 py-12 relative">

      {/* Background ambient light effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/15 rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-0 relative z-10">

        {/* LEFT — Branded Info Panel */}
        <div className="hidden lg:flex flex-col justify-between glass-box glass-iridescent rounded-l-3xl p-10 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-purple-500/20 rounded-full blur-[70px] pointer-events-none animate-float-slow" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none animate-float-medium" />

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-100 to-indigo-200 bg-clip-text text-transparent">TeamUp</span>
                  <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                </div>
                <span className="text-[10px] uppercase tracking-widest font-semibold text-purple-200/80">Hackathon Matcher</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-white leading-tight">
                Build the future,<br />
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">together.</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
                Join thousands of hackers finding their perfect team, shipping winning prototypes, and making lasting connections.
              </p>
            </div>
          </div>

          <div className="space-y-5 mt-8">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-600/30 border border-purple-400/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-purple-200" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{b.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5">
                {['SC', 'ER', 'MV', 'DW'].map((initials) => (
                  <div key={initials} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                    {initials}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-300"><strong className="text-white">2,400+</strong> hackers already teamed up</p>
            </div>
          </div>
        </div>

        {/* RIGHT — Sign-In / Sign-Up Form */}
        <div className="glass-box lg:border-l-0 rounded-3xl lg:rounded-l-none lg:rounded-r-3xl shadow-2xl p-8 sm:p-10 space-y-6 relative">

          <div className="lg:hidden flex items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Users className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">TeamUp</span>
          </div>

          {/* Success state */}
          {success ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                {isSignUp ? 'Account Created!' : 'Welcome back!'}
              </h2>
              <p className="text-sm text-slate-300">
                {isSignUp
                  ? `Hey ${user?.name}, your hacker profile is live.`
                  : `Good to see you again, ${user?.name}! Redirecting…`}
              </p>
            </div>
          ) : (
            <>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-semibold border border-purple-400/30 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSignUp ? 'Get Started Free' : 'Hackathon Access'}
                </div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-sm font-medium text-slate-200">
                  {isSignUp ? 'Set up your hacker profile and start finding your squad' : 'Sign in to access your hackathon team dashboard'}
                </p>
              </div>

              {authError && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/15 border border-red-400/30 text-red-300 text-sm animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-100">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="name" name="name" type="text"
                        value={values.name} onChange={handleChange} onBlur={handleBlur}
                        placeholder="Alex Morgan"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium ${touched.name && errors.name ? 'border-red-400/70 focus:ring-red-400' : 'border-white/20 focus:border-purple-400'}`}
                      />
                    </div>
                    {touched.name && <FieldError message={errors.name} />}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-100">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="email" name="email" type="email"
                      value={values.email} onChange={handleChange} onBlur={handleBlur}
                      placeholder="hacker@teamup.dev"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/60 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium ${touched.email && errors.email ? 'border-red-400/70 focus:ring-red-400' : 'border-white/20 focus:border-purple-400'}`}
                    />
                  </div>
                  {touched.email && <FieldError message={errors.email} />}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-100">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-300">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="password" name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password} onChange={handleChange} onBlur={handleBlur}
                      placeholder="••••••••••••"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl bg-slate-900/60 border text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium ${touched.password && errors.password ? 'border-red-400/70 focus:ring-red-400' : 'border-white/20 focus:border-purple-400'}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {touched.password && <FieldError message={errors.password} />}
                  {isSignUp && values.password.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {[...Array(4)].map((_, i) => {
                        const strength = Math.min(Math.floor(values.password.length / 3), 4);
                        const colors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400'];
                        return <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < strength ? colors[strength - 1] : 'bg-white/10'}`} />;
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="rememberMe" checked={values.rememberMe} onChange={handleChange}
                      className="rounded border-white/30 bg-slate-900/80 text-purple-600 focus:ring-purple-400 focus:ring-offset-0 w-4 h-4" />
                    <span className="font-medium text-slate-100">Remember me</span>
                  </label>
                  {!isSignUp && (
                    <button type="button" className="text-purple-300 hover:text-white font-semibold transition-colors focus:outline-none focus:underline">
                      Forgot password?
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || isSubmitting}
                  className="w-full py-3.5 rounded-xl btn-primary font-bold text-base shadow-xl animate-pulse-glow flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:animate-none"
                >
                  {loading || isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>{isSignUp ? 'Creating account…' : 'Signing in…'}</span></>
                  ) : (
                    <><LogIn className="w-4 h-4" /><span>{isSignUp ? 'Create Account' : 'Sign In'}</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center py-2">
                <div className="w-full border-t border-white/15" />
                <span className="absolute bg-slate-950/80 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-300 rounded-full border border-white/10">Or continue with</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl btn-secondary text-xs font-semibold hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
                  GitHub
                </button>
                <button type="button" className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl btn-secondary text-xs font-semibold hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-400">
                  <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24"><path d="M12.24 10.285V13.4h6.887c-.58 2.31-2.455 4.303-6.887 4.303-4.205 0-7.618-3.413-7.618-7.618s3.413-7.618 7.618-7.618c2.093 0 3.906.77 5.28 2.016l2.368-2.368C17.994 1.05 15.342 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c7.06 0 11.75-4.96 11.75-11.95 0-.79-.08-1.57-.22-2.245H12.24z" /></svg>
                  Google
                </button>
              </div>

              <div className="text-center pt-2">
                <button type="button" onClick={() => {
                  const nextState = !isSignUp;
                  setIsSignUp(nextState);
                  setAuthMode?.(nextState ? 'signup' : 'login');
                }}
                  className="text-xs text-slate-200 hover:text-white font-medium transition-colors">
                  {isSignUp
                    ? <span>Already have an account? <strong className="text-purple-300 underline">Sign In</strong></span>
                    : <span>Need a hackathon squad? <strong className="text-purple-300 underline">Create Account</strong></span>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
