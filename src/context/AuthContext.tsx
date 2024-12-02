import React, { createContext, useContext, useState } from "react";
import { authService } from "../services/api";
import { User, AuthContextType } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Input validation
      if (!email || !password || !name) {
        throw new Error("All fields are required");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const response = await authService.signUp({
        email: email.trim(),
        password,
        name: name.trim(),
      });

      const { token, ...userData } = response.data;

      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error: unknown) {
      console.error("Signup error:", error);

      // Handle Axios error responses
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data: { message?: string; errors?: Array<{ msg: string }> } } };
        if (axiosError.response) {
          const message =
            axiosError.response.data.message ||
            axiosError.response.data.errors?.[0]?.msg ||
            "Registration failed";
          throw new Error(message);
        }
      }

      // Handle other errors
      throw new Error(
        error instanceof Error ? error.message : "Failed to create account. Please try again."
      );
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authService.signIn({ email, password });
      const { token, ...userData } = response.data;

      setUser(userData);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      throw new Error("Invalid credentials");
    }
  };

  const signOut = async () => {
    try {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      throw new Error("Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
