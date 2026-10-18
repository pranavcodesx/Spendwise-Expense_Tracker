import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import useAuth from '../hooks/useAuth';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { isEmail, passwordError } from '../utils/validators';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const er = {};
    if (form.name.trim().length < 2) er.name = 'Enter your full name';
    if (!form.email.trim()) er.email = 'Email is required';
    else if (!isEmail(form.email.trim())) er.email = 'Enter a valid email address';
    const pw = passwordError(form.password);
    if (pw) er.password = pw;
    if (!form.confirmPassword) er.confirmPassword = 'Confirm your password';
    else if (form.confirmPassword !== form.password) er.confirmPassword = 'Passwords do not match';
    return er;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = validate();
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    setMessage('');
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setMessage(getErrorMessage(err));
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-muted">Start tracking your income, expenses and savings goals.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Alert>{message}</Alert>
        <Input label="Full name" name="name" icon={User} autoComplete="name" placeholder="Your full name" value={form.name} onChange={onChange} error={errors.name} />
        <Input label="Email" name="email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com" value={form.email} onChange={onChange} error={errors.email} />
        <Input label="Password" name="password" type="password" icon={Lock} autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={onChange} error={errors.password} />
        <Input label="Confirm password" name="confirmPassword" type="password" icon={Lock} autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={onChange} error={errors.confirmPassword} />
        <p className="-mt-2 text-xs text-muted">Use 8+ characters with upper and lower case letters and a number.</p>
        <Button type="submit" loading={loading} className="w-full">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="font-semibold text-brand-dark hover:underline">Sign in</Link>
      </p>
    </>
  );
}
