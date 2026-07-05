import { Menu, X, Moon, Sun, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuthStore } from "@/store/useAuthStore";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";

const navLinkClass =
  "relative text-sm font-semibold text-muted-foreground transition-colors hover:text-black dark:hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:rounded-full after:bg-gradient-to-r after:from-[#6dd3e8] after:via-[#7fd69a] after:to-[#d8df6f] after:transition-transform after:duration-200 hover:after:scale-x-100 dark:after:from-[#B6EDFD] dark:after:via-[#b8f5c8] dark:after:to-[#f5f0a0]";
const activeNavLinkClass =
  "text-black dark:text-foreground after:scale-x-100 after:h-[3px]";

export function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const redirectUrl = location.pathname.startsWith("/m/")
    ? location.pathname
    : "/dashboard";

  const featuresHref = location.pathname === "/" ? "#features" : "/#features";
  const howHref = location.pathname === "/" ? "#how-it-works" : "/#how-it-works";

  const getNavLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `${navLinkClass} ${isActive ? activeNavLinkClass : ""}`.trim();
  };

  const handleCreateMeeting = () => {
    setMobileOpen(false);
    if (isAuthenticated) {
      navigate("/create");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={(event) => {
            setMobileOpen(false);
            if (location.pathname === "/") {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <img
            src={theme === "dark" ? "/logo_darktheme.svg" : "/logo_lighttheme.svg"}
            alt="Meetrix Groups logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-display font-bold text-foreground">Meetrix Groups</span>
        </Link>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-8">
          <a
            href={featuresHref}
            className={location.pathname === "/" ? `${navLinkClass} ${activeNavLinkClass}` : navLinkClass}
          >
            Features
          </a>
          <a
            href={howHref}
            className={location.pathname === "/" ? `${navLinkClass} ${activeNavLinkClass}` : navLinkClass}
          >
            How It Works
          </a>

          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={getNavLinkClass("/dashboard")}>
                Dashboard
              </Link>
              <Link to="/my-meetings" className={getNavLinkClass("/my-meetings")}>
                My Meetings
              </Link>
              <button type="button" onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
              </button>
              <Button
                type="button"
                className="btn-gradient-primary !rounded-full px-6 font-bold flex items-center gap-1.5"
                onClick={handleCreateMeeting}
              >
                Create Meeting
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <button type="button" onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Toggle theme">
                {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
              </button>
              <div className="flex items-center gap-4">
                <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
                  <Button type="button" className="px-6 font-bold">
                    Login
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl={redirectUrl}>
                  <Button type="button" variant="secondary" className="px-6 font-bold">
                    Sign up
                  </Button>
                </SignUpButton>
              </div>
            </>
          )}
        </div>

        {/* Mobile Header Icons / Buttons */}
        <div className="flex items-center gap-2 md:hidden">
          <button type="button" onClick={toggle} className="p-2 rounded-full hover:bg-secondary transition-colors" aria-label="Toggle theme">
            {theme === "light" ? <Moon className="h-5 w-5 text-foreground" /> : <Sun className="h-5 w-5 text-foreground" />}
          </button>
          {isAuthenticated && <UserButton afterSignOutUrl="/" />}
          <button type="button" aria-label="Open menu" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-b border-border px-6 pb-4 flex flex-col gap-3">
          <a href={featuresHref} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            Features
          </a>
          <a href={howHref} className="text-sm font-medium text-muted-foreground" onClick={() => setMobileOpen(false)}>
            How It Works
          </a>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`text-sm font-medium ${location.pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/my-meetings"
                className={`text-sm font-medium ${location.pathname === "/my-meetings" ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMobileOpen(false)}
              >
                My Meetings
              </Link>
              <Button
                type="button"
                className="btn-gradient-primary !rounded-full px-6 w-full font-bold flex items-center justify-center gap-1.5"
                onClick={handleCreateMeeting}
              >
                Create a Free Meeting
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </Button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <SignInButton mode="modal" forceRedirectUrl={redirectUrl}>
                <Button type="button" className="w-full font-bold">
                  Login
                </Button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl={redirectUrl}>
                <Button type="button" variant="secondary" className="w-full font-bold">
                  Sign up
                </Button>
              </SignUpButton>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
