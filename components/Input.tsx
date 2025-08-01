import React from "react";

interface InputProps {
  value: string | undefined | null;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Input = (props: InputProps) => {
  return (
    <input
      className={`w-full text-white text-sm bg-zinc-700 py-2 px-6 rounded-lg outline-none ${props.className}`}
      disabled={props.disabled}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      type="text"
      value={props.value || ""}
    />
  );
};
