import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Discover = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-purple-700 mb-4">
          Discover Page
        </h1>
        <p className="text-gray-600 mb-6">
          This page will feature an infinite scrolling list of interesting
          family-friendly locations.
        </p>
        <p className="text-gray-500 mb-8 text-sm">Coming soon...</p>
        <Button
          onClick={() => navigate(-1)}
          className="bg-gradient-to-r from-pink-500 to-purple-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    </div>
  );
};

export default Discover;
