import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Globe,
  LayoutGrid,
  Star,
  MapPin,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
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

type FilterTab = "all" | "popular" | "north" | "south" | "east" | "west";

export default function LanguageSelector({
  variant = "header",
  className = "",
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCode, setActiveCode] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setActiveCode(getCurrentLanguage());
  }, []);

  // Keyboard shortcut (Ctrl + K) & Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Prevent background scroll when modal is open
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
    if (activeTab === "north") return l.region === "north";
    if (activeTab === "south") return l.region === "south";
    if (activeTab === "east") return l.region === "east";
    if (activeTab === "west") return l.region === "west";
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
          className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-md hover:shadow-xl border border-emerald-300 hover:border-emerald-500 text-slate-800 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          title="Select Regional Language (Ctrl+K)"
        >
          <span
            className={`w-6 h-6 rounded-full ${activeLang.avatarColor} flex items-center justify-center text-[10px] font-bold text-white shadow-xs`}
          >
            {activeLang.shortTag}
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider leading-none">
              Language
            </span>
            <span className="font-bold text-slate-900 text-xs mt-0.5">
              {activeLang.nativeName}
            </span>
          </div>
          <ChevronDown
            size={14}
            className="text-slate-400 group-hover:text-emerald-600 transition-colors ml-0.5"
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-xs cursor-pointer"
          title="Change Portal Language (Ctrl+K)"
        >
          <Globe size={15} className="text-emerald-600 flex-shrink-0" />
          <span
            className={`w-5 h-5 rounded-full ${activeLang.avatarColor} flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 shadow-xs`}
          >
            {activeLang.shortTag}
          </span>
          <span className="max-w-[85px] sm:max-w-none truncate font-semibold text-slate-800">
            {activeLang.nativeName}
          </span>
          <ChevronDown size={13} className="text-slate-400 flex-shrink-0" />
        </button>
      )}

      {/* ── Exact User Specified CSS Modal via React Portal ── */}
      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="language-modal-overlay notranslate"
            translate="no"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="language-modal"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="modal-header">
                <div className="modal-header-ribbon">
                  Apni Bhasha, Apna KisanQueue
                </div>

                <div className="globe-wrapper">
                  <div className="globe">
                    <Globe size={34} />
                  </div>
                </div>

                <div className="header-content">
                  <h1>Choose Language</h1>
                  <p>Available across all 28 Indian States &amp; 8 UTs</p>
                  <div className="header-tagline">
                    Same platform. Stronger farmers. In every language.
                  </div>
                </div>

                <button
                  type="button"
                  className="close-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Body */}
              <div className="modal-body">
                {/* Search */}
                <div className="search-wrapper">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    className="search-box"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by language, script or state (e.g. Punjabi, Marathi, বাংলা)..."
                    autoFocus
                  />
                  <span className="shortcut">Ctrl + K</span>
                </div>

                {/* Filters */}
                <div className="filters">
                  <button
                    type="button"
                    className={`filter ${activeTab === "all" ? "active" : ""}`}
                    onClick={() => setActiveTab("all")}
                  >
                    <LayoutGrid size={15} /> All Languages ({INDIAN_LANGUAGES.length})
                  </button>

                  <button
                    type="button"
                    className={`filter ${activeTab === "popular" ? "active" : ""}`}
                    onClick={() => setActiveTab("popular")}
                  >
                    <Star size={15} /> Most Popular
                  </button>

                  <button
                    type="button"
                    className={`filter ${activeTab === "north" ? "active" : ""}`}
                    onClick={() => setActiveTab("north")}
                  >
                    <MapPin size={15} /> North India
                  </button>

                  <button
                    type="button"
                    className={`filter ${activeTab === "south" ? "active" : ""}`}
                    onClick={() => setActiveTab("south")}
                  >
                    <MapPin size={15} /> South India
                  </button>

                  <button
                    type="button"
                    className={`filter ${activeTab === "east" ? "active" : ""}`}
                    onClick={() => setActiveTab("east")}
                  >
                    <MapPin size={15} /> East India
                  </button>

                  <button
                    type="button"
                    className={`filter ${activeTab === "west" ? "active" : ""}`}
                    onClick={() => setActiveTab("west")}
                  >
                    <MapPin size={15} /> West India
                  </button>

                  <button type="button" className="filter-arrow">
                    &rsaquo;
                  </button>
                </div>

                {/* Language Grid */}
                <div className="language-grid">
                  {filteredLanguages.map((lang) => {
                    const isSelected = activeCode === lang.code;
                    return (
                      <div
                        key={lang.code}
                        className={`language-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleSelect(lang)}
                      >
                        {isSelected && <div className="check">✓</div>}

                        <div className="language-main">
                          <div className={`language-icon ${lang.iconClass}`}>
                            {lang.shortTag}
                          </div>
                          <div className="language-info">
                            <div className="language-native">{lang.nativeName}</div>
                            <div className="language-english">({lang.name})</div>
                          </div>
                        </div>

                        <div className="language-location">
                          <span className="location-icon">📍</span>
                          <span>{lang.states}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Quote Card */}
                  {activeTab === "all" && searchQuery === "" && (
                    <div className="quote-card">
                      <div className="quote-left">
                        <span style={{ fontSize: "28px" }}>🍃</span>
                        <div className="quote-text">
                          &ldquo;Every language grows a stronger tomorrow.&rdquo;
                        </div>
                      </div>

                      <div className="quote-right">
                        <img
                          src="/images/farmer_hand_seedling.jpg"
                          alt="Seedling"
                          className="quote-img"
                        />
                        <div className="quote-brand">
                          <div className="quote-brand-name">KisanQueue</div>
                          <div className="quote-brand-sub">Farmers First. Always.</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <div className="footer-status">
                  <span className="footer-dot" />
                  <span>Google Translate Engine &bull; Real-time Instant Translation</span>
                </div>
                {activeCode !== "en" && (
                  <button type="button" className="reset-btn" onClick={handleReset}>
                    <RotateCcw size={13} /> Reset to English
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
