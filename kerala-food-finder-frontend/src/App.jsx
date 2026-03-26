import { useState, useEffect, useRef, useCallback } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

const CITIES = ["All Kerala","Kochi","Kozhikode","Kannur","Alappuzha","Thrissur","Thiruvananthapuram","Palakkad"];
const CITY_EMOJI = { Kochi:"⚓",Kozhikode:"🌊",Kannur:"🏖️",Alappuzha:"🚣",Thrissur:"🎭",Thiruvananthapuram:"🏛️",Palakkad:"🏰" };
const CITY_TAG = { Kochi:"Queen of Arabian Sea",Kozhikode:"City of Biryani",Kannur:"Land of Thalassery",Alappuzha:"Venice of the East",Thrissur:"Cultural Capital",Thiruvananthapuram:"Green City",Palakkad:"Gateway of Kerala" };

const GOLD = "#D97706";
const GOLD_DARK = "#92400E";
const GOLD_MID = "#B45309";
const GREEN = "#059669";


const LIGHT_T = {
  bg:"#FFFBF0", surface:"#FFFFFF", surface2:"#FEF9EC",
  border:"#F0E4C0", text:"#1C1408", text2:"#7A5C20",
  text3:"#A88040", accent:GOLD_MID, accent2:GOLD_DARK,
  accentBg:"#FEF3C7", accentBorder:"#FDE68A",
  nav:"rgba(255,251,240,0.96)", shadow:"0 4px 20px rgba(180,83,9,0.1)",
  green:GREEN, greenBg:"#F0FDF4", greenBorder:"#BBF7D0",
};

// ── API Helper ────────────────────────────────────────────────────────────────
const api = {
  get: async (path) => {
    try {
      const res = await fetch(`${API_BASE}${path}`);
      const data = await res.json();
      return data.data || data;
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  },
  post: async (path, body) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      return await res.json();
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  },
  delete: async (path) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "DELETE" });
      return await res.json();
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  },
  put: async (path) => {
    try {
      const res = await fetch(`${API_BASE}${path}`, { method: "PUT" });
      return await res.json();
    } catch (e) {
      console.error("API Error:", e);
      return null;
    }
  },
};

// ── Tag + Color Logic (Frontend calculated) ────────────────────────────────
const getDishTag = (dish) => {
  if (dish.saves > 5000) return "🏆 Legendary";
  if (dish.saves > 2000) return "🔥 Trending";
  if (dish.saves > 500) return "⭐ Popular";
  return "🆕 New";
};

const getCategoryColor = (category) => {
  const colors = {
    "Rice": "#D97706", "Biryani": "#D97706",
    "Seafood": "#059669", "Fish": "#059669",
    "Meat": "#DC2626", "Beef": "#DC2626", "Chicken": "#DC2626",
    "Breakfast": "#F59E0B", "Snacks": "#7C3AED",
    "Bread": "#B45309", "Meals": "#10B981",
    "Dessert": "#EC4899",
  };
  return colors[category] || "#D97706";
};

const uid = () => "u" + Date.now() + Math.random().toString(36).slice(2, 6);

const T = LIGHT_T;

const Stars = ({ value, onChange, size = 22 }) => (
  <div style={{ display: "flex", gap: 3 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span key={n} onClick={() => onChange && onChange(n)}
        style={{ fontSize: size, cursor: onChange ? "pointer" : "default", opacity: n <= value ? 1 : .15, transition: "opacity .1s" }}>
        ⭐
      </span>
    ))}
  </div>
);

const Tag = ({ text, color }) => (
  <span style={{ background: `${color}18`, color, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 99, border: `1px solid ${color}28` }}>
    {text}
  </span>
);

const RatingBar = ({ label, value, color = GOLD }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
    <span style={{ color: T.text2, fontSize: 12, width: 90, flexShrink: 0, fontWeight: 500 }}>{label}</span>
    <div style={{ flex: 1, background: T.surface2, borderRadius: 99, height: 5, overflow: "hidden" }}>
      <div style={{ width: `${(value / 5) * 100}%`, height: "100%", background: color, borderRadius: 99, transition: "width .5s" }} />
    </div>
    <span style={{ color: T.text, fontSize: 12, fontWeight: 700, width: 26, textAlign: "right" }}>{value > 0 ? value.toFixed(1) : "-"}</span>
  </div>
);

const PrimaryBtn = ({ children, onClick, full = false, variant = "gold", disabled = false }) => {
  const variants = {
    gold: { background: `linear-gradient(135deg,${GOLD},${GOLD_MID})`, color: "#1C1408", border: "none", boxShadow: `0 4px 16px ${GOLD}44` },
    outline: { background: "transparent", color: T.accent, border: `1.5px solid ${T.accentBorder}`, boxShadow: "none" },
    ghost: { background: T.surface2, color: T.text2, border: `1.5px solid ${T.border}`, boxShadow: "none" },
    green: { background: `linear-gradient(135deg,${GREEN},#047857)`, color: "#fff", border: "none", boxShadow: `0 4px 16px ${GREEN}44` },
  };
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...variants[variant], borderRadius: 13, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .6 : 1, width: full ? "100%" : "auto", fontFamily: "'Plus Jakarta Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s" }}>
      {children}
    </button>
  );
};

const Field = ({ label, value, onChange, placeholder, multi = false, type = "text" }) => (
  <div style={{ marginBottom: 13 }}>
    <p style={{ color: T.text2, fontSize: 12, fontWeight: 600, margin: "0 0 6px" }}>{label}</p>
    {multi
      ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
        style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "11px 13px", color: T.text, fontSize: 14, width: "100%", outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", resize: "none" }} />
      : <input value={value} onChange={onChange} placeholder={placeholder} type={type}
        style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "11px 13px", color: T.text, fontSize: 14, width: "100%", outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
    }
  </div>
);

