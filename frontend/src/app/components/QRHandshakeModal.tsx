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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/20 rounded-2xl">
              <QrCode size={28} />
            </div>
            <h3 className="text-2xl font-black tracking-tight">QR Handshake</h3>
          </div>
          <p className="text-blue-100 font-medium">
            {userRole === 'owner' 
              ? "Show this code to the person who found your item." 
              : "Scan the owner's QR code to confirm you've returned the item."}
          </p>
        </div>

        {/* Content */}
        <div className="p-10 flex flex-col items-center text-center">
          {success ? (
            <div className="space-y-6 py-8">
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-2xl font-bold text-slate-900">Return Confirmed!</h4>
                <p className="text-slate-500 font-medium mt-2">The item has been officially recovered.</p>
              </div>
            </div>
          ) : userRole === 'owner' ? (
            <div className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-slate-200">
                <QRCodeSVG 
                  value={JSON.stringify({ matchId: match.id, key: match.securityKey })} 
                  size={200}
                  includeMargin={true}
                  level="H"
                />
              </div>
              <div>
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">Security Token</p>
                <div className="bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                  <code className="text-xl font-mono font-bold text-blue-600 tracking-widest">{match.securityKey}</code>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {!isScanning ? (
                <div className="py-12 flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                    <Camera size={40} />
                  </div>
                  <Button 
                    onClick={() => setIsScanning(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-6 rounded-2xl text-lg shadow-xl"
                  >
                    Launch QR Scanner
                  </Button>
                </div>
              ) : (
                <div className="w-full">
                  <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-blue-600"></div>
                  <Button 
                    onClick={() => setIsScanning(false)}
                    variant="ghost"
                    className="mt-6 text-slate-500 font-bold"
                  >
                    Cancel Scan
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
            🛡️ Secure Verification by EaseFind.AI
          </p>
        </div>
      </div>
    </div>
  );
}
