import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { transactionApi } from '../../services/dataService';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../../utils/categories';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { toYMD } from '../../utils/format';

// Used for both "Add" (no item) and "Edit" (item given).
export default function TransactionModal({ item, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState(() => item
    ? { type: item.type, title: item.title, amount: String(item.amount), category: item.category, date: item.date.slice(0, 10), paymentMethod: item.paymentMethod || '', notes: item.notes || '' }
    : { type: 'expense', title: '', amount: '', category: EXPENSE_CATEGORIES[0], date: toYMD(new Date()), paymentMethod: 'UPI', notes: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const set = (name, value) => { setForm((f) => ({ ...f, [name]: value })); setErrors((e) => ({ ...e, [name]: '' })); };
  const setType = (type) => setForm((f) => ({ ...f, type, category: (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)[0] }));

  const submit = async (e) => {
    e.preventDefault();
    const er = {};
    if (!form.title.trim()) er.title = 'Title is required';
    if (!(Number(form.amount) > 0)) er.amount = 'Enter an amount greater than 0';
    if (!form.date) er.date = 'Choose a date';
    setErrors(er);
    if (Object.keys(er).length) return;

    setBusy(true);
    setMessage('');
    const payload = { ...form, title: form.title.trim(), amount: Number(form.amount) };
    try {
      if (item) await transactionApi.update(item.id, payload);
      else await transactionApi.create(payload);
      toast.success(item ? 'Transaction updated' : 'Transaction added');
      onSaved();
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setMessage(getErrorMessage(err));
      setBusy(false);
    }
  };

  const seg = (active) => `min-h-[44px] flex-1 rounded-lg text-sm font-semibold transition ${active ? 'bg-white shadow-card' : 'text-muted'}`;
  return (
    <Modal title={item ? 'Edit transaction' : 'Add transaction'} onClose={onClose}>
      <form onSubmit={submit} noValidate className="space-y-4">
        <Alert>{message}</Alert>
        <div className="flex gap-1 rounded-xl bg-canvas p-1" role="group" aria-label="Transaction type">
          <button type="button" aria-pressed={form.type === 'expense'} onClick={() => setType('expense')} className={`${seg(form.type === 'expense')} ${form.type === 'expense' ? 'text-expense' : ''}`}>Expense</button>
          <button type="button" aria-pressed={form.type === 'income'} onClick={() => setType('income')} className={`${seg(form.type === 'income')} ${form.type === 'income' ? 'text-emerald-600' : ''}`}>Income</button>
        </div>
        <Input label="Title" value={form.title} maxLength={100} placeholder="e.g. Swiggy order" onChange={(e) => set('title', e.target.value)} error={errors.title} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Amount" type="number" inputMode="decimal" min="0" step="0.01" value={form.amount} placeholder="0.00" onChange={(e) => set('amount', e.target.value)} error={errors.amount} />
          <Input label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} error={errors.date} />
          <Select label="Category" value={form.category} options={categories} onChange={(e) => set('category', e.target.value)} error={errors.category} />
          <Select label="Payment method" value={form.paymentMethod} options={[{ value: '', label: 'Not specified' }, ...PAYMENT_METHODS]} onChange={(e) => set('paymentMethod', e.target.value)} error={errors.paymentMethod} />
        </div>
        <Input as="textarea" rows={3} label="Notes (optional)" value={form.notes} maxLength={300} onChange={(e) => set('notes', e.target.value)} error={errors.notes} />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy}>{item ? 'Save changes' : 'Add transaction'}</Button>
        </div>
      </form>
    </Modal>
  );
}
