import { useEffect, useState } from "react";
import { Calendar, MapPin, User, Phone } from "lucide-react";
import { Package } from "lucide-react";
import { getLostItems } from "../services/api";

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
}

export default function LostItemsPage() {
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
      createdAt: ""
    }));

    setItems(mappedData);

  } catch (error) {
    console.error("Error fetching lost items:", error);
  }
};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-4xl mb-6 text-[#1E2A44] font-bold">
          Lost Items
        </h2>
        <p className="text-gray-600 text-base">
          Browse recently reported lost items in your area
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package
            size={48}
            className="mx-auto text-gray-400 mb-4"
          />
          <p className="text-gray-500 text-lg">
            No lost items reported yet
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Lost items will appear here once reported
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-[#FCA5A5]/20 to-white rounded-xl shadow-lg p-5 border-2 border-[#FCA5A5] hover:shadow-xl transition-all"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.itemName}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <div className="mb-3">
                <span className="px-3 py-1 bg-[#FCA5A5] text-gray-800 text-sm rounded-full font-semibold">
                  LOST
                </span>
              </div>
              <h3 className="text-xl text-[#1E2A44] mb-2 font-bold">
                {item.itemName}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {item.description}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1E2A44]">
                    Category:
                  </span>
                  <span className="text-gray-700">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-500" />
                  <span className="text-gray-700 text-sm line-clamp-1">
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar
                    size={16}
                    className="text-red-500"
                  />
                  <span className="text-gray-700 text-sm">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-red-500" />
                  <span className="text-gray-700 text-sm">
                    {item.userName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-red-500" />
                  <span className="line-clamp-1 text-sm text-gray-700">
                    {item.contactInfo}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}