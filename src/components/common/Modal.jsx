import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ open, onClose, title, children, footer }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const body = document.body;

    // Calculate scrollbar width to avoid layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      body.style.overflow = prevOverflow || '';
      body.style.paddingRight = prevPaddingRight || '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[1000] bg-black/40 flex items-center justify-center"
      onMouseDown={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-100 p-0"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          {footer}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;