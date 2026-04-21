import React from 'react';
import { X, FileText, BrainCircuit, BellRing, Handshake } from 'lucide-react';

interface UserGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const steps = [
        {
            icon: <FileText className="w-8 h-8 text-blue-500" />,
            title: "1. Report It",
            description: "Lose something or find an item? Click 'Report'. You can type details, upload photos, or even use your voice to describe it!",
            color: "bg-blue-50 border-blue-100"
        },
        {
            icon: <BrainCircuit className="w-8 h-8 text-purple-500" />,
            title: "2. AI Magic",
            description: "Our Smart AI instantly scans the entire database. It compares images and text to find perfect matches in seconds.",
            color: "bg-purple-50 border-purple-100"
        },
        {
            icon: <BellRing className="w-8 h-8 text-pink-500" />,
            title: "3. Get Notified",
            description: "As soon as the AI finds a match, both the finder and the owner get an instant email and an in-app notification.",
            color: "bg-pink-50 border-pink-100"
        },
        {
            icon: <Handshake className="w-8 h-8 text-green-500" />,
            title: "4. Secure Return",
            description: "Chat securely to arrange a meetup. When you meet, use the 'QR Handshake' to safely verify you have the right person before handing the item over.",
            color: "bg-green-50 border-green-100"
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 relative transform animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">How it Works</h2>
                        <p className="text-slate-500 mt-1">Your guide to the Smart Lost & Found system</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>

                {/* Steps */}
                <div className="grid gap-4">
                    {steps.map((step, index) => (
                        <div 
                            key={index} 
                            className={`flex gap-6 p-6 rounded-2xl border ${step.color} transition-transform hover:-translate-y-1 duration-300`}
                        >
                            <div className="flex-shrink-0 mt-1">
                                <div className="p-3 bg-white rounded-2xl shadow-sm">
                                    {step.icon}
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">{step.title}</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserGuideModal;
