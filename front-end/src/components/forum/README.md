# Forum Component

Đây là một forum nhỏ với các chức năng cơ bản được tích hợp vào ứng dụng CompeteCh.

## Các chức năng chính

### 1. Xem danh sách bài viết

- Hiển thị tất cả bài viết theo thứ tự thời gian mới nhất
- Hiển thị thông tin tác giả, thời gian tạo, danh mục
- Hiển thị số lượt thích và số bình luận
- Tìm kiếm bài viết theo tiêu đề, nội dung hoặc danh mục

### 2. Tạo bài viết mới

- Form tạo bài viết với tiêu đề, nội dung và danh mục
- Validation dữ liệu đầu vào
- Chọn danh mục từ danh sách có sẵn
- Giới hạn độ dài tiêu đề (200 ký tự) và nội dung (5000 ký tự)

### 3. Xem chi tiết bài viết

- Hiển thị đầy đủ nội dung bài viết
- Danh sách bình luận với thông tin tác giả và thời gian
- Chức năng thích bài viết

### 4. Bình luận

- Thêm bình luận mới
- Chỉnh sửa bình luận của mình
- Xóa bình luận (tác giả bình luận hoặc tác giả bài viết)
- Trả lời bình luận (nested comments)

### 5. Quản lý bài viết

- Chỉnh sửa bài viết của mình
- Xóa bài viết của mình
- Hiển thị nút chỉnh sửa/xóa chỉ cho tác giả

### 6. Danh mục

Các danh mục có sẵn:

- Chung
- Học tập
- Thảo luận
- Hỏi đáp
- Chia sẻ kinh nghiệm
- Tài liệu
- Sự kiện

## Cấu trúc dữ liệu

### Bài viết (Post)

```javascript
{
  id: string,
  title: string,
  content: string,
  author: string,
  authorId: string,
  createdAt: Timestamp, // Firebase Timestamp
  likes: number,
  comments: Comment[],
  category: string
}
```

### Bình luận (Comment)

```javascript
{
  id: string,
  content: string,
  author: string,
  authorId: string,
  createdAt: string, // ISO string
  replies: Reply[]
}
```

### Trả lời (Reply)

```javascript
{
  id: string,
  content: string,
  author: string,
  authorId: string,
  createdAt: string // ISO string
}
```

## Lưu trữ dữ liệu

Dữ liệu được lưu trữ trong Firebase Firestore với collection `forum_posts`. Điều này có nghĩa là:

- Dữ liệu được đồng bộ real-time giữa các thiết bị
- Dữ liệu được lưu trữ an toàn trên cloud
- Dữ liệu không bị mất khi xóa cache trình duyệt
- Hỗ trợ offline mode với Firebase

## Các component

1. **Forum.jsx** - Component chính, quản lý state và logic
2. **CreatePost.jsx** - Modal tạo bài viết mới
3. **PostDetail.jsx** - Hiển thị chi tiết bài viết và bình luận
4. **EditPost.jsx** - Modal chỉnh sửa bài viết

## Sử dụng

Forum được tích hợp vào route `/forum` và được bảo vệ bởi `ProGuard` component, yêu cầu người dùng đăng nhập để truy cập.

## Firebase Integration

Forum sử dụng Firebase Firestore để lưu trữ dữ liệu:

- Collection: `forum_posts`
- Real-time updates
- Offline support
- Automatic data synchronization

## Giao diện

- Sử dụng Tailwind CSS cho styling
- Responsive design
- Phù hợp với theme màu của ứng dụng (#064232)
- Icons từ Lucide React
- Modal cho các form tạo/chỉnh sửa
- Loading states và error handling
