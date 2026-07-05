import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { useAuthStore, setClerkGetToken } from "@/store/useAuthStore";

export default function ClerkStateSync() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      setClerkGetToken(getToken);
      getToken().then((token) => {
        if (token) {
          login(token, {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress ?? "",
            name: user.fullName ?? "",
            picture: user.imageUrl ?? "",
          });
        }
      });
    } else {
      setClerkGetToken(null);
      logout();
    }
  }, [isLoaded, isSignedIn, user, getToken, login, logout]);

  return null;
}
