"use client";

import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName?: string;
  message?: string;
}

export default function DeleteModal({
  isOpen,
  onClose,
  onConfirm,
  entityName = "record",
  message,
}: DeleteModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Delete {entityName}
        </h3>
        <p className="mb-4 text-gray-900 dark:text-white">
          {message || `Are you sure you want to delete this ${entityName}?`}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
}
