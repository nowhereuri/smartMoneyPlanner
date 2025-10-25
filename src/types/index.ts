// 거래 유형 정의
export type TransactionType = 'income' | 'expense';

// 거래내역 데이터 모델
export interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  subcategory?: string;
  memo?: string;
  source: 'manual' | 'receipt' | 'kakao'; // 입력 방식
  originalText?: string; // 원본 텍스트 (영수증이나 카톡 내용)
}

// 분류항목 데이터 모델
export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  keywords: string[]; // 자동 분류를 위한 키워드
  color: string; // UI에서 사용할 색상
  icon?: string; // 아이콘 이름
}

// 하위 분류항목
export interface Subcategory {
  id: string;
  name: string;
  parentCategoryId: string;
  keywords: string[];
}

// 월별 분석 데이터
export interface MonthlyAnalysis {
  month: number;
  year: number;
  categories: {
    [categoryId: string]: {
      amount: number;
      transactionCount: number;
    };
  };
  totalIncome: number;
  totalExpense: number;
}

// 연도별 분석 데이터
export interface YearlyAnalysis {
  year: number;
  months: MonthlyAnalysis[];
  categoryTotals: {
    [categoryId: string]: number;
  };
}

// 달력 뷰용 일별 데이터
export interface DailyTransactions {
  date: Date;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
}

// 샘플 분류항목 데이터
export interface SampleCategories {
  name: string;
  description: string;
  categories: Category[];
  subcategories: Subcategory[];
}

// 앱 설정
export interface AppSettings {
  currency: string;
  dateFormat: string;
  defaultCategories: boolean;
  autoBackup: boolean;
}
