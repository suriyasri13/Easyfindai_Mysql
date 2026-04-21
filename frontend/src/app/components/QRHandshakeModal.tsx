import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode, Camera, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import axios from 'axios';

interface QRHandshakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
  userRole: 'owner' | 'finder';
  onSuccess: () => void;
}

export default function QRHandshakeModal({ isOpen, onClose, match, userRole, onSuccess }: QRHandshakeModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isOpen && isScanning && userRole === 'finder') {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render(async (decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.matchId === match.id) {
            await handleVerify(data.key);
            if (scanner) scanner.clear();
            setIsScanning(false);
          } else {
            toast.error("Invalid QR Code for this match.");
          }
        } catch (err) {
          toast.error("Invalid QR Code format.");
        }
      }, (error) => {
        // Just ignoring scan errors
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Failed to clear scanner", err));
      }
    };
  }, [isOpen, isScanning, userRole, match.id]);

  const handleVerify = async (key: string) => {
    try {
      await axios.post(`http://localhost:8080/api/match/${match.id}/handshake`, { key });
      setSuccess(true);
      toast.success("Handshake Successful! Item marked as returned.");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (error: any) {
      toast.error(error.response?.data || "Handshake failed.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white/90 backdrop-blur-3xl rounded-[3rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-pink-100 animate-in zoom-in-95 duration-300">
        
        {/* Soft Dream Header */}
        <div className="bg-gradient-to-r from-sky-500 to-pink-500 p-8 text-white relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
          >
            <X size={20} />
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20">
              <QrCode size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tighter uppercase">QR Handshake</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">Secure Verification</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-white/90 font-bold leading-relaxed uppercase tracking-widest opacity-80 mt-4">
            {userRole === 'owner' 
              ? "Generate your owner verification key." 
              : "Scan the owner's key to confirm recovery."}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-10 flex flex-col items-center text-center">
          {success ? (
            <div className="space-y-6 py-8">
              <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce border border-emerald-100 shadow-lg shadow-emerald-50">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Handshake Complete!</h4>
                <p className="text-slate-500 font-medium mt-2">Item recovery has been officially verified.</p>
              </div>
            </div>
          ) : userRole === 'owner' ? (
            <div className="space-y-8 w-full">
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-dashed border-pink-100 shadow-inner inline-block relative group">
                <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
                <QRCodeSVG 
                  value={JSON.stringify({ matchId: match.id, key: match.securityKey })} 
                  size={180}
                  includeMargin={true}
                  level="H"
                  fgColor="#1e293b"
                />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Security Token</p>
                <div className="bg-sky-50 px-6 py-4 rounded-2xl border border-sky-100 shadow-sm">
                  <code className="text-2xl font-mono font-black text-sky-600 tracking-[0.3em]">{match.securityKey}</code>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {!isScanning ? (
                <div className="py-12 flex flex-col items-center gap-8">
                  <div className="w-20 h-20 bg-pink-50 text-pink-500 rounded-[2rem] flex items-center justify-center shadow-lg shadow-pink-50/50">
                    <Camera size={36} />
                  </div>
                  <Button 
                    onClick={() => setIsScanning(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-[0.2em] px-12 py-7 rounded-2xl text-xs shadow-2xl transition-all active:scale-95"
                  >
                    Launch Intelligence Scanner
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <div id="qr-reader" className="overflow-hidden rounded-3xl border-4 border-sky-500 shadow-2xl"></div>
                  <Button 
                    onClick={() => setIsScanning(false)}
                    variant="ghost"
                    className="mt-8 text-slate-400 hover:text-rose-500 font-black uppercase tracking-widest text-[10px]"
                  >
                    Abort Scanning Protocol
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Footer */}
        <div className="bg-slate-50/50 p-6 border-t border-pink-50 text-center">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping"></span>
            🛡️ Neural Encryption Active
          </p>
        </div>
      </div>
    </div>
  );
}