const DishCard = ({ dish, onOpen, delay = 0, isSaved, onToggleSave }) => {
  const restaurant = dish.Restaurant || dish.restaurant;
  const color = getCategoryColor(dish.category || dish.Category);
  const tag = getDishTag(dish);
  return (
    <div onClick={onOpen}
      style={{ background: T.surface, borderRadius: 18, marginBottom: 11, border: `1px solid ${T.border}`, overflow: "hidden", cursor: "pointer", animation: `slideUp .32s ease forwards`, animationDelay: `${delay}s`, opacity: 0, boxShadow: T.shadow }}>
      <div style={{ height: 2.5, background: `linear-gradient(90deg,${color},transparent)` }} />
      <div style={{ padding: "13px 15px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
              <Tag text={tag} color={color} />
              {restaurant?.Verified && <Tag text="✓" color={GREEN} />}
            </div>
            <h3 style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: "0 0 3px", letterSpacing: -.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Fraunces',serif" }}>
              {dish.Name || dish.name}
            </h3>
            <p style={{ color: T.text2, fontSize: 12, margin: "0 0 2px", fontWeight: 500 }}>{restaurant?.Name || restaurant?.name}</p>
            <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>📍 {restaurant?.Area || restaurant?.area} · {restaurant?.City || restaurant?.city}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); onToggleSave(dish); }}
            style={{ width: 38, height: 38, background: isSaved ? T.accentBg : T.surface2, border: `1.5px solid ${isSaved ? T.accentBorder : T.border}`, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, flexShrink: 0, transition: "all .15s" }}>
            {isSaved ? "🔖" : "＋"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 11, paddingTop: 11, borderTop: `1px solid ${T.border}` }}>
          <span style={{ color: dish.saves > 0 ? "#F59E0B" : T.text3, fontSize: 12, fontWeight: 700 }}>
            {dish.saves > 0 ? `★ ${(4 + Math.random()).toFixed(1)}` : "★ New"}
          </span>
          <span style={{ color: T.text3, fontSize: 11 }}>🔖 {(dish.Saves || dish.saves || 0).toLocaleString()}</span>
          <span style={{ color: T.text3, fontSize: 11 }}>📹 Reel</span>
        </div>
      </div>
    </div>
  );
};

const Spinner = () => (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <div style={{ fontSize: 32, animation: "spin 1s linear infinite", display: "inline-block", marginBottom: 10 }}>🌀</div>
    <p style={{ color: T.text2, fontSize: 14 }}>Loading...</p>
  </div>
);

