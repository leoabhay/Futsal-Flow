import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import api from "../api/instance";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const mutation = useMutation({
    mutationFn: (data) => api.post(`/auth/login`, data),
    onSuccess: (res) => {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      const redirectTo = location.state?.from;

      if (redirectTo) {
        window.location.href = redirectTo;
      } else if (role === "admin") {
        window.location.href = "/admin/dashboard";
      } else if (role === "owner") {
        window.location.href = "/owner/dashboard";
      } else {
        window.location.href = "/dashboard";
      }
    },
    onError: (err) =>
      setError(err.response?.data?.message || "Invalid credentials"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 glass">
      <h2 className="text-3xl font-bold mb-2 text-center pt-4">Welcome Back</h2>
      <p className="text-gray-400 text-center mb-8">
        Sign in to your Futsal Flow account
      </p>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
          <input
            type="email"
            placeholder="Email Address"
            className="input-field w-full pl-10"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>
        <div className="relative group">
          <Lock
            className="absolute left-3 top-3 text-gray-500 group-focus-within:text-primary transition-colors"
            size={18}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="input-field w-full pl-10 pr-10"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
        >
          <span>{mutation.isPending ? "Signing in..." : "Sign In"}</span>
          {!mutation.isPending && <ArrowRight size={20} />}
        </button>
      </form>

      <div className="mt-8 text-center text-gray-400">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary hover:underline font-bold">
          Sign Up
        </Link>
      </div>
    </div>
  );
};

export default Login;
