import { User } from 'iconsax-reactjs';
import { initials } from '../../utils/format';

interface AvatarProps {
  name?: string;
  size?: 'sm' | 'md';
}

/** Circular initials avatar. */
export function Avatar({ name, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs';
  return (
    <div
      className={`${sizeClass} rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent uppercase shrink-0`}
    >
      {name ? initials(name) : <User size={14} variant="Bold" />}
    </div>
  );
}
