import { cn } from "@/lib/utils";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { Button } from "./Button";
import {
  descriptionClasses,
  footerClasses,
  headerClasses,
  overlayClasses,
  panelClasses,
  titleClasses,
} from "./dialogStyles";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

const AlertDialog = AlertDialogPrimitive.Root;

const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

function AlertDialogContent({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className={overlayClasses} />

      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(panelClasses, className)}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(headerClasses, className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(footerClasses, className)} {...props} />;
}

function AlertDialogTitle({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      className={cn(titleClasses, className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      className={cn(descriptionClasses, className)}
      {...props}
    />
  );
}

function AlertDialogAction({
  variant = "default",
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action> & {
  variant?: ButtonVariant;
}) {
  return (
    <Button variant={variant} asChild>
      <AlertDialogPrimitive.Action {...props} />
    </Button>
  );
}

function AlertDialogCancel(
  props: ComponentProps<typeof AlertDialogPrimitive.Cancel>,
) {
  return (
    <Button variant="outline" asChild>
      <AlertDialogPrimitive.Cancel {...props} />
    </Button>
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
};
