import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Mail, User, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import api from "../api/instance";

const Signup = () => {
  const [step, setStep] = useState(1); // 1: Signup form, 2: OTP verification
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    otp: ["", "", "", "", "", ""],
  });
  const [error, setError] = useState("");

  const signupMutation = useMutation({
    mutationFn: (data) => api.post(`/auth/signup`, data),
    onSuccess: () => setStep(2),
    onError: (err) =>
      setError(err.response?.data?.message || "Error sending OTP"),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (data) => api.post(`/auth/verify-otp`, data),
    onSuccess: (res) => {
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.token) localStorage.setItem("token", res.data.token);
      const role = res.data.user.role;
      if (role === "admin") window.location.href = "/admin/dashboard";
      else if (role === "owner") window.location.href = "/owner/dashboard";
      else window.location.href = "/dashboard";
    },
    onError: (err) => setError(err.response?.data?.message || "Invalid OTP"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (step === 1) {
      signupMutation.mutate({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
    } else {
      const otpValue = formData.otp.join("");
      verifyOtpMutation.mutate({ email: formData.email, otp: otpValue });
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...formData.otp];
    newOtp[index] = element.value;
    setFormData({ ...formData, otp: newOtp });

    // Focus next input
    if (element.value !== "" && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (formData.otp[index] === "" && e.target.previousSibling) {
        e.target.previousSibling.focus();
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 glass">
      {step === 1 ? (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight mb-1">
            Join Futsal Flow
          </h2>
          <p className="text-gray-400 text-sm font-medium">
            Create your account and start booking pitches
          </p>
        </div>
      ) : (
        <h2 className="text-3xl font-bold mb-6 text-center">Verify Email</h2>
      )}

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          <>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Full Name"
                className="input-field w-full pl-10"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
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
            <div className="space-y-2">
              <p className="text-gray-400 text-sm font-medium">Join as:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "user" })}
                  className={`py-2 rounded-xl font-bold border-2 transition-all ${
                    formData.role === "user"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/5 bg-white/5 text-gray-500 hover:border-white/10"
                  }`}
                >
                  Player
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "owner" })}
                  className={`py-2 rounded-xl font-bold border-2 transition-all ${
                    formData.role === "owner"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/5 bg-white/5 text-gray-500 hover:border-white/10"
                  }`}
                >
                  Owner
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center space-y-6">
            <p className="text-gray-400 text-sm">
              We've sent a 6-digit code to <br />
              <span className="text-white font-semibold">{formData.email}</span>
            </p>
            <div className="flex justify-between gap-2 max-w-[300px] mx-auto">
              {formData.otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  className="w-10 h-12 bg-white/5 border border-white/10 rounded-lg text-center text-xl font-bold focus:border-primary focus:outline-none transition-all"
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={signupMutation.isPending || verifyOtpMutation.isPending}
          className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
        >
          <span>{step === 1 ? "Sign Up" : "Verify & Continue"}</span>
          {signupMutation.isPending || verifyOtpMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          ) : (
            <ArrowRight size={20} />
          )}
        </button>

        {step === 1 && (
          <p className="text-center text-gray-400 text-sm mt-4">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary hover:underline font-bold"
            >
              Login
            </Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default Signup;
