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
      // Zoom level 18 provides clear street-level detail
      const map = L.map('mini-map', { 
        center: currentCoords, 
        zoom: 18,
        zoomControl: true 
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      // Listen for map drag/pan finish events (EXACTLY like Google Maps works)
      map.on('moveend', async () => {
        // Find exactly what point the map's center crosshairs are resting on
        const center = map.getCenter();
        try {
          setIsFetchingLocation(true);
          // Esri ArcGIS API: Enterprise-grade reliability, open usage for basic reverse geocoding, NO browser blocking!
          const res = await fetch(`https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${center.lng},${center.lat}&f=pjson`);
          const data = await res.json();
          if (data && data.address && data.address.Match_addr) {
             // Provides highly accurate structured address string automatically
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

      return () => {
        map.remove();
      };
    }
  }, [currentCoords]);

  const categories = [
    'Electronics',
    'Personal Items',
    'Documents',
    'Accessories',
    'Clothing',
    'Keys',
    'Bags',
    'Jewelry',
    'Other',
  ];

  const campusLocations = [
    'Classroom',
    'Library',
    'Canteen',
    'Laboratory',
    'Hostel',
    'Sports Ground',
    'Main Gate',
    'Others',
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Validate file size
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Image size must be less than 5MB');
    return;
  }

  // Validate type
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    toast.error('Only JPG and PNG files are allowed');
    return;
  }

  // ✅ Store actual file
  setImageFile(file);

  // ✅ Still keep preview (for UI)
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      setIsFetchingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          // Setting the coords will immediately mount the map, which triggers the 'moveend' event
          // That event takes care of automatically feeding the text box!
          setCurrentCoords([latitude, longitude]);
          setIsFetchingLocation(false);
          setUseCurrentLocation(true);
          toast.success('Map opened. Pan to adjust location.');
        },
        () => {
          toast.error('Unable to fetch GPS Location. Please check browser permissions.');
          setIsFetchingLocation(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };


  const resetForm = () => {
    setItemName('');
    setCategory('');
    setDescription('');
    setContactInfo('');
    setDate('');
    setLocation('');
    setStorageLocation('');
    setImagePreview(null);
    setImageFile(null);
    setUseCurrentLocation(false);
    setIsConfidential(false);
    setUniqueIdentifier('');
    setHiddenDetail('');
    setCurrentCoords(null);
  };

  const handleVoiceAssistant = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Your browser does not support voice recognition.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Tell me what you lost or found!");
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsParsing(true);
      
      try {
        console.log("Sending transcript to backend:", transcript);
        const res = await fetch("http://localhost:8080/api/voice/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript })
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with ${res.status}`);
        }

        const data = await res.json();
        console.log("AI Voice Parse Result:", data);
        
        if (data.error) throw new Error(data.error);

        // Auto-fill the form with robust key matching
        const findVal = (keys: string[]) => {
          const key = keys.find(k => data[k]);
          return key ? data[key] : null;
        };

        const parsedItemName = findVal(['itemName', 'item_name', 'name', 'item']);
        const parsedCategory = findVal(['category', 'itemCategory', 'type']);
        const parsedDesc = findVal(['description', 'desc', 'details']);
        const parsedLoc = findVal(['location', 'loc', 'place']);
        const parsedType = findVal(['itemType', 'item_type', 'status']);

        if (parsedItemName) setItemName(parsedItemName);
        if (parsedCategory) setCategory(parsedCategory);
        if (parsedDesc) setDescription(parsedDesc);
        if (parsedLoc) setLocation(parsedLoc);
        if (parsedType) setItemType(parsedType.toLowerCase().includes('found') ? 'found' : 'lost');
        
        if (!date) setDate(new Date().toISOString().split('T')[0]);

        toast.success("AI parsed your voice report!", {
          description: `Identified: ${parsedItemName || 'Item'}`,
        });
      } catch (err: any) {
        console.error("Voice Assistant Error:", err);
        toast.error("AI Assistant Error", {
          description: err.message || "Failed to parse voice transcript. Is the AI server running?"
        });
      } finally {
        setIsParsing(false);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Voice recognition failed. Try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login first");
      return;
    }

    if (!itemName) {
      toast.error("Please provide the Item Name");
      return;
    }
    if (!category) {
      toast.error("Please select a Category");
      return;
    }
    if (!description) {
      toast.error("Please provide a Description");
      return;
    }
    if (!contactInfo) {
      toast.error("Please provide Contact Information");
      return;
    }
    if (!date) {
      toast.error(`Please select the Date ${itemType === 'lost' ? 'Lost' : 'Found'}`);
      return;
    }
    if (itemType === 'lost' && !location) {
      toast.error("Please provide the Last Known Location");
      return;
    }
    if (itemType === 'found' && !storageLocation) {
      toast.error("Please provide the Storage Location");
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
    
    const finalLocation = itemType === "found" 
      ? (storageLocation || location) 
      : location;

    formData.append("location", finalLocation);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      await reportItem(formData);
      toast.success("Item reported successfully!");
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Failed to report item");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12 relative z-10">
      <div className="glass rounded-[3.5rem] shadow-2xl p-12 border border-white/60">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-4xl text-[#1e293b] font-black tracking-tight flex items-center gap-3">
              Report Item
              <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-widest border border-blue-200">AI Enabled</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1">Intelligent item reporting system</p>
          </div>
          <Button
            type="button"
            onClick={handleVoiceAssistant}
            disabled={isListening || isParsing}
            className={`rounded-[1.5rem] px-8 py-8 transition-all ${
              isListening 
                ? "bg-rose-500 animate-pulse scale-105 shadow-rose-200" 
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
            } text-white shadow-2xl flex items-center gap-4 group`}
          >
            {isParsing ? (
              <Loader2 className="animate-spin" size={24} />
            ) : isListening ? (
              <Sparkles className="animate-bounce" size={24} />
            ) : (
              <Mic size={24} className="group-hover:scale-125 transition-transform" />
            )}
            <div className="text-left">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {isParsing ? "Processing" : isListening ? "Status" : "Proactive Reporting"}
              </p>
              <p className="font-black text-sm uppercase tracking-widest">
                {isParsing ? "AI Parsing..." : isListening ? "Listening..." : "Voice Assistant"}
              </p>
            </div>
          </Button>
        </div>

        {/* Item Type Selection - Exactly matching image */}
        <div className="flex gap-4 mb-10 bg-slate-100/50 p-2 rounded-2xl border border-white/40">
          <button
            type="button"
            onClick={() => setItemType('lost')}
            className={`flex-1 py-4 rounded-xl transition-all font-bold text-[16px] ${
              itemType === 'lost'
                ? 'bg-[#ef4444] text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Report Lost Item
          </button>
          <button
            type="button"
            onClick={() => setItemType('found')}
            className={`flex-1 py-4 rounded-xl transition-all font-bold text-[16px] ${
              itemType === 'found'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            Report Found Item
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <Label htmlFor="itemName" className="text-[#1e293b] text-[15px] font-bold mb-2 block">Item Name *</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Laptop, Wallet, Keys"
                className="bg-[#f1f5f9] border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-0 py-6 text-[15px] rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-[#1e293b] text-[15px] font-bold mb-2 block">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-[#f1f5f9] border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-0 py-6 text-[15px] rounded-xl">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="focus:bg-slate-100">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-[#1e293b] text-[15px] font-bold mb-2 block">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description..."
              className="bg-[#f1f5f9] border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-0 min-h-[140px] text-[15px] p-4 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="contactInfo" className="text-[#1e293b] text-[15px] font-bold mb-2 block">Contact Information *</Label>
              <Input
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                placeholder="Email or Phone Number"
                className="bg-[#f1f5f9] border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-0 py-6 text-[15px] rounded-xl"
              />
            </div>

            <div>
              <Label htmlFor="date" className="text-[#1e293b] text-[15px] font-bold mb-2 block">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#f1f5f9] border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-0 py-6 text-[15px] rounded-xl"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-blue-500/[0.02]">
            <Label className="text-[#1e293b] text-base font-bold mb-6 block">
              {itemType === 'lost' ? 'Last Known Location *' : 'Current Storage Location *'}
            </Label>
            <div className="space-y-6">
              <Button
                type="button"
                onClick={handleEnableLocation}
                disabled={isFetchingLocation}
                className={`${
                  itemType === 'lost' 
                    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
                    : 'bg-blue-500 hover:bg-blue-600 shadow-blue-200'
                } text-white font-bold py-7 px-8 rounded-2xl transition-all disabled:opacity-70 shadow-lg`}
              >
                <MapPin size={22} className="mr-3" />
                {isFetchingLocation ? 'Fetching Address...' : 'Enable Current Location'}
              </Button>
              
              {itemType === 'lost' ? (
                <div className="space-y-4">
                  <Input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setUseCurrentLocation(false);
                    }}
                    placeholder="Enter last known location (e.g., Classroom 101)"
                    className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl shadow-sm"
                  />
                  <div className="flex flex-wrap gap-3">
                    {campusLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          setUseCurrentLocation(false);
                        }}
                        className="px-5 py-2.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm rounded-xl border border-slate-200 hover:border-blue-500 transition-all font-bold shadow-sm"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label className="text-xs text-slate-400 font-black mb-3 block uppercase tracking-widest">Found Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setUseCurrentLocation(false);
                      }}
                      placeholder="Where was this item found? (Optional)"
                      className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base mb-4 rounded-2xl shadow-sm"
                    />
                    <div className="flex flex-wrap gap-3">
                      {campusLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocation(loc);
                            setUseCurrentLocation(false);
                          }}
                          className="px-5 py-2.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-sm rounded-xl border border-slate-200 hover:border-blue-500 transition-all font-bold shadow-sm"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400 font-black mb-3 block uppercase tracking-widest">Storage Location *</Label>
                    <Input
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Enter current storage location"
                      className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl shadow-sm"
                    />
                  </div>
                </div>
              )}

              {useCurrentLocation && location && (
                <p className="text-sm text-blue-600 mt-2 font-bold flex items-center gap-2">
                  <span className="animate-pulse">📍</span> Location fetched automatically
                </p>
              )}

              {currentCoords && (
                <div className="mt-8 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white relative">
                  <div id="mini-map" style={{ height: '280px', width: '100%', zIndex: 1, backgroundColor: '#f1f5f9' }}></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
                    <MapPin size={48} className="text-rose-500 drop-shadow-2xl animate-bounce" fill="white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confidential Custody Protocol */}
          <div className={`rounded-[2.5rem] p-10 border transition-all duration-500 ${isConfidential ? 'bg-blue-50/60 border-blue-300 shadow-xl shadow-blue-500/10' : 'bg-white/40 border-white/60 shadow-lg'} backdrop-blur-md`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isConfidential ? 'bg-blue-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                  <span className="text-xl">🔐</span>
                </div>
                <Label className="text-[#1e293b] text-xl font-bold">
                  Confidential Custody Protocol
                </Label>
              </div>
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="w-7 h-7 accent-blue-600 cursor-pointer"
              />
            </div>
            <p className="text-slate-500 mb-8 leading-relaxed font-medium">
              Add extra security for valuable or sensitive items. Requires verification for claims.
            </p>
            
            {isConfidential && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                  <Label className="text-[#1e293b] text-base font-bold mb-3 block">Unique Identifier *</Label>
                  <Input
                    value={uniqueIdentifier}
                    onChange={(e) => setUniqueIdentifier(e.target.value)}
                    placeholder="e.g., Serial number, unique marking"
                    className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl shadow-sm"
                  />
                  <p className="text-xs text-slate-400 mt-3 font-bold">This will be hidden from public view</p>
                </div>
                <div>
                  <Label className="text-[#1e293b] text-base font-bold mb-3 block">Hidden Detail (Optional)</Label>
                  <Textarea
                    value={hiddenDetail}
                    onChange={(e) => setHiddenDetail(e.target.value)}
                    placeholder="Additional verification details..."
                    className="bg-white border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 min-h-[100px] text-base p-5 rounded-2xl shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-lg">
            <Label className="text-[#1e293b] text-base font-bold mb-6 block">Upload Image (JPG/PNG, Max 5MB)</Label>
            <div className="mt-2">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-white hover:border-blue-400 transition-all group bg-slate-50 shadow-sm">
                  <Upload size={48} className="text-slate-300 mb-4 group-hover:text-blue-500 transition-colors" />
                  <span className="text-lg text-slate-400 font-bold group-hover:text-slate-600">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative group rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setImagePreview(null)}
                      className="bg-rose-500 text-white p-5 rounded-full hover:bg-rose-600 transition-all transform hover:scale-110 shadow-2xl"
                    >
                      <X size={28} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="flex-1 py-8 border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-bold text-xl transition-all rounded-[1.5rem] shadow-sm"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className={`flex-[2] py-8 text-white font-bold text-xl shadow-2xl transition-all disabled:opacity-70 rounded-[1.5rem] ${
                itemType === 'lost'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
              }`}
            >
              {isSubmitting ? 'Submitting...' : `Submit ${itemType === 'lost' ? 'Lost' : 'Found'} Item Report`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}