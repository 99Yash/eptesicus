'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import {
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from '@workspace/ui/components/dialog';
import {
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerTitle,
} from '@workspace/ui/components/drawer';
import { cn } from '@workspace/ui/lib/utils';
import { useRouter } from 'next/navigation';
import { Drawer } from 'vaul';
import { useMediaQuery } from '~/hooks/use-media-query';

export function Modal({
  children,
  className,
  showModal,
  setShowModal,
  onClose,
  desktopOnly,
  preventDefaultClose,
  persistent,
}: {
  children: React.ReactNode;
  className?: string;
  showModal?: boolean;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
  desktopOnly?: boolean;
  preventDefaultClose?: boolean;
  persistent?: boolean;
}) {
  const router = useRouter();

  const closeModal = ({ dragged }: { dragged?: boolean } = {}) => {
    if (persistent || preventDefaultClose) {
      return;
    }
    // fire onClose event if provided
    onClose?.();

    // if setShowModal is defined, use it to close modal
    if (setShowModal) {
      setShowModal(false);
      // else, this is intercepting route @modal
    } else {
      router.back();
    }
  };
  const isMobile = useMediaQuery('(max-width: 780px)');

  if (isMobile && !desktopOnly) {
    return (
      <Drawer.Root
        open={setShowModal ? showModal : true}
        onOpenChange={(open) => {
          if (!open) {
            closeModal({ dragged: true });
          }
        }}
      >
        <DrawerOverlay />
        <Drawer.Portal>
          <VisuallyHidden asChild>
            <div className="sr-only">
              <DrawerTitle>Modal</DrawerTitle>
              <DrawerDescription>Modal</DrawerDescription>
            </div>
          </VisuallyHidden>
          <DrawerContent className={cn(className, 'p-2')}>
            {children}
          </DrawerContent>
          <Drawer.Overlay />
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root
      open={setShowModal ? showModal : true}
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
    >
      <Dialog.Portal>
        <VisuallyHidden asChild>
          <div className="sr-only">
            <DialogTitle>Modal</DialogTitle>
            <DialogDescription>Modal</DialogDescription>
          </div>
        </VisuallyHidden>
        <DialogOverlay id="modal-backdrop" />
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn(className)}
        >
          {children}
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
