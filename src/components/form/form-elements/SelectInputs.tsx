"use client";

import React from "react";
import Label from "../Label";
import Select from "../Select";
import MultiSelect from "../MultiSelect";
import { ChevronDownIcon } from "@/icons";

interface SimpleOption {
  value: string;
  label: string;
}

interface MultiOption {
  value: string;
  text: string;
  selected?: boolean;
}

interface SelectInputProps {
  label?: string;
  type?: "single" | "multi";
  placeholder?: string;

  // Single Select
  options?: SimpleOption[];
  value?: string;
  onChange?: (value: string) => void;

  // Multi Select
  multiOptions?: MultiOption[];
  defaultSelected?: string[];
  onMultiChange?: (values: string[]) => void;

  className?: string;
}

export default function SelectInput({
  label,
  type = "single",
  placeholder = "Select...",
  options = [],
  value = "",
  onChange = () => {},

  multiOptions = [],
  defaultSelected = [],
  onMultiChange = () => {},

  className = "",
}: SelectInputProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      {/* Single Select */}
      {type === "single" && (
        <div className="relative">
          <Select
            options={options}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={className}
          />
          <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
            <ChevronDownIcon />
          </span>
        </div>
      )}

      {/* Multi Select */}
      {type === "multi" && (
        <MultiSelect
          label={label}
          options={multiOptions}
          defaultSelected={defaultSelected}
          onChange={onMultiChange}
        />
      )}
    </div>
  );
}
