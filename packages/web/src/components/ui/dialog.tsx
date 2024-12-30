import { Dialog as HUIDialog, type DialogProps } from "@headlessui/react";
import { forwardRef } from "react";

interface Props extends DialogProps {
  children?: React.ReactNode;
}

const Dialog = forwardRef<HTMLElement, Props>((props, ref) => {
  return (
    <HUIDialog ref={ref} className="" {...props}>
      <div className="bg-sand-1/80 fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-start justify-center pt-40">
          {props.children}
        </div>
      </div>
    </HUIDialog>
  );
});
Dialog.displayName = "Dialog";

export { Dialog };
