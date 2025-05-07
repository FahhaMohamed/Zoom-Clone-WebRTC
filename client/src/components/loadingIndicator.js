import { FourSquare } from "react-loading-indicators";
import React from "react";
import SocialLinks from "./socialLinks";

export default function LoadingWithFooter() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col justify-center items-center bg-gray-900">
        <FourSquare color="#D1D5DB" />
        {/* <strong style={{color:"#D1D5DB"}}>Loading...</strong> */}
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
