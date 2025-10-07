# API Guide: Tạo Reading Exam Set với Context và Image

## 📋 Tóm tắt thay đổi

### ✅ Đã cập nhật:
1. **CreateExamSetRequest** - Thêm các trường:
   - `ReadingContext` (string, nullable) - Nội dung đọc hiểu
   - `ReadingImage` (string, nullable) - Đường dẫn hình ảnh

2. **POST /api/ExamSet/reading** - Hỗ trợ tạo Reading Exam Set với context và image

3. **GET /api/ExamSet/reading** - Trả về danh sách với ReadingContext và ReadingImage

4. **GET /api/ExamSet/Reading/{id}** - Trả về chi tiết với readingContext và readingImage

5. **POST /api/Upload/image** - Upload image cho reading exam set

## 🚀 Cách sử dụng API

### 1. Upload Image (Optional)

**POST** `/api/Upload/image`

**Request:** `multipart/form-data`
```
Content-Type: multipart/form-data
file: [IMAGE_FILE]
```

**Response:**
```json
{
  "url": "https://localhost:7139/uploads/images/12345678-1234-1234-1234-123456789abc.jpg"
}
```

**Supported formats:** JPEG, JPG, PNG, GIF, WEBP (max 10MB)

### 2. Tạo Reading Exam Set mới

**POST** `/api/ExamSet/reading`

```json
{
  "title": "IELTS Reading Practice Test 1",
  "targetQuestions": 10,
  "readingContext": "The Industrial Revolution, which began in Britain in the late 18th century, marked a major turning point in human history. It was characterized by the transition from manual labor and animal-based economy to machine-based manufacturing...",
  "readingImage": "https://localhost:7139/uploads/images/12345678-1234-1234-1234-123456789abc.jpg"
}
```

**Response:**
```json
{
  "examSetId": 1,
  "examSetCode": "RS_20251007042500",
  "examSetTitle": "IELTS Reading Practice Test 1",
  "totalQuestions": 10,
  "readingContext": "The Industrial Revolution...",
  "readingImage": "https://localhost:7139/uploads/images/12345678-1234-1234-1234-123456789abc.jpg",
  "createdAt": "2025-10-07T04:25:00.000Z"
}
```

### 2. Lấy danh sách Reading Exam Sets

**GET** `/api/ExamSet/reading`

**Response:**
```json
[
  {
    "examSetId": 1,
    "examSetTitle": "IELTS Reading Practice Test 1",
    "examSetCode": "RS_20251007042500",
    "createdAt": "2025-10-07T04:25:00.000Z",
    "totalQuestions": 10,
    "readingContext": "The passage about climate change...",
    "readingImage": "/uploads/reading-images/climate-change-chart.jpg",
    "questionCount": 5,
    "type": "Reading"
  }
]
```

### 3. Lấy chi tiết Reading Exam Set

**GET** `/api/ExamSet/Reading/{id}`

**Response:**
```json
{
  "id": 1,
  "code": "RS_20251007042500",
  "name": "IELTS Reading Practice Test 1",
  "description": "",
  "targetQuestions": 10,
  "readingContext": "The passage about climate change...",
  "readingImage": "/uploads/reading-images/climate-change-chart.jpg",
  "questionCount": 5,
  "createdAt": "2025-10-07T04:25:00.000Z",
  "type": "Reading"
}
```

## 📝 Lưu ý cho Frontend

1. **ReadingContext**: Có thể chứa HTML để format text (paragraph, bold, italic, etc.)
2. **ReadingImage**: Đường dẫn tương đối hoặc tuyệt đối đến file ảnh
3. **Upload Image**: Sử dụng `/api/Upload` endpoint để upload image trước khi tạo exam set
4. **Validation**: Cả hai trường đều nullable, không bắt buộc

## 🔗 Workflow Recommended cho Frontend

### Form "Create Reading Exam Set" cần có:

1. **Exam Type Selection**: Radio buttons (Reading được chọn sẵn)
2. **Exam Set Title**: Text input (required)
3. **Target Number of Questions**: Dropdown hoặc number input
4. **Reading Context**: Large textarea với rich text editor
5. **Image Upload**: File input với preview
6. **Create Button**: Submit form

### Workflow thực hiện:

1. **User nhập thông tin cơ bản:**
   - Title: "IELTS Reading Practice Test 1"
   - Target Questions: 10

2. **User nhập Reading Context:**
   ```
   Textarea với placeholder:
   "Enter the reading passage here. This will be the text that students read before answering questions..."
   ```

3. **User upload image (optional):**
   - Click "Choose File" button
   - Select image file
   - Call `POST /api/Upload/image`
   - Show preview image
   - Store returned URL

4. **User submit form:**
   ```javascript
   const formData = {
     title: "IELTS Reading Practice Test 1",
     targetQuestions: 10,
     readingContext: "The Industrial Revolution...",
     readingImage: "https://localhost:7139/uploads/images/abc123.jpg" // từ upload
   }
   
   // Call API
   POST /api/ExamSet/reading
   ```

5. **Success:**
   - Show success message
   - Redirect to exam set details or question creation page