# Reading & Listening Exam APIs

Tài liệu này mô tả các API mới được thêm vào để hỗ trợ chức năng làm bài thi Reading và Listening.

## 📚 Reading Exam APIs

### 1. Lấy đề thi Reading để làm bài
```
GET /api/ReadingExam/examset/{examSetId}/take-exam
```

**Response:**
```json
{
  "examSetId": 1,
  "examTitle": "IELTS Reading Test 1",
  "examCode": "RS_20241201120000",
  "readingContext": "Reading passage content...",
  "readingImage": "/images/reading1.jpg",
  "totalQuestions": 10,
  "timeLimit": 60,
  "questions": [
    {
      "questionId": 1,
      "questionNumber": 1,
      "questionText": "What is the main topic of the passage?",
      "questionType": "multiple_choice",
      "options": [
        { "value": "A", "text": "Option A" },
        { "value": "B", "text": "Option B" },
        { "value": "C", "text": "Option C" },
        { "value": "D", "text": "Option D" }
      ],
      "points": 1
    }
  ]
}
```

### 2. Nộp bài Reading
```
POST /api/ReadingExam/submit
```

**Request Body:**
```json
{
  "userId": 1,
  "examSetId": 1,
  "examCourseId": 1,
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A"
    },
    {
      "questionId": 2,
      "fillAnswer": "climate change"
    }
  ],
  "timeSpent": 1800,
  "submittedAt": "2024-12-01T12:00:00Z"
}
```

**Response:**
```json
{
  "submissionId": 123,
  "userId": 1,
  "examSetId": 1,
  "examCourseId": 1,
  "examType": "reading",
  "answers": [...],
  "timeSpent": 1800,
  "submittedAt": "2024-12-01T12:00:00Z",
  "score": 85.5,
  "correctAnswers": 8,
  "totalQuestions": 10,
  "questionResults": [
    {
      "questionId": 1,
      "userAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true,
      "points": 1
    }
  ],
  "status": "submitted"
}
```

### 3. Xem kết quả bài Reading
```
GET /api/ReadingExam/result/{submissionId}
```

## 🎧 Listening Exam APIs

### 1. Lấy đề thi Listening để làm bài
```
GET /api/ListeningExam/examset/{examSetId}/take-exam
```

**Response:**
```json
{
  "examSetId": 1,
  "examTitle": "IELTS Listening Test 1",
  "examCode": "LS_20241201120000",
  "listeningImage": "/images/listening1.jpg",
  "totalQuestions": 10,
  "timeLimit": 40,
  "questions": [
    {
      "questionId": 1,
      "questionNumber": 1,
      "questionText": "What does the speaker say about...?",
      "questionType": "multiple_choice",
      "audioUrl": "/uploads/audio/question1.mp3",
      "options": [
        { "value": "A", "text": "Option A" },
        { "value": "B", "text": "Option B" },
        { "value": "C", "text": "Option C" },
        { "value": "D", "text": "Option D" }
      ],
      "points": 1
    }
  ]
}
```

### 2. Nộp bài Listening
```
POST /api/ListeningExam/submit
```

**Request Body:** (Tương tự như Reading)

### 3. Xem kết quả bài Listening
```
GET /api/ListeningExam/result/{submissionId}
```

## 📋 General Exam APIs

### 1. Lấy danh sách tất cả bài thi có sẵn
```
GET /api/Exam/available
```

**Response:**
```json
{
  "reading": [...],
  "listening": [...],
  "speaking": [...],
  "writing": [...],
  "summary": {
    "totalReading": 5,
    "totalListening": 3,
    "totalSpeaking": 2,
    "totalWriting": 4,
    "totalExams": 14
  }
}
```

### 2. Lấy bài thi theo khóa học
```
GET /api/Exam/course/{courseId}
```

## 🔧 Tính năng chính

### ✅ Chấm điểm tự động
- **Reading & Listening**: Chấm điểm tự động dựa trên đáp án đúng
- **Multiple Choice**: So sánh chính xác (A, B, C, D)
- **Fill-in-the-blank**: So sánh linh hoạt, hỗ trợ nhiều đáp án đúng
- **Tính điểm phần trăm**: (Số câu đúng / Tổng số câu) × 100

### ✅ Lưu trữ kết quả
- Lưu submission vào database
- Lưu chi tiết từng câu trả lời
- Lưu thời gian làm bài
- Lưu điểm số và trạng thái

### ✅ Xem kết quả chi tiết
- Điểm tổng kết
- Số câu đúng/sai
- Chi tiết từng câu hỏi
- Đáp án đúng và đáp án của học viên

### ✅ Hỗ trợ nhiều loại câu hỏi
- **Multiple Choice**: Chọn A, B, C, D
- **Fill-in-the-blank**: Điền từ vào chỗ trống
- **Audio files**: Phát audio cho Listening

## 🚀 Cách sử dụng

### Frontend Integration

1. **Lấy đề thi:**
```javascript
const response = await fetch('/api/ReadingExam/examset/1/take-exam');
const examData = await response.json();
```

2. **Nộp bài:**
```javascript
const submission = {
  userId: 1,
  examSetId: 1,
  examCourseId: 1,
  answers: [
    { questionId: 1, selectedAnswer: "A" },
    { questionId: 2, fillAnswer: "climate change" }
  ],
  timeSpent: 1800,
  submittedAt: new Date().toISOString()
};

const response = await fetch('/api/ReadingExam/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(submission)
});
```

3. **Xem kết quả:**
```javascript
const response = await fetch('/api/ReadingExam/result/123');
const result = await response.json();
```

## 📝 Lưu ý

- **Time Limit**: Reading (60 phút), Listening (40 phút)
- **Scoring**: Tự động chấm điểm ngay sau khi nộp bài
- **Validation**: Kiểm tra dữ liệu đầu vào trước khi xử lý
- **Error Handling**: Xử lý lỗi và trả về thông báo rõ ràng
- **Database**: Tự động lưu kết quả vào bảng Submissions

## 🔄 Workflow

1. Học viên chọn bài thi từ danh sách
2. Frontend gọi API lấy đề thi
3. Học viên làm bài và nộp
4. Backend chấm điểm tự động
5. Lưu kết quả vào database
6. Trả về kết quả chi tiết cho học viên
7. Học viên có thể xem lại kết quả bất kỳ lúc nào
