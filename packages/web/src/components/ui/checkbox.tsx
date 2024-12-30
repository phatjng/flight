import { Checkbox as HUICheckbox, type CheckboxProps } from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends CheckboxProps {}

const Checkbox = forwardRef<HTMLInputElement, Props>((props, ref) => {
  return (
    <HUICheckbox
      ref={ref}
      className="data-[checked]:border-sand-12 data-[checked]:bg-sand-12 group block size-4 border"
      {...props}
    >
      <svg
        className="fill-sand-1 pointer-events-none opacity-0 group-data-[checked]:opacity-100"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z"
        />
      </svg>
    </HUICheckbox>
  );
});
Checkbox.displayName = "Checkbox";

export { Checkbox };
