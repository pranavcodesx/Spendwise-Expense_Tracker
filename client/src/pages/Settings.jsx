import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, KeyRound, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import { userApi } from '../services/dataService';
import { CURRENCIES } from '../utils/categories';
import { getErrorMessage, getFieldErrors } from '../utils/errors';
import { formatDate } from '../utils/format';
import { isEmail, passwordError } from '../utils/validators';

function Section({ icon: Icon, title, text, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="flex items-center gap-2.5 text-base font-semibold"><Icon className="h-5 w-5 text-brand" aria-hidden="true" /> {title}</h2>
      {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ name: user.name, email: user.email, currency: user.currency, currentPassword: '' });
  const [pErrors, setPErrors] = useState({});
  const [pMsg, setPMsg] = useState('');
  const [pBusy, setPBusy] = useState(false);
  const emailChanged = profile.email.trim().toLowerCase() !== user.email;

  const saveProfile = async (e) => {
    e.preventDefault();
    const er = {};
    if (profile.name.trim().length < 2) er.name = 'Name must be at least 2 characters';
    if (!isEmail(profile.email.trim())) er.email = 'Enter a valid email address';
    if (emailChanged && !profile.currentPassword) er.currentPassword = 'Enter your current password to change your email';
    setPErrors(er);
    if (Object.keys(er).length) return;
    setPBusy(true);
    setPMsg('');
    try {
      const d = await userApi.updateProfile({ name: profile.name.trim(), email: profile.email.trim(), currency: profile.currency, currentPassword: profile.currentPassword || undefined });
      updateUser(d.user);
      setProfile((p) => ({ ...p, currentPassword: '' }));
      toast.success('Profile updated');
    } catch (err) {
      setPErrors(getFieldErrors(err));
      setPMsg(getErrorMessage(err));
    } finally {
      setPBusy(false);
    }
  };

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [wErrors, setWErrors] = useState({});
  const [wMsg, setWMsg] = useState('');
  const [wBusy, setWBusy] = useState(false);
  const savePassword = async (e) => {
    e.preventDefault();
    const er = {};
    if (!pw.currentPassword) er.currentPassword = 'Enter your current password';
    const issue = passwordError(pw.newPassword);
    if (issue) er.newPassword = issue;
    if (pw.confirm !== pw.newPassword) er.confirm = 'Passwords do not match';
    setWErrors(er);
    if (Object.keys(er).length) return;
    setWBusy(true);
    setWMsg('');
    try {
      await userApi.updatePassword({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      toast.success('Password changed');
    } catch (err) {
      setWErrors(getFieldErrors(err));
      setWMsg(getErrorMessage(err));
    } finally {
      setWBusy(false);
    }
  };

  const [demo, setDemo] = useState(null); // 'load' | 'remove'
  const runDemo = async () => {
    try {
      if (demo === 'load') { const r = await userApi.loadDemo(); toast.success(`Added ${r.transactions} demo transactions and budgets`); }
      else { const r = await userApi.removeDemo(); toast.success(`Removed ${r.transactions} demo transactions and ${r.budgets} budgets`); }
      setDemo(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDemo(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Settings</h1>
        <p className="mt-1 text-muted">Manage your profile, security and data. Member since {formatDate(user.createdAt)}.</p>
      </div>

      <Section icon={UserIcon} title="Profile" text="Your name and email are shown in the header.">
        <form onSubmit={saveProfile} noValidate className="space-y-4">
          <Alert>{pMsg}</Alert>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Display name" value={profile.name} onChange={(e) => { setProfile((p) => ({ ...p, name: e.target.value })); setPErrors((x) => ({ ...x, name: '' })); }} error={pErrors.name} />
            <Select label="Currency" value={profile.currency} options={CURRENCIES} onChange={(e) => setProfile((p) => ({ ...p, currency: e.target.value }))} error={pErrors.currency} />
          </div>
          <Input label="Email" type="email" value={profile.email} onChange={(e) => { setProfile((p) => ({ ...p, email: e.target.value })); setPErrors((x) => ({ ...x, email: '' })); }} error={pErrors.email} />
          {emailChanged && <Input label="Current password (required to change email)" type="password" autoComplete="current-password" value={profile.currentPassword} onChange={(e) => { setProfile((p) => ({ ...p, currentPassword: e.target.value })); setPErrors((x) => ({ ...x, currentPassword: '' })); }} error={pErrors.currentPassword} />}
          <Button type="submit" loading={pBusy}>Save profile</Button>
        </form>
      </Section>

      <Section icon={KeyRound} title="Change password">
        <form onSubmit={savePassword} noValidate className="space-y-4">
          <Alert>{wMsg}</Alert>
          <Input label="Current password" type="password" autoComplete="current-password" value={pw.currentPassword} onChange={(e) => { setPw((p) => ({ ...p, currentPassword: e.target.value })); setWErrors((x) => ({ ...x, currentPassword: '' })); }} error={wErrors.currentPassword} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="New password" type="password" autoComplete="new-password" value={pw.newPassword} onChange={(e) => { setPw((p) => ({ ...p, newPassword: e.target.value })); setWErrors((x) => ({ ...x, newPassword: '' })); }} error={wErrors.newPassword} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={pw.confirm} onChange={(e) => { setPw((p) => ({ ...p, confirm: e.target.value })); setWErrors((x) => ({ ...x, confirm: '' })); }} error={wErrors.confirm} />
          </div>
          <Button type="submit" loading={wBusy}>Change password</Button>
        </form>
      </Section>

      <Section icon={Database} title="Demo data" text="Want to preview charts quickly? Load sample transactions and budgets. They are tagged DEMO everywhere and can be removed with one click. Your own records are never touched.">
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setDemo('load')}><Database className="h-4 w-4" aria-hidden="true" /> Load demo data</Button>
          <Button variant="outline" onClick={() => setDemo('remove')}><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove demo data</Button>
        </div>
      </Section>

      <Section icon={LogOut} title="Session">
        <Button variant="outline" onClick={async () => { await logout(); navigate('/login'); }}><LogOut className="h-4 w-4" aria-hidden="true" /> Log out</Button>
      </Section>

      {demo && <ConfirmDialog title={demo === 'load' ? 'Load demo data?' : 'Remove demo data?'} message={demo === 'load' ? 'About 4 months of sample transactions and this month’s budgets will be added, each tagged DEMO.' : 'Only rows tagged DEMO will be deleted. Everything you entered yourself stays.'} confirmLabel={demo === 'load' ? 'Load demo data' : 'Remove'} onConfirm={runDemo} onClose={() => setDemo(null)} />}
    </div>
  );
}
