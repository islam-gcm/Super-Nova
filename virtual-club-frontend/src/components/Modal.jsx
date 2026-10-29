import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, eyebrow, children, size = "medium" }) {
  const titleId = useId();
  const panelRef = useRef(null);

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const previouslyFocused = document.activeElement;
    const handleKey = (event) => {
      if (event.key === "Escape") onCloseRef.current();

      if (event.key === "Tab" && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll(
          'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )];
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.body.classList.add("modal-open");
    window.addEventListener("keydown", handleKey);
    requestAnimationFrame(() => {
      const preferredTarget = panelRef.current?.querySelector("input:not([disabled]), textarea:not([disabled]), select:not([disabled])");
      (preferredTarget || panelRef.current)?.focus();
    });

    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="modal-root" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="modal-backdrop" onClick={onClose} aria-label="Close dialog" />
          <motion.section
            className={`modal-panel modal-${size}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="modal-heading">
              <div>
                {eyebrow && <span className="eyebrow">{eyebrow}</span>}
                <h2 id={titleId}>{title}</h2>
              </div>
              <button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
            </div>
            <div className="modal-content">{children}</div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
