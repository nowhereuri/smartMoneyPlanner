import { Category, Subcategory, SampleCategories } from '../types';

// 기본 지출 분류항목
const expenseCategories: Category[] = [
  {
    id: 'food',
    name: '식비',
    type: 'expense',
    keywords: ['식사', '음식', '카페', '커피', '점심', '저녁', '아침', '배달', '치킨', '피자', '햄버거', '김치찌개', '라면', '밥', '식당', '맛집'],
    color: '#FF6B6B',
    icon: 'utensils'
  },
  {
    id: 'transport',
    name: '교통비',
    type: 'expense',
    keywords: ['지하철', '버스', '택시', '기차', '비행기', '주유', '주차', '톨게이트', '교통카드', '카카오택시', '우버'],
    color: '#4ECDC4',
    icon: 'car'
  },
  {
    id: 'shopping',
    name: '쇼핑',
    type: 'expense',
    keywords: ['쇼핑', '옷', '신발', '가방', '화장품', '온라인', '쿠팡', '11번가', 'G마켓', '옥션', '네이버쇼핑', '아마존'],
    color: '#45B7D1',
    icon: 'shopping-bag'
  },
  {
    id: 'healthcare',
    name: '의료비',
    type: 'expense',
    keywords: ['병원', '약국', '약', '치과', '안과', '피부과', '검진', '의료', '건강', '보험'],
    color: '#96CEB4',
    icon: 'heart'
  },
  {
    id: 'entertainment',
    name: '문화생활',
    type: 'expense',
    keywords: ['영화', '게임', '책', '음악', '콘서트', '전시회', '카페', '술', '맥주', '와인', '노래방', 'PC방'],
    color: '#FFEAA7',
    icon: 'music'
  },
  {
    id: 'utilities',
    name: '공과금',
    type: 'expense',
    keywords: ['전기', '가스', '수도', '인터넷', '핸드폰', '통신비', '관리비', '아파트', '월세', '전세'],
    color: '#DDA0DD',
    icon: 'home'
  },
  {
    id: 'education',
    name: '교육비',
    type: 'expense',
    keywords: ['학원', '과외', '책', '교재', '학습', '교육', '강의', '온라인강의', '유튜브', '스터디'],
    color: '#98D8C8',
    icon: 'book'
  },
  {
    id: 'others',
    name: '기타',
    type: 'expense',
    keywords: ['기타', '기타지출', '잡비'],
    color: '#F7DC6F',
    icon: 'more-horizontal'
  }
];

// 기본 수입 분류항목
const incomeCategories: Category[] = [
  {
    id: 'salary',
    name: '급여',
    type: 'income',
    keywords: ['급여', '월급', '연봉', '보너스', '상여금', '급여이체'],
    color: '#2ECC71',
    icon: 'dollar-sign'
  },
  {
    id: 'freelance',
    name: '부업/프리랜서',
    type: 'income',
    keywords: ['부업', '프리랜서', '외주', '용돈', '알바', '아르바이트', '투잡'],
    color: '#3498DB',
    icon: 'briefcase'
  },
  {
    id: 'investment',
    name: '투자수익',
    type: 'income',
    keywords: ['주식', '펀드', '적금', '예금', '이자', '배당', '투자', '코인', '비트코인'],
    color: '#9B59B6',
    icon: 'trending-up'
  },
  {
    id: 'gift',
    name: '선물/용돈',
    type: 'income',
    keywords: ['선물', '용돈', '상금', '보상금', '환급', '적립금'],
    color: '#E67E22',
    icon: 'gift'
  }
];

// 하위 분류항목
const subcategories: Subcategory[] = [
  // 식비 하위 분류
  { id: 'food-breakfast', name: '아침식사', parentCategoryId: 'food', keywords: ['아침', '브런치'] },
  { id: 'food-lunch', name: '점심식사', parentCategoryId: 'food', keywords: ['점심', '런치'] },
  { id: 'food-dinner', name: '저녁식사', parentCategoryId: 'food', keywords: ['저녁', '디너'] },
  { id: 'food-snack', name: '간식/음료', parentCategoryId: 'food', keywords: ['간식', '음료', '커피', '차', '과자'] },
  
  // 교통비 하위 분류
  { id: 'transport-public', name: '대중교통', parentCategoryId: 'transport', keywords: ['지하철', '버스', '교통카드'] },
  { id: 'transport-taxi', name: '택시', parentCategoryId: 'transport', keywords: ['택시', '카카오택시', '우버'] },
  { id: 'transport-car', name: '자동차', parentCategoryId: 'transport', keywords: ['주유', '주차', '정비', '보험'] },
  
  // 쇼핑 하위 분류
  { id: 'shopping-clothes', name: '의류', parentCategoryId: 'shopping', keywords: ['옷', '신발', '가방', '액세서리'] },
  { id: 'shopping-beauty', name: '화장품/뷰티', parentCategoryId: 'shopping', keywords: ['화장품', '스킨케어', '메이크업'] },
  { id: 'shopping-online', name: '온라인쇼핑', parentCategoryId: 'shopping', keywords: ['온라인', '쿠팡', '11번가', 'G마켓'] }
];

// 샘플 분류항목 데이터
export const sampleCategories: SampleCategories = {
  name: '기본 분류항목',
  description: '일반적인 가계부 분류항목으로 시작할 수 있습니다.',
  categories: [...expenseCategories, ...incomeCategories],
  subcategories: subcategories
};

// 기본 분류항목만 별도로 export
export const defaultCategories = [...expenseCategories, ...incomeCategories];
export const defaultSubcategories = subcategories;
