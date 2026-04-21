import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Upload, X, Mic, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { reportItem } from "../services/api";


export default function ReportItemPage() {
  const { user } = useAuth();
  const [itemType, setItemType] = useState<'lost' | 'found'>('lost');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isConfidential, setIsConfidential] = useState(false);
  const [uniqueIdentifier, setUniqueIdentifier] = useState('');
  const [hiddenDetail, setHiddenDetail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (currentCoords) {
      const container = L.DomUtil.get('mini-map');
      if (container != null && (container as any)._leaflet_id) {
          (container as any)._leaflet_id = null; 
      }
      const map = L.map('mini-map', { center: currentCoords, zoom: 18, zoomControl: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      map.on('moveend', async () => {
        const center = map.getCenter();
        try {
          setIsFetchingLocation(true);
          const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${center.lng},${center.lat}&f=pjson`);
          const data = await res.json();
          if (data && data.address && data.address.Match_addr) {
             setLocation(data.address.Match_addr);
          } else {
             setLocation(`Lat: ${center.lat.toFixed(4)}, Long: ${center.lng.toFixed(4)}`);
          }
        } catch(e) {
          setLocation(`Lat: ${center.lat.toFixed(4)}, Long: ${center.lng.toFixed(4)}`);
        } finally {
          setIsFetchingLocation(false);
          setUseCurrentLocation(false);
        }
      });

      return () => { map.remove(); };
    }
  }, [currentCoords]);

  const categories = ['Electronics', 'Personal Items', 'Documents', 'Accessories', 'Clothing', 'Keys', 'Bags', 'Jewelry', 'Other'];
  const campusLocations = ['Classroom', 'Library', 'Canteen', 'Lab', 'Hostel', 'Playground', 'Auditorium'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCurrentCoords(coords);
          try {
            const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${coords[1]},${coords[0]}&f=pjson`);
            const data = await res.json();
            if (data && data.address && data.address.Match_addr) {
              setLocation(data.address.Match_addr);
            } else {
              setLocation(`Lat: ${coords[0].toFixed(4)}, Long: ${coords[1].toFixed(4)}`);
            }
            setUseCurrentLocation(true);
          } catch(e) {
            setLocation(`Lat: ${coords[0].toFixed(4)}, Long: ${coords[1].toFixed(4)}`);
          } finally {
            setIsFetchingLocation(false);
          }
        },
        () => {
          setIsFetchingLocation(false);
          toast.error("Unable to retrieve location");
        }
      );
    }
  };

  const handleVoiceAssistant = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice recognition not supported in this browser");
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsParsing(true);
      try {
        const prompt = `Extract item details from this report: "${transcript}". Return ONLY JSON with keys: itemName, category (must be from: ${categories.join(', ')}), description, location, date (YYYY-MM-DD). If unknown, leave null.`;
        const res = await fetch('http://localhost:8080/api/ai/parse-report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt })
        });
        const data = await res.json();
        if (data.itemName) setItemName(data.itemName);
        if (data.category && categories.includes(data.category)) setCategory(data.category);
        if (data.description) setDescription(data.description);
        if (data.location) setLocation(data.location);
        if (data.date) setDate(data.date);
        toast.success("AI has filled the form details!");
      } catch (e) {
        toast.error("AI parsing failed. Please fill manually.");
      } finally { setIsParsing(false); }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  const resetForm = () => {
    setItemName(''); setCategory(''); setDescription(''); setContactInfo('');
    setDate(''); setLocation(''); setStorageLocation(''); setImagePreview(null);
    setImageFile(null); setCurrentCoords(null); setIsConfidential(false);
    setUniqueIdentifier(''); setHiddenDetail('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !category || !description || !contactInfo || !date || (!location && !storageLocation)) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isConfidential && !uniqueIdentifier) {
      toast.error("Unique Identifier is required for confidential items");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("itemType", itemType);
    formData.append("userId", user.userId.toString());  
    formData.append("itemName", itemName);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("contactInfo", contactInfo);
    formData.append("dateLost", date);
    formData.append("isConfidential", isConfidential.toString());
    if (isConfidential) {
      formData.append("uniqueIdentifier", uniqueIdentifier);
      formData.append("hiddenDetail", hiddenDetail);
    }
    const finalLocation = itemType === "found" ? (storageLocation || location) : location;
    formData.append("location", finalLocation);
    if (imageFile) formData.append("image", imageFile);

    try {
      await reportItem(formData);
      toast.success("Item reported successfully!");
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to report item");
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative z-10">
      <div className="bg-white/60 backdrop-blur-3xl rounded-[3.5rem] shadow-2xl p-12 border border-pink-100">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl text-slate-800 font-black tracking-tight flex items-center gap-3 uppercase">
              Report Item
              <span className="text-[9px] font-black bg-sky-500/10 text-sky-600 px-3 py-1 rounded-full uppercase tracking-widest border border-sky-100">AI Enabled</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Intelligent item reporting system</p>
          </div>
          <Button
            type="button"
            onClick={handleVoiceAssistant}
            disabled={isListening || isParsing}
            className={`rounded-[1.5rem] px-8 py-8 transition-all ${
              isListening ? "bg-pink-500 animate-pulse scale-105 shadow-pink-200" : "bg-sky-500 hover:bg-sky-600 shadow-sky-200"
            } text-white shadow-2xl flex items-center gap-4 group`}
          >
            {isParsing ? <Loader2 className="animate-spin" size={24} /> : isListening ? <Sparkles className="animate-bounce" size={24} /> : <Mic size={24} className="group-hover:scale-125 transition-transform" />}
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{isParsing ? "Processing" : isListening ? "Status" : "Proactive Reporting"}</p>
              <p className="font-black text-sm uppercase tracking-widest">{isParsing ? "AI Parsing..." : isListening ? "Listening..." : "Voice Assistant"}</p>
            </div>
          </Button>
        </div>

        <div className="flex gap-4 mb-10 bg-white/40 p-2 rounded-3xl border border-pink-50 shadow-sm">
          <button type="button" onClick={() => setItemType('lost')} className={`flex-1 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${itemType === 'lost' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'text-slate-400 hover:text-pink-500'}`}>Report Lost Item</button>
          <button type="button" onClick={() => setItemType('found')} className={`flex-1 py-5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${itemType === 'found' ? 'bg-sky-500 text-white shadow-lg shadow-sky-200' : 'text-slate-400 hover:text-sky-500'}`}>Report Found Item</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <Label className="text-slate-800 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Item Name *</Label>
              <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="e.g., Laptop, Wallet, Keys" className="bg-white/80 border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 py-6 text-[15px] rounded-xl shadow-sm" />
            </div>
            <div>
              <Label className="text-slate-800 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-white/80 border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 py-6 text-[15px] rounded-xl shadow-sm">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-pink-100">
                  {categories.map((cat) => <SelectItem key={cat} value={cat} className="focus:bg-pink-50">{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-slate-800 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Description *</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Provide detailed description..." className="bg-white/80 border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 min-h-[140px] text-[15px] p-4 rounded-xl shadow-sm" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-slate-800 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Contact Information *</Label>
              <Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Email or Phone Number" className="bg-white/80 border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 py-6 text-[15px] rounded-xl shadow-sm" />
            </div>
            <div>
              <Label className="text-slate-800 text-[11px] font-black uppercase tracking-[0.2em] mb-3 block">Date *</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-white/80 border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 py-6 text-[15px] rounded-xl shadow-sm" />
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-pink-50 shadow-sm">
            <Label className="text-slate-800 text-[12px] font-black uppercase tracking-[0.2em] mb-6 block">
              {itemType === 'lost' ? 'Last Known Location *' : 'Current Storage Location *'}
            </Label>
            <div className="space-y-6">
              <Button type="button" onClick={handleEnableLocation} disabled={isFetchingLocation} className={`${itemType === 'lost' ? 'bg-pink-500 hover:bg-pink-600 shadow-pink-100' : 'bg-sky-500 hover:bg-sky-600 shadow-sky-100'} text-white font-black uppercase tracking-widest text-[10px] py-7 px-8 rounded-2xl transition-all disabled:opacity-70 shadow-lg`}>
                <MapPin size={22} className="mr-3" /> {isFetchingLocation ? 'Fetching Address...' : 'Enable Current Location'}
              </Button>
              <Input value={location} onChange={(e) => { setLocation(e.target.value); setUseCurrentLocation(false); }} placeholder="Enter location details..." className="bg-white border-pink-50 text-slate-800 focus:border-sky-500 focus:ring-0 py-7 text-base rounded-2xl shadow-sm" />
            </div>
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-pink-50">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isConfidential ? 'bg-sky-500 text-white' : 'bg-pink-50 text-pink-400'}`}>
                  <span className="text-xl">🔐</span>
                </div>
                <Label className="text-slate-800 text-lg font-black uppercase tracking-tight">Confidential Protocol</Label>
              </div>
              <input type="checkbox" checked={isConfidential} onChange={(e) => setIsConfidential(e.target.checked)} className="w-7 h-7 accent-sky-500 cursor-pointer" />
            </div>
            {isConfidential && (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-4">
                <Input value={uniqueIdentifier} onChange={(e) => setUniqueIdentifier(e.target.value)} placeholder="Unique Identifier (e.g., Serial Number)" className="bg-white border-pink-50 text-slate-800 py-6 rounded-xl" />
                <Input value={hiddenDetail} onChange={(e) => setHiddenDetail(e.target.value)} placeholder="Hidden Detail (e.g., Internal mark)" className="bg-white border-pink-50 text-slate-800 py-6 rounded-xl" />
              </div>
            )}
          </div>

          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-pink-50 text-center">
            <Label className="text-slate-800 text-sm font-black uppercase tracking-[0.2em] mb-6 block">Visual Evidence</Label>
            <div className="relative group cursor-pointer" onClick={() => document.getElementById('image-upload')?.click()}>
              {imagePreview ? (
                <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white"><img src={imagePreview} alt="Preview" className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><p className="text-white font-black uppercase tracking-widest text-xs">Change Image</p></div></div>
              ) : (
                <div className="aspect-video rounded-3xl border-4 border-dashed border-pink-100 bg-white/50 flex flex-col items-center justify-center group-hover:border-sky-500 group-hover:bg-sky-50 transition-all"><div className="w-20 h-20 bg-pink-50 text-pink-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload size={32} /></div><p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Upload Protocol</p></div>
              )}
              <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-[0.3em] py-8 rounded-[2rem] text-sm transition-all shadow-2xl disabled:opacity-70 group relative overflow-hidden">
            {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <span className="flex items-center justify-center gap-3">Initialize Submission Protocol <Sparkles size={20} className="text-sky-400" /></span>}
          </Button>
        </form>
      </div>
    </div>
  );
}