import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { authApi } from '@/api/auth.api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null);
      const res = await authApi.login(data);
      if (res.access_token) {
        // Backend only returns token, no user object. Save temporarily to localStorage
        // so the profileApi Axios interceptor picks it up
        localStorage.setItem('r2i_token', res.access_token);
        
        // Now fetch user
        const { profileApi } = await import('@/api/profile.api');
        const user = await profileApi.getProfile();
        
        login(res.access_token, user);
        navigate('/home');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.detail || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left Branding Panel (Hidden on small screens) */}
      <div className="hidden lg:flex w-[40%] bg-surface border-r border-border flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="R2I Logo" className="h-10 w-auto object-contain flex-shrink-0" />
          <span className="font-syne font-bold text-2xl tracking-tight">
            Resume2<span className="text-primary">Interview</span>
          </span>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-syne font-bold leading-tight text-foreground">
            Refine your pitch.<br/>Ace the interview.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md">
            AI-powered simulated technical interviews generated instantly from your uploaded resume.
          </p>
        </div>
        
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Resume2Interview. All rights reserved.
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden">
          <img src="/logo.png" alt="R2I Logo" className="h-8 w-auto object-contain flex-shrink-0" />
          <span className="font-syne font-bold text-xl tracking-tight">R2I</span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-syne font-bold mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                className="bg-surface-3 transition-colors h-11"
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-primary-dim transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-surface-3 transition-colors h-11 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base bg-primary hover:bg-primary-dim text-white mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Log In'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground mt-8">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-dim font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
