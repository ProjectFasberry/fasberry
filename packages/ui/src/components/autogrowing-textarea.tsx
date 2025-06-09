import { Textarea } from "./textarea";
import { ChangeEvent, TextareaHTMLAttributes, useRef } from "react";
import { cn } from "@repo/lib/utils/ui/cn.ts";

interface AutogrowingTextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> { }

export default function AutogrowingTextarea({
  onChange, onKeyDown, ...props
}: AutogrowingTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const defaultRows = 1;
  const maxRows = undefined;

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";

    const style = window.getComputedStyle(textarea);

    const borderHeight = parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
    const paddingHeight = parseInt(style.paddingTop) + parseInt(style.paddingBottom);

    const lineHeight = parseInt(style.lineHeight);

    const maxHeight = maxRows
      ? lineHeight * maxRows + borderHeight + paddingHeight : Infinity;

    const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);
    
    if (textarea.value.endsWith('\n\n')) return;

    textarea.style.height = `${newHeight}px`;

    if (onChange) onChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) onKeyDown(e);

    if (e.shiftKey && e.key === ' ') {
      e.preventDefault();

      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const value = textarea.value;
      const newValue = `${value.substring(0, start)}\n${value.substring(end)}`;

      textarea.value = newValue;
      textarea.setSelectionRange(start + 1, start + 1);

      if (textarea.value.endsWith('\n\n')) return;

      textarea.style.height = "auto";

      const style = window.getComputedStyle(textarea);

      const borderHeight = parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
      const paddingHeight = parseInt(style.paddingTop) + parseInt(style.paddingBottom);

      const lineHeight = parseInt(style.lineHeight);

      const maxHeight = maxRows
        ? lineHeight * maxRows + borderHeight + paddingHeight : Infinity;

      const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

      textarea.style.height = `${newHeight}px`;
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={defaultRows}
        className={cn("min-h-[none] resize-none ", props.className)}
        {...props}
      />
    </div>
  );
}