export default function App() {

  // ── State ──
  const [tab, setTab] = useState("home");
  const [screen, setScreen] = useState("onboard");
  const [dishes, setDishes] = useState([]);
  const [trending, setTrending] = useState([]);
  const [savedIds, setSavedIds] = useState(() => {
    const saved = localStorage.getItem("kff_saved_ids");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("kff_saved_ids", JSON.stringify(savedIds));
  }, [savedIds]);

  const [city, setCity] = useState("All Kerala");
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selDish, setSelDish] = useState(null);
  const [selRest, setSelRest] = useState(null);
  const [restDishes, setRestDishes] = useState([]);
  const [restReels, setRestReels] = useState([]);
  const [dishReviews, setDishReviews] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addReel, setAddReel] = useState(false);
  const [addManual, setAddManual] = useState(false);
  const [writeReview, setWriteReview] = useState(null);
  const [helpfulIds, setHelpfulIds] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [reelLink, setReelLink] = useState("");
  const [selAiDishes, setSelAiDishes] = useState([]);
  const [manForm, setManForm] = useState({ restaurant: "", city: "", area: "", dish: "", category: "Rice", notes: "", reelLink: "" });
  const [revForm, setRevForm] = useState({ rating: 0, taste: 0, value: 0, ambience: 0, comment: "", visited: true, user_name: "You" });
  const toastRef = useRef(null);



  // ── Load Dishes ──
  useEffect(() => {
    if (screen !== "main") return;
    loadDishes();
    loadTrending();
  }, [screen, city]);

  const loadDishes = async () => {
    setLoading(true);
    let path = "/dishes";
    if (city !== "All Kerala") path += `?city=${city}`;
    const data = await api.get(path);
    if (data) setDishes(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const loadTrending = async () => {
    let path = "/trending";
    if (city !== "All Kerala") path += `?city=${city}`;
    const data = await api.get(path);
    if (data) setTrending(Array.isArray(data) ? data : []);
  };

  // ── Search ──
  useEffect(() => {
    if (!search) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const data = await api.get(`/search?q=${encodeURIComponent(search)}`);
      if (data) setSearchResults(Array.isArray(data) ? data : []);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Load Dish Details ──
  const openDish = async (dish) => {
    setSelDish(dish);
    setScreen("dish");
    const reviews = await api.get(`/dishes/${dish.ID || dish.id}/reviews`);
    setDishReviews(Array.isArray(reviews) ? reviews : []);
  };

  // ── Load Restaurant ──
  const openRestaurant = async (restaurant) => {
    setSelRest(restaurant);
    setScreen("restaurant");
    const [dishes, reels] = await Promise.all([
      api.get(`/restaurants/${restaurant.ID || restaurant.id}/dishes`),
api.get(`/restaurants/${restaurant.ID || restaurant.id}/reels`),
    ]);
    setRestDishes(Array.isArray(dishes) ? dishes : []);
    setRestReels(Array.isArray(reels) ? reels : []);
  };

  // ── Toast ──
  const showToast = (msg, ok = true) => {
    clearTimeout(toastRef.current);
    setToast({ msg, ok });
    toastRef.current = setTimeout(() => setToast(null), 2600);
  };

  // ── Save / Unsave ──
  const toggleSave = async (dish) => {
    const id = dish.ID || dish.id;
    const isSaved = savedIds.includes(id);
    if (isSaved) {
      setSavedIds(p => p.filter(x => x !== id));
      await api.delete(`/dishes/${id}/save`);
      showToast("Removed from saved");
    } else {
      setSavedIds(p => [...p, id]);
      await api.post(`/dishes/${id}/save`, {});
      showToast("Saved to Kerala map! 🔖");
    }
  };

  // ── AI Extract ──
  const extractFromReel = async () => {
    if (!reelLink.trim()) { showToast("Paste a reel link!", false); return; }
    setAiLoading(true);
    setAiResult(null);
    const result = await api.post("/ai/extract", { reel_link: reelLink });
    setAiLoading(false);
    if (result?.data) {
      setAiResult(result.data);
      setSelAiDishes(result.data.dishes || []);
    } else {
      showToast("Could not extract from reel. Try another!", false);
    }
  };

  // ── Save AI Dishes ──
  const saveFromReel = async () => {
    if (!aiResult || !selAiDishes.length) return;
    const result = await api.post("/ai/save", {
      restaurant_name: aiResult.restaurant,
      city: aiResult.city,
      area: aiResult.area,
      dishes: selAiDishes,
      reel_link: reelLink,
    });
    if (result?.dishes) {
      const newIds = result.dishes.map(d => d.ID || d.id);
      setSavedIds(p => [...p, ...newIds]);
      await loadDishes();
    }
    setAddReel(false);
    setAiResult(null);
    setReelLink("");
    setSelAiDishes([]);
    showToast(`${selAiDishes.length} dishes saved! 🌴`);
  };

  // ── Save Manual ──
  const saveManual = async () => {
    if (!manForm.restaurant || !manForm.dish || !manForm.city) {
      showToast("Fill required fields ⚠️", false);
      return;
    }
    const result = await api.post("/dishes", {
      restaurant_name: manForm.restaurant,
      city: manForm.city,
      area: manForm.area,
      name: manForm.dish,
      category: manForm.category,
      notes: manForm.notes,
      reel_link: manForm.reelLink,
    });
    if (result?.data) {
      setSavedIds(p => [...p, result.data.ID || result.data.id]);
      await loadDishes();
    }
    setManForm({ restaurant: "", city: "", area: "", dish: "", category: "Rice", notes: "", reelLink: "" });
    setAddManual(false);
    showToast("Spot added! 🌴");
  };

  // ── Submit Review ──
  const submitReview = async (dishId) => {
    if (!revForm.rating) { showToast("Select a rating!", false); return; }
    if (!revForm.comment.trim()) { showToast("Write a review!", false); return; }
    const result = await api.post(`/dishes/${dishId}/reviews`, {
      user_name: revForm.user_name || "Anonymous",
      rating: revForm.rating,
      taste: revForm.taste || revForm.rating,
      value: revForm.value || revForm.rating,
      ambience: revForm.ambience || revForm.rating,
      comment: revForm.comment,
      visited: revForm.visited,
    });
    if (result) {
      const reviews = await api.get(`/dishes/${dishId}/reviews`);
      setDishReviews(Array.isArray(reviews) ? reviews : []);
    }
    setRevForm({ rating: 0, taste: 0, value: 0, ambience: 0, comment: "", visited: true, user_name: "You" });
    setWriteReview(null);
    showToast("Review posted! 🌟");
  };

  // ── Mark Helpful ──
  const markHelpful = async (reviewId) => {
    if (helpfulIds.includes(reviewId)) return;
    setHelpfulIds(p => [...p, reviewId]);
    await api.put(`/reviews/${reviewId}/helpful`);
    const reviews = await api.get(`/dishes/${selDish.id}/reviews`);
    setDishReviews(Array.isArray(reviews) ? reviews : []);
    showToast("👍 Helpful!");
  };

  const savedDishes = dishes.filter(d => savedIds.includes(d.id || d.ID));
  const savedCities = [...new Set(savedDishes.map(d => d.Restaurant?.City || d.restaurant?.city).filter(Boolean))];

  const avgRating = (reviews) => {
    if (!reviews?.length) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  };

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#E8DFC0", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", padding: 16, transition: "background .3s" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,800;1,9..144,700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes scaleIn{from{transform:scale(.93);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes toast{0%{opacity:0;transform:translateX(-50%) translateY(10px)}12%{opacity:1;transform:translateX(-50%) translateY(0)}88%{opacity:1}100%{opacity:0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes glow{0%,100%{box-shadow:0 0 0 0 ${GOLD}44}50%{box-shadow:0 0 0 8px ${GOLD}00}}
        button:hover{opacity:.87!important}button:active{transform:scale(.95)!important}
        input:focus,textarea:focus{border-color:${GOLD}!important;outline:none}
        input::placeholder,textarea::placeholder{color:"#C0A060"}
        ::-webkit-scrollbar{width:0}*{box-sizing:border-box}textarea{resize:none}
      `}</style>

      {/* Phone Shell */}
      <div style={{ width: 390, height: 820, background: T.bg, borderRadius: 48, overflow: "hidden", boxShadow: `0 40px 100px rgba(180,83,9,.2),0 0 0 1px ${GOLD}30`, position: "relative", display: "flex", flexDirection: "column", transition: "all .3s" }}>

        {/* Status Bar */}
        <div style={{ background: T.bg, padding: "14px 26px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>9:41</span>
          <div style={{ width: 104, height: 24, background: "#1C1408", borderRadius: 20, border: `1px solid ${T.border}` }} />
          <div style={{ width: 24 }} /> {/* Empty space balancing the header */}
        </div>

        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", position: "relative" }}>

          {/* ══ ONBOARDING ══ */}
          {screen === "onboard" && (
            <div style={{ position: "absolute", inset: 0, background: T.bg, zIndex: 999, display: "flex", flexDirection: "column", padding: "32px 26px 28px", animation: "fadeIn .4s ease" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{ width: 60, height: 60, background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20, boxShadow: `0 8px 28px ${GOLD}55`, animation: "glow 2s ease infinite" }}>🌴</div>
                <p style={{ color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 8px" }}>Kerala Food Finder</p>
                <h1 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 38, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.05, letterSpacing: -1 }}>Save dishes.<br />Find them<br /><em style={{ color: T.accent }}>when you travel.</em></h1>
                <p style={{ color: T.text2, fontSize: 15, margin: "0 0 36px", lineHeight: 1.7 }}>Paste any food reel — AI saves the dishes.<br />App reminds you when you're nearby. 🔔</p>
                {[
                  { icon: "🤖", t: "AI Reel Extract", d: "Paste a reel link — AI extracts all dishes automatically" },
                  { icon: "🍛", t: "Dish-First Search", d: "'Biryani in Kozhikode' — not restaurant names" },
                  { icon: "🔔", t: "Travel Notifications", d: "Get notified when saved dishes are within 10km" },
                ].map((f, i) => (
                  <div key={i} style={{ display: "flex", gap: 13, marginBottom: 16, animation: `slideUp .4s ease forwards`, animationDelay: `${.1 + i * .08}s`, opacity: 0 }}>
                    <div style={{ width: 40, height: 40, background: T.accentBg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, border: `1px solid ${T.accentBorder}` }}>{f.icon}</div>
                    <div style={{ paddingTop: 2 }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>{f.t}</p>
                      <p style={{ color: T.text2, fontSize: 12, margin: 0, lineHeight: 1.5 }}>{f.d}</p>
                    </div>
                  </div>
                ))}
              </div>
              <PrimaryBtn onClick={() => setScreen("main")} full>Start Exploring Kerala 🌴</PrimaryBtn>
              <p style={{ color: T.text3, fontSize: 11, textAlign: "center", marginTop: 10 }}>7 cities · Kerala only · Free forever</p>
            </div>
          )}

          {/* ══ HOME ══ */}
          {screen === "main" && tab === "home" && (
            <div style={{ animation: "fadeIn .25s ease" }}>
              <div style={{ padding: "14px 20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      <div style={{ width: 22, height: 22, background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🌴</div>
                      <p style={{ color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Kerala Food Finder</p>
                    </div>
                    <h1 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 24, fontWeight: 800, margin: 0, lineHeight: 1.15, letterSpacing: -.4 }}>Discover Kerala's<br />best dishes</h1>
                  </div>
                  <button onClick={() => setAddReel(true)} style={{ width: 42, height: 42, background: `linear-gradient(135deg,${GOLD},${GOLD_MID})`, border: "none", borderRadius: 13, fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 16px ${GOLD}55`, color: "#1C1408", fontWeight: 700 }}>＋</button>
                </div>

                {/* Search */}
                <div style={{ background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, marginBottom: 13, boxShadow: T.shadow }}>
                  <span style={{ fontSize: 15, color: T.text3 }}>🔍</span>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dish, city, restaurant..."
                    style={{ background: "none", border: "none", color: T.text, fontSize: 14, flex: 1, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 500 }} />
                  {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: T.text3, fontSize: 18, cursor: "pointer", padding: 0 }}>×</button>}
                </div>

                {/* City Pills */}
                <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
                  {CITIES.map(c => (
                    <button key={c} onClick={() => setCity(c)}
                      style={{ background: city === c ? `linear-gradient(135deg,${GOLD},${GOLD_MID})` : T.surface, color: city === c ? "#1C1408" : T.text2, border: city === c ? "none" : `1.5px solid ${T.border}`, borderRadius: 99, padding: "7px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: city === c ? `0 3px 12px ${GOLD}44` : "none", transition: "all .15s" }}>
                      {c === "All Kerala" ? "🌴 All Kerala" : `${CITY_EMOJI[c]} ${c}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              {search && (
                <div style={{ padding: "0 20px 110px" }}>
                  <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>{searchResults.length} results</p>
                  {searchResults.length === 0 && !loading && (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>🌴</div>
                      <p style={{ color: T.text2, fontSize: 14, marginBottom: 16 }}>No spots found.<br />Be the first to add!</p>
                      <PrimaryBtn onClick={() => setAddManual(true)}>Add Spot ＋</PrimaryBtn>
                    </div>
                  )}
                  {searchResults.map((d, i) => <DishCard key={d.id || d.ID} dish={d} onOpen={() => openDish(d)} delay={i * .05} isSaved={savedIds.includes(d.id || d.ID)} onToggleSave={toggleSave} />)}
                </div>
              )}

              {/* Normal Home */}
              {!search && (
                <div style={{ padding: "0 20px 110px" }}>
                  {/* Hero Banner */}
                  <div style={{ background: `linear-gradient(135deg,${T.accentBg},${T.accentBg}cc)`, borderRadius: 20, padding: "18px 20px", marginBottom: 20, border: `1px solid ${T.accentBorder}`, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", right: -10, top: -10, fontSize: 72, opacity: .07, transform: "rotate(15deg)" }}>🍛</div>
                    <p style={{ color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", margin: "0 0 6px" }}>🔥 Trending Now</p>
                    <p style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 19, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.25 }}>Discover the best<br />Kerala food spots!</p>
                    <div style={{ display: "flex", gap: 7 }}>
                      {["Kozhikode", "Kochi", "Kannur"].map(c => (
                        <button key={c} onClick={() => setCity(c)}
                          style={{ background: `${GOLD}18`, border: `1px solid ${GOLD}30`, borderRadius: 10, padding: "6px 11px", color: T.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                          {CITY_EMOJI[c]} {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending */}
                  {trending.length > 0 && (
                    <>
                      <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 11 }}>🔥 Trending Dishes</p>
                      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
                        {trending.slice(0, 6).map((d, i) => {
                          const restaurant = d.Restaurant || d.restaurant;
                          const color = getCategoryColor(d.category || d.Category);
                          return (
                            <div key={d.id || d.ID} onClick={() => openDish(d)}
                              style={{ background: T.surface, borderRadius: 16, padding: "13px 14px", border: `1px solid ${T.border}`, flexShrink: 0, minWidth: 132, cursor: "pointer", boxShadow: T.shadow }}>
                              <div style={{ fontSize: 24, marginBottom: 7 }}>🍽️</div>
                              <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px", letterSpacing: -.2, fontFamily: "'Fraunces',serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.Name || d.name}</p>
                              <p style={{ color: T.text2, fontSize: 11, margin: "0 0 7px" }}>{CITY_EMOJI[restaurant?.City || restaurant?.city] || "📍"} {restaurant?.City || restaurant?.city}</p>
                              <p style={{ color, fontSize: 11, fontWeight: 700, margin: 0, background: `${color}12`, padding: "2px 8px", borderRadius: 99, display: "inline-block", border: `1px solid ${color}25` }}>🔖 {(d.Saves || d.saves || 0).toLocaleString()}</p>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* City Cards */}
                  {city === "All Kerala" && (
                    <>
                      <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 11 }}>🌴 Explore by City</p>
                      <div style={{ display: "flex", gap: 9, overflowX: "auto", paddingBottom: 8, marginBottom: 20 }}>
                        {CITIES.slice(1).map(c => (
                          <div key={c} onClick={() => setCity(c)}
                            style={{ background: T.surface, borderRadius: 16, padding: "13px", border: `1px solid ${T.border}`, flexShrink: 0, minWidth: 106, textAlign: "center", cursor: "pointer", boxShadow: T.shadow }}>
                            <div style={{ fontSize: 22, marginBottom: 5 }}>{CITY_EMOJI[c]}</div>
                            <p style={{ color: T.text, fontSize: 12, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Fraunces',serif" }}>{c}</p>
                            <p style={{ color: T.text3, fontSize: 9, margin: "0 0 5px", lineHeight: 1.3 }}>{CITY_TAG[c]}</p>
                            <p style={{ color: T.accent, fontSize: 11, fontWeight: 700, margin: 0 }}>
                              {dishes.filter(d => (d.Restaurant?.City || d.restaurant?.city) === c).length} dishes
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Dishes */}
                  <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 11 }}>
                    {city === "All Kerala" ? "⭐ All Dishes" : `${CITY_EMOJI[city]} Best in ${city}`}
                  </p>
                  {loading ? <Spinner /> : dishes.map((d, i) => (
                    <DishCard key={d.id || d.ID} dish={d} onOpen={() => openDish(d)} delay={i * .04} isSaved={savedIds.includes(d.id || d.ID)} onToggleSave={toggleSave} />
                  ))}
                  {!loading && dishes.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 44, marginBottom: 12 }}>🌴</div>
                      <p style={{ color: T.text2, fontSize: 14 }}>No dishes yet.<br />Be the first to add!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ TRENDING TAB ══ */}
          {screen === "main" && tab === "trending" && (
            <div style={{ padding: "20px 20px 110px", animation: "fadeIn .25s ease" }}>
              <p style={{ color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>Community</p>
              <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 28, fontWeight: 800, margin: "0 0 20px", letterSpacing: -.5 }}>Trending</h2>
              <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 11px" }}>Most Saved Dishes</p>
              {trending.length === 0 ? <Spinner /> : trending.map((d, i) => {
                const restaurant = d.Restaurant || d.restaurant;
                return (
                  <div key={d.id || d.ID} onClick={() => openDish(d)}
                    style={{ background: T.surface, borderRadius: 16, padding: "13px 15px", marginBottom: 9, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 13, cursor: "pointer", animation: `slideUp .32s ease forwards`, animationDelay: `${i * .06}s`, opacity: 0, boxShadow: T.shadow }}>
                    <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#1C1408", flexShrink: 0 }}>#{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Fraunces',serif" }}>{d.Name || d.name}</p>
                      <p style={{ color: T.text2, fontSize: 12, margin: 0 }}>{restaurant?.Name || restaurant?.name} · {restaurant?.City || restaurant?.city}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ color: T.accent, fontSize: 16, fontWeight: 800, margin: "0 0 1px", fontFamily: "'Fraunces',serif" }}>{(d.Saves || d.saves || 0).toLocaleString()}</p>
                      <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>saves</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ SAVED ══ */}
          {screen === "main" && tab === "saved" && (
            <div style={{ padding: "20px 20px 110px", animation: "fadeIn .25s ease" }}>
              <p style={{ color: T.green, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>My Collection</p>
              <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 28, fontWeight: 800, margin: "0 0 18px", letterSpacing: -.5 }}>Saved Spots</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11, marginBottom: 20 }}>
                {[{ icon: "🔖", val: savedDishes.length, label: "Dishes Saved", c: T.accent }, { icon: "🌴", val: savedCities.length, label: "Cities", c: T.green }].map(s => (
                  <div key={s.label} style={{ background: T.surface, borderRadius: 16, padding: 15, border: `1px solid ${T.border}`, textAlign: "center", boxShadow: T.shadow }}>
                    <div style={{ fontSize: 20, marginBottom: 5 }}>{s.icon}</div>
                    <p style={{ fontFamily: "'Fraunces',serif", color: s.c, fontSize: 28, fontWeight: 800, margin: "0 0 2px" }}>{s.val}</p>
                    <p style={{ color: T.text3, fontSize: 11, margin: 0, fontWeight: 500 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              {savedDishes.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 14 }}>🗺️</div>
                  <p style={{ color: T.text2, fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>Your Kerala food map is empty.<br />Start saving dishes!</p>
                  <PrimaryBtn onClick={() => setTab("home")}>Discover Dishes 🔍</PrimaryBtn>
                </div>
              ) : savedDishes.map((dish, i) => {
                const restaurant = dish.Restaurant || dish.restaurant;
                const color = getCategoryColor(dish.category || dish.Category);
                return (
                  <div key={dish.id || dish.ID} onClick={() => openDish(dish)}
                    style={{ background: T.surface, borderRadius: 15, padding: "12px 14px", marginBottom: 9, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 11, cursor: "pointer", boxShadow: T.shadow }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: T.accentBg, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🍽️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "'Fraunces',serif" }}>{dish.Name || dish.name}</p>
                      <p style={{ color: T.text2, fontSize: 12, margin: "0 0 1px", fontWeight: 500 }}>{restaurant?.Name || restaurant?.name}</p>
                      <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>{restaurant?.City || restaurant?.city}</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); toggleSave(dish); }}
                      style={{ background: "none", border: `1px solid ${T.border}`, borderRadius: 9, padding: "5px 9px", color: T.text3, fontSize: 13, cursor: "pointer", flexShrink: 0 }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {screen === "main" && tab === "profile" && (
            <div style={{ padding: "20px 20px 110px", animation: "fadeIn .25s ease" }}>
              <div style={{ textAlign: "center", marginBottom: 22 }}>
                <div style={{ width: 68, height: 68, borderRadius: "50%", background: `linear-gradient(135deg,${GOLD},${GOLD_DARK})`, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: `0 8px 24px ${GOLD}44` }}>🧑</div>
                <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 21, fontWeight: 800, margin: "0 0 3px" }}>Kerala Food Lover</h2>
                <p style={{ color: T.text2, fontSize: 13, margin: 0 }}>Kerala 🌴</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 22 }}>
                {[{ icon: "🔖", val: savedDishes.length, label: "Saved", c: T.accent }, { icon: "🌴", val: savedCities.length, label: "Cities", c: T.green }, { icon: "🍽️", val: dishes.length, label: "Dishes", c: "#7C3AED" }].map(s => (
                  <div key={s.label} style={{ background: T.surface, borderRadius: 15, padding: "13px 9px", border: `1px solid ${T.border}`, textAlign: "center", boxShadow: T.shadow }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <p style={{ fontFamily: "'Fraunces',serif", color: s.c, fontSize: 22, fontWeight: 800, margin: "0 0 2px" }}>{s.val}</p>
                    <p style={{ color: T.text3, fontSize: 10, margin: 0, fontWeight: 500 }}>{s.label}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: T.accentBg, borderRadius: 15, padding: 15, border: `1px solid ${T.accentBorder}`, marginBottom: 16 }}>
                <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 4px" }}>🌴 Kerala Food Finder</p>
                <p style={{ color: T.text2, fontSize: 12, lineHeight: 1.6, margin: "0 0 8px" }}>Save dishes from reels. Get notified when you travel near saved spots.</p>
                <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>MVP v1.0 · Go + PostgreSQL + Groq AI 🤖</p>
              </div>
              <div style={{ background: T.surface2, borderRadius: 14, padding: 14, border: `1px solid ${T.border}` }}>
                <p style={{ color: T.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 10px" }}>API Status</p>
                {[
                  { name: "Go Backend", status: "Connected ✅" },
                  { name: "PostgreSQL", status: "Connected ✅" },
                  { name: "Groq AI", status: "Active ✅" },
                  { name: "AssemblyAI", status: "Active ✅" },
                ].map(s => (
                  <div key={s.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: T.text2, fontSize: 12 }}>{s.name}</span>
                    <span style={{ color: T.green, fontSize: 12, fontWeight: 600 }}>{s.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══ RESTAURANT ══ */}
          {screen === "restaurant" && selRest && (
            <div style={{ animation: "fadeIn .25s ease" }}>
              <div style={{ padding: "14px 20px 0" }}>
                <button onClick={() => setScreen("main")}
                  style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 13px", color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 14, cursor: "pointer" }}>← Back</button>
                <p style={{ color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>Restaurant</p>
                <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 22, fontWeight: 800, margin: "0 0 4px", letterSpacing: -.3 }}>{selRest.Name || selRest.name}</h2>
                <p style={{ color: T.text2, fontSize: 12, margin: "0 0 14px" }}>📍 {selRest.Area || selRest.area}, {selRest.City || selRest.city}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 18 }}>
                  {[{ l: "Dishes", v: restDishes.length }, { l: "Reels", v: restReels.length }, { l: "Total Saves", v: restDishes.reduce((s, d) => s + (d.Saves || d.saves || 0), 0) }].map(s => (
                    <div key={s.l} style={{ background: T.accentBg, borderRadius: 12, padding: "11px", textAlign: "center", border: `1px solid ${T.accentBorder}` }}>
                      <p style={{ fontFamily: "'Fraunces',serif", color: T.accent, fontSize: 18, fontWeight: 800, margin: "0 0 2px" }}>{s.v}</p>
                      <p style={{ color: T.text3, fontSize: 10, margin: 0 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: "0 20px 110px" }}>
                <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 11 }}>All Dishes</p>
                {restDishes.length === 0 ? <Spinner /> : restDishes.map((d, i) => <DishCard key={d.id || d.ID} dish={d} onOpen={() => openDish(d)} delay={i * .05} isSaved={savedIds.includes(d.id || d.ID)} onToggleSave={toggleSave} />)}
                {restReels.length > 0 && (
                  <>
                    <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "18px 0 11px" }}>Featured Reels ({restReels.length})</p>
                    {restReels.map(reel => (
                      <a key={reel.ID || reel.id} href={reel.ReelLink || reel.reel_link} target="_blank" rel="noopener noreferrer" 
                        style={{ background: `linear-gradient(135deg, ${T.accentBg}, ${T.surface})`, borderRadius: 16, padding: "14px 16px", marginBottom: 12, border: `1px solid ${T.accentBorder}`, display: "flex", alignItems: "center", gap: 14, textDecoration: "none", boxShadow: T.shadow, cursor: "pointer" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, boxShadow: `0 4px 12px ${GOLD}66` }}>
                          ▶️
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: T.text, fontSize: 14, fontWeight: 800, margin: "0 0 3px", fontFamily: "'Fraunces',serif" }}>Watch Reel</p>
                          <p style={{ color: T.text3, fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reel.ReelLink || reel.reel_link}</p>
                        </div>
                        <div style={{ background: T.surface, borderRadius: 99, padding: "6px 12px", border: `1px solid ${T.border}`, color: T.text2, fontSize: 11, fontWeight: 700 }}>
                          Open ↗
                        </div>
                      </a>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}

          {/* ══ DISH ══ */}
          {screen === "dish" && selDish && (() => {
            const restaurant = selDish.Restaurant || selDish.restaurant;
            const isSaved = savedIds.includes(selDish.id || selDish.ID);
            const color = getCategoryColor(selDish.category || selDish.Category);
            const avg = avgRating(dishReviews);
            const avgAspect = k => dishReviews.length ? (dishReviews.reduce((s, r) => s + (r[k] || r.rating), 0) / dishReviews.length) : 0;
            return (
              <div style={{ animation: "fadeIn .25s ease" }}>
                <div style={{ padding: "14px 20px 0" }}>
                  <button onClick={() => setScreen("main")}
                    style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: "7px 13px", color: T.text2, fontSize: 12, fontWeight: 600, marginBottom: 14, cursor: "pointer" }}>← Back</button>
                  <div style={{ height: 2.5, background: `linear-gradient(90deg,${color},transparent)`, borderRadius: 99, marginBottom: 14 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 7 }}><Tag text={getDishTag(selDish)} color={color} /></div>
                      <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 24, fontWeight: 800, margin: "0 0 6px", letterSpacing: -.4 }}>{selDish.Name || selDish.name}</h2>
                      <button onClick={() => openRestaurant(restaurant)}
                        style={{ background: "none", border: "none", padding: 0, color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                        🏨 {restaurant?.Name || restaurant?.name} →
                      </button>
                      <p style={{ color: T.text3, fontSize: 11, margin: "3px 0 0" }}>📍 {restaurant?.Area || restaurant?.area}, {restaurant?.City || restaurant?.city}</p>
                    </div>
                    {avg && (
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                        <p style={{ fontFamily: "'Fraunces',serif", color: "#F59E0B", fontSize: 24, fontWeight: 800, margin: "0 0 1px" }}>★ {avg}</p>
                        <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>{dishReviews.length} reviews</p>
                      </div>
                    )}
                  </div>
                  {(selDish.Notes || selDish.notes) && (
                    <div style={{ background: T.accentBg, borderRadius: 12, padding: "11px 13px", marginBottom: 13, border: `1px solid ${T.accentBorder}` }}>
                      <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.65, margin: 0, fontStyle: "italic" }}>"{selDish.Notes || selDish.notes}"</p>
                    </div>
                  )}
                  {avg && (
                    <div style={{ background: T.surface, borderRadius: 14, padding: "13px", marginBottom: 13, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                      <p style={{ color: T.text3, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 11px" }}>Rating Breakdown</p>
                      <RatingBar label="👅 Taste" value={avgAspect("taste")} color={GOLD} />
                      <RatingBar label="💰 Value" value={avgAspect("value")} color={GREEN} />
                      <RatingBar label="✨ Ambience" value={avgAspect("ambience")} color="#7C3AED" />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 9, marginBottom: 14 }}>
                    <PrimaryBtn onClick={() => toggleSave(selDish)} full variant={isSaved ? "outline" : "gold"}>
                      {isSaved ? "🔖 Saved" : "Save Dish 🔖"}
                    </PrimaryBtn>
                    <button onClick={() => setWriteReview(selDish.id || selDish.ID)}
                      style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 13, padding: "13px 16px", color: T.text2, fontSize: 18, cursor: "pointer" }}>⭐</button>
                  </div>
                </div>
                <div style={{ padding: "0 20px 110px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <p style={{ color: T.text3, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: 0 }}>Reviews ({dishReviews.length})</p>
                    <button onClick={() => setWriteReview(selDish.id || selDish.ID)}
                      style={{ background: T.accentBg, border: `1px solid ${T.accentBorder}`, borderRadius: 9, padding: "6px 11px", color: T.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Write ✍️</button>
                  </div>
                  {dishReviews.length === 0 && (
                    <div style={{ textAlign: "center", padding: "28px 0" }}>
                      <div style={{ fontSize: 38, marginBottom: 10 }}>✍️</div>
                      <p style={{ color: T.text2, fontSize: 14 }}>No reviews yet. Be the first!</p>
                    </div>
                  )}
                  {dishReviews.map(rv => (
                    <div key={rv.ID || rv.id} style={{ background: T.surface, borderRadius: 16, padding: "13px 14px", marginBottom: 11, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.accentBg, border: `1.5px solid ${T.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: T.accent, flexShrink: 0 }}>
                            {(rv.UserName || rv.user_name || "U")[0]}
                          </div>
                          <div>
                            <p style={{ color: T.text, fontSize: 13, fontWeight: 700, margin: "0 0 1px" }}>{rv.UserName || rv.user_name}</p>
                            <p style={{ color: T.text3, fontSize: 11, margin: 0 }}>{rv.Visited || rv.visited ? "✅ Visited" : ""}</p>
                          </div>
                        </div>
                        <Stars value={rv.Rating || rv.rating} size={13} />
                      </div>
                      <p style={{ color: T.text2, fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>{rv.Comment || rv.comment}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 9, borderTop: `1px solid ${T.border}` }}>
                        <div style={{ display: "flex", gap: 11 }}>
                          {[{ k: "taste", l: "Taste", i: "👅" }, { k: "value", l: "Value", i: "💰" }, { k: "ambience", l: "Ambience", i: "✨" }].map(a => (
                            <span key={a.k} style={{ color: T.text3, fontSize: 11 }}>{a.i} <span style={{ color: T.text2, fontWeight: 700 }}>{rv[a.k] || rv[a.l?.toLowerCase()] || "-"}</span></span>
                          ))}
                        </div>
                        <button onClick={() => markHelpful(rv.ID || rv.id)}
                          style={{ background: helpfulIds.includes(rv.ID || rv.id) ? T.accentBg : "transparent", border: `1px solid ${helpfulIds.includes(rv.ID || rv.id) ? T.accentBorder : T.border}`, borderRadius: 9, padding: "4px 9px", color: helpfulIds.includes(rv.ID || rv.id) ? T.accent : T.text3, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
                          👍 {rv.Helpful || rv.helpful || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Bottom Nav */}
        {screen === "main" && (
          <div style={{ background: T.nav, borderTop: `1px solid ${T.border}`, padding: "9px 6px 22px", display: "flex", justifyContent: "space-around", flexShrink: 0, backdropFilter: "blur(20px)" }}>
            {[
              { id: "home", icon: "🔍", label: "Discover" },
              { id: "trending", icon: "🔥", label: "Trending" },
              { id: "saved", icon: "🔖", label: savedDishes.length > 0 ? `Saved(${savedDishes.length})` : "Saved" },
              { id: "profile", icon: "👤", label: "Profile" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ background: tab === t.id ? T.accentBg : "none", border: tab === t.id ? `1.5px solid ${T.accentBorder}` : "1.5px solid transparent", borderRadius: 13, padding: "8px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, minWidth: 74, transition: "all .15s" }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, fontFamily: "'Plus Jakarta Sans',sans-serif", color: tab === t.id ? T.accent : T.text3 }}>{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── ADD FROM REEL ── */}
        {addReel && (
          <div style={{ position: "absolute", inset: 0, background: T.bg, zIndex: 600, display: "flex", flexDirection: "column", animation: "slideUp .26s ease" }}>
            <div style={{ padding: "16px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
              <div>
                <p style={{ color: T.green, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>AI Extract</p>
                <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -.3 }}>Add from Reel</h2>
              </div>
              <button onClick={() => { setAddReel(false); setAiResult(null); setReelLink(""); }}
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, width: 34, height: 34, color: T.text2, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 28px" }}>
              <div style={{ background: T.greenBg, border: `1.5px dashed ${T.greenBorder}`, borderRadius: 16, padding: 17, marginBottom: 18, textAlign: "center" }}>
                <span style={{ fontSize: 26, display: "block", marginBottom: 7 }}>📱</span>
                <p style={{ color: T.text, fontSize: 14, fontWeight: 700, margin: "0 0 3px" }}>Paste Instagram / YouTube Link</p>
                <p style={{ color: T.text2, fontSize: 12, margin: "0 0 13px" }}>AI reads the caption and extracts all dishes</p>
                <div style={{ marginBottom: 11 }}>
                  <Field label="" value={reelLink} onChange={e => setReelLink(e.target.value)} placeholder="https://instagram.com/reel/..." />
                </div>
                <PrimaryBtn onClick={extractFromReel} full variant="green" disabled={aiLoading}>
                  {aiLoading ? <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⚙️</span> Extracting...</> : "Extract with AI ✨"}
                </PrimaryBtn>
              </div>

              {aiLoading && (
                <div style={{ textAlign: "center", padding: "18px 0", animation: "fadeIn .3s ease" }}>
                  <div style={{ fontSize: 32, marginBottom: 8, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🤖</div>
                  <p style={{ color: T.accent, fontSize: 14, fontWeight: 700, marginBottom: 3 }}>AI reading the reel caption...</p>
                  <p style={{ color: T.text2, fontSize: 12 }}>Identifying restaurant and dishes</p>
                </div>
              )}

              {aiResult && !aiLoading && (
                <div style={{ animation: "scaleIn .25s ease" }}>
                  <div style={{ background: T.greenBg, borderRadius: 13, padding: "13px 15px", marginBottom: 14, border: `1px solid ${T.greenBorder}` }}>
                    <p style={{ color: T.green, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 7px" }}>✅ Extracted!</p>
                    <p style={{ color: T.text, fontSize: 15, fontWeight: 700, margin: "0 0 2px", fontFamily: "'Fraunces',serif" }}>🏨 {aiResult.restaurant || "Restaurant name not found"}</p>
                    <p style={{ color: T.text2, fontSize: 12, margin: 0 }}>📍 {aiResult.area ? `${aiResult.area}, ` : ""}{aiResult.city || "Location not found"}</p>
                  </div>
                  {aiResult.dishes?.length > 0 ? (
                    <>
                      <p style={{ color: T.text3, fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 9px" }}>Select dishes ({selAiDishes.length} selected)</p>
                      {aiResult.dishes.map((dish, i) => (
                        <div key={i} onClick={() => setSelAiDishes(p => p.includes(dish) ? p.filter(d => d !== dish) : [...p, dish])}
                          style={{ background: selAiDishes.includes(dish) ? T.accentBg : T.surface2, borderRadius: 12, padding: "12px 14px", marginBottom: 8, border: `1.5px solid ${selAiDishes.includes(dish) ? T.accentBorder : T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", transition: "all .15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                            <span style={{ fontSize: 18 }}>🍽️</span>
                            <p style={{ color: T.text, fontSize: 13, fontWeight: 600, margin: 0 }}>{dish}</p>
                          </div>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: selAiDishes.includes(dish) ? GOLD : "transparent", border: `1.5px solid ${selAiDishes.includes(dish) ? GOLD : T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#1C1408", fontWeight: 700, transition: "all .15s" }}>
                            {selAiDishes.includes(dish) ? "✓" : ""}
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 14 }}>
                        <PrimaryBtn onClick={saveFromReel} full>Save {selAiDishes.length} Dish{selAiDishes.length !== 1 ? "es" : ""} 🌴</PrimaryBtn>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <p style={{ color: T.text2, fontSize: 14 }}>No dishes found in caption.</p>
                      <p style={{ color: T.text3, fontSize: 12 }}>Try adding manually!</p>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0 14px" }}>
                <div style={{ flex: 1, height: 1, background: T.border }} />
                <span style={{ color: T.text3, fontSize: 11, fontWeight: 500 }}>or add manually</span>
                <div style={{ flex: 1, height: 1, background: T.border }} />
              </div>
              <PrimaryBtn onClick={() => { setAddReel(false); setAddManual(true); }} full variant="ghost">Add Manually ✏️</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ── ADD MANUALLY ── */}
        {addManual && (
          <div style={{ position: "absolute", inset: 0, background: T.bg, zIndex: 600, display: "flex", flexDirection: "column", animation: "slideUp .26s ease" }}>
            <div style={{ padding: "16px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, borderBottom: `1px solid ${T.border}` }}>
              <div>
                <p style={{ color: T.accent, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>Add Spot</p>
                <h2 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -.3 }}>Add Manually</h2>
              </div>
              <button onClick={() => setAddManual(false)}
                style={{ background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, width: 34, height: 34, color: T.text2, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 28px" }}>
              <Field label="Restaurant Name *" value={manForm.restaurant} onChange={e => setManForm(p => ({ ...p, restaurant: e.target.value }))} placeholder="e.g. Paragon Restaurant" />
              <Field label="Kerala City *" value={manForm.city} onChange={e => setManForm(p => ({ ...p, city: e.target.value }))} placeholder="e.g. Kozhikode" />
              <Field label="Area / Locality" value={manForm.area} onChange={e => setManForm(p => ({ ...p, area: e.target.value }))} placeholder="e.g. SM Street" />
              <Field label="Dish Name *" value={manForm.dish} onChange={e => setManForm(p => ({ ...p, dish: e.target.value }))} placeholder="e.g. Malabar Biryani" />
              <div style={{ marginBottom: 13 }}>
                <p style={{ color: T.text2, fontSize: 12, fontWeight: 600, margin: "0 0 6px" }}>Category</p>
                <select value={manForm.category} onChange={e => setManForm(p => ({ ...p, category: e.target.value }))}
                  style={{ background: T.surface2, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: "11px 13px", color: T.text, fontSize: 14, width: "100%", outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                  {["Rice", "Bread", "Seafood", "Meat", "Breakfast", "Snacks", "Meals", "Dessert"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <Field label="Notes" value={manForm.notes} onChange={e => setManForm(p => ({ ...p, notes: e.target.value }))} placeholder="What makes it special?" multi />
              <Field label="Reel Link (optional)" value={manForm.reelLink} onChange={e => setManForm(p => ({ ...p, reelLink: e.target.value }))} placeholder="https://instagram.com/reel/..." />
              <div style={{ marginTop: 8 }}>
                <PrimaryBtn onClick={saveManual} full>Save to Kerala Map 🌴</PrimaryBtn>
              </div>
            </div>
          </div>
        )}

        {/* ── WRITE REVIEW ── */}
        {writeReview && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)", backdropFilter: "blur(14px)", display: "flex", alignItems: "flex-end", zIndex: 700, animation: "fadeIn .2s ease" }} onClick={() => setWriteReview(null)}>
            <div style={{ background: T.bg, borderRadius: "26px 26px 0 0", padding: "18px 20px 32px", width: "100%", animation: "slideUp .24s ease", border: `1px solid ${T.border}`, borderBottom: "none" }} onClick={e => e.stopPropagation()}>
              <div style={{ width: 30, height: 3.5, background: T.border, borderRadius: 99, margin: "0 auto 14px" }} />
              <p style={{ color: T.text3, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 3px" }}>Write Review</p>
              <h3 style={{ fontFamily: "'Fraunces',serif", color: T.text, fontSize: 19, fontWeight: 800, margin: "0 0 14px", letterSpacing: -.3 }}>{selDish?.Name || selDish?.name}</h3>
              <Field label="Your Name" value={revForm.user_name} onChange={e => setRevForm(p => ({ ...p, user_name: e.target.value }))} placeholder="Your name" />
              <div style={{ background: T.accentBg, borderRadius: 12, padding: 13, marginBottom: 11, border: `1px solid ${T.accentBorder}` }}>
                <p style={{ color: T.text3, fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", margin: "0 0 9px" }}>Overall Rating *</p>
                <Stars value={revForm.rating} onChange={v => setRevForm(p => ({ ...p, rating: v }))} size={28} />
                {revForm.rating > 0 && <p style={{ color: T.accent, fontSize: 12, fontWeight: 600, margin: "7px 0 0" }}>{["", "😞 Poor", "😐 Okay", "🙂 Good", "😄 Great", "🤩 Amazing!"][revForm.rating]}</p>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 9, marginBottom: 11 }}>
                {[{ k: "taste", l: "👅 Taste" }, { k: "value", l: "💰 Value" }, { k: "ambience", l: "✨ Vibe" }].map(a => (
                  <div key={a.k} style={{ background: T.surface2, borderRadius: 11, padding: "9px 7px", border: `1px solid ${T.border}`, textAlign: "center" }}>
                    <p style={{ color: T.text3, fontSize: 10, margin: "0 0 7px", fontWeight: 500 }}>{a.l}</p>
                    <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                      {[1, 2, 3, 4, 5].map(n => <span key={n} onClick={() => setRevForm(p => ({ ...p, [a.k]: n }))} style={{ fontSize: 13, cursor: "pointer", opacity: n <= revForm[a.k] ? 1 : .15 }}>⭐</span>)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 11 }}>
                <Field label="" value={revForm.comment} onChange={e => setRevForm(p => ({ ...p, comment: e.target.value }))} placeholder="What was special about this dish?" multi />
              </div>
              <div style={{ background: T.surface2, borderRadius: 11, padding: "10px 13px", marginBottom: 13, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }} onClick={() => setRevForm(p => ({ ...p, visited: !p.visited }))}>
                <span style={{ color: T.text2, fontSize: 12, fontWeight: 500 }}>✅ I tried this dish</span>
                <div style={{ width: 38, height: 20, background: revForm.visited ? GREEN : T.surface, borderRadius: 99, position: "relative", transition: "background .2s", border: `1px solid ${revForm.visited ? GREEN : T.border}` }}>
                  <div style={{ width: 14, height: 14, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: revForm.visited ? 21 : 2, transition: "left .2s" }} />
                </div>
              </div>
              <PrimaryBtn onClick={() => submitReview(writeReview)} full>Post Review 🌟</PrimaryBtn>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{ position: "absolute", bottom: 86, left: "50%", background: T.surface, border: `1px solid ${T.accentBorder}`, borderRadius: 20, padding: "9px 18px", color: T.text, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", animation: "toast 2.6s ease forwards", zIndex: 999, boxShadow: T.shadow, fontFamily: "'Plus Jakarta Sans',sans-serif", backdropFilter: "blur(12px)" }}>
          {toast.msg}
        </div>
        )}
      </div>
    </div>
  );
}