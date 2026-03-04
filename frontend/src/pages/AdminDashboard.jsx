import React from "react";
import { useQuery } from "@tanstack/react-query";
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
} from "lucide-react";
import api from "../api/instance";

const AdminDashboard = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get(`/admin/stats`).then((res) => res.data.stats),
  });

  if (isLoading)
    return (
      <div className="text-center py-20 text-gray-400">
        Analyzing platform data...
      </div>
    );
  if (error)
    return (
      <div className="text-red-500 glass p-8">
        Error loading analytics. Are you logged in as admin?
      </div>
    );

  const stats = [
    {
      label: "Total Revenue",
      value: `NPR ${data.totalRevenue}`,
      icon: Landmark,
      color: "text-emerald-400",
    },
    {
      label: "Total Bookings",
      value: data.totalBookings,
      icon: Calendar,
      color: "text-blue-400",
    },
    {
      label: "Active Users",
      value: data.totalUsers,
      icon: Users,
      color: "text-purple-400",
    },
    {
      label: "Total Grounds",
      value: data.totalFutsals,
      icon: Award,
      color: "text-amber-400",
    },
  ];

  // Format monthly stats for chart
  const chartData = data.monthlyStats.map((item) => ({
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
    revenue: item.revenue / 100, // Normalized for display
  }));

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 tracking-tight">
            Admin Analytics
          </h1>
          <p className="text-gray-400">
            Real-time overview of Futsal Flow platform performance.
          </p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <TrendingUp size={18} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass p-6 hover:shadow-2xl shadow-black/20 transition-all border-white/5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Growth +12%
              </span>
            </div>
            <h3 className="text-gray-400 text-sm font-medium mb-1">
              {stat.label}
            </h3>
            <p className="text-2xl font-black">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Booking Trends Chart */}
        <div className="glass p-8">
          <h3 className="text-xl font-bold mb-6">Booking & Revenue Trends</h3>
          <div className="h-80 w-full">
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
                  itemStyle={{ color: "#fff" }}
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
        </div>

        {/* Popular Grounds List */}
        <div className="glass p-8">
          <h3 className="text-xl font-bold mb-6">Top Performing Grounds</h3>
          <div className="space-y-6">
            {data.popularFutsals.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-black/40">
                    <img
                      src={item.futsalDetails.images[0]}
                      className="w-full h-full object-cover"
                      alt={item.futsalDetails.name}
                    />
                  </div>
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
                  <button className="text-[10px] text-gray-500 uppercase tracking-widest font-bold flex items-center space-x-1 ml-auto group-hover:text-white transition-colors">
                    <span>Manage</span>
                    <ExternalLink size={10} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
