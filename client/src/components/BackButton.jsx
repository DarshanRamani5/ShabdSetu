import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BUTTON_BASE_STYLES =
  "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 hover:-translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2";
const CONTAINER_BASE_STYLES =
  "back-button-container flex w-full justify-start mb-6";

const BackButton = ({ className = "", containerClassName = "" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className={`${CONTAINER_BASE_STYLES} ${containerClassName}`.trim()}
      data-testid="back-button-container"
    >
      <button
        onClick={handleBack}
        className={`${BUTTON_BASE_STYLES} ${className}`.trim()}
        aria-label="Go back"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>
    </div>
  );
};

export default BackButton;
