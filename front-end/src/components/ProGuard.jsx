import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import UserInfoModal from "./Signpage/UserInfoModal.jsx";

function ProGuard({ children }) {
  const [user, setUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user info from Firestore
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserInfo(data);
            
            // Check if required fields are missing
            if (!data.firstName || !data.studentId || !data.className) {
              setShowModal(true);
            }
          } else {
            // User document doesn't exist, show modal
            setShowModal(true);
          }
        } catch (error) {
          console.error("Error fetching user info:", error);
          setShowModal(true);
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleModalComplete = () => {
    setShowModal(false);
    // Refresh user info
    if (user) {
      getDoc(doc(db, "users", user.uid)).then((userDoc) => {
        if (userDoc.exists()) {
          setUserInfo(userDoc.data());
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFEFF2" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#568F87" }}></div>
          <p style={{ color: "#064232" }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <UserInfoModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onComplete={handleModalComplete}
      />
    </>
  );
}

export default ProGuard;
