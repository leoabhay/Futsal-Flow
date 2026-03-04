import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import api from "../api/instance";

const Dashboard = () => {
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get(`/bookings/my`).then((res) => res.data.data),
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle2 size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (isLoading)
    return <div className="text-center py-20">Loading your bookings...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
        <p className="text-gray-400">
          Manage your upcoming and past futsal sessions.
        </p>
      </div>

      {bookings?.length === 0 ? (
        <div className="glass p-12 text-center">
          <Calendar className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-bold mb-2">No Bookings Yet</h3>
          <p className="text-gray-400 mb-6">
            You haven't booked any futsal sessions yet. Start exploring now!
          </p>
          <a href="/futsals" className="btn-primary inline-block">
            Explore Grounds
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="glass p-6 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8"
            >
              <div className="w-full md:w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={
                    booking.futsal.images[0] ||
                    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300"
                  }
                  className="w-full h-full object-cover"
                  alt={booking.futsal.name}
                />
              </div>

              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold">{booking.futsal.name}</h3>
                  <div
                    className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center space-x-1 ${getStatusStyle(booking.status)}`}
                  >
                    {getStatusIcon(booking.status)}
                    <span className="capitalize">{booking.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar size={14} className="text-primary" />
                    <span>
                      {new Date(booking.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={14} className="text-primary" />
                    <span>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Tag size={14} className="text-primary" />
                    <span>NPR {booking.totalPrice}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-2 w-full md:w-auto">
                <button className="glass py-2 px-6 text-sm font-semibold hover:bg-white/10 transition-all">
                  Get Receipt
                </button>
                {booking.status === "pending" && (
                  <button className="text-red-400 hover:text-red-300 text-sm font-medium transition-all">
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
