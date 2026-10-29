
const Button = ({
  children,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={`
        inline-flex items-center justify-center
        rounded-lg px-5 py-2 text-sm font-semibold text-[#151525]
        bg-[#EC6AA5] hover:bg-[#E45B98]
        transition-[transform,box-shadow,background-color] duration-200
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/20
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-pink-400 focus-visible:ring-offset-2
        dark:focus-visible:ring-offset-slate-950
        disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;