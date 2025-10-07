// DTOs for ExamCourse API communication

export interface ExamCourseDto {
  examCourseId: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  examType: string;
  createdAt: string;
  readingExamSetsCount: number;
  listeningExamSetsCount: number;
  speakingExamSetsCount: number;
  writingExamSetsCount: number;
  totalExamSets: number;
}

export interface CreateExamCourseDto {
  courseTitle: string;
  courseCode?: string;
  description?: string;
  examType: string;
  examSetIds: number[];
}

export interface UpdateExamCourseDto {
  courseTitle: string;
  description: string;
  examSetIds: number[];
}

export interface DeleteExamCourseDto {
  examCourseId: number;
  forceDelete?: boolean;
  reason?: string;
}

export interface ExamSetSummaryDto {
  examSetId: number;
  examSetTitle: string;
  examSetCode: string;
  totalQuestions: number;
  questionCount: number;
  type: string;
}

export interface ExamCourseDetailDto {
  examCourseId: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  examType: string;
  createdAt: string;
  readingExamSets: ExamSetSummaryDto[];
  listeningExamSets: ExamSetSummaryDto[];
  speakingExamSets: ExamSetSummaryDto[];
  writingExamSets: ExamSetSummaryDto[];
}

export interface DeleteResultDto {
  success: boolean;
  message: string;
  deletedExamCourseId: number;
  deletedSubmissionsCount: number;
  deletedAssignmentsCount: number;
  deletedAt: string;
}

// Type aliases for convenience
export type ExamType = 'reading' | 'listening' | 'speaking' | 'writing';
export type ExamCourse = ExamCourseDto; // For backward compatibility
export type ExamSet = ExamSetSummaryDto; // For backward compatibility