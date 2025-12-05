export interface AssessmentCriteria {
  score: number; // 0-100
  title: string;
  description: string;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

export interface QuestionImprovement {
  questionId: string;
  issue: string;
  suggestion: string;
}

export interface AnalysisResult {
  overallScore: number;
  bloomsLevel: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  questionImprovements: QuestionImprovement[];
  criteriaBreakdown: {
    realContext: AssessmentCriteria; // 真實情境
    problemSolving: AssessmentCriteria; // 問題解決
    interdisciplinary: AssessmentCriteria; // 跨領域/學科素養
    technicalQuality: AssessmentCriteria; // 一般命題原則
    editorialQuality: AssessmentCriteria; // 文句與格式檢核
    contentReview: AssessmentCriteria; // 內容審查(善良風俗/邏輯/價值觀)
  };
}

export interface QuestionInput {
  text: string;
  file: File | null;
  filePreview: string | null;
  fileType: 'image' | 'pdf' | null;
}