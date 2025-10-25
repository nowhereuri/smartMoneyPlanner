import { Transaction, Category, MonthlyAnalysis, YearlyAnalysis } from '../types';
import { format, isSameMonth, isSameYear, startOfMonth, endOfMonth } from 'date-fns';

// 월별 분석 데이터 생성
export function generateMonthlyAnalysis(
  transactions: Transaction[],
  year: number,
  month: number
): MonthlyAnalysis {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(monthStart);
  
  const monthTransactions = transactions.filter(transaction =>
    transaction.date >= monthStart && transaction.date <= monthEnd
  );

  const categories: { [categoryId: string]: { amount: number; transactionCount: number } } = {};
  
  let totalIncome = 0;
  let totalExpense = 0;

  monthTransactions.forEach(transaction => {
    const categoryId = transaction.category;
    
    if (!categories[categoryId]) {
      categories[categoryId] = { amount: 0, transactionCount: 0 };
    }
    
    categories[categoryId].amount += transaction.amount;
    categories[categoryId].transactionCount += 1;

    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
    } else {
      totalExpense += transaction.amount;
    }
  });

  return {
    month,
    year,
    categories,
    totalIncome,
    totalExpense
  };
}

// 연도별 분석 데이터 생성
export function generateYearlyAnalysis(
  transactions: Transaction[],
  year: number
): YearlyAnalysis {
  const months: MonthlyAnalysis[] = [];
  const categoryTotals: { [categoryId: string]: number } = {};

  // 각 월별 분석 생성
  for (let month = 1; month <= 12; month++) {
    const monthlyAnalysis = generateMonthlyAnalysis(transactions, year, month);
    months.push(monthlyAnalysis);

    // 분류별 연간 총합 계산
    Object.entries(monthlyAnalysis.categories).forEach(([categoryId, data]) => {
      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = 0;
      }
      categoryTotals[categoryId] += data.amount;
    });
  }

  return {
    year,
    months,
    categoryTotals
  };
}

// 분류별 월별 데이터를 테이블 형태로 변환
export function createAnalysisTable(
  yearlyAnalysis: YearlyAnalysis,
  categories: Category[]
) {
  const tableData: Array<{
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    months: Array<{
      month: number;
      amount: number;
      transactionCount: number;
    }>;
    yearlyTotal: number;
  }> = [];

  // 각 분류별로 데이터 구성
  categories.forEach(category => {
    const months = yearlyAnalysis.months.map(monthlyData => {
      const categoryData = monthlyData.categories[category.id] || {
        amount: 0,
        transactionCount: 0
      };
      
      return {
        month: monthlyData.month,
        amount: categoryData.amount,
        transactionCount: categoryData.transactionCount
      };
    });

    const yearlyTotal = yearlyAnalysis.categoryTotals[category.id] || 0;

    tableData.push({
      categoryId: category.id,
      categoryName: category.name,
      categoryColor: category.color,
      months,
      yearlyTotal
    });
  });

  // 연간 총합 순으로 정렬
  return tableData.sort((a, b) => b.yearlyTotal - a.yearlyTotal);
}

// 월별 총합 계산
export function getMonthlyTotals(yearlyAnalysis: YearlyAnalysis) {
  return yearlyAnalysis.months.map(monthlyData => ({
    month: monthlyData.month,
    totalIncome: monthlyData.totalIncome,
    totalExpense: monthlyData.totalExpense,
    netIncome: monthlyData.totalIncome - monthlyData.totalExpense
  }));
}

// 분류별 성장률 계산
export function calculateGrowthRate(
  currentYear: YearlyAnalysis,
  previousYear: YearlyAnalysis
) {
  const growthRates: { [categoryId: string]: number } = {};

  Object.keys(currentYear.categoryTotals).forEach(categoryId => {
    const currentTotal = currentYear.categoryTotals[categoryId] || 0;
    const previousTotal = previousYear.categoryTotals[categoryId] || 0;
    
    if (previousTotal > 0) {
      growthRates[categoryId] = ((currentTotal - previousTotal) / previousTotal) * 100;
    } else if (currentTotal > 0) {
      growthRates[categoryId] = 100; // 새로 생긴 분류
    } else {
      growthRates[categoryId] = 0;
    }
  });

  return growthRates;
}

// 예산 대비 실제 지출 분석
export function compareWithBudget(
  actualData: YearlyAnalysis,
  budgetData: { [categoryId: string]: number }
) {
  const comparison: Array<{
    categoryId: string;
    categoryName: string;
    budget: number;
    actual: number;
    difference: number;
    percentage: number;
  }> = [];

  Object.entries(budgetData).forEach(([categoryId, budget]) => {
    const actual = actualData.categoryTotals[categoryId] || 0;
    const difference = actual - budget;
    const percentage = budget > 0 ? (actual / budget) * 100 : 0;

    comparison.push({
      categoryId,
      categoryName: '', // 이 부분은 categories 배열에서 찾아서 채워야 함
      budget,
      actual,
      difference,
      percentage
    });
  });

  return comparison.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
}

// 분류별 평균 월 지출 계산
export function getAverageMonthlySpending(
  yearlyAnalysis: YearlyAnalysis,
  categoryId: string
): number {
  const monthlyAmounts = yearlyAnalysis.months
    .map(month => month.categories[categoryId]?.amount || 0)
    .filter(amount => amount > 0);

  if (monthlyAmounts.length === 0) return 0;

  return monthlyAmounts.reduce((sum, amount) => sum + amount, 0) / monthlyAmounts.length;
}

// 분류별 지출 패턴 분석 (어느 달에 많이 쓰는지)
export function analyzeSpendingPattern(
  yearlyAnalysis: YearlyAnalysis,
  categoryId: string
) {
  const monthlyData = yearlyAnalysis.months.map(month => ({
    month: month.month,
    amount: month.categories[categoryId]?.amount || 0
  }));

  const totalAmount = monthlyData.reduce((sum, data) => sum + data.amount, 0);
  const averageAmount = totalAmount / 12;

  const pattern = monthlyData.map(data => ({
    month: data.month,
    amount: data.amount,
    percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    isAboveAverage: data.amount > averageAmount
  }));

  return {
    totalAmount,
    averageAmount,
    pattern,
    peakMonth: monthlyData.reduce((max, data) => 
      data.amount > max.amount ? data : max, 
      { month: 1, amount: 0 }
    )
  };
}
