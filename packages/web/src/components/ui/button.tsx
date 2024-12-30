import { Button as HUIButton, type ButtonProps } from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends ButtonProps {}

const Button = forwardRef<HTMLElement, Props>((props, ref) => {
  return (
    <HUIButton
      ref={ref}
      className="bg-sand-12 text-sand-1 flex h-9 gap-2 px-4 py-2 text-sm tracking-tight"
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button };
