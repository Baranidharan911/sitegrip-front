import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // Ripple effect state
    const [ripples, setRipples] = React.useState<{x: number, y: number, key: number}[]>([]);
    const rippleKey = React.useRef(0);
    const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setRipples(ripples => [...ripples, { x, y, key: rippleKey.current++ }]);
      setTimeout(() => {
        setRipples(ripples => ripples.slice(1));
      }, 500);
      if (props.onClick) props.onClick(e);
    };
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "transition-transform duration-100 active:scale-95 hover:shadow-lg focus:shadow-lg relative overflow-hidden"
        )}
        ref={ref}
        {...props}
        onClick={handleRipple}
      >
        {props.children}
        {/* Ripple effect */}
        {ripples.map(ripple => (
          <span
            key={ripple.key}
            className="absolute pointer-events-none rounded-full bg-white/40 dark:bg-white/20 animate-ripple"
            style={{
              left: ripple.x - 16,
              top: ripple.y - 16,
              width: 32,
              height: 32,
              opacity: 0.7,
            }}
          />
        ))}
      </Comp>
    );
  }
);
Button.displayName = "Button"

export { Button, buttonVariants } 