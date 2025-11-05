"use client";

import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Button from "@/components/ui/button/Button";

interface FieldConfig {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
}

interface AddModalProps<T> {
  isOpen: boolean;
  title?: string;
  fields: FieldConfig[];
  data: Partial<T>;
  onChange: (data: Partial<T>) => void;
  onSubmit: () => void;
  onClose: () => void;
  entityName?: string;
}

export default function AddModal<T>({
  isOpen,
  title,
  fields,
  data,
  onChange,
  onSubmit,
  onClose,
  entityName = "Record",
}: AddModalProps<T>) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {title || `Add ${entityName}`}
        </h3>
        <div className="space-y-4">
          {fields.map(({ key, label, type = "text", required }) => (
            <div key={key}>
              <Label>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                type={type}
                value={(data as any)[key] || ""}
                onChange={(e) => onChange({ ...data, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Add</Button>
        </div>
      </div>
    </Modal>
  );
}
