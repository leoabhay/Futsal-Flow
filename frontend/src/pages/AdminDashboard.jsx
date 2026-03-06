import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Calendar,
  Landmark,
  TrendingUp,
  Award,
  ExternalLink,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Package,
  X,
  Save,
  Clock,
} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("analytics");
  const [editingUser, setEditingUser] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get(`/admin/stats`).then((res) => res.data.stats),
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => api.get(`/admin/users`).then((res) => res.data.data),
    enabled: activeTab === "users",
  });

  const { data: futsals, isLoading: futsalsLoading } = useQuery({
    queryKey: ["admin-futsals"],
    queryFn: () => api.get(`/futsals`).then((res) => res.data.data),
    enabled: activeTab === "futsals",
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["admin-bookings"],
    queryFn: () => api.get(`/bookings`).then((res) => res.data.data),
    enabled: activeTab === "bookings",
  });

  // Mutations
  const deleteUser = useMutation({
    mutationFn: (id) => api.delete(`/admin/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User deleted");
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }) => api.put(`/admin/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-users"]);
      toast.success("User updated");
      setEditingUser(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update user"),
  });

  const deleteFutsal = useMutation({
    mutationFn: (id) => api.delete(`/futsals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-futsals"]);
      toast.success("Futsal ground removed");
    },
  });

  const updateBookingStatus = useMutation({
    mutationFn: ({ id, status }) => api.put(`/bookings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-bookings"]);
      toast.success("Booking updated");
    },
  });

  const updateBooking = useMutation({
    mutationFn: ({ id, data }) => api.put(`/bookings/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-bookings"]);
      toast.success("Booking updated");
      setEditingBooking(null);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update booking"),
  });

  const deleteBooking = useMutation({
    mutationFn: (id) => api.delete(`/bookings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-bookings"]);
      toast.success("Booking deleted");
    },
  });

  if (statsLoading)
    return (
      <div className="text-center py-20 text-gray-400">
        Analyzing platform data...
      </div>
    );

  const metricStats = [
    {
      label: "Total Revenue",
      value: `NPR ${stats.totalRevenue}`,
      icon: Landmark,
      color: "text-emerald-400",
    },
    {
      label: "Total Bookings",
      value: stats.totalBookings,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Active Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Total Grounds",
      value: stats.totalFutsals,
      icon: Award,
      color: "text-amber-400",
    },
  ];

  const chartData = stats.monthlyStats.map((item) => ({
    name: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][item._id.month - 1],
    bookings: item.count,
    revenue: item.revenue / 100,
  }));

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            Admin Control Center
          </h1>
          <p className="text-gray-400">
            Comprehensive management and real-time analytics.
          </p>
        </div>
        <div className="flex glass p-1 rounded-2xl">
          {["analytics", "users", "futsals", "bookings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "analytics" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricStats.map((stat, idx) => (
              <div
                key={idx}
                className="glass p-6 hover:shadow-2x transition-all border-white/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">
                  {stat.label}
                </h3>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-8 h-[450px]">
              <h3 className="text-xl font-bold mb-6">Booking Trends</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="colorBookings"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#ffffff10"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #ffffff10",
                      borderRadius: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorBookings)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass p-8">
              <h3 className="text-xl font-bold mb-6">Top Performing Grounds</h3>
              <div className="space-y-4">
                {stats.popularFutsals.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.futsalDetails.images[0]}
                        className="w-12 h-12 rounded-xl object-cover"
                        alt=""
                      />
                      <div>
                        <h4 className="font-bold">{item.futsalDetails.name}</h4>
                        <p className="text-xs text-gray-400">
                          {item.futsalDetails.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">
                        {item.bookingCount} Bookings
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "users" && (
        <div className="glass overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Role</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users?.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {u.name[0]}
                      </div>
                      <div>
                        <p className="font-bold">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.role === "admin"
                          ? "bg-amber-500/20 text-amber-500"
                          : u.role === "owner"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-blue-500/20 text-blue-500"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck
                        size={14}
                        className={
                          u.isVerified ? "text-emerald-400" : "text-gray-600"
                        }
                      />
                      <span className="text-sm text-gray-400">
                        {u.isVerified ? "Verified" : "Unverified"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button
                      onClick={() => setEditingUser(u)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteUser.mutate(u._id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "futsals" && (
        <div className="glass overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <div className="p-8 border-b border-white/5 flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <Package className="mr-3 text-primary" size={20} />
              Platform Grounds
            </h3>
            <button
              onClick={() => (window.location.href = "/admin/create-futsal")}
              className="btn-primary py-2 px-6 flex items-center space-x-2"
            >
              <Package size={16} />
              <span>Add Ground</span>
            </button>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                <th className="px-8 py-4">Ground</th>
                <th className="px-8 py-4">Location</th>
                <th className="px-8 py-4">Price/hr</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {futsals?.map((f) => (
                <tr key={f._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={f.images[0]}
                        className="w-12 h-10 rounded-lg object-cover"
                        alt=""
                      />
                      <p className="font-bold">{f.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-400">
                    {f.location}
                  </td>
                  <td className="px-8 py-6 font-bold text-primary">
                    NPR {f.pricePerHour}
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    <button
                      onClick={() =>
                        (window.location.href = `/admin/edit-futsal/${f._id}`)
                      }
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteFutsal.mutate(f._id)}
                      className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="glass overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-black">
                <th className="px-8 py-4">Player / Ground</th>
                <th className="px-8 py-4">Schedule</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings?.map((b) => (
                <tr key={b._id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="font-bold">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.futsal?.name}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm">
                      <p className="font-medium text-gray-300">
                        {new Date(b.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {b.startTime} - {b.endTime}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        b.status === "confirmed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : b.status === "pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    {b.status === "pending" && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            updateBookingStatus.mutate({
                              id: b._id,
                              status: "confirmed",
                            })
                          }
                          className="p-2 text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-all"
                          title="Confirm"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() =>
                            updateBookingStatus.mutate({
                              id: b._id,
                              status: "declined",
                            })
                          }
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                          title="Decline"
                        >
                          <XCircle size={18} />
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => setEditingBooking(b)}
                      className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => deleteBooking.mutate(b._id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editing Modals */}
      {editingUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass w-full max-w-lg p-8 space-y-6 relative overflow-hidden">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Edit User Persona
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const data = {
                  name: formData.get("name"),
                  role: formData.get("role"),
                  isVerified: formData.get("isVerified") === "on",
                };
                updateUser.mutate({ id: editingUser._id, data });
              }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  defaultValue={editingUser.name}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-primary outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Access Tier
                </label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  className="w-full px-4 py-3 bg-dark border border-white/10 rounded-xl focus:border-primary outline-none"
                >
                  <option value="user">User</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center space-x-3 bg-white/5 p-4 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  name="isVerified"
                  defaultChecked={editingUser.isVerified}
                  id="isVerified"
                  className="w-5 h-5 rounded border-white/10 bg-dark text-primary focus:ring-primary"
                />
                <label
                  htmlFor="isVerified"
                  className="text-sm font-bold text-gray-300"
                >
                  Verified Credentials
                </label>
              </div>

              <button
                type="submit"
                disabled={updateUser.isPending}
                className="btn-primary w-full py-4 flex items-center justify-center space-x-2"
              >
                {updateUser.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={18} /> <span>Deploy Updates</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

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
              Modify Slot Parameters
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
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Date
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
                    Current Status
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
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center">
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
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center">
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
                    <Save size={18} /> <span>Sync Changes</span>
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

export default AdminDashboard;
