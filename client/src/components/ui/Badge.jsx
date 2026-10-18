import { getCategory } from '../../utils/categories';

// Tinted pill built from one hex colour (18 = ~10% opacity in hex).
export function Badge({ color, children }) {
  return (
    <span className="inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ backgroundColor: `${color}22`, color }}>
      {children}
    </span>
  );
}

export function CategoryIcon({ category }) {
  const { color, icon: Icon } = getCategory(category);
  return (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${color}1F`, color }}>
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
    </span>
  );
}
