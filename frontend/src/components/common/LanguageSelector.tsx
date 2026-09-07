import { useState, useEffect, useRef } from "react";
import { Globe, Check, Search, ChevronDown } from "lucide-react";
import {
  INDIAN_LANGUAGES,
  getCurrentLanguage,
  changeLanguage,
  type IndianLanguage,
} from "@/lib/languages";

interface LanguageSelectorProps {
  variant?: "header" | "compact" | "floating";
  className?: string;
}

export default function LanguageSelector({
  variant = "header",
  className = "",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCode(getCurrentLanguage());

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLang =
    INDIAN_LANGUAGES.find((l) => l.code === activeCode) || INDIAN_LANGUAGES[0];

  const filteredLanguages = INDIAN_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.states.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLanguage = (lang: IndianLanguage) => {
    setActiveCode(lang.code);
    setIsOpen(false);
    changeLanguage(lang.code);
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left notranslate ${className}`}
      data-notranslate="true"
    >
      {/* Trigger Button */}
      {variant === "floating" ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-emerald-200/80 hover:border-emerald-500 hover:shadow-emerald-500/20 text-slate-800 text-xs font-semibold transition-all"
          title="Select Regional Language"
        >
          <span className="text-base">{activeLang.flagEmoji}</span>
          <span className="font-medium text-slate-700">{activeLang.nativeName}</span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold transition-all shadow-xs"
          aria-label="Choose Language"
        >
          <Globe size={15} className="text-emerald-600" />
          <span className="text-sm">{activeLang.flagEmoji}</span>
          <span className="max-w-[80px] sm:max-w-none truncate font-medium">
            {activeLang.nativeName}
          </span>
          <ChevronDown size={13} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-emerald-200" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                  Select Language / भाषा चुनें
                </span>
              </div>
              <span className="text-[10px] bg-emerald-900/60 px-2 py-0.5 rounded-full text-emerald-200 font-mono">
                22+ Languages
              </span>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language or state (e.g. Punjab, Marathi)..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white text-slate-900 rounded-lg outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-400 shadow-inner"
                autoFocus
              />
            </div>
          </div>

          {/* Language Options List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 p-1">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No language found matching &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = activeCode === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? "bg-emerald-50 text-emerald-900 font-semibold"
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg flex-shrink-0">{lang.flagEmoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-900">
                            {lang.nativeName}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">
                            ({lang.name})
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[210px] sm:max-w-[260px]">
                          📍 {lang.states}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white shadow-xs">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Note */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>Powered by Google Translate &bull; Real-Time</span>
            {activeCode !== "en" && (
              <button
                onClick={() => changeLanguage("en")}
                className="text-emerald-700 font-bold hover:underline"
              >
                Reset to English
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
