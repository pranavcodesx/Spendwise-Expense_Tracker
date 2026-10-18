import { useState } from 'react';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { useToast } from '../../context/ToastContext';
import { budgetApi } from '../../services/dataService';
import { EXPENSE_CATEGORIES } from '../../utils/categories';
import { getErrorMessage, getFieldErrors } from '../../utils/errors';
import { monthLabel } from '../../utils/format';

// budget given = edit (only the limit can change). Otherwise create for `month`.
export default function BudgetModal({ budget, month, takenCategories, onClose, onSaved }) {
  const toast = useToast();
  const free = EXPENSE_CATEGORIES.filter((c) => !takenCategories.includes(c));
  const [category, setCategory] = useState(budget?.category || free[0]);
  const [limit, setLimit] = useState(budget ? String(budget.limitAmount) : '');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!(Number(limit) > 0)) return setErrors({ limitAmount: 'Enter a limit greater than 0' });
    setBusy(true);
    setMessage('');
    try {
      if (budget) await budgetApi.update(budget.id, { limitAmount: Number(limit) });
      else await budgetApi.create({ category, month, limitAmount: Number(limit) });
      toast.success(budget ? 'Budget updated' : 'Budget added');
      onSaved();
      onClose();
    } catch (err) {
      setErrors(getFieldErrors(err));
      setMessage(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={budget ? 'Edit budget' : 'Add budget'} onClose={onClose} size="max-w-md">
      {!budget && free.length === 0 ? (
        <p className="text-sm text-muted">Every category already has a budget for {monthLabel(month)}. Edit an existing one instead.</p>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-4">
          <Alert>{message}</Alert>
          <p className="text-sm text-muted">Month: <span className="font-semibold text-ink">{monthLabel(month)}</span></p>
          <Select label="Category" value={category} options={budget ? [budget.category] : free} disabled={Boolean(budget)} onChange={(e) => { setCategory(e.target.value); setErrors({}); }} error={errors.category} />
          <Input label="Monthly limit" type="number" inputMode="decimal" min="0" step="0.01" placeholder="e.g. 10000" value={limit} onChange={(e) => { setLimit(e.target.value); setErrors({}); }} error={errors.limitAmount} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={busy}>{budget ? 'Save changes' : 'Add budget'}</Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
