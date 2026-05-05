import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { useThemeStore } from "../store/useThemeStore.js";

const THEMES = [
  "light","dark","cupcake","forest","synthwave",
  "retro","cyberpunk","halloween","aqua","dracula",
  "night","coffee","winter","luxury","black",
];

const Navbar = () => {
  const { authUser, logout } = useAuthStore();
  const { theme, setTheme, soundEnabled, toggleSound } = useThemeStore();

  return (
    <div className="navbar bg-base-100 border-b border-base-300 px-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex-1">
        <Link to="/" className="text-xl font-bold text-primary">
          💬 Chatify
        </Link>
      </div>

      {/* Right side controls */}
      <div className="flex-none gap-2">

        {/* Sound toggle */}
        <button
          className="btn btn-ghost btn-sm"
          onClick={toggleSound}
          title={soundEnabled ? "Mute sounds" : "Enable sounds"}
        >
          {soundEnabled ? "🔔" : "🔕"}
        </button>

        {/* Theme picker */}
        <div className="dropdown dropdown-end">
          <button className="btn btn-ghost btn-sm">
            🎨 Theme
          </button>
          <ul className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-40 max-h-64 overflow-y-auto border border-base-300">
            {THEMES.map((t) => (
              <li key={t}>
                <button
                  className={`capitalize ${theme === t ? "active" : ""}`}
                  onClick={() => setTheme(t)}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* User menu */}
        {authUser && (
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle avatar placeholder"
            >
              <div className="bg-primary text-primary-content rounded-full w-9">
                {authUser.profilePic ? (
                  <img
                    src={authUser.profilePic}
                    alt={authUser.username}
                    className="rounded-full"
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {authUser.username[0].toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <ul className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-300">
              <li className="menu-title px-2 py-1">
                <span className="font-bold text-base-content">
                  {authUser.username}
                </span>
                <span className="text-xs text-base-content/50">
                  {authUser.email}
                </span>
              </li>
              <div className="divider my-0"></div>
              <li>
                <button onClick={logout} className="text-error">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;