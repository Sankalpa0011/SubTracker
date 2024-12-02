import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const GoogleAuthButton = () => {
  const { signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("Credential Response:", credentialResponse);
    try {
      if (!credentialResponse?.credential) {
        toast.error("Google authentication failed");
        return;
      }

      await signInWithGoogle(credentialResponse.credential);
      toast.success("Successfully signed in with Google!");
      navigate("/");
    } catch (error) {
      console.error("Google sign in error:", error);
      toast.error("Failed to sign in with Google");
    }
  };

  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error("Google authentication failed")}
        useOneTap={false}
        context="signin"
      />
    </div>
  );
};

export default GoogleAuthButton;
