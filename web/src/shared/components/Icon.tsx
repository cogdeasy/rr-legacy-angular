interface IconProps {
  name: string;
  className?: string;
}

/** Material Icons ligature span, replacing `<mat-icon>`. */
export function Icon({ name, className }: IconProps) {
  return (
    <span className={className ? `material-icons ${className}` : 'material-icons'} aria-hidden="true">
      {name}
    </span>
  );
}
