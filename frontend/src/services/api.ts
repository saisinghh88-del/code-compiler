import {
  AnalysisResponse,
  ExecutionResponse,
  AITutorResponse,
  LanguageItem,
  CourseItem,
  QuizAnswerResult,
  ProblemItem,
  ProblemSubmissionResponse,
  ProjectItem,
  Diagnostic
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = null;

  setAuthToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Failed to reach backend health endpoint.');
    return res.json();
  }

  async getLanguages(): Promise<LanguageItem[]> {
    const res = await fetch(`${API_BASE_URL}/languages`);
    if (!res.ok) throw new Error('Failed to fetch languages.');
    return res.json();
  }

  async analyzeCode(language: string, source_code: string): Promise<AnalysisResponse> {
    const res = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ language, source_code }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Static analysis request failed.');
    }
    return res.json();
  }

  async executeCode(
    language: string,
    source_code: string,
    stdin: string = '',
    skip_preflight: boolean = false
  ): Promise<ExecutionResponse> {
    const res = await fetch(`${API_BASE_URL}/execute`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        language,
        source_code,
        stdin,
        skip_preflight
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Execution request failed.');
    }
    return res.json();
  }

  async getAITutor(
    action: 'explain_diagnostic' | 'get_hint' | 'explain_code' | 'suggest_fix',
    language: string,
    source_code: string,
    diagnostic?: Diagnostic,
    hint_level: number = 1,
    context?: string
  ): Promise<AITutorResponse> {
    const res = await fetch(`${API_BASE_URL}/ai/tutor`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        action,
        language,
        source_code,
        diagnostic,
        hint_level,
        context
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'AI Tutor request failed.');
    }
    return res.json();
  }

  async getCourses(): Promise<CourseItem[]> {
    const res = await fetch(`${API_BASE_URL}/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses.');
    return res.json();
  }

  async getCourse(slug: string): Promise<CourseItem> {
    const res = await fetch(`${API_BASE_URL}/courses/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch course '${slug}'.`);
    return res.json();
  }

  async submitQuiz(courseSlug: string, quizId: string, selectedOptionIndex: number): Promise<QuizAnswerResult> {
    const res = await fetch(`${API_BASE_URL}/courses/${courseSlug}/quiz`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        quiz_id: quizId,
        selected_option_index: selectedOptionIndex
      }),
    });
    if (!res.ok) throw new Error('Failed to submit quiz answer.');
    return res.json();
  }

  async getProblems(): Promise<ProblemItem[]> {
    const res = await fetch(`${API_BASE_URL}/problems`);
    if (!res.ok) throw new Error('Failed to fetch challenge problems.');
    return res.json();
  }

  async getProblem(slug: string): Promise<ProblemItem> {
    const res = await fetch(`${API_BASE_URL}/problems/${slug}`);
    if (!res.ok) throw new Error(`Failed to fetch problem '${slug}'.`);
    return res.json();
  }

  async submitProblem(problemId: string, language: string, source_code: string): Promise<ProblemSubmissionResponse> {
    const res = await fetch(`${API_BASE_URL}/problems/${problemId}/submit`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ language, source_code }),
    });
    if (!res.ok) throw new Error('Failed to evaluate problem submission.');
    return res.json();
  }

  async getProjects(): Promise<ProjectItem[]> {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch projects.');
    return res.json();
  }

  async createProject(
    title: string,
    description: string,
    language: string,
    source_code: string,
    is_public: boolean = false
  ): Promise<ProjectItem> {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title,
        description,
        language,
        source_code,
        is_public
      }),
    });
    if (!res.ok) throw new Error('Failed to save project.');
    return res.json();
  }

  async updateProgress(lessonId: string, status: string, lastCode?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progress/${lessonId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status, last_code: lastCode }),
    });
    if (!res.ok) throw new Error('Failed to update progress.');
    return res.json();
  }

  async getUserProgress(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/progress`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch user progress.');
    return res.json();
  }
}

export const api = new ApiService();
