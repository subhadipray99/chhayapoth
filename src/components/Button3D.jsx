import Link from 'next/link';

export default function Button3D({
  children,
  variant = 'white', // white, orange, blue, red, black
  href,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) {
  const baseClass = 'btn-3d';
  const variantClass = `btn-3d-${variant}`;
  const combinedClasses = `${baseClass} ${variantClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`.trim();

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
