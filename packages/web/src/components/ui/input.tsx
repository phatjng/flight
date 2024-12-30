import { Input as HUIInput, type InputProps } from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends InputProps {}

const Input = forwardRef<HTMLElement, Props>((props, ref) => {
  return (
    <HUIInput
      ref={ref}
      className={
        "border-sand-12 focus:bg-sand-1 flex h-9 w-full border px-3 py-2 transition focus:outline-none"
      }
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
