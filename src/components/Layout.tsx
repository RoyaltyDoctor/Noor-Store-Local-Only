import { Routes, Route, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { App as CapApp } from "@capacitor/app";
import {
  Home,
  Users,
  Store,
  BarChart3,
  Settings as SettingsIcon,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import HomeRoute from "../pages/Home";
import CustomersRoute from "../pages/Customers";
import OrderDetailsRoute from "../pages/OrderDetails";
import ReportsRoute from "../pages/Reports";
import SettingsRoute from "../pages/Settings";
import BatchesRoute from "../pages/Batches";
import BatchDetailsRoute from "../pages/BatchDetails";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitModal, setShowExitModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const currentPathRef = useRef(location.pathname);
  const showExitModalRef = useRef(false);

  useEffect(() => {
    currentPathRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    showExitModalRef.current = showExitModal;
  }, [showExitModal]);

  useEffect(() => {
    // Check if we are running under Capacitor (Android/iOS)
    if (typeof window === "undefined" || !(window as any).Capacitor) {
      return;
    }

    const setupListener = async () => {
      const handler = () => {
        if (showExitModalRef.current) {
          // If modal is showing, back button closes it
          setShowExitModal(false);
          return;
        }

        // Check if there is a modal open in the URL hash/search
        const hasUrlModal = window.location.search.includes("modal=") || window.location.hash.includes("modal=");
        if (hasUrlModal) {
          navigate(-1);
          return;
        }

        const mainTabs = ["/", "/batches", "/customers", "/reports", "/settings"];
        const currentPath = currentPathRef.current;

        if (currentPath === "/") {
          // If on home route, show exit confirmation dialog
          setShowExitModal(true);
        } else if (mainTabs.includes(currentPath)) {
          // If on any of the core/main tabs, return to the default Home tab
          navigate("/");
        } else {
          // Otherwise (e.g. details page), navigate back
          navigate(-1);
        }
      };

      const listener = await CapApp.addListener("backButton", handler);
      return listener;
    };

    const listenerPromise = setupListener();

    return () => {
      listenerPromise.then((l) => l?.remove());
    };
  }, [navigate]);

  const handleExitApp = async () => {
    if (typeof window !== "undefined" && (window as any).Capacitor) {
      await CapApp.exitApp();
    } else {
      setShowExitModal(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-200 dark:bg-gray-600">
      <div className="w-full max-w-md landscape:max-w-full md:landscape:max-w-2xl lg:landscape:max-w-3xl bg-gray-50 flex flex-col h-screen min-h-[100dvh] relative shadow-2xl ring-1 ring-gray-900/5 dark:bg-gray-900 dark:shadow-none dark:bg-gray-800">
        {/* Exit Confirmation Modal */}
        {showExitModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-xs w-full shadow-2xl border border-gray-100 dark:border-gray-700 text-center transform scale-100 transition-all">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/40 mb-4 animate-bounce">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                إغلاق التطبيق
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 font-medium">
                هل تريد بالتأكيد إغلاق التطبيق والخروج؟
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleExitApp}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-red-200 dark:shadow-none"
                >
                  نعم، خروج
                </button>
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-650 dark:active:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-bold rounded-xl transition-all"
                >
                  لا، تراجع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="bg-white border-b px-4 py-2 flex items-center justify-between z-10 shadow-sm relative dark:bg-gray-800 dark:border-gray-700 dark:shadow-none">
          <div className="flex items-center gap-2.5">
            {imageError ? (
              <div className="w-8.5 h-8.5 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold shrink-0">
                <Store className="w-4.5 h-4.5" />
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg shrink-0">
                <img
                  src="/icon.png"
                  onError={() => setImageError(true)}
                  className="w-12 h-12 max-w-none object-contain scale-[1.5] shrink-0"
                  alt="Noor Store Logo"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}
            <h1 className="font-bold text-lg text-gray-900 flex flex-col dark:text-white tracking-tight">
              Noor Store
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main
          id="main-scroll-container"
          className="flex-1 overflow-y-auto no-scrollbar pb-20 relative"
        >
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/batches" element={<BatchesRoute />} />
            <Route path="/customers" element={<CustomersRoute />} />
            <Route path="/reports" element={<ReportsRoute />} />
            <Route path="/order/:id" element={<OrderDetailsRoute />} />
            <Route path="/batch/:id" element={<BatchDetailsRoute />} />
            <Route path="/settings" element={<SettingsRoute />} />
          </Routes>
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-3 py-3 flex justify-between items-center z-20 pb-safe dark:bg-gray-800 dark:border-gray-700 dark:border-gray-600">
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-medium">العملاء</span>
          </NavLink>

          <NavLink
            to="/batches"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="text-[10px] font-medium">السلات</span>
          </NavLink>

          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-medium">الطلبيات</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <BarChart3 className="w-6 h-6" />
            <span className="text-[10px] font-medium">التقارير</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 ${
                isActive
                  ? "text-purple-600 dark:text-purple-400"
                  : "text-gray-400 hover:text-gray-600"
              }`
            }
          >
            <SettingsIcon className="w-6 h-6" />
            <span className="text-[10px] font-medium">الإعدادات</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
