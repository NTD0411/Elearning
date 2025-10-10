import { redirect } from 'next/navigation';

// Redirect từ /courses về /courses/all hoặc page courses chính
export default function CoursesPage() {
  redirect('/courses/all');
}