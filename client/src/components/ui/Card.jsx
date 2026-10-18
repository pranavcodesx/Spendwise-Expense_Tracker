import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function CardHeader({ icon: Icon, title, to, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-base font-semibold">
        {Icon && <Icon className="h-5 w-5 text-brand" aria-hidden="true" />}
        {title}
      </h2>
      {action}
      {to && (
        <Link to={to} className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
