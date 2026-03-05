import { cx } from "../lib/cva";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { };

export function Button({ children, className, ...props }: ButtonProps) {
  return <button
    className={cx("font-mono bg-transparent border border-mist/20 rounded-full text-fog cursor-pointer transition-all duration-200 hover:border-amber/40 hover:text-amber whitespace-nowrap px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase", className)}
    {...props}
  >
    {children}
  </button>

}
