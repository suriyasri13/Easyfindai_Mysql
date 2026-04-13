import { useEffect, useState } from 'react';
import { Calendar, MapPin, User, Phone, Search, Trash2 } from 'lucide-react';
import { getFoundItems, deleteFoundItem } from "../services/api";
import { toast } from "sonner";

interface Item {
  id: string;
  userId: string;
  userName: string;
  type: string;
  itemName: string;
  category: string;
  description: string;
  contactInfo: string;
  date: string;
  location: string;
  image: string | null;
  createdAt: string;
  status: string;
}

export default function FoundItemsPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const fetchFoundItems = async () => {
    try {
      const data = await getFoundItems();
      
      const mappedData = data.map((item: any) => ({
        id: item.itemId,
        itemName: item.itemName,
        category: item.category || "Other",
        description: item.description || "",
        contactInfo: item.contactInfo || item.finder?.email || "",
        date: item.dateFound,
        location: item.location,
        image: item.imagePath ? `http://localhost:8080/uploads/${item.imagePath}` : null,
        userName: item.finder?.name || "Unknown",
        userId: item.finder?.userId || "",
        type: "found",
        createdAt: "",
        status: item.status || "PENDING"
      }));

      setItems(mappedData);
    } catch (error) {
      console.error("Error fetching found items:", error);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to clear this item?")) {
      try {
        await deleteFoundItem(id);
        toast.success("Item cleared successfully");
        fetchFoundItems();
      } catch (error: any) {
        toast.error(error.message || "Failed to clear item");
      }
    }
  };

  const handleClearAll = async () => {
    if (items.length === 0) return;
    if (window.confirm("Are you sure you want to clear ALL found items? This cannot be undone.")) {
      try {
        await Promise.all(items.map(item => deleteFoundItem(item.id)));
        toast.success("All items cleared successfully");
        fetchFoundItems();
      } catch (error: any) {
        toast.error("Failed to clear some items");
        fetchFoundItems();
      }
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-4xl mb-6 text-[#1E2A44] font-bold">Found Items</h2>
          <p className="text-gray-600 text-base">
            Browse recently reported found items in your area
          </p>
        </div>
        {items.length > 0 && (
          <button onClick={handleClearAll} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold flex items-center gap-2 transition-colors mb-2">
            <Trash2 size={18} /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Search size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No found items reported yet</p>
          <p className="text-gray-400 text-sm mt-2">Found items will appear here once reported</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className={`bg-gradient-to-br from-[#93C5FD]/20 to-white rounded-xl shadow-lg p-5 border-2 hover:shadow-xl transition-all relative group overflow-hidden ${item.status === "MATCHED" ? "border-green-400 opacity-90" : "border-[#93C5FD]"}`}
            >
              {item.status === "MATCHED" && (
                <div className="absolute top-4 right-[-35px] bg-green-500 text-white text-xs font-bold px-10 py-1 rotate-45 shadow-md z-20">
                  MATCH FOUND
                </div>
              )}

              <button
                onClick={() => handleDelete(item.id)}
                className="absolute top-4 left-4 p-2 bg-white/80 hover:bg-red-500 hover:text-white text-red-500 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 z-30"
                title="Clear Item"
              >
                <Trash2 size={18} />
              </button>

              {item.image && (
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="mb-3 flex items-center gap-2">
                <span className="px-3 py-1 bg-[#93C5FD] text-gray-800 text-sm rounded-full font-semibold">
                  FOUND
                </span>
              </div>
              <h3 className="text-xl text-[#1E2A44] mb-2 font-bold">{item.itemName}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1E2A44]">Category:</span>
                  <span className="text-gray-700">{item.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  <span className="text-gray-700 text-sm line-clamp-1">{item.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  <span className="text-gray-700 text-sm">{item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-500" />
                  <span className="text-gray-700 text-sm">{item.userName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-blue-500" />
                  <span className="line-clamp-1 text-sm text-gray-700">{item.contactInfo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}