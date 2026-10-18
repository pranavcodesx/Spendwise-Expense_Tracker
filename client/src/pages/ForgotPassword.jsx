import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { forgotPassword } from '../services/authService';
import { getErrorMessage } from '../utils/errors';
import { isEmail } from '../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ type: 'error', message: '' });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isEmail(email.trim())) return setError('Enter a valid email address');
    setError('');
    setLoading(true);
    setStatus({ type: 'error', message: '' });
    try {
      const data = await forgotPassword({ email: email.trim() });
      setStatus({ type: 'success', message: data.message }); // message comes from the server; it never claims an email was sent
    } catch (err) {
      setStatus({ type: 'error', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Reset your password</h1>
      <p className="mt-2 text-muted">Enter your account email to get password reset instructions.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Alert type={status.type}>{status.message}</Alert>
        <Input label="Email" type="email" icon={Mail} autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={error} />
        <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
      </form>
      <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-brand-dark hover:underline">Back to sign in</Link></p>
    </>
  );
}
