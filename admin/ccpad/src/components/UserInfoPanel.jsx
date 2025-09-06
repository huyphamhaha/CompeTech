import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Info, Shield, Users, Award } from "lucide-react";

const UserInfoPanel = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <Shield className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">
            Thông tin quyền truy cập
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p className="font-medium">{user.name}</p>
            <p>
              Vai trò: {user.role === "admin" ? "Quản trị viên" : "Giáo viên"}
            </p>
            {user.role === "teacher" && (
              <div className="mt-2">
                <p className="font-medium">Lớp được phân công: {user.class}</p>
                <div className="mt-2 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Chỉ có thể quản lý học sinh lớp {user.class}</span>
                </div>
                <div className="mt-1 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  <span>Chỉ có thể quản lý điểm lớp {user.class}</span>
                </div>
              </div>
            )}
            {user.role === "admin" && (
              <div className="mt-2">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span>Có quyền truy cập đầy đủ tất cả chức năng</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfoPanel;
