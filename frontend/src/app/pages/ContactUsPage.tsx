import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { toast } from "sonner";

export default function ContactUsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error("Please fill in all fields");
      return;
    }

    toast.success(
      "Message sent successfully! We will get back to you soon.",
    );
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="mb-10">
        <h2 className="text-4xl text-[#1e293b] font-bold tracking-tight">Contact Us</h2>
        <p className="text-slate-500 mt-2 text-lg font-medium">
          We're here to help you with any questions or concerns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100 h-full">
            <h3 className="text-2xl text-[#1e293b] font-bold mb-10 flex items-center gap-3">
               <span className="p-2 bg-blue-50 rounded-lg">📞</span>
               Get In Touch
            </h3>

            <div className="space-y-6">
              {[
                { 
                  icon: MapPin, 
                  label: "Address", 
                  value: "No 12: 555 MCE Campus Road, Chennai, Tamil Nadu", 
                  color: "bg-blue-50 text-blue-600",
                },
                { 
                  icon: Phone, 
                  label: "Phone", 
                  value: "7200076786", 
                  color: "bg-emerald-50 text-emerald-600",
                },
                { 
                  icon: Mail, 
                  label: "Email", 
                  value: "support@easefind.ai", 
                  color: "bg-purple-50 text-purple-600",
                },
                { 
                  icon: Clock, 
                  label: "Business Hours", 
                  value: "Monday - Friday, 9:00 AM - 5:00 PM", 
                  color: "bg-orange-50 text-orange-600",
                }
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-6 p-6 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all group">
                  <div className={`${item.color} p-4 rounded-xl shadow-sm group-hover:shadow-md transition-all`}>
                    <item.icon size={26} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1e293b] mb-1 text-sm uppercase tracking-widest">
                      {item.label}
                    </h4>
                    <p className="text-slate-500 text-base leading-relaxed font-medium">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-[2rem] shadow-xl p-10 border border-slate-100">
          <h3 className="text-2xl text-[#1e293b] font-bold mb-10 flex items-center gap-3">
            <span className="p-2 bg-purple-50 rounded-lg">✉️</span>
            Send Us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[#1e293b] font-bold text-base block">
                  Your Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="email" className="text-[#1e293b] font-bold text-base block">
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 py-7 text-base rounded-2xl"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="message" className="text-[#1e293b] font-bold text-base block">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can we help you today?"
                className="bg-slate-50 border-slate-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10 min-h-[200px] text-base p-6 rounded-2xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-8 text-xl font-bold shadow-xl shadow-blue-100 transition-all rounded-2xl"
            >
              <Send size={24} className="mr-3" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}