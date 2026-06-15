# Car Booking Application

Ứng dụng đặt vé xe khách hiện đại được xây dựng bằng React.js với giao diện đẹp và responsive.

## 📋 Mục Lục

- [Tổng Quan Dự Án](#tổng-quan-dự-án)
- [Cấu Trúc Thư Mục](#cấu-trúc-thư-mục)
- [Cách Thức Hoạt Động](#cách-thức-hoạt-động)
- [Chi Tiết Từng Thư Mục và File](#chi-tiết-từng-thư-mục-và-file)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Hướng Dẫn Cài Đặt và Chạy](#hướng-dẫn-cài-đặt-và-chạy)
- [API Integration](#api-integration)
- [Chức Năng và Checklist Test](#-chức-năng-và-checklist-test)

---

## Tổng Quan Dự Án

Dự án **base-react** là ứng dụng frontend cho hệ thống đặt vé xe khách, cho phép người dùng:
- Tìm kiếm và đặt vé xe khách
- Xem thông tin tuyến đường, bến xe, nhà xe
- Quản lý đặt vé và kiểm tra vé
- Xem chi tiết xe và nhà xe
- Tương tác với chatbot hỗ trợ

---

## Cấu Trúc Thư Mục

```
client/base-react/
├── public/                 # Tài nguyên tĩnh (images, icons, etc.)
├── src/                    # Source code chính
│   ├── pages/             # Các trang/component chính của ứng dụng
│   │   ├── Home/          # Trang chủ và các trang liên quan
│   │   └── Auth/          # Trang xác thực (Login, Register)
│   ├── layouts/           # Layout chung (Header, Footer wrapper)
│   ├── routes/            # Định nghĩa routing
│   ├── services/          # API services và utilities
│   ├── utils/             # Utility functions
│   ├── App.jsx            # Component gốc của ứng dụng
│   ├── App.css            # Styles cho App component
│   ├── main.jsx           # Entry point của ứng dụng
│   └── index.css          # Global styles
├── index.html             # HTML template
├── package.json           # Dependencies và scripts
├── vite.config.js         # Cấu hình Vite bundler
├── tailwind.config.js     # Cấu hình Tailwind CSS
├── postcss.config.js      # Cấu hình PostCSS
└── README.md              # Tài liệu dự án
```

---

## Cách Thức Hoạt Động

### 1. **Entry Point và Khởi Tạo**

- **`index.html`**: File HTML gốc, chứa thẻ `<div id="root">` để React render vào
- **`src/main.jsx`**: Điểm vào của ứng dụng React
  - Import React và ReactDOM
  - Bọc App component trong `<BrowserRouter>` để enable React Router
  - Render App vào DOM với React 18's `createRoot` API

### 2. **Component Tree**

```
main.jsx
  └── BrowserRouter (React Router)
      └── App.jsx
          └── RouteIndex (Routing configuration)
              └── [Các Pages khác nhau dựa trên route]
```

### 3. **Routing Flow**

- **`src/routes/RouteIndex.jsx`**: Định nghĩa tất cả các routes của ứng dụng
- Khi người dùng navigate, React Router so khớp URL với route tương ứng
- Component tương ứng được render

### 4. **State Management và Data Flow**

- Sử dụng React Hooks (useState, useEffect) cho local state
- API calls được xử lý qua `services/api.service.js`
- Authentication tokens được lưu trong localStorage
- Redux có thể được sử dụng cho global state (đã có dependencies)

---

## Chi Tiết Từng Thư Mục và File

### 📁 **Root Directory**

#### **`package.json`**
- **Chức năng**: Quản lý dependencies và scripts của dự án
- **Ý nghĩa**: 
  - Định nghĩa các dependencies cần thiết (React, Router, Axios, Ant Design, etc.)
  - Chứa scripts để chạy dev server, build, lint
  - Xác định version và metadata của dự án

#### **`vite.config.js`**
- **Chức năng**: Cấu hình Vite bundler
- **Ý nghĩa**: 
  - Cấu hình React plugin với SWC (fast compilation)
  - Định nghĩa cách Vite build và serve ứng dụng
  - Quản lý development server settings

#### **`tailwind.config.js`**
- **Chức năng**: Cấu hình Tailwind CSS
- **Ý nghĩa**:
  - Định nghĩa content paths để Tailwind scan và generate CSS
  - Customize theme, colors, breakpoints
  - Add plugins nếu cần

#### **`postcss.config.js`**
- **Chức năng**: Cấu hình PostCSS
- **Ý nghĩa**: Xử lý CSS, thường được sử dụng với Tailwind và Autoprefixer

#### **`index.html`**
- **Chức năng**: HTML template gốc
- **Ý nghĩa**:
  - Chứa metadata (title, favicon, viewport)
  - Có thẻ `<div id="root">` để React mount vào
  - Link đến `main.jsx` để khởi tạo ứng dụng

---

### 📁 **src/** - Source Code Chính

#### **`src/main.jsx`**
- **Chức năng**: Entry point của ứng dụng React
- **Cách hoạt động**:
  1. Import React, ReactDOM, App component
  2. Import CSS global (`index.css`)
  3. Bọc App trong `<BrowserRouter>` để enable routing
  4. Sử dụng `React.StrictMode` để phát hiện potential problems
  5. Render vào DOM với `createRoot` API

#### **`src/App.jsx`**
- **Chức năng**: Component gốc của ứng dụng
- **Cách hoạt động**:
  - Import và render `RouteIndex` để handle routing
  - Import global CSS (`App.css`)
  - Có thể thêm ToastContainer, ErrorBoundary, etc.

#### **`src/index.css`** và **`src/App.css`**
- **Chức năng**: Global styles và component-specific styles
- **Ý nghĩa**: Định nghĩa CSS chung cho toàn ứng dụng

---

### 📁 **src/pages/** - Các Trang của Ứng Dụng

#### **`src/pages/Home/`** - Trang Chủ và Các Trang Liên Quan

**`Home.jsx`**
- **Chức năng**: Trang chủ chính của ứng dụng
- **Các component con**:
  - `Navigation`: Thanh điều hướng
  - `HomeBanner`: Banner chính với form tìm kiếm
  - `PopularRoutes`: Hiển thị các tuyến đường phổ biến
  - `PopularBusCompany`: Hiển thị các nhà xe phổ biến
  - `TopReviews`: Đánh giá top
  - `Boastcast`: Phần giới thiệu/quảng bá
  - `Footer`: Chân trang
  - `ChatBot`: Chatbot hỗ trợ

**`Navigation.jsx`**
- **Chức năng**: Component điều hướng chính
- **Ý nghĩa**: 
  - Logo và menu navigation
  - Links đến các trang khác
  - User authentication state (login/logout)
  - Responsive mobile menu

**`About/About.jsx`**
- **Chức năng**: Trang giới thiệu về công ty/dịch vụ
- **Nội dung**: Thông tin về ứng dụng, dịch vụ, liên hệ

**`Bus_company/Bus_Company.jsx`**
- **Chức năng**: Trang danh sách các nhà xe
- **Tính năng**:
  - Hiển thị danh sách nhà xe với pagination
  - Tìm kiếm và filter nhà xe
  - Link đến chi tiết từng nhà xe

**`BusCompanyDetail/BusCompanyDetail.jsx`**
- **Chức năng**: Trang chi tiết nhà xe
- **Tính năng**:
  - Thông tin chi tiết nhà xe (tên, mô tả, hình ảnh)
  - Danh sách xe của nhà xe
  - Đánh giá và reviews
  - Liên hệ và booking

**`Station/Station.jsx`**
- **Chức năng**: Trang danh sách bến xe
- **Tính năng**:
  - Hiển thị các bến xe
  - Tìm kiếm bến xe
  - Thông tin chi tiết từng bến xe

**`Route/Route.jsx`**
- **Chức năng**: Trang danh sách tuyến đường
- **Tính năng**:
  - Hiển thị các tuyến đường
  - Filter và search routes
  - Thông tin giá, thời gian, khoảng cách

**`Bus_list/BusList.jsx`**
- **Chức năng**: Trang danh sách xe khách sau khi search
- **Tính năng**:
  - Hiển thị danh sách xe khả dụng cho route đã chọn
  - Filter theo giá, thời gian, nhà xe
  - Sort options
  - Booking flow

**`Bus_list/components/SeatListModal.jsx`**
- **Chức năng**: Modal chọn ghế
- **Tính năng**:
  - Hiển thị layout ghế xe
  - Chọn ghế cho từng hành khách
  - Hiển thị ghế đã được đặt (disabled)
  - Tính toán giá tiền

**`Bus_list/components/PaymentModal.jsx`**
- **Chức năng**: Modal thanh toán
- **Tính năng**:
  - Form thông tin hành khách
  - Chọn phương thức thanh toán
  - Xác nhận đơn hàng
  - Xử lý payment

**`CarDetail/CarDetail.jsx`**
- **Chức năng**: Trang chi tiết xe
- **Tính năng**:
  - Thông tin chi tiết xe (hình ảnh, tiện ích, giá)
  - Lịch trình và routes
  - Reviews và đánh giá
  - Booking button

**`CheckTicket/CheckTicket.jsx`**
- **Chức năng**: Trang tra cứu vé
- **Tính năng**:
  - Form nhập mã vé hoặc thông tin để tra cứu
  - Hiển thị thông tin vé
  - Hủy vé, in vé

**`components/`** - Các Component Dùng Chung trong Home

**`HomeBanner.jsx`**
- **Chức năng**: Banner chính trên trang chủ
- **Tính năng**:
  - Form tìm kiếm vé (điểm đi, điểm đến, ngày đi, số người)
  - Submit để chuyển đến trang kết quả tìm kiếm

**`PopularRoutes.jsx`**
- **Chức năng**: Hiển thị các tuyến đường phổ biến
- **Tính năng**:
  - Carousel/slider các routes
  - Link đến trang chi tiết route

**`PopularBusCompany.jsx`**
- **Chức năng**: Hiển thị các nhà xe phổ biến
- **Tính năng**:
  - Grid/carousel các nhà xe
  - Link đến trang chi tiết nhà xe

**`TopReviews.jsx`**
- **Chức năng**: Hiển thị các đánh giá tốt nhất
- **Tính năng**:
  - Display reviews từ khách hàng
  - Rating stars

**`PupularStation.jsx`**
- **Chức năng**: Hiển thị các bến xe phổ biến
- **Tính năng**: List các bến xe với links

**`Boastcast.jsx`**
- **Chức năng**: Phần giới thiệu/quảng bá dịch vụ
- **Nội dung**: Features, benefits, promotions

**`Footer.jsx`**
- **Chức năng**: Chân trang website
- **Nội dung**:
  - Links hữu ích (tin tức, tuyến đường, nhà xe, bến xe)
  - Thông tin liên hệ
  - Social media links
  - Copyright

**`ChatBot.jsx`**
- **Chức năng**: Chatbot hỗ trợ khách hàng
- **Tính năng**:
  - Chat interface
  - Tích hợp với API chatbot
  - Auto-responses và hỗ trợ tìm kiếm

#### **`src/pages/Auth/`** - Authentication Pages

**`Login.jsx`**
- **Chức năng**: Trang đăng nhập
- **Tính năng**:
  - Form nhập email/username và password
  - Validation
  - Gọi API login
  - Lưu token vào localStorage
  - Redirect sau khi login thành công

**`Register.jsx`**
- **Chức năng**: Trang đăng ký tài khoản
- **Tính năng**:
  - Form đăng ký (tên, email, password, confirm password)
  - Validation
  - Gọi API register
  - Redirect đến login sau khi đăng ký thành công

---

### 📁 **src/layouts/** - Layout Components

**`Index.jsx`**
- **Chức năng**: Layout wrapper chung cho các trang
- **Cấu trúc**:
  - Header (navigation bar)
  - Main content area (`<Outlet />` từ React Router)
  - Footer
- **Ý nghĩa**: Đảm bảo consistency trong layout across pages

**`style.css`**
- **Chức năng**: Styles cho layout component
- **Nội dung**: CSS cho header, main, footer sections

---

### 📁 **src/routes/** - Routing Configuration

**`RouteIndex.jsx`**
- **Chức năng**: Định nghĩa tất cả routes của ứng dụng
- **Các routes**:
  - `/` → Home page
  - `/about` → About page
  - `/bus-company` → Bus company list
  - `/station` → Station list
  - `/route` → Route list
  - `/bus-list` → Bus list (search results)
  - `/check-ticket` → Check ticket page
  - `/login` → Login page
  - `/register` → Register page
  - `/car-detail/:id` → Car detail page (dynamic route)
  - `/bus-company-detail/:id` → Bus company detail (dynamic route)
- **Cách hoạt động**:
  1. Import các component pages
  2. Sử dụng `<Routes>` và `<Route>` từ React Router
  3. Map path với component tương ứng
  4. Sử dụng `:id` cho dynamic routes

---

### 📁 **src/services/** - API Services

**`base.api.url.js`**
- **Chức năng**: Định nghĩa base URL và tất cả API endpoints
- **Cấu trúc**:
  - `API_BASE_URL`: Base URL của backend API (http://localhost:5000)
  - `API_ENDPOINTS`: Object chứa tất cả endpoints:
    - Authentication endpoints (login, register, logout)
    - User management endpoints
    - Bus companies endpoints
    - Routes endpoints
    - Stations endpoints
    - Cars/Vehicles endpoints
    - Seats endpoints
    - Tickets endpoints
    - Reviews endpoints
    - Banners endpoints
    - Payment endpoints
    - Vehicle schedules endpoints
  - `HTTP_METHODS`: Constants cho HTTP methods
  - `API_STATUS`: Constants cho HTTP status codes
- **Ý nghĩa**: Centralized API configuration, dễ maintain và update

**`api.service.js`**
- **Chức năng**: Service class để handle tất cả API calls
- **Các methods chính**:
  - `getAuthToken()`: Lấy token từ localStorage
  - `setAuthToken(token)`: Lưu token vào localStorage
  - `getUserData()`: Lấy thông tin user từ localStorage
  - `getHeaders(includeAuth)`: Tạo headers cho request (include Authorization token)
  - `request(endpoint, options)`: Generic method để gọi API
  - `get()`, `post()`, `put()`, `delete()`: HTTP methods
  - Authentication methods (login, register, logout)
  - User CRUD methods
  - Bus company CRUD methods
  - Route CRUD methods
  - Station CRUD methods
  - Car CRUD methods
  - Seat CRUD methods
  - Ticket CRUD methods (booking, cancel, check status)
  - Review CRUD methods
  - Banner methods
  - Payment methods
  - Vehicle schedule methods
- **Cách hoạt động**:
  1. Mỗi method gọi `request()` với endpoint tương ứng
  2. Tự động thêm Authorization header nếu có token
  3. Handle errors và unauthorized (redirect to login)
  4. Return response data hoặc error

---

### 📁 **src/utils/** - Utility Functions

**`index.js`**
- **Chức năng**: Chứa các utility functions dùng chung
- **Các functions**:
  - `API_BASE_URL`: Export API base URL constant
  - `getImageUrl(imagePath)`: 
    - Convert relative image path thành full URL
    - Handle placeholder nếu không có image
    - Handle absolute URLs (http/https)
  - `createImageLoader(fallbackSrc)`: Tạo image loader với fallback
- **Ý nghĩa**: Reusable functions để tránh code duplication

---

## Công Nghệ Sử Dụng

### **Core Technologies**
- **React 18.2.0**: Frontend framework
- **React Router 6.30.1**: Client-side routing
- **Vite 5.1.4**: Build tool và dev server (nhanh hơn webpack)

### **UI Libraries**
- **Ant Design 5.25.2**: Component library
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **React Icons 5.5.0**: Icon library
- **Lucide React 0.545.0**: Icon library
- **Swiper 11.2.10**: Carousel/slider component
- **React Slick 0.30.3**: Carousel component

### **State Management**
- **Redux 5.0.1**: Global state management
- **React Redux 9.2.0**: React bindings for Redux
- **Redux Persist 6.0.0**: Persist Redux state to localStorage

### **HTTP Client**
- **Axios 1.9.0**: HTTP client (có thể sử dụng thay cho fetch API)

### **Utilities**
- **SweetAlert2 11.21.2**: Beautiful alerts/modals
- **Socket.io-client 4.8.1**: Real-time communication (cho chatbot)
- **React Scrollbars Custom 4.1.1**: Custom scrollbars
- **Markdown-it 14.1.0**: Markdown parser (cho editor)
- **@uiw/react-md-editor 4.0.8**: Markdown editor component

### **Styling**
- **SASS 1.90.0**: CSS preprocessor
- **PostCSS 8.5.6**: CSS post-processor
- **Autoprefixer 10.4.21**: Auto-add vendor prefixes

---

## Hướng Dẫn Cài Đặt và Chạy

### **Prerequisites**
- Node.js (v14 hoặc cao hơn)
- npm hoặc yarn package manager

### **Cài Đặt**

1. **Di chuyển vào thư mục dự án**:
   ```bash
   cd client/base-react
   ```

2. **Cài đặt dependencies**:
   ```bash
   npm install
   ```
   hoặc
   ```bash
   yarn install
   ```

### **Chạy Development Server**

```bash
npm run dev
```
hoặc
```bash
npm run start:dev
```

Server sẽ chạy tại `http://localhost:5173` (port mặc định của Vite)

### **Build cho Production**

```bash
npm run build
```

Output sẽ ở thư mục `dist/`

### **Preview Production Build**

```bash
npm run preview
```

### **Linting**

```bash
npm run lint
```

---

## API Integration

### **Cấu Hình API**

File `src/services/base.api.url.js` chứa cấu hình API:
- **Base URL**: `http://localhost:5000` (có thể thay đổi theo môi trường)
- Tất cả endpoints được định nghĩa trong `API_ENDPOINTS` object

### **Sử Dụng API Service**

```javascript
import ApiService from '../services/api.service.js';

// Tạo instance
const apiService = new ApiService();

// Gọi API
const response = await apiService.get('/routes');
if (response.success) {
  console.log(response.data);
}
```

### **Authentication Flow**

1. User login → `apiService.login(email, password)`
2. Token được lưu vào localStorage
3. Các request sau tự động include token trong header
4. Nếu token expired/unauthorized → redirect to login

### **Error Handling**

- API service tự động handle:
  - Unauthorized (401) → Clear auth data và redirect
  - Network errors → Return error object
  - Server errors → Log và return error

---

## Development Notes

### **State Management**
- Local state: React Hooks (useState, useEffect, useContext)
- Global state: Redux (đã có dependencies, có thể setup)
- Form state: Handled locally với validation

### **Routing**
- Sử dụng React Router v6
- Client-side routing (không reload page)
- Dynamic routes với `:id` parameter
- Protected routes có thể implement với authentication check

### **Styling Approach**
- Tailwind CSS cho utility classes
- Custom CSS cho complex components
- SASS cho styles phức tạp
- Responsive design với Tailwind breakpoints

### **Performance Optimization**
- Code splitting với React.lazy() (có thể implement)
- Image optimization (lazy loading)
- Efficient re-renders với React hooks
- Vite's fast HMR (Hot Module Replacement)

---

## 🧪 Chức Năng và Checklist Test

Phần này mô tả chi tiết các chức năng của ứng dụng và cách test từng chức năng.

### 📋 **1. Chức Năng Trang Chủ (Home Page)**

#### **1.1. Navigation Bar**
- [ ] **Hiển thị logo và menu**
  - Logo hiển thị đúng
  - Menu navigation hiển thị đầy đủ: Trang chủ, Về chúng tôi, Nhà xe, Bến xe, Tuyến đường, Tra cứu vé
  - Responsive: Menu mobile hiển thị đúng trên thiết bị di động

- [ ] **Xác thực người dùng**
  - Khi chưa đăng nhập: Hiển thị nút "Đăng nhập" và "Đăng ký"
  - Khi đã đăng nhập: Hiển thị tên người dùng và nút "Đăng xuất"
  - Click "Đăng xuất" → Xóa token, chuyển về trang chủ

#### **1.2. Home Banner (Form Tìm Kiếm)**
- [ ] **Form tìm kiếm vé**
  - Dropdown chọn điểm đi: Load danh sách bến xe từ API
  - Dropdown chọn điểm đến: Load danh sách bến xe từ API
  - Date picker chọn ngày đi: Chọn ngày hợp lệ (không chọn ngày quá khứ)
  - Nút "Tìm kiếm" hoạt động đúng

- [ ] **Validation**
  - Submit form trống → Hiển thị thông báo lỗi
  - Chọn điểm đi và điểm đến giống nhau → Hiển thị cảnh báo
  - Chọn ngày quá khứ → Hiển thị cảnh báo

- [ ] **Chuyển hướng**
  - Submit form hợp lệ → Chuyển đến `/bus-list` với query params đúng

#### **1.3. Popular Routes (Tuyến Đường Phổ Biến)**
- [ ] **Hiển thị danh sách tuyến đường**
  - Load danh sách từ API endpoint `/getPopularRoute`
  - Hiển thị đúng thông tin: Điểm đi, điểm đến, giá, hình ảnh
  - Click vào tuyến đường → Chuyển đến trang chi tiết hoặc tìm kiếm

#### **1.4. Popular Bus Company (Nhà Xe Phổ Biến)**
- [ ] **Hiển thị danh sách nhà xe**
  - Load danh sách từ API
  - Hiển thị logo, tên nhà xe
  - Click vào nhà xe → Chuyển đến `/bus-company-detail/:id`

#### **1.5. Top Reviews (Đánh Giá Tốt Nhất)**
- [ ] **Hiển thị đánh giá**
  - Load danh sách từ API endpoint `/getTopReview`
  - Hiển thị: Tên người đánh giá, rating (sao), nội dung đánh giá
  - Carousel/slider hoạt động mượt mà

#### **1.6. ChatBot**
- [ ] **Mở/đóng chatbot**
  - Click icon chatbot → Mở cửa sổ chat
  - Click nút đóng → Đóng cửa sổ chat
  - Hiển thị tin nhắn chào mừng khi mở lần đầu

- [ ] **Tương tác chatbot**
  - Gửi tin nhắn → Hiển thị loading state
  - Nhận phản hồi từ API chatbot
  - Hiển thị kết quả tìm kiếm (nếu có) dưới dạng card
  - Click vào card xe → Chuyển đến trang chi tiết xe

#### **1.7. Footer**
- [ ] **Hiển thị thông tin**
  - Links hữu ích: Tin tức, Tuyến đường, Nhà xe, Bến xe
  - Thông tin liên hệ
  - Social media links
  - Copyright information

---

### 🔐 **2. Chức Năng Xác Thực (Authentication)**

#### **2.1. Đăng Ký (Register)**
- [ ] **Form đăng ký**
  - Input: Họ tên, Email, Mật khẩu, Xác nhận mật khẩu
  - Validation:
    - Email format hợp lệ
    - Mật khẩu tối thiểu 6 ký tự
    - Xác nhận mật khẩu khớp với mật khẩu
  - Hiển thị lỗi validation rõ ràng

- [ ] **Submit đăng ký**
  - Gọi API `/auth/register`
  - Thành công → Hiển thị thông báo → Redirect đến trang Login
  - Thất bại → Hiển thị thông báo lỗi (email đã tồn tại, etc.)

#### **2.2. Đăng Nhập (Login)**
- [ ] **Form đăng nhập**
  - Input: Email, Mật khẩu
  - Nút "Hiển thị/Ẩn mật khẩu" hoạt động
  - Validation: Email và mật khẩu không được trống

- [ ] **Submit đăng nhập**
  - Gọi API `/auth/login`
  - Thành công:
    - Lưu token vào localStorage
    - Lưu thông tin user vào localStorage
    - Hiển thị thông báo thành công
    - Redirect về trang chủ
  - Thất bại → Hiển thị thông báo lỗi (sai email/mật khẩu)

- [ ] **Trạng thái đăng nhập**
  - Sau khi đăng nhập → Navigation bar hiển thị tên user
  - Token được tự động thêm vào các API request sau

#### **2.3. Đăng Xuất (Logout)**
- [ ] **Chức năng đăng xuất**
  - Click nút "Đăng xuất" trong Navigation
  - Gọi API `/auth/logout`
  - Xóa token và user data khỏi localStorage
  - Redirect về trang chủ
  - Navigation bar hiển thị lại nút "Đăng nhập"

---

### 🔍 **3. Chức Năng Tìm Kiếm và Danh Sách Xe**

#### **3.1. Trang Danh Sách Xe (Bus List)**
- [ ] **Load dữ liệu từ URL params**
  - Đọc `departure`, `destination`, `departureDate` từ query string
  - Tự động load danh sách xe theo filters
  - Hiển thị loading state khi đang fetch

- [ ] **Hiển thị danh sách xe**
  - Mỗi xe hiển thị:
    - Hình ảnh xe
    - Tên nhà xe
    - Thời gian khởi hành
    - Thời gian đến
    - Giá vé
    - Số ghế trống
    - Tiện ích (WiFi, điều hòa, etc.)

- [ ] **Filter và Sort**
  - Filter theo:
    - Nhà xe (dropdown)
    - Khoảng giá (slider hoặc input)
    - Thời gian khởi hành
  - Sort theo:
    - Giá tăng dần/giảm dần
    - Thời gian khởi hành
  - Khi thay đổi filter/sort → Reload danh sách

- [ ] **Pagination**
  - Hiển thị số trang
  - Click trang → Load dữ liệu trang mới
  - Hiển thị số lượng kết quả

#### **3.2. Chọn Xe và Ghế**
- [ ] **Button "Chọn ghế"**
  - Click "Chọn ghế" → Mở modal `SeatListModal`
  - Modal hiển thị thông tin xe: Tên, thời gian, giá

- [ ] **Modal Chọn Ghế**
  - Load danh sách ghế từ API `/seats/:busId`
  - Hiển thị layout ghế:
    - Ghế trống (Available) → Có thể click
    - Ghế đã đặt (Occupied) → Disabled, màu xám
    - Ghế đang chọn → Highlight
  - Click ghế → Toggle select/deselect
  - Hiển thị thông tin:
    - Số ghế đã chọn
    - Tổng tiền (giá × số ghế)

- [ ] **Button "Đặt vé" trong modal ghế**
  - Click "Đặt vé" → Gọi API tạo ticket
  - Thành công → Mở modal `PaymentModal`
  - Thất bại → Hiển thị thông báo lỗi

---

### 💳 **4. Chức Năng Thanh Toán**

#### **4.1. Modal Thanh Toán (Payment Modal)**
- [ ] **Hiển thị thông tin vé**
  - Thông tin hành khách
  - Thông tin chuyến đi (điểm đi, điểm đến, thời gian)
  - Ghế đã chọn
  - Tổng tiền

- [ ] **Form thông tin hành khách**
  - Input: Họ tên, Số điện thoại, Email
  - Validation: Tất cả fields bắt buộc, email format hợp lệ

- [ ] **Thông tin thanh toán**
  - Hiển thị QR code để quét (nếu có)
  - Thông tin tài khoản ngân hàng:
    - Ngân hàng
    - Số tài khoản
    - Tên chủ tài khoản
    - Nội dung chuyển khoản (mã đơn hàng)
    - Số tiền

- [ ] **Kiểm tra thanh toán**
  - Click "Đã thanh toán" → Bắt đầu polling
  - Polling gọi API `/tickets/payment/status/:ticketId` mỗi vài giây
  - Khi status = "BOOKED" → Hiển thị thông báo thành công → Đóng modal
  - Nút "Hủy" → Dừng polling, đóng modal

---

### 📄 **5. Chức Năng Tra Cứu Vé**

#### **5.1. Trang Tra Cứu Vé (Check Ticket)**
- [ ] **Kiểm tra đăng nhập**
  - Chưa đăng nhập → Hiển thị thông báo yêu cầu đăng nhập
  - Đã đăng nhập → Tự động load danh sách vé của user

- [ ] **Hiển thị danh sách vé**
  - Load từ API `/tickets/history` (hoặc endpoint tương ứng)
  - Mỗi vé hiển thị:
    - Mã vé
    - Thông tin chuyến đi (điểm đi, điểm đến)
    - Ngày giờ khởi hành
    - Số ghế
    - Trạng thái (Đã xác nhận, Đang chờ, Đã hủy)
    - Giá vé

- [ ] **Filter và Search**
  - Filter theo trạng thái
  - Search theo mã vé hoặc điểm đến

- [ ] **Chức năng hủy vé**
  - Click "Hủy vé" → Hiển thị xác nhận
  - Xác nhận → Gọi API `/tickets/:ticketId/cancel`
  - Thành công → Cập nhật trạng thái vé

- [ ] **In/Download vé**
  - Click "In vé" → Hiển thị thông tin chi tiết vé
  - Có thể in hoặc download PDF (nếu có)

---

###  **6. Chức Năng Xem Chi Tiết**

#### **6.1. Trang Chi Tiết Xe (Car Detail)**
- [ ] **Load thông tin xe**
  - Load từ API `/cars/:id`
  - Hiển thị:
    - Hình ảnh xe (carousel/slider)
    - Tên xe, biển số
    - Thông tin nhà xe (link đến trang chi tiết nhà xe)
    - Tiện ích (WiFi, điều hòa, ổ cắm, etc.)
    - Số ghế
    - Giá vé

- [ ] **Lịch trình xe**
  - Hiển thị các chuyến xe sắp tới
  - Thông tin: Điểm đi, điểm đến, thời gian khởi hành, giá

- [ ] **Đánh giá và reviews**
  - Hiển thị danh sách đánh giá từ khách hàng
  - Rating trung bình
  - Nội dung đánh giá

- [ ] **Chọn ghế và đặt vé**
  - Click "Chọn ghế" → Mở modal chọn ghế (tương tự Bus List)
  - Quy trình đặt vé giống như từ trang Bus List

#### **6.2. Trang Chi Tiết Nhà Xe (Bus Company Detail)**
- [ ] **Load thông tin nhà xe**
  - Load từ API `/bus-companies/:id`
  - Hiển thị:
    - Logo nhà xe
    - Tên nhà xe
    - Mô tả
    - Thông tin liên hệ (địa chỉ, số điện thoại, email)
    - Hình ảnh giới thiệu

- [ ] **Danh sách xe của nhà xe**
  - Load từ API `/cars/company/:companyId`
  - Hiển thị danh sách xe với card
  - Click vào xe → Chuyển đến trang chi tiết xe

- [ ] **Đánh giá nhà xe**
  - Hiển thị rating trung bình
  - Danh sách reviews

---

### 📋 **7. Chức Năng Danh Sách**

#### **7.1. Trang Danh Sách Nhà Xe (Bus Company)**
- [ ] **Hiển thị danh sách nhà xe**
  - Load từ API `/bus-companies`
  - Hiển thị dạng grid hoặc list
  - Mỗi nhà xe: Logo, tên, rating, số lượng xe

- [ ] **Tìm kiếm và filter**
  - Search box: Tìm theo tên nhà xe
  - Filter theo rating
  - Sort theo tên, rating

- [ ] **Pagination**
  - Phân trang danh sách
  - Hiển thị số lượng kết quả

- [ ] **Click vào nhà xe**
  - Chuyển đến `/bus-company-detail/:id`

#### **7.2. Trang Danh Sách Bến Xe (Station)**
- [ ] **Hiển thị danh sách bến xe**
  - Load từ API `/stations`
  - Hiển thị: Tên bến xe, địa chỉ, hình ảnh

- [ ] **Tìm kiếm bến xe**
  - Search box
  - Filter theo tỉnh/thành phố

- [ ] **Chi tiết bến xe**
  - Click vào bến xe → Hiển thị thông tin chi tiết
  - Danh sách các tuyến đường từ bến xe

#### **7.3. Trang Danh Sách Tuyến Đường (Route)**
- [ ] **Hiển thị danh sách tuyến đường**
  - Load từ API `/routes`
  - Hiển thị: Điểm đi, điểm đến, khoảng cách, thời gian di chuyển

- [ ] **Tìm kiếm và filter**
  - Search theo điểm đi/điểm đến
  - Filter theo khoảng cách, thời gian

- [ ] **Click vào tuyến đường**
  - Chuyển đến trang tìm kiếm xe với tuyến đường đã chọn

---

### 📱 **8. Responsive và UI/UX**

#### **8.1. Responsive Design**
- [ ] **Mobile (< 768px)**
  - Navigation: Menu hamburger hoạt động
  - Form tìm kiếm: Layout stack vertical
  - Danh sách: Hiển thị 1 cột
  - Modal: Full screen hoặc chiếm toàn bộ width

- [ ] **Tablet (768px - 1024px)**
  - Layout 2 cột
  - Menu có thể collapse

- [ ] **Desktop (> 1024px)**
  - Layout đầy đủ
  - Menu horizontal
  - Grid layout cho danh sách

#### **8.2. Loading States**
- [ ] **Hiển thị loading**
  - Khi fetch API → Hiển thị spinner/loading indicator
  - Disable button khi đang xử lý
  - Skeleton screens cho danh sách

#### **8.3. Error Handling**
- [ ] **Xử lý lỗi**
  - API error → Hiển thị thông báo lỗi rõ ràng
  - Network error → Thông báo mất kết nối
  - 404 → Hiển thị trang không tìm thấy
  - Unauthorized (401) → Redirect đến trang login

---

### 🎯 **9. Test Cases Tổng Hợp**

#### **9.1. Flow Đặt Vé Hoàn Chỉnh**
1. [ ] Truy cập trang chủ
2. [ ] Điền form tìm kiếm (điểm đi, điểm đến, ngày)
3. [ ] Click "Tìm kiếm" → Chuyển đến trang Bus List
4. [ ] Chọn một xe → Click "Chọn ghế"
5. [ ] Chọn ghế trong modal
6. [ ] Click "Đặt vé" → Mở modal thanh toán
7. [ ] Điền thông tin hành khách
8. [ ] Click "Đã thanh toán" → Polling kiểm tra thanh toán
9. [ ] Sau khi thanh toán thành công → Vé được tạo
10. [ ] Kiểm tra vé trong trang "Tra cứu vé"

#### **9.2. Flow Đăng Ký và Đăng Nhập**
1. [ ] Click "Đăng ký" → Điền form đăng ký
2. [ ] Submit → Tạo tài khoản thành công
3. [ ] Redirect đến trang Login
4. [ ] Đăng nhập với tài khoản vừa tạo
5. [ ] Kiểm tra Navigation hiển thị tên user
6. [ ] Truy cập trang "Tra cứu vé" → Xem được danh sách vé

#### **9.3. Flow Xem Chi Tiết**
1. [ ] Trang chủ → Click vào một nhà xe phổ biến
2. [ ] Chuyển đến trang chi tiết nhà xe
3. [ ] Click vào một xe trong danh sách
4. [ ] Chuyển đến trang chi tiết xe
5. [ ] Xem thông tin, lịch trình, đánh giá
6. [ ] Click "Chọn ghế" → Đặt vé (tương tự flow trên)

---

### 📝 **Ghi Chú Test**

#### **Môi Trường Test**
- **Backend API**: Đảm bảo backend đang chạy tại `http://localhost:5000`
- **Database**: Đảm bảo database có dữ liệu test (bến xe, nhà xe, xe, tuyến đường)
- **Browser**: Test trên Chrome, Firefox, Safari, Edge
- **Devices**: Test trên desktop, tablet, mobile

#### **Dữ Liệu Test Cần Có**
- Ít nhất 2 tài khoản user (để test đăng nhập)
- Ít nhất 3-5 bến xe
- Ít nhất 3-5 nhà xe
- Ít nhất 5-10 xe
- Ít nhất 5-10 tuyến đường
- Một số lịch trình xe (vehicle schedules)
- Một số vé đã đặt (để test tra cứu)

#### **Các Lỗi Thường Gặp và Cách Fix**
- **CORS Error**: Kiểm tra backend CORS settings
- **API 404**: Kiểm tra API endpoint và base URL
- **Token expired**: Đăng nhập lại
- **Loading không dừng**: Kiểm tra API response format
- **Image không load**: Kiểm tra đường dẫn image và API upload

---

## Future Enhancements

- [ ] Implement Redux store cho global state
- [ ] Add Protected Routes với authentication middleware
- [ ] Implement code splitting và lazy loading
- [ ] Add Unit tests và Integration tests
- [ ] Add Error Boundaries
- [ ] Implement PWA features
- [ ] Add Internationalization (i18n)
- [ ] Optimize bundle size
- [ ] Add SEO optimization
- [ ] Implement offline support

---

## License

This project is licensed under the MIT License. 
