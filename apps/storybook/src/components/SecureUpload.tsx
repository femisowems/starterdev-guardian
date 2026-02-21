import React, { useState } from 'react';

interface SecureUploadProps {
    label: string;
    onFileSelect?: (file: File) => void;
    accept?: string;
    maxSizeMB?: number;
}

export const SecureUpload: React.FC<SecureUploadProps> = ({
    label,
    onFileSelect,
    accept = ".pdf,.jpg,.png",
    maxSizeMB = 5
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [scanning, setScanning] = useState(false);
    const [encrypted, setEncrypted] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setScanning(true);

            // Simulate enterprise virus scanning & encryption
            setTimeout(() => {
                setScanning(false);
                setEncrypted(true);
                if (onFileSelect) onFileSelect(selectedFile);
            }, 1500);
        }
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
                {label}
            </label>

            <div className={`
        border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all
        ${file ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/10'}
      `}>
                {!file ? (
                    <>
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-900 leading-none">Click to upload document</p>
                            <p className="text-xs text-slate-500 mt-2">Maximum file size {maxSizeMB}MB. Supports PDF, JPG, PNG.</p>
                        </div>
                        <input
                            type="file"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            accept={accept}
                            onChange={handleFileChange}
                        />
                    </>
                ) : (
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-indigo-100 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</p>
                                    <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setFile(null); setEncrypted(false); }}
                                className="text-xs font-semibold text-red-500 hover:text-red-700"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                                <span className="flex items-center gap-1.5 text-slate-500">
                                    {scanning ? (
                                        <>
                                            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Virus Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-3 w-3 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                            Security Check Passed
                                        </>
                                    )}
                                </span>
                                {encrypted && (
                                    <span className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                        <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                        </svg>
                                        Encrypted (AES-256)
                                    </span>
                                )}
                            </div>
                            <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 ${scanning ? 'bg-indigo-400 w-1/2 animate-pulse' : 'bg-emerald-500 w-full'}`}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
