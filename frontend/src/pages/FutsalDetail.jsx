import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  Info,
  CreditCard,
} from "lucide-react";
import KhaltiCheckout from "khalti-checkout-web";
import api from "../api/instance";

const FutsalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const location = useLocation();

  const { data: futsal, isLoading } = useQuery({
    queryKey: ["futsal", id],
    queryFn: () => api.get(`/futsals/${id}`).then((res) => res.data.data),
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (paymentData) =>
      api.post(`/payments/khalti/verify`, paymentData),
    onSuccess: () => setBookingSuccess(true),
    onError: (err) => alert("Payment verification failed."),
  });

  const bookingMutation = useMutation({
    mutationFn: (bookingData) => api.post(`/bookings`, bookingData),
    onSuccess: (res) => {
      // Initialize Khalti for the newly created booking
      const config = {
        publicKey:
          import.meta.env.VITE_KHALTI_PUBLIC_KEY ||
          "test_public_key_dc74e1d001224f8d9753c15A976F5E3D",
        productIdentity: id,
        productName: futsal.name,
        productUrl: window.location.href,
        eventHandler: {
          onSuccess(payload) {
            verifyPaymentMutation.mutate({
              token: payload.token,
              amount: payload.amount,
              bookingId: res.data.data._id,
            });
          },
          onError(error) {
            console.log(error);
          },
          onClose() {
            console.log("widget is closing");
          },
        },
        paymentPreference: [
          "KHALTI",
          "EBANKING",
          "MOBILE_BANKING",
          "CONNECT_IPS",
          "SCT",
        ],
      };

      const checkout = new KhaltiCheckout(config);
      checkout.show({ amount: futsal.pricePerHour * 100 }); // Amount in paisa
    },
    onError: (err) => alert(err.response?.data?.message || "Booking failed"),
  });

  if (isLoading)
    return (
      <div className="text-center py-20 animate-pulse">
        Scanning pitch details...
      </div>
    );

  const handleBooking = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      return navigate("/login", { state: { from: location.pathname } });
    }
    if (!selectedSlot) return alert("Please select a slot");
    bookingMutation.mutate({
      futsalId: id,
      date: selectedDate,
      startTime: selectedSlot,
      endTime: `${parseInt(selectedSlot.split(":")[0]) + 1}:00`,
    });
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center glass p-12 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-4xl font-black mb-4">PAYMENT SUCCESSFUL!</h2>
        <p className="text-gray-400 text-lg mb-8 uppercase tracking-widest font-medium">
          Session locked and loaded for {selectedDate} @ {selectedSlot}.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="btn-primary px-12 py-4"
        >
          GO TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-10">
        <div className="h-[450px] rounded-[40px] overflow-hidden glass border-white/5 relative group">
          <img
            src={
              futsal.images[0] ||
              "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200"
            }
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            alt={futsal.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-transparent to-transparent"></div>
        </div>
        <div className="px-4">
          <h1 className="text-5xl font-black mb-6 tracking-tighter uppercase italic">
            {futsal.name}
          </h1>
          <div className="flex flex-wrap gap-6 items-center text-gray-400 mb-10">
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <MapPin size={18} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest">
                {futsal.location}
              </span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Clock size={18} className="text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">
                06:00 - 22:00
              </span>
            </div>
          </div>
          <div className="glass p-10 border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full"></div>
            <h3 className="text-xl font-black mb-6 flex items-center space-x-3 uppercase tracking-tight">
              <Info size={22} className="text-primary" />
              <span>Pitch Intel</span>
            </h3>
            <p className="text-gray-400 leading-loose font-medium text-lg">
              {futsal.description}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="glass p-10 sticky top-32 border-white/10 shadow-3xl shadow-black/50">
          <div className="mb-8">
            <label className="block text-[10px] font-black text-gray-500 mb-4 uppercase tracking-[0.2em]">
              Select Scouting Date
            </label>
            <div className="relative group">
              <CalendarIcon
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors"
                size={20}
              />
              <input
                type="date"
                className="input-field w-full pl-12 py-4 bg-white/5 border-white/10 focus:border-primary/50 font-bold"
                value={selectedDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-10">
            <label className="block text-[10px] font-black text-gray-500 mb-6 uppercase tracking-[0.2em]">
              Live Surface Slots
            </label>
            <div className="grid grid-cols-2 gap-4">
              {futsal.availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-4 rounded-2xl border transition-all font-black text-sm tracking-widest ${
                    selectedSlot === slot
                      ? "bg-primary border-primary text-white shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                      : "bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:border-white/10"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 mb-8 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                Base Rate
              </span>
              <span className="font-black text-xl text-emerald-500">
                NPR {futsal.pricePerHour}
              </span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black">
              <span className="tracking-tighter uppercase italic text-gray-400">
                Total
              </span>
              <span className="text-white">NPR {futsal.pricePerHour}</span>
            </div>
          </div>

          <button
            onClick={handleBooking}
            disabled={
              bookingMutation.isPending || verifyPaymentMutation.isPending
            }
            className="btn-primary w-full py-5 text-xl font-black shadow-[0_0_40px_rgba(59,130,246,0.2)] flex items-center justify-center space-x-3 group"
          >
            <CreditCard
              size={24}
              className="group-hover:rotate-12 transition-transform"
            />
            <span>
              {bookingMutation.isPending ? "DEPLOYING..." : "INITIALIZE KHALTI"}
            </span>
          </button>

          <div className="mt-6 flex items-center justify-center space-x-2 text-gray-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.1em]">
              Encrypted Khalti Verification Active
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FutsalDetail;
