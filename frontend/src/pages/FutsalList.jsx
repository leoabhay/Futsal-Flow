import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Search,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  Map as MapIcon,
  Grid,
} from "lucide-react";
import FutsalMap from "../components/FutsalMap";
import api from "../api/instance";

const FutsalList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'map'

  const { data, isLoading, error } = useQuery({
    queryKey: ["futsals", searchTerm, maxPrice],
    queryFn: () =>
      api
        .get("/futsals", {
          params: { location: searchTerm, maxPrice: maxPrice || undefined },
        })
        .then((res) => res.data.data),
  });

  if (error)
    return <div className="text-red-500 glass p-8">Error loading grounds.</div>;

  return (
    <div className="space-y-12">
      {/* Search & Filter Header */}
      <div className="glass p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-white/5 shadow-2xl shadow-black/40">
        <div className="flex-1 w-full max-w-xl relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by city, area or ground name..."
            className="input-field w-full pl-12 py-4 bg-white/5 border-white/10 hover:border-white/20 focus:border-primary/50 text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 w-full md:w-auto">
          <div className="flex bg-dark-lighter p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`p-2 rounded-lg transition-all ${viewMode === "map" ? "bg-primary text-white shadow-lg" : "text-gray-500 hover:text-white"}`}
            >
              <MapIcon size={20} />
            </button>
          </div>

          <div className="relative flex-1 md:flex-none">
            <Filter
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              size={16}
            />
            <select
              className="input-field pl-10 pr-8 py-3 bg-white/5 appearance-none cursor-pointer"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              <option value="">Budget: Any</option>
              <option value="1500">Under 1500</option>
              <option value="2000">Under 2000</option>
              <option value="2500">Under 2500</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2 uppercase italic">
            Ground Discovery
          </h2>
          <div className="h-1 w-20 bg-primary rounded-full"></div>
        </div>
        <p className="text-gray-400 font-bold tracking-widest text-xs">
          {data?.length || 0} GROUNDS FOUND
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="glass h-[420px] animate-pulse bg-white/5"
            ></div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === "map" ? (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <FutsalMap grounds={data} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.map((futsal) => (
                <div
                  key={futsal._id}
                  className="glass group overflow-hidden transition-all hover:scale-[1.02] border-white/5 hover:border-primary/30 shadow-xl hover:shadow-primary/10"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={
                        futsal.images[0] ||
                        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800"
                      }
                      alt={futsal.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 right-4 bg-primary/95 backdrop-blur-md px-4 py-2 rounded-2xl text-sm font-black shadow-2xl border border-white/20">
                      NPR {futsal.pricePerHour}
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-2xl font-bold mb-1 tracking-tight group-hover:text-primary transition-colors">
                          {futsal.name}
                        </h3>
                        <div className="flex items-center text-gray-500 space-x-1">
                          <MapPin size={14} className="text-emerald-500" />
                          <span className="text-xs font-semibold uppercase tracking-wider">
                            {futsal.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/futsals/${futsal._id}`}
                      className="btn-primary w-full py-3 flex items-center justify-center space-x-2 rounded-xl"
                    >
                      <span className="font-bold">VIEW SLOTS</span>
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {!isLoading && data.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
          <p className="text-gray-400 text-lg font-bold">
            MISSING IN ACTION. TRY A DIFFERENT SEARCH.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setMaxPrice("");
            }}
            className="mt-4 text-primary font-black uppercase tracking-widest text-xs hover:underline"
          >
            Reset Scouting
          </button>
        </div>
      )}
    </div>
  );
};

export default FutsalList;
