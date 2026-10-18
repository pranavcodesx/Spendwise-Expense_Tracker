import DateRangePicker from './DateRangePicker';

export default function PageHeader({ title, subtitle, picker = true, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}{picker && <DateRangePicker />}</div>
    </div>
  );
}
