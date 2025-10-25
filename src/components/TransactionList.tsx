import React, { useState, useMemo } from 'react';
import { Transaction, Category, Subcategory } from '../types';
import { format, isSameDay, isSameMonth, isSameYear } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Edit, Trash2, Filter, Search, Calendar, DollarSign } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  subcategories: Subcategory[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

type SortOrder = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  subcategories,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 필터링 및 정렬된 거래내역
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.memo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 분류 필터
    if (selectedCategory) {
      filtered = filtered.filter(transaction => transaction.category === selectedCategory);
    }

    // 거래 유형 필터
    if (selectedType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedType);
    }

    // 날짜 필터
    if (selectedDate) {
      filtered = filtered.filter(transaction => isSameDay(transaction.date, selectedDate));
    }

    // 정렬
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'date-desc':
          return b.date.getTime() - a.date.getTime();
        case 'date-asc':
          return a.date.getTime() - b.date.getTime();
        case 'amount-desc':
          return b.amount - a.amount;
        case 'amount-asc':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [transactions, searchTerm, selectedCategory, selectedType, selectedDate, sortOrder]);

  // 분류항목 정보 가져오기
  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const getSubcategoryInfo = (subcategoryId: string) => {
    return subcategories.find(sub => sub.id === subcategoryId);
  };

  // 거래내역 그룹화 (날짜별)
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    
    filteredTransactions.forEach(transaction => {
      const dateKey = format(transaction.date, 'yyyy-MM-dd');
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    return groups;
  }, [filteredTransactions]);

  // 일별 합계 계산
  const getDailyTotal = (transactions: Transaction[]) => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, net: income - expense };
  };

  return (
    <div className="space-y-4">
      {/* 필터 및 검색 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 검색 */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 분류 필터 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">전체 분류</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* 거래 유형 필터 */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="all">전체</option>
            <option value="income">수입</option>
            <option value="expense">지출</option>
          </select>

          {/* 정렬 */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="date-desc">최신순</option>
            <option value="date-asc">오래된순</option>
            <option value="amount-desc">금액 높은순</option>
            <option value="amount-asc">금액 낮은순</option>
          </select>
        </div>

        {/* 날짜 필터 */}
        <div className="mt-4">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
              className="p-2 border border-gray-300 rounded-md"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
              >
                전체
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 거래내역 목록 */}
      <div className="space-y-4">
        {Object.keys(groupedTransactions).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            거래내역이 없습니다.
          </div>
        ) : (
          Object.entries(groupedTransactions)
            .sort(([a], [b]) => b.localeCompare(a)) // 날짜 내림차순
            .map(([dateKey, dayTransactions]) => {
              const date = new Date(dateKey);
              const dailyTotal = getDailyTotal(dayTransactions);
              const categoryInfo = getCategoryInfo(dayTransactions[0]?.category || '');

              return (
                <div key={dateKey} className="bg-white rounded-lg shadow-sm border">
                  {/* 날짜 헤더 */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-semibold text-lg">
                          {format(date, 'M월 d일 (E)', { locale: ko })}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-green-600">
                            수입: {dailyTotal.income.toLocaleString()}원
                          </span>
                          <span className="text-red-600">
                            지출: {dailyTotal.expense.toLocaleString()}원
                          </span>
                          <span className={`font-medium ${
                            dailyTotal.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            순수익: {dailyTotal.net.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 거래내역 목록 */}
                  <div className="divide-y">
                    {dayTransactions.map(transaction => {
                      const category = getCategoryInfo(transaction.category);
                      const subcategory = getSubcategoryInfo(transaction.subcategory || '');

                      return (
                        <div key={transaction.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                {/* 분류 색상 표시 */}
                                {category && (
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                )}
                                
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {transaction.description}
                                  </h4>
                                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <span>{format(transaction.date, 'HH:mm')}</span>
                                    {category && (
                                      <span className="px-2 py-1 rounded text-xs"
                                            style={{ 
                                              backgroundColor: category.color + '20',
                                              color: category.color 
                                            }}>
                                        {category.name}
                                      </span>
                                    )}
                                    {subcategory && (
                                      <span className="text-gray-400">
                                        - {subcategory.name}
                                      </span>
                                    )}
                                    {transaction.source !== 'manual' && (
                                      <span className="text-blue-500 text-xs">
                                        {transaction.source === 'kakao' ? '카톡' : '영수증'}
                                      </span>
                                    )}
                                  </div>
                                  {transaction.memo && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {transaction.memo}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className={`font-semibold ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}
                                {transaction.amount.toLocaleString()}원
                              </span>
                              
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => onEditTransaction(transaction)}
                                  className="p-1 text-gray-400 hover:text-blue-500"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => onDeleteTransaction(transaction.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

export default TransactionList;
