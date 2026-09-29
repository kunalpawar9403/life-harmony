import { X } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

export function Toaster() {
    const { toasts } = useToast();

    return (
        <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-4 sm:right-4 sm:top-auto sm:flex-col md:max-w-[420px]">
            {toasts.map((t) => (
                <Toast key={t.id} {...t} />
            ))}
        </div>
    );
}

function Toast({ id, title, description, open, onOpenChange }) {
    if (!open) return null;

    return (
        <div className="group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border border-[#363636]/10 bg-white p-4 pr-6 shadow-lg transition-all">
            <div className="grid gap-1">
                {title && <div className="text-sm font-semibold text-[#363636]">{title}</div>}
                {description && <div className="text-sm text-[#7a7a7a]">{description}</div>}
            </div>
            <button
                onClick={() => onOpenChange?.(false)}
                className="absolute right-2 top-2 rounded-md p-1 text-[#7a7a7a] opacity-0 transition-opacity group-hover:opacity-100"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}