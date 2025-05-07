import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import SocialLinks from "../components/socialLinks";

function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoginView) {
      dispatch(login(formData.email, formData.password));
    } else {
      dispatch(register(formData.name, formData.email, formData.password));
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gray-700 py-6 px-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gray-800 p-3 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {isLoginView ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-blue-100 mt-1">
              {isLoginView
                ? "Sign in to continue"
                : "Get started with your account"}
            </p>
          </div>

          {/* Form Body */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLoginView && (
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Enter Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
                  placeholder={
                    isLoginView ? "Enter your password" : "Create a password"
                  }
                />
                {!isLoginView && (
                  <p className="text-xs text-gray-400 mt-1">
                    Use 6 or more characters with a mix of letters, numbers &
                    symbols
                  </p>
                )}
              </div>

              {isLoginView && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-300"
                    >
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a
                      href="/"
                      className="font-medium text-blue-400 hover:text-blue-300"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
              >
                {isLoginView ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">
                    {isLoginView
                      ? "New to our platform?"
                      : "Already have an account?"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="mt-4 w-full border border-gray-600 rounded-lg py-2 px-4 text-gray-300 font-medium hover:bg-gray-700 transition duration-200"
              >
                {isLoginView ? "Create Account" : "Sign In Instead"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gray-800 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} All Rights Reserved
              </p>
            </div>
            <div className="flex flex-col items-center">
              <p className="text-gray-300 font-medium text-sm mb-1">
                Developed by
              </p>
              <p className="text-blue-400 font-bold">MOHAMED FAHHAM</p>
            </div>
            <SocialLinks/>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
