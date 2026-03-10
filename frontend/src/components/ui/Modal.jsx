import { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div
                className={clsx("bg-dark-800 rounded-xl border border-dark-600 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200", className)}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-dark-600">
                    <h3 className="text-lg font-bold text-gray-200">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-dark-700 rounded-full text-gray-400 hover:text-gray-200">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
