import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const Dashboard = () => {
  const queryClient = useQueryClient();

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => api.get(`/bookings/my`).then((res) => res.data.data),
  });

  const cancelBooking = useMutation({
    mutationFn: (id) => api.put(`/bookings/${id}`, { status: "cancelled" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-bookings"]);
      toast.success("Booking cancelled successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    },
  });

  const deleteBooking = useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["my-bookings"]);
      toast.success("Booking history removed");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete booking");
    },
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "cancelled":
      case "declined":
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
      case "declined":
        return <XCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (isLoading)
    return (
      <div className="text-center py-20 animate-pulse text-gray-500 font-bold uppercase tracking-widest">
        Retrieving sessions...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            My Sessions
          </h1>
          <p className="text-gray-400 font-medium">
            Manage your scheduled pitch times and history.
          </p>
        </div>
        <div className="glass px-6 py-4 rounded-2xl hidden md:block">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
            Active Bookings
          </p>
          <p className="text-2xl font-black">
            {bookings?.filter((b) => b.status === "confirmed").length || 0}
          </p>
        </div>
      </div>

      {bookings?.length === 0 ? (
        <div className="glass p-16 text-center border-dashed border-2 border-white/10">
          <Calendar
            className="mx-auto mb-6 text-gray-700 animate-bounce"
            size={64}
          />
          <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Empty Pitch
          </h3>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto font-medium">
            No active sessions found in your roster. Time to get back on the
            field.
          </p>
          <a
            href="/futsals"
            className="btn-primary inline-flex items-center space-x-2 px-10 py-5"
          >
            <ExternalLink size={20} />
            <span>Find a Futsal</span>
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="glass p-6 md:p-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 hover:border-primary/30 transition-all group overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                <Tag size={120} />
              </div>

              <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl shadow-black/40 border-2 border-white/5 bg-white/5">
                <img
                  src={
                    booking.futsal?.images[0] ||
                    "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=300"
                  }
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={booking.futsal?.name}
                />
              </div>

              <div className="flex-grow space-y-4 w-full">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">
                      {booking.futsal?.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium flex items-center">
                      <MapPin size={12} className="mr-1" />{" "}
                      {booking.futsal?.location}
                    </p>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${getStatusStyle(booking.status)} shadow-lg`}
                  >
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Date
                    </p>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Calendar size={14} className="text-primary" />
                      <span>
                        {new Date(booking.date).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Time Slot
                    </p>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Clock size={14} className="text-primary" />
                      <span>
                        {booking.startTime} - {booking.endTime}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Investment
                    </p>
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Tag size={14} className="text-primary" />
                      <span className="text-emerald-400">
                        NPR {booking.totalPrice}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-3 w-full md:w-auto">
                <button className="glass flex-1 md:flex-none py-3 px-8 text-xs font-black uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all">
                  Details
                </button>
                {booking.status === "pending" ? (
                  <button
                    onClick={() => cancelBooking.mutate(booking._id)}
                    className="flex-1 md:flex-none py-3 px-8 text-red-500 bg-red-500/10 hover:bg-red-500/20 text-xs font-black uppercase tracking-widest transition-all rounded-xl active:scale-95"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => deleteBooking.mutate(booking._id)}
                    className="flex-1 md:flex-none p-3 text-gray-600 hover:text-red-400 hover:bg-red-400/10 transition-all rounded-xl"
                    title="Remove from history"
                  >
                    <Trash2 size={18} className="mx-auto" />
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
