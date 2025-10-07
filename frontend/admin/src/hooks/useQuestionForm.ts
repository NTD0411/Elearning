import { useState } from 'react';

export type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

interface BaseQuestionDto {
  examSetId?: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answerFill?: string;
  correctAnswer: string;
}

export function useQuestionForm<T extends BaseQuestionDto>(initialData: T) {
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [optionCount, setOptionCount] = useState(4);
  const [formData, setFormData] = useState<T>(initialData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    // Reset form data when changing question type
    setFormData(prev => ({
      ...prev,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      answerFill: '',
      correctAnswer: ''
    }));
    
    // Set default option count based on type
    if (type === 'true-false') {
      setOptionCount(2);
    } else if (type === 'fill-blank') {
      setOptionCount(0);
    } else {
      setOptionCount(4);
    }
  };

  const handleOptionCountChange = (count: number) => {
    setOptionCount(count);
    // Clear options beyond the selected count
    const newFormData = { ...formData };
    if (count < 4) newFormData.optionD = '';
    if (count < 3) newFormData.optionC = '';
    if (count < 2) newFormData.optionB = '';
    setFormData(newFormData);
  };

  const getOptionLetters = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters.slice(0, optionCount);
  };

  const prepareSubmitData = (data: T) => {
    const submitData = { ...data };
    
    if (questionType === 'fill-blank') {
      // For fill-in-blank, clear multiple choice options
      submitData.optionA = '';
      submitData.optionB = '';
      submitData.optionC = '';
      submitData.optionD = '';
    } else if (questionType === 'true-false') {
      // For true/false, set fixed options
      submitData.optionA = 'True';
      submitData.optionB = 'False';
      submitData.optionC = '';
      submitData.optionD = '';
      submitData.answerFill = '';
    } else {
      // For multiple choice, clear fill answer
      submitData.answerFill = '';
    }
    
    return submitData;
  };

  const resetForm = () => {
    setFormData(initialData);
    setQuestionType('multiple-choice');
    setOptionCount(4);
  };

  return {
    loading,
    setLoading,
    questionType,
    setQuestionType,
    optionCount,
    setOptionCount,
    formData,
    setFormData,
    resetForm,
    handleInputChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    getOptionLetters,
    prepareSubmitData
  };
}