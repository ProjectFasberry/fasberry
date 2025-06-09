import { forwardRef, HTMLAttributes } from "react";
import { Typography } from "./typography.js";

interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: {
    name: string;
    for: string;
    optional?: boolean;
  };
  errorMessage?: string;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, errorMessage, label, children, ...props }, ref) => {
    return (
      <div ref={ref} className="flex flex-col gap-y-2" {...props}>
        {label && (
          <>
            <label htmlFor={label.for} />
            <Typography
              className={`text-md font-medium text-shark-800`}
              textShadow="small"
            >
              {label.name} {label.optional && " (опционально)"}
            </Typography>
          </>
        )}
        {children}
        {errorMessage && (
          <span className="text-red-600 text-[16px] font-normal">
            {errorMessage}
          </span>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
