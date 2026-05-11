import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LogIn, UserPlus, Loader2, Mail, Lock } from 'lucide-react';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Check your email for the confirmation link!' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Logged in successfully!' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto glass p-8 rounded-3xl shadow-2xl border border-white/20">
      <div className="text-center mb-8">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {isSignUp ? <UserPlus className="text-primary h-8 w-8" /> : <LogIn className="text-primary h-8 w-8" />}
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isSignUp ? 'Join Study Compass today' : 'Sign in to your account'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground ml-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}
