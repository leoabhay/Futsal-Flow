import React, { useState } from "react";
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
  Trash2,
  Edit,
  X,
  Save,
} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const OwnerDashboard = () => {
  const queryClient = useQueryClient();
  const [editingBooking, setEditingBooking] = useState(null);

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
    mutationFn: ({ id, status }) => api.put(`/bookings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-bookings"]);
      toast.success("Booking updated");
    },
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => api.put(`/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-bookings"]);
      toast.success("Booking details synced");
      setEditingBooking(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update booking"),
  });

  const deleteBooking = useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["owner-bookings"]);
      toast.success("Booking deleted");
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
              <button
                onClick={() =>
                  (window.location.href = `/owner/edit-futsal/${myFutsal._id}`)
                }
                className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-white/5"
              >
                <Settings size={14} />
                <span>Configure Pitch</span>
              </button>
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
                                  status: "declined",
                                })
                              }
                              className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                              title="Decline"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setEditingBooking(booking)}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                          title="Edit Details"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => deleteBooking.mutate(booking._id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Remove Record"
                        >
                          <Trash2 size={18} />
                        </button>
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

      {/* Editing Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-8 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setEditingBooking(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Update Player Schedule
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  status: formData.get("status"),
                  date: formData.get("date"),
                  startTime: formData.get("startTime"),
                  endTime: formData.get("endTime"),
                };
                updateBooking.mutate({ id: editingBooking._id, data });
              }}
              className="space-y-6 text-left"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Session Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={editingBooking.date.split("T")[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingBooking.status}
                    className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl focus:border-primary outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center hover:text-white transition-colors cursor-help"
                    title="Format: HH:MM 24h"
                  >
                    <Clock size={10} className="mr-1" /> Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    defaultValue={editingBooking.startTime}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center hover:text-white transition-colors cursor-help"
                    title="Format: HH:MM 24h"
                  >
                    <Clock size={10} className="mr-1" /> End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    defaultValue={editingBooking.endTime}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updateBooking.isPending}
                className="btn-primary w-full py-4 flex items-center justify-center space-x-2"
              >
                {updateBooking.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> <span>Save Slot Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
