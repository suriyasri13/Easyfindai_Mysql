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
    <div className="max-w-5xl mx-auto">
      <h2 className="text-4xl mb-8 text-[#1E2A44] font-bold">
        Contact Us
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl text-[#1E2A44] mb-6 font-bold">
              Get In Touch
            </h3>

            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-gradient-to-r from-blue-50 to-white p-5 rounded-xl border border-blue-100">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <MapPin size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2A44] mb-1 text-lg">
                    Address
                  </h4>
                  <p className="text-gray-700 text-base">
                    No 12: 555 MCE Campus Road
                    <br />
                    Chennai, Tamil Nadu
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-r from-green-50 to-white p-5 rounded-xl border border-green-100">
                <div className="bg-green-600 p-3 rounded-lg">
                  <Phone size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2A44] mb-1 text-lg">
                    Phone
                  </h4>
                  <p className="text-gray-700 text-base">
                    7200076786
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-r from-purple-50 to-white p-5 rounded-xl border border-purple-100">
                <div className="bg-purple-600 p-3 rounded-lg">
                  <Mail size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2A44] mb-1 text-lg">
                    Email
                  </h4>
                  <p className="text-gray-700 text-base">
                    support@easefind.ai
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-gradient-to-r from-orange-50 to-white p-5 rounded-xl border border-orange-100">
                <div className="bg-orange-600 p-3 rounded-lg">
                  <Clock size={24} className="text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[#1E2A44] mb-1 text-lg">
                    Business Hours
                  </h4>
                  <p className="text-gray-700 text-base">
                    Monday - Friday
                    <br />
                    9:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl text-[#1E2A44] mb-6 font-bold">
            Send Us a Message
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="name"
                className="text-gray-700 font-semibold text-base mb-2 block"
              >
                Your Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
              />
            </div>

            <div>
              <Label
                htmlFor="email"
                className="text-gray-700 font-semibold text-base mb-2 block"
              >
                Your Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 text-base"
              />
            </div>

            <div>
              <Label
                htmlFor="message"
                className="text-gray-700 font-semibold text-base mb-2 block"
              >
                Message *
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="border-2 border-gray-200 focus:border-[#14B8A6] focus:ring-2 focus:ring-[#14B8A6]/20 min-h-[160px] text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#1E2A44] hover:bg-[#2D3E5F] text-white py-6 text-base font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Send size={20} className="mr-2" />
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}