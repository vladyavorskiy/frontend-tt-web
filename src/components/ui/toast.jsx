import * as RadixToast from '@radix-ui/react-toast';
import React from 'react';

const toastStyles = {
  success: "bg-green-100/50 border border-green-500 text-green-800 p-4 rounded shadow",
  error: "bg-red-100/50 border border-red-500 text-red-800 p-4 rounded shadow",
  default: "bg-white border border-gray-300 text-gray-900 p-4 rounded shadow"
};

export function Toast({ type = "default", title, description, open, onOpenChange }) {
  return (
    <RadixToast.Root
      open={open}
      onOpenChange={onOpenChange}
      className={toastStyles[type]}
    >
      {title && <RadixToast.Title className="font-semibold">{title}</RadixToast.Title>}
      {description && <RadixToast.Description>{description}</RadixToast.Description>}
    </RadixToast.Root>
  );
}

export function ToastViewport() {
  return (
    <RadixToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50" />
  );
}
