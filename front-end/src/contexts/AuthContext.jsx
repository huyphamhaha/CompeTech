import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../components/firebase.js";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  // Lấy Firebase Auth Token
  const getAuthToken = async (firebaseUser = null) => {
    const targetUser = firebaseUser || user;
    if (targetUser) {
      try {
        const token = await targetUser.getIdToken();
        setAuthToken(token);
        console.log("🔑 Auth token obtained:", token.substring(0, 50) + "...");
        return token;
      } catch (error) {
        console.error("Error getting auth token:", error);
        return null;
      }
    }
    console.warn("⚠️ No user available for getAuthToken");
    return null;
  };

  // Fetch user data
  const fetchUserData = async (firebaseUser) => {
    try {
      console.log("📋 Fetching user data for:", firebaseUser.email);
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserDetails(userData);
        console.log("✅ User data loaded:", userData);
      } else {
        // User chưa có data, tạo mới
        console.log("🆕 Creating new user document");
        const newUserDetails = {
          firstName: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
        };
        await setDoc(docRef, newUserDetails);
        setUserDetails(newUserDetails);
      }

      // Get auth token - pass firebaseUser to avoid race condition
      console.log("🔑 Getting auth token...");
      const token = await getAuthToken(firebaseUser);
      console.log("🔑 Auth token result:", token ? "SUCCESS" : "FAILED");
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🚀 AuthContext: Setting up auth listener");
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      console.log(
        "🔄 Auth state changed:",
        firebaseUser ? firebaseUser.email : "No user"
      );
      setUser(firebaseUser);

      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        console.log("🚪 User logged out, clearing state");
        setUserDetails(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Effect để ensure authToken được set khi user đã có
  useEffect(() => {
    if (user && !authToken && !isLoading) {
      console.log("🔧 User exists but no authToken, getting token...");
      getAuthToken(user);
    }
  }, [user, authToken, isLoading]);

  // Refresh auth token khi cần
  const refreshAuthToken = async () => {
    if (user) {
      try {
        console.log("🔄 Refreshing auth token...");
        const token = await user.getIdToken(true); // force refresh
        setAuthToken(token);
        console.log("✅ Auth token refreshed successfully");
        return token;
      } catch (error) {
        console.error("Error refreshing auth token:", error);
        return null;
      }
    }
    console.warn("⚠️ No user available for refreshAuthToken");
    return null;
  };

  const value = {
    user,
    userDetails,
    isLoading,
    authToken,
    getAuthToken: () => getAuthToken(user),
    refreshAuthToken,
    fetchUserData: () => (user ? fetchUserData(user) : null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
