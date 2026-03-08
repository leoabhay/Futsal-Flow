import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Info, Upload, Plus, Save, ChevronLeft, User, ChevronDown,} from "lucide-react";
import api from "../api/instance";
import toast from "react-hot-toast";

const FutsalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    pricePerHour: "",
    availableSlots: ["06:00", "07:00", "08:00", "15:00", "16:00", "17:00"],
    owner: "",
  });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Fetch data if editing
  const { data: existingFutsal, isLoading: fetching } = useQuery({
    queryKey: ["futsal", id],
    queryFn: () => api.get(`/futsals/${id}`).then((res) => res.data.data),
    enabled: isEdit,
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = user?.role === "admin";

  const { data: owners } = useQuery({
    queryKey: ["admin-owners"],
    queryFn: () =>
      api
        .get("/admin/users")
        .then((res) => res.data.data.filter((u) => u.role === "owner")),
    enabled: isAdmin,
  });

  useEffect(() => {
    if (existingFutsal) {
      setFormData({
        name: existingFutsal.name,
        location: existingFutsal.location,
        description: existingFutsal.description,
        pricePerHour: existingFutsal.pricePerHour,
        availableSlots:
          existingFutsal.availableSlots || formData.availableSlots,
        owner: existingFutsal.owner || "",
      });
    }
  }, [existingFutsal]);

  const mutation = useMutation({
    mutationFn: (data) =>
      isEdit
        ? api.put(`/futsals/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : api.post(`/futsals`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          }),
    onSuccess: () => {
      setSuccess(true);
      toast.success(isEdit ? "Ground updated!" : "Ground created!");
    },
    onError: (err) =>
      setError(
        err.response?.data?.message ||
          `Error ${isEdit ? "updating" : "creating"} futsal`,
      ),
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

  if (fetching)
    return (
      <div className="text-center py-20 text-gray-400">
        Loading ground data...
      </div>
    );

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center glass p-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Save size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4 uppercase tracking-tight">
          {isEdit ? "Update Successful!" : "Ground Created!"}
        </h2>
        <p className="text-gray-400 mb-8 font-medium">
          {isEdit
            ? "The ground details have been refreshed."
            : "Your futsal ground is now live and ready for bookings."}
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="glass px-8 py-3 font-bold"
          >
            Go Back
          </button>
          <button onClick={() => navigate("/futsals")} className="btn-primary">
            View Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <button
        onClick={() =>
          navigate(isAdmin ? "/admin/dashboard" : "/owner/dashboard")
        }
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:bg-white/10"
      >
        <ChevronLeft size={16} />
        <span>Cancel</span>
      </button>

      <div className="glass p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Plus size={150} />
        </div>

        <h2 className="text-4xl font-black mb-10 tracking-tight uppercase">
          {isEdit ? "Edit Ground Details" : "Register New Futsal"}
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Ground Name
              </label>
              <div className="relative">
                <Info
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="e.g. Wembley Futsal Arena"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Precise Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="e.g. Kathmandu, Nepal"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Price per Hour (Rs)
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">
                  Rs
                </div>
                <input
                  type="number"
                  placeholder="1500"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerHour: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                  Assign Owner
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                    <User size={18} />
                  </div>
                  <select
                    className="w-full pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none cursor-pointer text-gray-200 hover:bg-white/15"
                    value={formData.owner}
                    onChange={(e) =>
                      setFormData({ ...formData, owner: e.target.value })
                    }
                    required={isAdmin}
                  >
                    <option value="" className="bg-slate-800 text-gray-400">
                      Select an Owner
                    </option>
                    {owners?.map((o) => (
                      <option
                        key={o._id}
                        value={o._id}
                        className="bg-slate-800 text-white py-2"
                      >
                        {o.name} — {o.email}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 transition-transform group-focus-within:rotate-180">
                    <ChevronDown size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Facilities & Description
              </label>
              <textarea
                placeholder="Talk about the turf quality, parking, changing rooms..."
                className="w-full p-4 h-44 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                Media Assets
              </label>
              <div className="p-6 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 transition-all cursor-pointer relative bg-white/5 group">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="flex flex-col items-center text-gray-400 group-hover:text-primary transition-colors">
                  <Upload size={32} className="mb-2" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    {images.length > 0
                      ? `${images.length} images selected`
                      : "Upload Ground Images"}
                  </span>
                </div>
              </div>
              {isEdit && !images.length && (
                <p className="text-[10px] text-gray-500 ml-1 italic">
                  * Images won't be changed if none uploaded
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="col-span-full text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 font-bold text-sm">
              {error}
            </div>
          )}

          <div className="col-span-full pt-4">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full py-5 flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
            >
              {mutation.isPending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={20} />
                  <span className="text-lg">
                    {isEdit ? "Update Ground" : "Add Ground"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FutsalForm;