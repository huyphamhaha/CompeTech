import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Forum ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFEFF2]">
          <div
            className="glass rounded-xl p-8 border text-center"
            style={{ borderColor: "#568F87" }}
          >
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "#064232" }}
            >
              Đã xảy ra lỗi
            </h1>
            <p style={{ color: "#06423299" }}>
              Vui lòng tải lại trang hoặc thử lại sau.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
