import React, { useState } from 'react';
import { useStore } from '../store';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/UI';
import { Lock } from 'lucide-react';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useStore();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (isLogin) {
        login(email);
      } else {
        signup(name, email);
      }
      setLoading(false);
      navigate('/dashboard');
    }, 1000); // Simulate API delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-primary">
        <div className="flex justify-center mb-6 text-primary">
          <div className="bg-blue-50 p-4 rounded-full">
            <Lock size={40} />
          </div>
        </div>
        
        <h1 className="text-3xl font-display text-center mb-2 uppercase">
          {isLogin ? 'Welcome Back' : 'Join The Squad'}
        </h1>
        <p className="text-center text-slate-500 mb-8">
          {isLogin ? 'Enter your details to access your locker.' : 'Start your journey to mastery today.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Password</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-blue-100 outline-none transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button type="submit" fullWidth disabled={loading}>
               {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
            </Button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button type="button" className="w-full border-2 border-slate-100 py-3 rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition flex items-center justify-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.987H12.24z"/></svg>
            Google
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? (
            <>
              <a href="#" className="text-primary font-bold hover:underline">Forgot password?</a>
              <p className="mt-2 text-slate-500">Don't have an account? <button onClick={() => setIsLogin(false)} className="text-primary font-bold hover:underline">Sign up</button></p>
            </>
          ) : (
             <p className="text-slate-500">Already have an account? <button onClick={() => setIsLogin(true)} className="text-primary font-bold hover:underline">Log in</button></p>
          )}
        </div>
      </div>
    </div>
  );
};