import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Car, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAdmin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    if (success) {
      navigate('/admin');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4" data-testid="login-page">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-500/5 blur-[100px] rounded-full"></div>
      </div>

      <Card className="w-full max-w-md bg-[#18181b]/80 backdrop-blur-xl border-white/10 shadow-2xl animate-slide-up" data-testid="login-card">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-4 animate-pulse-glow">
            <Car className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">ترانسفيرز</CardTitle>
          <CardDescription className="text-zinc-400">لوحة تحكم الإدارة</CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm animate-slide-up" data-testid="login-error">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@transfers.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-zinc-600"
                  required
                  data-testid="login-email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">كلمة المرور</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10 bg-white/5 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-zinc-600"
                  required
                  data-testid="login-password"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 btn-glow transition-all duration-200"
              data-testid="login-submit"
            >
              {loading ? 'جاري التحميل...' : 'تسجيل الدخول'}
            </Button>

            <p className="text-center text-xs text-zinc-500 pt-2">
              بيانات الدخول التجريبية: admin@transfers.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
