import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Upload, X } from 'lucide-react';
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
  const [currentCoords, setCurrentCoords] = useState<[number, number] | null>(null);

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
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl text-[#1E2A44] font-bold tracking-tight">Report Item</h2>
        </div>

        {/* Item Type Selection */}
        <div className="flex gap-4 mb-8">
          <button
            type="button"
            onClick={() => setItemType('lost')}
            className={`flex-1 py-4 rounded-xl transition-all font-bold text-base shadow-sm ${
              itemType === 'lost'
                ? 'bg-[#EF4444] text-white ring-4 ring-red-100'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            Report Lost Item
          </button>
          <button
            type="button"
            onClick={() => setItemType('found')}
            className={`flex-1 py-4 rounded-xl transition-all font-bold text-base shadow-sm ${
              itemType === 'found'
                ? 'bg-[#3B82F6] text-white ring-4 ring-blue-100'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-2 border-transparent'
            }`}
          >
            Report Found Item
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="itemName" className="text-gray-700 text-base">Item Name *</Label>
            <Input
              id="itemName"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Laptop, Wallet, Keys"
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] text-base"
            />
          </div>

          <div>
            <Label htmlFor="category" className="text-gray-700 text-base">Category *</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] text-base">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-700 text-base">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed description..."
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] min-h-[100px] text-base"
            />
          </div>

          <div>
            <Label htmlFor="contactInfo" className="text-gray-700 text-base">Contact Information *</Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="Email or Phone Number"
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] text-base"
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-gray-700 text-base">Date *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] text-base"
            />
          </div>

          {/* Location Section */}
          <div>
            <Label className="text-gray-700 text-base">
              {itemType === 'lost' ? 'Last Known Location *' : 'Current Storage Location *'}
            </Label>
            <div className="mt-2 space-y-2">
              <Button
                type="button"
                onClick={handleEnableLocation}
                disabled={isFetchingLocation}
                className={`${
                  itemType === 'lost' 
                    ? 'bg-[#EF4444] hover:bg-[#DC2626] text-white' 
                    : 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                } text-base font-medium disabled:opacity-70`}
              >
                <MapPin size={18} className="mr-2" />
                {isFetchingLocation ? 'Fetching Address...' : 'Enable Current Location'}
              </Button>
              
              {itemType === 'lost' ? (
                <div className="space-y-2">
                  <Input
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setUseCurrentLocation(false);
                    }}
                    placeholder="Enter last known location (e.g., Classroom 101)"
                    className="border-2 border-gray-200 focus:border-[#14B8A6] text-base"
                  />
                  <div className="flex flex-wrap gap-2">
                    {campusLocations.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          setLocation(loc);
                          setUseCurrentLocation(false);
                        }}
                        className="px-3 py-1 bg-gray-100 hover:bg-teal-50 text-teal-700 text-xs sm:text-sm rounded-full border border-gray-200 hover:border-teal-300 transition-colors"
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 mt-3">
                  <div>
                    <Label className="text-sm text-gray-500 font-medium">Found Location</Label>
                    <Input
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setUseCurrentLocation(false);
                      }}
                      placeholder="Where was this item found? (Optional)"
                      className="border-2 border-gray-200 focus:border-[#14B8A6] text-base mb-2"
                    />
                    <div className="flex flex-wrap gap-2">
                      {campusLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => {
                            setLocation(loc);
                            setUseCurrentLocation(false);
                          }}
                          className="px-3 py-1 bg-gray-100 hover:bg-teal-50 text-teal-700 text-xs sm:text-sm rounded-full border border-gray-200 hover:border-teal-300 transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500 font-medium">Storage Location *</Label>
                    <Input
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Enter current storage location"
                      className="border-2 border-gray-200 focus:border-[#14B8A6] text-base"
                    />
                  </div>
                </div>
              )}

              {useCurrentLocation && location && (
                <p className="text-xs text-blue-600 mt-1">
                  📍 Location fetched automatically. You can edit it manually above if it is incorrect.
                </p>
              )}

              {/* Visual Map showing where you are standing (Google Maps Picker Style) */}
              {currentCoords && (
                <div className="mt-4 rounded-xl overflow-hidden shadow-sm border-2 border-[#3B82F6] relative">
                  <div id="mini-map" style={{ height: '220px', width: '100%', zIndex: 1, backgroundColor: '#f3f4f6' }}></div>
                  
                  {/* Fixed Center Pin that doesn't move */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full pointer-events-none z-[1000]">
                    <MapPin size={42} className="text-red-500 drop-shadow-lg animate-bounce" fill="white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confidential Custody Protocol */}
          <div className="border-2 border-gray-200 rounded-xl p-5 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">🔐</span>
                <Label className="text-[#1E2A44] text-base font-semibold">
                  Enable Confidential Custody Protocol
                </Label>
              </div>
              <input
                type="checkbox"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="w-5 h-5 accent-[#14B8A6]"
              />
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Add extra security for valuable or sensitive items. Requires verification for claims.
            </p>
            
            {isConfidential && (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 text-base">Unique Identifier *</Label>
                  <Input
                    value={uniqueIdentifier}
                    onChange={(e) => setUniqueIdentifier(e.target.value)}
                    placeholder="e.g., Serial number, unique marking"
                    className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">This will be hidden from public view</p>
                </div>
                <div>
                  <Label className="text-gray-700 text-base">Hidden Detail (Optional)</Label>
                  <Textarea
                    value={hiddenDetail}
                    onChange={(e) => setHiddenDetail(e.target.value)}
                    placeholder="Additional verification details..."
                    className="mt-1.5 border-2 border-gray-200 focus:border-[#14B8A6] min-h-[80px] text-base"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label className="text-gray-700 text-base">Upload Image (JPG/PNG, Max 5MB)</Label>
            <div className="mt-2">
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload size={32} className="text-gray-400 mb-2" />
                  <span className="text-base text-gray-500">Click to upload image</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              onClick={resetForm}
              variant="outline"
              className="flex-1 py-6 border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-base transition-all"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              className={`flex-[2] py-6 text-white font-bold text-base shadow-md hover:shadow-xl transition-all ${
                itemType === 'lost'
                  ? 'bg-[#EF4444] hover:bg-[#DC2626] shadow-red-100'
                  : 'bg-[#3B82F6] hover:bg-[#2563EB] shadow-blue-100'
              }`}
            >
              Submit {itemType === 'lost' ? 'Lost' : 'Found'} Item Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}