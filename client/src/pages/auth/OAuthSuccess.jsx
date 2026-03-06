import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
// ✅ Fixed: was importing from "../../context/AuthContext" (wrong path)
import { AuthContext } from "../../context/AuthProvider";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { setToken, fetchUser } = useContext(AuthContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // Store the access token in memory + set Authorization header
    setToken(token);

    fetchUser()
      .then((data) => {
        // Redirect based on role
        const role = data?.user?.role;
        navigate(role === "admin" ? "/admin" : "/student");
      })
      .catch(() => navigate("/login"));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
      <p className="text-slate-600 dark:text-slate-300 text-lg">
        ✅ Signing you in with Google…
      </p>
    </div>
  );
};

export default OAuthSuccess;
