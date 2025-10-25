import { Category, Subcategory } from '../types';

// 텍스트에서 분류항목을 자동으로 매칭하는 함수
export function matchCategory(
  text: string, 
  categories: Category[], 
  subcategories: Subcategory[] = []
): { category: Category | null; subcategory: Subcategory | null } {
  const lowerText = text.toLowerCase();
  let bestMatch: Category | null = null;
  let bestSubMatch: Subcategory | null = null;
  let maxScore = 0;
  let maxSubScore = 0;

  // 메인 분류항목 매칭
  for (const category of categories) {
    let score = 0;
    
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += keyword.length; // 키워드 길이에 비례하여 점수 부여
      }
    }
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }

  // 하위 분류항목 매칭 (메인 분류항목이 있을 때만)
  if (bestMatch && subcategories.length > 0) {
    const relevantSubcategories = subcategories.filter(
      sub => sub.parentCategoryId === bestMatch!.id
    );

    for (const subcategory of relevantSubcategories) {
      let score = 0;
      
      for (const keyword of subcategory.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          score += keyword.length;
        }
      }
      
      if (score > maxSubScore) {
        maxSubScore = score;
        bestSubMatch = subcategory;
      }
    }
  }

  return {
    category: bestMatch,
    subcategory: bestSubMatch
  };
}

// 거래내역 설명에서 분류항목 추천
export function suggestCategories(
  description: string,
  categories: Category[]
): Category[] {
  const lowerDesc = description.toLowerCase();
  const suggestions: { category: Category; score: number }[] = [];

  for (const category of categories) {
    let score = 0;
    
    for (const keyword of category.keywords) {
      if (lowerDesc.includes(keyword.toLowerCase())) {
        score += keyword.length;
      }
    }
    
    if (score > 0) {
      suggestions.push({ category, score });
    }
  }

  // 점수순으로 정렬하여 상위 3개 반환
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.category);
}

// 분류항목 학습 기능 - 사용자가 수동으로 분류한 내용을 학습
export function learnFromUserClassification(
  description: string,
  categoryId: string,
  categories: Category[]
): Category[] {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return categories;

  // 설명에서 새로운 키워드 추출
  const words = description.toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1);

  // 기존 키워드에 없는 새로운 단어들을 추가
  const newKeywords = words.filter(word => 
    !category.keywords.some(keyword => 
      keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())
    )
  );

  // 새로운 키워드가 있으면 추가
  if (newKeywords.length > 0) {
    const updatedCategory = {
      ...category,
      keywords: [...category.keywords, ...newKeywords.slice(0, 3)] // 최대 3개까지만 추가
    };

    return categories.map(cat => 
      cat.id === categoryId ? updatedCategory : cat
    );
  }

  return categories;
}

// 분류항목 통계 - 어떤 분류항목이 가장 많이 사용되는지
export function getCategoryStats(
  transactions: Array<{ category: string; amount: number }>
): Array<{ categoryId: string; count: number; totalAmount: number }> {
  const stats = new Map<string, { count: number; totalAmount: number }>();

  for (const transaction of transactions) {
    const existing = stats.get(transaction.category) || { count: 0, totalAmount: 0 };
    stats.set(transaction.category, {
      count: existing.count + 1,
      totalAmount: existing.totalAmount + transaction.amount
    });
  }

  return Array.from(stats.entries()).map(([categoryId, data]) => ({
    categoryId,
    ...data
  }));
}
