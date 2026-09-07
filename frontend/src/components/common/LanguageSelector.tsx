import { useState, useEffect } from "react";
import { Globe, Check, Search, X, ChevronDown, RotateCcw } from "lucide-react";
import {
  INDIAN_LANGUAGES,
  getCurrentLanguage,
  changeLanguage,
  type IndianLanguage,
} from "@/lib/languages";

interface LanguageSelectorProps {
  variant?: "header" | "floating" | "compact";
  className?: string;
}

export default function LanguageSelector({
  variant = "header",
  className = "",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "popular">("all");

  useEffect(() => {
    setActiveCode(getCurrentLanguage());
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const activeLang =
    INDIAN_LANGUAGES.find((l) => l.code === activeCode) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.states.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.shortTag.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeTab === "popular") return l.isPopular;
    return true;
  });

  const handleSelect = (lang: IndianLanguage) => {
    setActiveCode(lang.code);
    setIsOpen(false);
    changeLanguage(lang.code);
  };

  const handleReset = () => {
    setActiveCode("en");
    setIsOpen(false);
    changeLanguage("en");
  };

  return (
    <div className={`notranslate ${className}`} translate="no">
      {/* ── Trigger Button ── */}
      {variant === "floating" ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md hover:shadow-lg border border-emerald-300/80 hover:border-emerald-500 text-slate-800 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          title="Select Regional Language"
        >
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${activeLang.badgeBg}`}
          >
            {activeLang.shortTag}
          </span>
          <span className="font-semibold text-slate-800">
            {activeLang.nativeName}
          </span>
          <ChevronDown size={14} className="text-slate-400" />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          title="Change Portal Language"
        >
          <Globe size={14} className="text-emerald-600 flex-shrink-0" />
          <span
            className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${activeLang.badgeBg}`}
          >
            {activeLang.shortTag}
          </span>
          <span className="max-w-[75px] sm:max-w-none truncate font-medium">
            {activeLang.nativeName}
          </span>
          <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />
        </button>
      )}

      {/* ── Center Dialog Modal (Never Clips, Works on Any Screen) ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex-shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white backdrop-blur-xs">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      Choose Language / भाषा चुनें
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-0.5">
                      Available across all 28 Indian States &amp; 8 UTs
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Close language selector"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Box */}
              <div className="mt-3.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by language, script or state (e.g. Punjab, Marathi, বাংলা)..."
                  className="w-full pl-9 pr-9 py-2.5 bg-white text-slate-900 rounded-xl text-sm outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 shadow-xs"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Quick Tabs */}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-emerald-600/50">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60"
                  }`}
                >
                  All Languages ({INDIAN_LANGUAGES.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("popular")}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "popular"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60"
                  }`}
                >
                  Most Popular
                </button>
              </div>
            </div>

            {/* Language Cards Grid */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 divide-y divide-slate-100">
              {filteredLanguages.length === 0 ? (
                <div className="py-12 text-center">
                  <Globe size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">
                    No matching language found
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try searching for &quot;Punjab&quot;, &quot;Hindi&quot;, or &quot;Marathi&quot;
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredLanguages.map((lang) => {
                    const isSelected = activeCode === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelect(lang)}
                        className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-emerald-50/90 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
                            : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Short badge */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-xs ${lang.badgeBg} ${lang.textColor}`}
                          >
                            {lang.shortTag}
                          </div>

                          {/* Language names & state */}
                          <div className="min-w-0">
                            <div className="flex items-baseline gap-1.5 truncate">
                              <span className="text-sm font-bold text-slate-900">
                                {lang.nativeName}
                              </span>
                              <span className="text-xs text-slate-500 font-normal">
                                ({lang.name})
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5 max-w-[170px] sm:max-w-[180px]">
                              📍 {lang.states}
                            </p>
                          </div>
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs ml-2">
                            <Check size={14} strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 sm:px-5 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="font-medium text-slate-600">
                  Google Translate Engine &bull; Real-time
                </span>
              </div>

              {activeCode !== "en" && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-emerald-700 font-bold hover:text-emerald-800 hover:underline cursor-pointer"
                >
                  <RotateCcw size={13} />
                  Reset to English
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
