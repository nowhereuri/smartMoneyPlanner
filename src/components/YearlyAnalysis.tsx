import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { generateYearlyAnalysis, createAnalysisTable, getMonthlyTotals } from '../utils/analysis';
import { format } from 'date-fns';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Download,
  Filter
} from 'lucide-react';

interface YearlyAnalysisProps {
  transactions: Transaction[];
  categories: Category[];
}

const YearlyAnalysis: React.FC<YearlyAnalysisProps> = ({
  transactions,
  categories
}) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedView, setSelectedView] = useState<'table' | 'chart'>('table');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // 연도별 분석 데이터 생성
  const yearlyAnalysis = useMemo(() => {
    return generateYearlyAnalysis(transactions, selectedYear);
  }, [transactions, selectedYear]);

  // 분석 테이블 데이터 생성
  const analysisTable = useMemo(() => {
    const filteredCategories = categories.filter(cat => {
      if (filterType === 'all') return true;
      return cat.type === filterType;
    });
    
    return createAnalysisTable(yearlyAnalysis, filteredCategories);
  }, [yearlyAnalysis, categories, filterType]);

  // 월별 총합 데이터
  const monthlyTotals = useMemo(() => {
    return getMonthlyTotals(yearlyAnalysis);
  }, [yearlyAnalysis]);

  // 연간 총계 계산
  const yearlyTotals = useMemo(() => {
    const totalIncome = yearlyAnalysis.months.reduce((sum, month) => sum + month.totalIncome, 0);
    const totalExpense = yearlyAnalysis.months.reduce((sum, month) => sum + month.totalExpense, 0);
    const netIncome = totalIncome - totalExpense;

    return { totalIncome, totalExpense, netIncome };
  }, [yearlyAnalysis]);

  // 사용 가능한 연도 목록
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => t.date.getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // CSV 내보내기
  const exportToCSV = () => {
    const headers = ['분류', ...Array.from({ length: 12 }, (_, i) => `${i + 1}월`), '연간총계'];
    const csvData = [
      headers.join(','),
      ...analysisTable.map(row => [
        row.categoryName,
        ...row.months.map(month => month.amount),
        row.yearlyTotal
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedYear}년_분석.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center">
            <BarChart3 className="mr-2" />
            {selectedYear}년 분석
          </h2>
          
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="p-2 border border-gray-300 rounded-md"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
            
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Download size={16} />
              <span>CSV 내보내기</span>
            </button>
          </div>
        </div>

        {/* 연간 총계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">총 수입</p>
                <p className="text-2xl font-bold text-green-700">
                  {yearlyTotals.totalIncome.toLocaleString()}원
                </p>
              </div>
              <TrendingUp className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 font-medium">총 지출</p>
                <p className="text-2xl font-bold text-red-700">
                  {yearlyTotals.totalExpense.toLocaleString()}원
                </p>
              </div>
              <TrendingDown className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${
            yearlyTotals.netIncome >= 0 ? 'bg-blue-50' : 'bg-orange-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  yearlyTotals.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'
                }`}>
                  순수익
                </p>
                <p className={`text-2xl font-bold ${
                  yearlyTotals.netIncome >= 0 ? 'text-blue-700' : 'text-orange-700'
                }`}>
                  {yearlyTotals.netIncome.toLocaleString()}원
                </p>
              </div>
              {yearlyTotals.netIncome >= 0 ? (
                <TrendingUp className="text-blue-500" size={24} />
              ) : (
                <TrendingDown className="text-orange-500" size={24} />
              )}
            </div>
          </div>
        </div>

        {/* 필터 및 뷰 선택 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter size={16} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">전체</option>
                <option value="income">수입</option>
                <option value="expense">지출</option>
              </select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedView('table')}
              className={`px-4 py-2 rounded-md ${
                selectedView === 'table' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              테이블
            </button>
            <button
              onClick={() => setSelectedView('chart')}
              className={`px-4 py-2 rounded-md ${
                selectedView === 'chart' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              차트
            </button>
          </div>
        </div>
      </div>

      {/* 분석 테이블 */}
      {selectedView === 'table' && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 sticky left-0 bg-gray-50">
                    분류
                  </th>
                  {Array.from({ length: 12 }, (_, i) => (
                    <th key={i} className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                      {i + 1}월
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 bg-blue-50">
                    연간총계
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analysisTable.map((row) => (
                  <tr key={row.categoryId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 sticky left-0 bg-white">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: row.categoryColor }}
                        />
                        <span className="font-medium">{row.categoryName}</span>
                      </div>
                    </td>
                    {row.months.map((month) => (
                      <td key={month.month} className="px-4 py-3 text-center">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {month.amount.toLocaleString()}원
                          </div>
                          <div className="text-xs text-gray-500">
                            {month.transactionCount}건
                          </div>
                        </div>
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center bg-blue-50 font-bold">
                      {row.yearlyTotal.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 차트 뷰 */}
      {selectedView === 'chart' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">월별 지출 추이</h3>
          <div className="space-y-4">
            {analysisTable.slice(0, 10).map((row) => (
              <div key={row.categoryId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: row.categoryColor }}
                    />
                    <span className="font-medium">{row.categoryName}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    총 {row.yearlyTotal.toLocaleString()}원
                  </span>
                </div>
                
                <div className="flex space-x-1 h-4">
                  {row.months.map((month) => {
                    const maxAmount = Math.max(...row.months.map(m => m.amount));
                    const height = maxAmount > 0 ? (month.amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div
                        key={month.month}
                        className="flex-1 bg-gray-200 rounded-sm relative group"
                        style={{ height: '16px' }}
                      >
                        <div
                          className="absolute bottom-0 left-0 right-0 rounded-sm"
                          style={{
                            height: `${height}%`,
                            backgroundColor: row.categoryColor
                          }}
                        />
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {month.amount.toLocaleString()}원
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 월별 총합 요약 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">월별 총합</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {monthlyTotals.map((month) => (
            <div key={month.month} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{month.month}월</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">수입:</span>
                  <span>{month.totalIncome.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-600">지출:</span>
                  <span>{month.totalExpense.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className={month.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                    순수익:
                  </span>
                  <span className={month.netIncome >= 0 ? 'text-blue-600' : 'text-orange-600'}>
                    {month.netIncome.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearlyAnalysis;
