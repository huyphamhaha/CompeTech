import React from "react";
import { FileText, X, Trash2 } from "lucide-react";

const CVFileList = ({ files, onRemove, onClear }) => {
  if (!files || files.length === 0) return null;
  return (
    <div className="mt-4">
      <h4
        className="text-sm font-medium mb-3 flex items-center"
        style={{ color: "#064232" }}
      >
        <FileText className="h-4 w-4 mr-2" style={{ color: "#F5BABB" }} />
        File đã chọn: <span className="ml-1 font-bold">{files.length}</span>
      </h4>
      <div className="max-h-48 overflow-y-auto space-y-2">
        {files.map((file, idx) => (
          <div
            key={file.name + file.size}
            className="rounded-lg p-3 flex items-center justify-between transition-all hover:shadow-md border"
            style={{
              background: "#FFFFFF",
              borderColor: "#568F87",
            }}
          >
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-3" style={{ color: "#568F87" }} />
              <div>
                <div
                  className="text-sm font-medium"
                  style={{ color: "#064232" }}
                >
                  {file.name}
                </div>
                <div className="text-xs" style={{ color: "#06423299" }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(idx)}
              className="p-1 rounded-full hover:bg-red-100 transition-colors"
              style={{ color: "#EF4444" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-xs flex items-center hover:opacity-80 transition-opacity"
        style={{ color: "#EF4444" }}
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Xóa tất cả file
      </button>
    </div>
  );
};

export default CVFileList;
