# Hướng dẫn kết nối Frontend với Backend

## Tóm tắt các file đã tạo và cập nhật:

### 1. Cấu hình NextAuth
- **File:** `src/app/api/auth/[...nextauth]/route.ts`
- **Chức năng:** Cấu hình NextAuth để xử lý authentication với backend API

### 2. AuthService
- **File:** `src/services/authService.ts`  
- **Chức năng:** Service để gọi các API backend (login, register, refresh token, forgot password)

### 3. Environment Configuration
- **File:** `.env.local`
- **Chức năng:** Cấu hình biến môi trường cho API URL và NextAuth

### 4. Authentication Provider
- **File:** `src/components/Auth/AuthProvider.tsx`
- **Chức năng:** Wrapper component cho SessionProvider của NextAuth

### 5. User Profile Component
- **File:** `src/components/Auth/UserProfile.tsx`
- **Chức năng:** Hiển thị thông tin user và dropdown menu khi đã đăng nhập

### 6. Custom Hooks
- **File:** `src/hooks/useAuth.ts` - Hook để quản lý authentication state
- **File:** `src/hooks/useApiClient.ts` - Hook để thực hiện authenticated API calls

### 7. Type Definitions
- **File:** `src/types/next-auth.d.ts`
- **Chức năng:** Extend NextAuth types để bao gồm accessToken và refreshToken

### 8. Updated Components
- **File:** `src/components/Auth/SignIn/index.tsx` - Cập nhật để sử dụng NextAuth
- **File:** `src/components/Layout/Header/index.tsx` - Cập nhật để hiển thị UserProfile khi đã login
- **File:** `src/app/layout.tsx` - Thêm AuthProvider và Toaster

### 9. Test Pages
- **File:** `src/app/dashboard/page.tsx` - Trang dashboard để test authentication
- **File:** `src/app/test-api/page.tsx` - Trang test API connection

### 10. Middleware
- **File:** `middleware.ts` - Bảo vệ các route yêu cầu authentication

## Cách chạy và test:

### 1. Khởi động Backend
```bash
cd d:\Elearning\backend\WebRtcApi
dotnet run
```

### 2. Khởi động Frontend  
```bash
cd d:\Elearning\frontend
npm run dev
```

### 3. Test các tính năng:
- **Sign In:** Truy cập `/signin` hoặc click nút Sign In ở header
- **Dashboard:** Truy cập `/dashboard` (yêu cầu đăng nhập)
- **Test API:** Truy cập `/test-api` để test kết nối backend

## Lưu ý quan trọng:

### 1. SSL Certificate Issue
Nếu gặp lỗi SSL khi connect tới `https://localhost:7159`, có 2 cách fix:

**Cách 1:** Tạo development certificate:
```bash
dotnet dev-certs https --trust
```

**Cách 2:** Sử dụng HTTP thay vì HTTPS:
- Cập nhật `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5074/api`
- Hoặc cập nhật backend để chạy trên HTTP

### 2. CORS Configuration
Đảm bảo backend đã cấu hình CORS để cho phép frontend truy cập:

```csharp
// Trong Program.cs hoặc Startup.cs
app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader());
```

### 3. Backend API Endpoint
Backend sử dụng:
- **LoginDto:** `{ fullName: string, passwordHash: string }`
- **Response:** `{ accessToken: string, refreshToken: string }`

### 4. Frontend Authentication Flow:
1. User nhập email/password
2. NextAuth gọi AuthService.login()
3. AuthService gọi backend API `/auth/login`
4. Backend trả về tokens
5. NextAuth lưu tokens vào session
6. Frontend sử dụng tokens để gọi protected APIs

## Troubleshooting:

### 1. Network Error
- Kiểm tra backend có đang chạy không
- Kiểm tra URL trong `.env.local`
- Kiểm tra CORS configuration

### 2. Authentication Error  
- Kiểm tra credentials có đúng không
- Kiểm tra backend có user tương ứng không
- Xem console log để debug

### 3. Token Issues
- Kiểm tra session có chứa tokens không
- Kiểm tra middleware có hoạt động không
- Xem network tab để kiểm tra API calls

Bây giờ frontend đã được kết nối với backend và sẵn sàng để test!