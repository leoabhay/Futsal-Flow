import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlusCircle,
  Settings,
  Layout,
} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const OwnerDashboard = () => {
  const queryClient = useQueryClient();

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["owner-bookings"],
    queryFn: () => api.get("/bookings/owner").then((res) => res.data.data),
  });

  const { data: futsals, isLoading: futsalLoading } = useQuery({
    queryKey: ["owner-futsal"],
    queryFn: () =>
      api.get("/futsals").then((res) => {
        const user = JSON.parse(localStorage.getItem("user"));
        return res.data.data.filter((f) => f.owner === user?._id);
      }),
  });

  const updateBookingStatus = useMutation({
    mutationFn: ({ id, status }) =>
      api.put(`/bookings/admin/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-bookings"]);
      toast.success("Booking updated");
    },
  });

  if (bookingsLoading || futsalLoading)
    return <div className="text-center py-20">Loading your stadium...</div>;

  const myFutsal = futsals?.[0];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            Stadium Manager
          </h1>
          <p className="text-gray-400 font-medium">
            {myFutsal
              ? `Managing ${myFutsal.name}`
              : "Register your futsal to start receiving bookings."}
          </p>
        </div>
        {!myFutsal && (
          <button
            onClick={() => (window.location.href = "/owner/create-futsal")}
            className="btn-primary flex items-center space-x-2 px-8 py-4"
          >
            <PlusCircle size={20} />
            <span>Register Ground</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics or Ground Info */}
        <div className="lg:col-span-1 space-y-6">
          {myFutsal ? (
            <div className="glass p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                <Settings size={80} />
              </div>
              <img
                src={myFutsal.images[0]}
                alt={myFutsal.name}
                className="w-full h-48 object-cover rounded-2xl mb-6 shadow-xl"
              />
              <h3 className="text-2xl font-bold mb-2">{myFutsal.name}</h3>
              <p className="text-gray-400 text-sm mb-6 flex items-center">
                <Layout size={14} className="mr-2" /> {myFutsal.location}
              </p>
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                  Price
                </span>
                <span className="text-primary font-black">
                  NPR {myFutsal.pricePerHour}/hr
                </span>
              </div>
            </div>
          ) : (
            <div className="glass p-8 text-center border-dashed border-2 border-white/10">
              <p className="text-gray-500 mb-4">No ground found</p>
              <Settings
                size={40}
                className="mx-auto text-gray-700 animate-spin-slow"
              />
            </div>
          )}
        </div>

        {/* Bookings Table */}
        <div className="lg:col-span-2 glass overflow-hidden">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <Calendar className="mr-3 text-primary" size={20} />
              Recent Bookings
            </h3>
            <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">
              {bookings?.length || 0} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                  <th className="px-8 py-4">Player</th>
                  <th className="px-8 py-4">Schedule</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {bookings?.map((booking) => (
                  <tr
                    key={booking._id}
                    className="hover:bg-white/5 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold">
                          {booking.user?.name?.[0] || <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold">{booking.user?.name}</p>
                          <p className="text-xs text-gray-500">
                            {booking.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm font-medium">
                          <Calendar size={12} className="mr-2 text-gray-400" />
                          {new Date(booking.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock size={12} className="mr-2 text-gray-400" />
                          {booking.startTime} - {booking.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-tighter ${
                          booking.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-500"
                            : booking.status === "pending"
                              ? "bg-amber-500/20 text-amber-500"
                              : "bg-red-500/20 text-red-500"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex space-x-2">
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                updateBookingStatus.mutate({
                                  id: booking._id,
                                  status: "confirmed",
                                })
                              }
                              className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-colors"
                              title="Confirm"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() =>
                                updateBookingStatus.mutate({
                                  id: booking._id,
                                  status: "cancelled",
                                })
                              }
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Cancel"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {booking.status !== "pending" && (
                          <AlertCircle size={18} className="text-gray-700" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {bookings?.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-8 py-10 text-center text-gray-500"
                    >
                      No bookings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
