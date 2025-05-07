import React from "react";
import "../styles/SpashScreen.module.css";

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 z-50">
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Logo with animation */}
        <div className="relative">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
            </svg>
          </div>
          <div className="absolute -inset-2 border-4 border-blue-400 rounded-full animate-spin-slow opacity-70"></div>
        </div>

        {/* App name */}
        <h1 className="text-4xl font-bold text-white animate-fade-in">
          VideoConnect
        </h1>

        {/* Loading dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
        </div>

        {/* Developer credit */}
        <p className="text-gray-400 text-sm mt-8 animate-fade-in-delayed">
          by MOHAMED FAHHAM
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;