# Danh sách tài khoản Admin Panel

## Tài khoản Admin (Quyền truy cập đầy đủ)

| ID         | Mật khẩu   | Tên                 | Quyền |
| ---------- | ---------- | ------------------- | ----- |
| `admin001` | `admin123` | Quản trị viên chính | Admin |
| `admin002` | `admin456` | Quản trị viên phụ   | Admin |

**Quyền của Admin:**

- Truy cập tất cả các chức năng
- Quản lý học sinh tất cả các lớp
- Quản lý điểm của tất cả học sinh
- Quản lý nội quy
- Quản lý minh chứng
- Quản lý sự kiện
- Duyệt đăng ký tham gia sự kiện

---

## Tài khoản Giáo viên (Quyền hạn chế theo lớp)

### Lớp 10A

| ID             | Mật khẩu     | Tên                     | Lớp |
| -------------- | ------------ | ----------------------- | --- |
| `teacher10a`   | `teacher123` | Giáo viên chủ nhiệm 10A | 10A |
| `teacher10a_2` | `teacher456` | Giáo viên bộ môn 10A    | 10A |

### Lớp 10B

| ID             | Mật khẩu     | Tên                     | Lớp |
| -------------- | ------------ | ----------------------- | --- |
| `teacher10b`   | `teacher789` | Giáo viên chủ nhiệm 10B | 10B |
| `teacher10b_2` | `teacher012` | Giáo viên bộ môn 10B    | 10B |

### Lớp 10C

| ID             | Mật khẩu     | Tên                     | Lớp |
| -------------- | ------------ | ----------------------- | --- |
| `teacher10c`   | `teacher345` | Giáo viên chủ nhiệm 10C | 10C |
| `teacher10c_2` | `teacher678` | Giáo viên bộ môn 10C    | 10C |

### Lớp 11A

| ID             | Mật khẩu     | Tên                     | Lớp |
| -------------- | ------------ | ----------------------- | --- |
| `teacher11a`   | `teacher901` | Giáo viên chủ nhiệm 11A | 11A |
| `teacher11a_2` | `teacher234` | Giáo viên bộ môn 11A    | 11A |

### Lớp 11B

| ID             | Mật khẩu     | Tên                     | Lớp |
| -------------- | ------------ | ----------------------- | --- |
| `teacher11b`   | `teacher567` | Giáo viên chủ nhiệm 11B | 11B |
| `teacher11b_2` | `teacher890` | Giáo viên bộ môn 11B    | 11B |

### Lớp 11C

| ID             | Mật khẩu      | Tên                     | Lớp |
| -------------- | ------------- | ----------------------- | --- |
| `teacher11c`   | `teacher1234` | Giáo viên chủ nhiệm 11C | 11C |
| `teacher11c_2` | `teacher5678` | Giáo viên bộ môn 11C    | 11C |

### Lớp 12A

| ID             | Mật khẩu      | Tên                     | Lớp |
| -------------- | ------------- | ----------------------- | --- |
| `teacher12a`   | `teacher9999` | Giáo viên chủ nhiệm 12A | 12A |
| `teacher12a_2` | `teacher8888` | Giáo viên bộ môn 12A    | 12A |

### Lớp 12B

| ID             | Mật khẩu      | Tên                     | Lớp |
| -------------- | ------------- | ----------------------- | --- |
| `teacher12b`   | `teacher7777` | Giáo viên chủ nhiệm 12B | 12B |
| `teacher12b_2` | `teacher6666` | Giáo viên bộ môn 12B    | 12B |

### Lớp 12C

| ID             | Mật khẩu      | Tên                     | Lớp |
| -------------- | ------------- | ----------------------- | --- |
| `teacher12c`   | `teacher5555` | Giáo viên chủ nhiệm 12C | 12C |
| `teacher12c_2` | `teacher4444` | Giáo viên bộ môn 12C    | 12C |

**Quyền của Giáo viên:**

- Chỉ truy cập được **Quản lý Học sinh** và **Quản lý Điểm**
- Chỉ quản lý được học sinh của lớp được phân công
- Không thể truy cập:
  - Nội quy
  - Minh chứng
  - Sự kiện
  - Duyệt đăng ký

---

## Hướng dẫn sử dụng

1. **Đăng nhập:** Nhập ID và mật khẩu tương ứng với vai trò của bạn
2. **Admin:** Sau khi đăng nhập sẽ thấy đầy đủ menu và có thể truy cập tất cả chức năng
3. **Giáo viên:** Sau khi đăng nhập chỉ thấy menu "Quản lý Học sinh" và "Quản lý Điểm", chỉ có thể xem và quản lý học sinh của lớp được phân công

## Lưu ý bảo mật

- Đây là mật khẩu mặc định, nên thay đổi trong môi trường production
- Trong thực tế, nên lưu trữ thông tin người dùng trong database
- Nên sử dụng mã hóa mật khẩu (hash) thay vì lưu plain text
- Có thể thêm tính năng đổi mật khẩu cho người dùng

## Thêm tài khoản mới

Để thêm tài khoản mới, cập nhật object `users` trong file `src/contexts/AuthContext.jsx`:

```javascript
const users = {
  // Thêm tài khoản mới vào đây
  newUserId: {
    password: "newPassword",
    role: "admin" | "teacher",
    name: "Tên người dùng",
    class: "Lớp", // Chỉ cần cho teacher
  },
};
```
