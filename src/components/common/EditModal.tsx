"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/NewInputField";
import Button from "@/components/ui/button/Button";
import SelectInput from "../form/form-elements/SelectInputs";
import { ChevronDownIcon } from "@/icons";

interface FieldOption {
  value: string | number;
  label: string;
}

interface FieldConfig {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: FieldOption[];
}

interface EditModalProps<T> {
  isOpen: boolean;
  title?: string;
  fields: FieldConfig[];
  data: Partial<T>;
  onChange: (data: Partial<T>) => void;
  onSubmit: () => void;
  onClose: () => void;
  entityName?: string;
}

export default function EditModal<T>({
  isOpen,
  title,
  fields,
  data,
  onChange,
  onSubmit,
  onClose,
  entityName = "Record",
}: EditModalProps<T>) {
  const [localData, setLocalData] = useState<Partial<T>>({});

  useEffect(() => {
    if (isOpen) {
      //console.log("Modal opened, incoming data:", data);
      setLocalData(data);
    }
  }, [isOpen, data]);

  const handleChange = (key: string, value: any) => {
    const updated = { ...localData, [key]: value };
    setLocalData(updated);
    onChange(updated);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {title || `Edit ${entityName}`}
        </h3>

        <div className="space-y-4">
           {fields.map(({ key, label, type = "text", required, options }) => (
            <div key={key}>
              <Label>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              {type === "select" ? (
                <div className="relative">
                  <SelectInput
                    options={options || []}
                    placeholder="Select..."
                    value={(localData as any)[key] || ""}
                    onChange={(value: string) => handleChange(key, value)}
                    className="w-full dark:bg-dark-900"
                  />

                  {/* dropdown icon */}
                  <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <ChevronDownIcon />
                  </span>
                </div>
              ) : (
                // ⭐ DEFAULT INPUT
                <Input
                  type={type}
                  value={(localData as any)[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}
