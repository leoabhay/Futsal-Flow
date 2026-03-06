import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Shield,
  Camera,
  Trash2,
  Key,
  Save,
  Upload,
} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const Profile = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/auth/me").then((res) => res.data.user),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        password: "",
      });
      setPreviewUrl(user.avatar || "");
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: (data) =>
      api.put("/auth/update-me", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: (res) => {
      queryClient.setQueryData(["me"], res.data.data);
      localStorage.setItem("user", JSON.stringify(res.data.data));
      toast.success("Profile updated successfully");
      setFormData((prev) => ({ ...prev, password: "" }));
      setSelectedFile(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    },
  });

  const deleteAccount = useMutation({
    mutationFn: () => api.delete("/auth/delete-me"),
    onSuccess: () => {
      localStorage.removeItem("user");
      toast.success("Account deleted");
      window.location.href = "/login";
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete account");
    },
  });

  const getImageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5000";
    return `${baseUrl}${path}`;
  };

  if (isLoading)
    return (
      <div className="text-center py-20 text-gray-400">Loading profile...</div>
    );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    if (formData.password) data.append("password", formData.password);
    if (selectedFile) data.append("avatar", selectedFile);

    updateProfile.mutate(data);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action is irreversible.",
      )
    ) {
      deleteAccount.mutate();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">
            My Profile
          </h1>
          <p className="text-gray-400 font-medium">
            Manage your personal information and security.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform">
              <Shield size={80} />
            </div>

            <div
              className="relative w-32 h-32 mx-auto mb-6 group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/40 bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-4xl font-black text-primary border-4 border-white/5 relative">
                {previewUrl ? (
                  <img
                    src={getImageUrl(previewUrl)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.name?.[0]
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload size={24} className="text-white" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-xl text-white shadow-xl">
                <Camera size={16} />
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
            <p className="text-gray-400 text-sm mb-4 flex items-center justify-center line-clamp-1">
              <Mail size={14} className="mr-2 flex-shrink-0" /> {user.email}
            </p>

            <span
              className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user.role === "admin"
                  ? "bg-amber-500/20 text-amber-500"
                  : user.role === "owner"
                    ? "bg-purple-500/20 text-purple-500"
                    : "bg-blue-500/20 text-blue-500"
              }`}
            >
              {user.role}
            </span>
          </div>

          <div className="mt-6 glass p-6 border-red-500/10">
            <h4 className="text-sm font-bold text-red-400 mb-4 uppercase tracking-widest">
              Danger Zone
            </h4>
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold text-sm"
            >
              <Trash2 size={16} />
              <span>Delete My Account</span>
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="glass p-8 space-y-6">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 col-span-full">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Email (Restricted)
                </label>
                <div className="relative opacity-50">
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Verified Status
                </label>
                <div className="flex items-center space-x-3 px-4 py-4 bg-white/5 border border-white/10 rounded-2xl">
                  <Shield
                    size={18}
                    className={
                      user.isVerified ? "text-emerald-400" : "text-gray-500"
                    }
                  />
                  <span className="text-sm font-bold text-gray-300">
                    {user.isVerified ? "Verified User" : "Unverified"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Change Password (Leave blank to keep current)
                </label>
                <div className="relative">
                  <Key
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={18}
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="btn-primary w-full py-5 flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {updateProfile.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span>Update Profile Intelligence</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
