import { Children, cloneElement, isValidElement } from "react";

export default function AdminFormGroup({ label, htmlFor, required = false, error, hint, children, className = "" }) {
  const child = Children.only(children);
  if (!isValidElement(child)) throw new Error("AdminFormGroup needs one form field.");
  const field = cloneElement(child, {
    "aria-invalid": Boolean(error),
    "aria-describedby": [hint ? `${htmlFor}-hint` : null, error ? `${htmlFor}-error` : null].filter(Boolean).join(" ") || undefined,
  });
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-semibold text-primary-900">
        {label} {required && <span className="text-red-700" aria-label="required">*</span>}
      </label>
      {field}
      {hint && <p id={`${htmlFor}-hint`} className="text-xs text-neutral-600">{hint}</p>}
      {error && <p id={`${htmlFor}-error`} role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
