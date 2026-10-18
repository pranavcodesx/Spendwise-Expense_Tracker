export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      {Icon && <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-brand"><Icon className="h-6 w-6" aria-hidden="true" /></span>}
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      {text && <p className="mt-1 max-w-sm text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
