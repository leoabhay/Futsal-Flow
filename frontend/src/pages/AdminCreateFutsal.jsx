import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { MapPin, Info, DollarSign, Clock, Upload, Plus } from "lucide-react";
import api from "../api/instance";

const CreateFutsal = () => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    pricePerHour: "",
    availableSlots: ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00"],
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) =>
      api.post(`/futsals`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => setSuccess(true),
    onError: (err) =>
      setError(err.response?.data?.message || "Error creating futsal"),
  });

  const handleFileChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "availableSlots") {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    images.forEach((image) => data.append("images", image));

    mutation.mutate(data);
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center glass p-12">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plus size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4">
          Ground Created Successfully!
        </h2>
        <p className="text-gray-400 mb-8">
          Your futsal ground is now live and ready for bookings.
        </p>
        <button
          onClick={() => (window.location.href = "/futsals")}
          className="btn-primary"
        >
          View Listing
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto glass p-8">
      <h2 className="text-3xl font-bold mb-8">Register New Futsal Ground</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="space-y-4">
          <div className="relative">
            <Info className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Ground Name"
              className="input-field w-full pl-10"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Full Address / Location"
              className="input-field w-full pl-10"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
          </div>
          <div className="relative">
            <DollarSign
              className="absolute left-3 top-3 text-gray-500"
              size={18}
            />
            <input
              type="number"
              placeholder="Price Per Hour (NPR)"
              className="input-field w-full pl-10"
              value={formData.pricePerHour}
              onChange={(e) =>
                setFormData({ ...formData, pricePerHour: e.target.value })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            placeholder="Description, facilities, rules..."
            className="input-field w-full h-32 resize-none"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
          <div className="p-4 border-2 border-dashed border-white/10 rounded-xl hover:border-primary/50 transition-colors cursor-pointer relative">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              accept="image/*"
            />
            <div className="flex flex-col items-center text-gray-400">
              <Upload size={32} className="mb-2" />
              <span>
                {images.length > 0
                  ? `${images.length} images selected`
                  : "Upload Ground Images (Max 5)"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="col-span-full text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            {error}
          </div>
        )}

        <div className="col-span-full flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary px-12 py-3 flex items-center space-x-2"
          >
            {mutation.isPending ? "Processing..." : "Create Listing"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateFutsal;
