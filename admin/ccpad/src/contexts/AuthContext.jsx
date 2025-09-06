import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Danh sách tài khoản (trong thực tế nên lưu trong database)
const users = {
  // Admin accounts
  admin001: {
    password: "admin123",
    role: "admin",
    name: "Quản trị viên chính",
  },
  admin002: { password: "admin456", role: "admin", name: "Quản trị viên phụ" },

  // Teacher accounts - Lớp 10A
  teacher10a: {
    password: "teacher123",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 10A",
    class: "10A",
  },
  teacher10a_2: {
    password: "teacher456",
    role: "teacher",
    name: "Giáo viên bộ môn 10A",
    class: "10A",
  },

  // Teacher accounts - Lớp 10B
  teacher10b: {
    password: "teacher789",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 10B",
    class: "10B",
  },
  teacher10b_2: {
    password: "teacher012",
    role: "teacher",
    name: "Giáo viên bộ môn 10B",
    class: "10B",
  },

  // Teacher accounts - Lớp 10C
  teacher10c: {
    password: "teacher345",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 10C",
    class: "10C",
  },
  teacher10c_2: {
    password: "teacher678",
    role: "teacher",
    name: "Giáo viên bộ môn 10C",
    class: "10C",
  },

  // Teacher accounts - Lớp 11A
  teacher11a: {
    password: "teacher901",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 11A",
    class: "11A",
  },
  teacher11a_2: {
    password: "teacher234",
    role: "teacher",
    name: "Giáo viên bộ môn 11A",
    class: "11A",
  },

  // Teacher accounts - Lớp 11B
  teacher11b: {
    password: "teacher567",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 11B",
    class: "11B",
  },
  teacher11b_2: {
    password: "teacher890",
    role: "teacher",
    name: "Giáo viên bộ môn 11B",
    class: "11B",
  },

  // Teacher accounts - Lớp 11C
  teacher11c: {
    password: "teacher1234",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 11C",
    class: "11C",
  },
  teacher11c_2: {
    password: "teacher5678",
    role: "teacher",
    name: "Giáo viên bộ môn 11C",
    class: "11C",
  },

  // Teacher accounts - Lớp 12A
  teacher12a: {
    password: "teacher9999",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 12A",
    class: "12A",
  },
  teacher12a_2: {
    password: "teacher8888",
    role: "teacher",
    name: "Giáo viên bộ môn 12A",
    class: "12A",
  },

  // Teacher accounts - Lớp 12B
  teacher12b: {
    password: "teacher7777",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 12B",
    class: "12B",
  },
  teacher12b_2: {
    password: "teacher6666",
    role: "teacher",
    name: "Giáo viên bộ môn 12B",
    class: "12B",
  },

  // Teacher accounts - Lớp 12C
  teacher12c: {
    password: "teacher5555",
    role: "teacher",
    name: "Giáo viên chủ nhiệm 12C",
    class: "12C",
  },
  teacher12c_2: {
    password: "teacher4444",
    role: "teacher",
    name: "Giáo viên bộ môn 12C",
    class: "12C",
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Kiểm tra session storage khi app khởi động
    const savedUser = sessionStorage.getItem("adminUser");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userId, password) => {
    const userData = users[userId];

    if (userData && userData.password === password) {
      const userInfo = {
        id: userId,
        name: userData.name,
        role: userData.role,
        class: userData.class || null,
      };

      setUser(userInfo);
      sessionStorage.setItem("adminUser", JSON.stringify(userInfo));
      return { success: true, user: userInfo };
    }

    return { success: false, error: "ID hoặc mật khẩu không đúng" };
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("adminUser");
  };

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.role === requiredRole;
  };

  const canAccessClass = (className) => {
    if (!user) return false;
    if (user.role === "admin") return true;
    return user.class === className;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    canAccessClass,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
