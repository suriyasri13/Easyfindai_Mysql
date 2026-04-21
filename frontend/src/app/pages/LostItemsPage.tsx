import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, User, Trash2 } from "lucide-react";
import { Package } from "lucide-react";
import { Button } from "../components/ui/button";
import { getLostItems, deleteLostItem } from "../services/api";
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

export default function LostItemsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    try {
      const data = await getLostItems();

      const mappedData = data.map((item: any) => ({
        id: item.itemId,
        itemName: item.itemName,
        category: item.category || "Other",
        description: item.description || "",
        contactInfo: item.user?.email || "",
        date: item.dateLost,
        location: item.location,
        image: item.imagePath ? `http://localhost:8080/uploads/${item.imagePath}` : null,
        userName: item.user?.name || "Unknown",
        userId: item.user?.userId || "",
        type: "lost",
        createdAt: "",
        status: item.status || "PENDING"
      }));

      setItems(mappedData);

    } catch (error) {
      console.error("Error fetching lost items:", error);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to clear this item?")) {
      try {
        await deleteLostItem(id);
        toast.success("Item cleared successfully");
        fetchLostItems();
      } catch (error: any) {
        toast.error(error.message || "Failed to clear item");
      }
    }
  };

  return (
    <div className="space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl text-white font-black tracking-tighter uppercase">Lost Items</h2>
          <p className="text-slate-400 mt-2 text-lg font-medium">Search through items reported as lost on campus.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate('/dashboard/report-item')}
            className="bg-rose-500 hover:bg-rose-600 text-white px-8 py-6 rounded-2xl transition-all font-black uppercase tracking-widest text-xs shadow-2xl shadow-rose-500/20"
          >
            Report Lost Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-2xl rounded-[3rem] p-20 text-center border border-white/10 shadow-2xl">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-slate-500" />
          </div>
          <p className="text-white text-2xl font-black mb-2 uppercase tracking-tight">No lost items reported yet</p>
          <p className="text-slate-400 text-lg font-medium">Lost items will appear here once reported by the community.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="group bg-white/5 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/10 overflow-hidden hover:-translate-y-2 transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative aspect-video overflow-hidden border-b border-white/5">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.itemName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center">
                    <Package size={48} className="text-slate-600" />
                  </div>
                )}
                
                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-4 left-4 p-3 bg-slate-900/80 backdrop-blur-md hover:bg-rose-500 hover:text-white text-rose-500 rounded-xl shadow-lg transition-all opacity-0 group-hover:opacity-100 z-30"
                  title="Clear Item"
                >
                  <Trash2 size={18} />
                </button>

                <div className="absolute top-4 right-4 bg-rose-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">
                  LOST
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl text-white mb-3 font-black tracking-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                  {item.itemName}
                </h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">
                  {item.description}
                </p>

                <div className="space-y-4 mt-auto">
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                    <MapPin size={18} className="text-blue-400" />
                    <span className="text-slate-300 text-sm font-bold line-clamp-1">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest line-clamp-1">
                        {item.userName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] text-slate-500 font-black mb-2 uppercase tracking-widest">Contact Protocol</p>
                    <p className="text-sm text-blue-400 font-black tracking-widest">
                      {item.contactInfo}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}