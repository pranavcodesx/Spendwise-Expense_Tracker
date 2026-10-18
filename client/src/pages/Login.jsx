import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import useAuth from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { isEmail } from '../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const from = useLocation().state?.from?.pathname || '/dashboard';
  const [form, setForm] = useState({ email: '', password: '', rememberMe: true });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.email.trim()) er.email = 'Email is required';
    else if (!isEmail(form.email.trim())) er.email = 'Enter a valid email address';
    if (!form.password) er.password = 'Password is required';
    setErrors(er);
    if (Object.keys(er).length) return;

    setLoading(true);
    setMessage('');
    try {
      await login({ email: form.email.trim(), password: form.password, rememberMe: form.rememberMe });
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setMessage(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-muted">Sign in to see your spending, budgets and savings.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Alert>{message}</Alert>
        <Input label="Email" name="email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={errors.email} />
        <Input label="Password" name="password" type="password" icon={Lock} autoComplete="current-password" placeholder="Enter your password" value={form.password} onChange={onChange} error={errors.password} />
        <div className="flex items-center justify-between text-sm">
          <label className="flex min-h-[44px] items-center gap-2">
            <input type="checkbox" name="rememberMe" checked={form.rememberMe} onChange={onChange} className="h-4 w-4 rounded border-line accent-brand" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-medium text-brand-dark hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" loading={loading} className="w-full">Sign in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to SpendWise? <Link to="/signup" className="font-semibold text-brand-dark hover:underline">Create an account</Link>
      </p>
    </>
  );
}
