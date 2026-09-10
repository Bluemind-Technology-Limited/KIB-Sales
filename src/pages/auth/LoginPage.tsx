import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { CloseCircle, Eye, EyeSlash, InfoCircle } from 'iconsax-reactjs';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { login, selectAuthError, selectAuthStatus, selectUser } from '../../store/slices/authSlice';
import { roleHome } from '../../routes/roles';



/** Shared sign-in gate for both roles, styled after the KIB-ERP login screen. */
export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAppSelector(selectAuthStatus);
  const serverError = useAppSelector(selectAuthError);
  const user = useAppSelector(selectUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Already signed in (e.g. session restored on boot) — skip the login form.
  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  const isSubmitting = status === 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError('');
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      const from = (location.state as { from?: string } | null)?.from;
      // Land on the intended route when it belongs to this role, otherwise the role home.
      const target = from && !from.startsWith('/login') ? from : roleHome(result.payload.user.role);
      navigate(target, { replace: true });
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-app-bg text-text font-sans">
      <header className="w-full max-w-[1440px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-2.5">
          <img src="/kib-group.png" alt="KIB Group" className="h-9 w-auto object-contain" />
          <span className="text-sm font-bold text-text hidden sm:inline">Sales Force Automation</span>
        </div>
      </header>

      <main className="flex-1 w-full flex flex-col items-center justify-center py-12 px-4">
        {(error || serverError) && (
          <div className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] max-w-sm">
            <div className="flex items-start gap-2.5 bg-surface text-text px-4 py-3 rounded-xl border border-border-soft shadow-lg">
              <InfoCircle size={16} className="text-accent shrink-0 mt-0.5" variant="Bold" />
              <p className="text-xs font-medium leading-5 flex-1">{error || serverError}</p>
              <button
                type="button"
                onClick={() => setError('')}
                className="text-slate-400 hover:text-slate-600 shrink-0 transition-colors cursor-pointer"
                aria-label="Dismiss"
              >
                <CloseCircle size={14} />
              </button>
            </div>
          </div>
        )}

        <div className="w-[448px] max-w-full bg-surface rounded-2xl p-5 border border-slate-200 flex flex-col gap-3">
          <h2 className="text-[23px] font-semibold text-text tracking-tight leading-8">
            Sign in to KIB SFA
          </h2>
          <p className="text-xs text-slate-500">
            Super admins manage the platform; distributors review their sales team&apos;s requests.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text leading-5 tracking-tight">Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full h-[40px] border border-slate-200 bg-surface rounded-[var(--radius-control)] px-3 text-sm text-text focus:outline-none focus:border-accent"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-text leading-5 tracking-tight">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[40px] border border-slate-200 bg-surface rounded-[var(--radius-control)] px-3 pr-10 text-sm text-text focus:outline-none focus:border-accent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-text transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full h-[40px] btn-3d mt-2">
              <span className="text-white text-sm font-semibold">{isSubmitting ? 'Signing in…' : 'Sign in'}</span>
            </button>
          </form>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Demo accounts removed</span>
          </div>
        </div>
      </main>
    </div>
  );
}
