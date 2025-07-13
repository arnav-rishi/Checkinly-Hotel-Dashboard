
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Loader2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [signUpErrors, setSignUpErrors] = useState<{ email?: string; password?: string }>({});
  const { login, signUp, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const validateLoginForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignUpForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!signUpEmail) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpEmail)) {
      newErrors.email = 'Email is invalid';
    }

    if (!signUpPassword) {
      newErrors.password = 'Password is required';
    } else if (signUpPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setSignUpErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
      return;
    }

    setLoginLoading(true);
    try {
      await login(email, password);
      // Navigation will be handled by the auth state change
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignUpForm()) {
      return;
    }

    setSignUpLoading(true);
    try {
      await signUp(signUpEmail, signUpPassword);
    } catch (error) {
      // Error handling is done in the auth context
    } finally {
      setSignUpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary rounded-lg flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Hotel Management</CardTitle>
          <CardDescription>
            Access your hotel dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={errors.email ? "border-destructive" : ""}
                    disabled={loginLoading}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-sm text-destructive">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={errors.password ? "border-destructive" : ""}
                    disabled={loginLoading}
                  />
                  {errors.password && (
                    <p id="password-error" className="text-sm text-destructive">
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginLoading}
                >
                  {loginLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loginLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    aria-describedby={signUpErrors.email ? "signup-email-error" : undefined}
                    className={signUpErrors.email ? "border-destructive" : ""}
                    disabled={signUpLoading}
                  />
                  {signUpErrors.email && (
                    <p id="signup-email-error" className="text-sm text-destructive">
                      {signUpErrors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Enter your password (min. 6 characters)"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    aria-describedby={signUpErrors.password ? "signup-password-error" : undefined}
                    className={signUpErrors.password ? "border-destructive" : ""}
                    disabled={signUpLoading}
                  />
                  {signUpErrors.password && (
                    <p id="signup-password-error" className="text-sm text-destructive">
                      {signUpErrors.password}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={signUpLoading}
                >
                  {signUpLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {signUpLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
