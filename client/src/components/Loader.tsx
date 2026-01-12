import { Loader2 } from 'lucide-react';

export default function Loader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#1e1e1e] z-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">Loading Scratch...</p>
            </div>
        </div>
    );
}
