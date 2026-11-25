import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import {
  descriptionClasses,
  footerClasses,
  headerClasses,
  overlayClasses,
  panelClasses,
  titleClasses,
} from "./dialogStyles";

const closeButtonClasses = cn(
  "absolute top-4 right-4 cursor-pointer rounded-xs opacity-70",
  "transition-opacity hover:opacity-100",
  "focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden",
  "[&_svg]:size-4",
);

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogClose = DialogPrimitive.Close;

function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className={overlayClasses} />

      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(panelClasses, className)}
        {...props}
      >
        {children}

        <DialogPrimitive.Close className={closeButtonClasses}>
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(headerClasses, className)} {...props} />;
}

function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(footerClasses, className)} {...props} />;
}

function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn(titleClasses, className)} {...props} />
  );
}

function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn(descriptionClasses, className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
};
