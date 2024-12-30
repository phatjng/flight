import {
  Popover as HUIPopover,
  PopoverPanel,
  type PopoverProps,
} from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends PopoverProps {
  children?: React.ReactNode;
}

const Popover = forwardRef<HTMLDivElement, Props>((props, ref) => {
  return (
    <HUIPopover ref={ref} className="relative border" {...props}>
      <PopoverPanel static>{props.children}</PopoverPanel>
    </HUIPopover>
  );
});
Popover.displayName = "Popover";

export { Popover };
