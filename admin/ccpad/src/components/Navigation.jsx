import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  Award,
  Eye,
  Settings,
  LogOut,
  FileText,
  FileCode,
  CheckSquare,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const allNavItems = [
    {
      path: "/",
      label: "Quản lý Học sinh",
      icon: Users,
      description: "Xem và quản lý danh sách học sinh",
      roles: ["admin", "teacher"],
    },
    {
      path: "/rules",
      label: "Nội quy",
      icon: BookOpen,
      description: "Thiết lập quy tắc điểm cộng/trừ",
      roles: ["admin"],
    },
    {
      path: "/points",
      label: "Quản lý Điểm",
      icon: Award,
      description: "Thêm điểm cộng/trừ cho học sinh",
      roles: ["admin", "teacher"],
    },
    {
      path: "/evidence",
      label: "Minh chứng",
      icon: FileText,
      description: "Xét duyệt minh chứng của học sinh",
      roles: ["admin"],
    },
    {
      path: "/events",
      label: "Sự kiện",
      icon: Eye,
      description: "Tạo và quản lý sự kiện",
      roles: ["admin"],
    },
    {
      path: "/approvals",
      label: "Duyệt đăng ký",
      icon: Settings,
      description: "Duyệt hoặc từ chối đăng ký tham gia sự kiện",
      roles: ["admin"],
    },
  ];

  // Lọc menu theo quyền người dùng
  const navItems = allNavItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                    title={item.description}
                  >
                    <Icon size={16} className="mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User info and logout */}
          <div className="flex items-center">
            {user && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={logout}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <LogOut size={16} className="mr-2" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                }`}
              >
                <div className="flex items-center">
                  <Icon size={16} className="mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
