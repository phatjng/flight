import { Select as HUISelect, type SelectProps } from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends SelectProps {}

const Select = forwardRef<HTMLSelectElement, Props>((props, ref) => {
  return (
    <div className="relative">
      <HUISelect
        ref={ref}
        className="block w-full appearance-none py-1 pl-2 pr-8"
        {...props}
      />
      <svg
        className="pointer-events-none absolute right-1.5 top-1.5 size-4 fill-black"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
