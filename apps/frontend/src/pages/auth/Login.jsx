import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Button, Input, Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login(email, password);
      const role = data.data?.user?.role;
      toast.success('Welcome');
      if (from && (from.startsWith('/admin') || from.startsWith('/owner'))) {
        navigate(from, { replace: true });
      } else if (role === 'owner') {
        navigate('/owner', { replace: true });
      } else {
        navigate('/admin/overview', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-violet-950 to-primary-800 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-gray-200/90 ring-1 ring-white/10 backdrop-blur-sm bg-white/95 dark:bg-slate-900/95 dark:border-slate-600 dark:ring-white/5">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-slate-900 dark:text-gray-50">Sign in</CardTitle>
            <CardDescription className="text-center">Admin or owner account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  className="pl-10"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={errors.email}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-9 h-5 w-5 text-gray-400" />
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  className="pl-10"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                />
              </div>
              <Button type="submit" className="w-full" variant="cta" loading={loading}>
                Continue
              </Button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              <Link to="/" className="text-primary-600 hover:underline dark:text-primary-400">
                Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
