import React, { ReactNode } from 'react';

export type SystemStateType = 'LOCKOUT' | 'TIMEOUT' | 'ENCRYPTION_FAILURE' | 'SUBMIT_BLOCKED';

interface SystemOverlayProps {
    type: SystemStateType;
    title: string;
    message: string;
    onAction?: () => void;
    actionLabel?: string;
    children?: ReactNode;
}

export const SystemOverlay: React.FC<SystemOverlayProps> = ({
    type,
    title,
    message,
    onAction,
    actionLabel,
    children
}) => {
    const configs: Record<SystemStateType, { icon: ReactNode; color: string; bg: string; border: string }> = {
        LOCKOUT: {
            icon: (
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            color: 'text-red-600',
            bg: 'bg-red-50',
            border: 'border-red-200'
        },
        TIMEOUT: {
            icon: (
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'text-amber-600',
            bg: 'bg-amber-50',
            border: 'border-amber-200'
        },
        ENCRYPTION_FAILURE: {
            icon: (
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            color: 'text-red-700',
            bg: 'bg-red-50/50',
            border: 'border-red-300'
        },
        SUBMIT_BLOCKED: {
            icon: (
                <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            ),
            color: 'text-rose-600',
            bg: 'bg-rose-50',
            border: 'border-rose-200'
        }
    };

    const config = configs[type];

    return (
        <>
            <div className="opacity-20 pointer-events-none filter blur-[4px]">
                {children}
            </div>

            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[4px] z-[9999]">
                <div className={`max-w-[340px] w-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-2xl border ${config.border} ${config.bg} p-8 text-center animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500`}>
                    <div className={`${config.color} flex justify-center mb-6`}>
                        <div className="p-3.5 bg-white rounded-full shadow-md">
                            <div className="w-10 h-10">
                                {config.icon}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">{title}</h3>
                    <p className="text-[11px] text-slate-600 mb-8 leading-relaxed font-semibold px-2">{message}</p>

                    {onAction && actionLabel && (
                        <button
                            onClick={onAction}
                            className={`w-full py-4 px-4 rounded-xl font-black text-white transition-all shadow-xl active:scale-[0.95] ring-offset-4 focus:ring-4 ${type === 'TIMEOUT' ? 'bg-amber-600 hover:bg-amber-700 ring-amber-500/50' :
                                type === 'ENCRYPTION_FAILURE' ? 'bg-slate-900 hover:bg-black ring-slate-400/50' :
                                    'bg-red-600 hover:bg-red-700 ring-red-500/50'
                                }`}
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};
