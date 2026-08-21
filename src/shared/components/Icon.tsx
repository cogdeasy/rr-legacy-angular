interface IconProps {
  children: string;
  className?: string;
}

export function Icon({ children, className }: IconProps) {
  return <span className={className ? `material-icons ${className}` : 'material-icons'}>{children}</span>;
}
