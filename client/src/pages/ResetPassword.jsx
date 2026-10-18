import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { resetPassword } from '../services/authService';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { passwordError } from '../utils/validators';

export default function ResetPassword() {
  const token = useSearchParams()[0].get('token');
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'error', message: '' });
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <>
        <h1 className="text-3xl font-bold">Link not valid</h1>
        <p className="mt-2 text-muted">This reset link is missing its token. Request a new one.</p>
        <Link to="/forgot-password" className="mt-6 inline-block font-semibold text-brand-dark hover:underline">Request a new link</Link>
      </>
    );
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    const er = {};
    const pw = passwordError(form.password);
    if (pw) er.password = pw;
    if (form.confirm !== form.password) er.confirm = 'Passwords do not match';
    setErrors(er);
    if (Object.keys(er).length) return;
    setLoading(true);
    try {
      const data = await resetPassword({ token, password: form.password });
      setStatus({ type: 'success', message: data.message });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setErrors(getFieldErrors(err));
      setStatus({ type: 'error', message: getErrorMessage(err) });
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <p className="mt-2 text-muted">Pick a strong password you have not used before.</p>
      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <Alert type={status.type}>{status.message}</Alert>
        <Input label="New password" type="password" icon={Lock} autoComplete="new-password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password} />
        <Input label="Confirm new password" type="password" icon={Lock} autoComplete="new-password" value={form.confirm} onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))} error={errors.confirm} />
        <Button type="submit" loading={loading} className="w-full">Update password</Button>
      </form>
    </>
  );
}
