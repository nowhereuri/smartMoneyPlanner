import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, DollarSign } from 'lucide-react';

interface CalendarViewProps {
  transactions: Transaction[];
  categories: Category[];
  onDateClick: (date: Date) => void;
  onAddTransaction: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  transactions,
  categories,
  onDateClick,
  onAddTransaction
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 달력 데이터 생성
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      const dayTransactions = transactions.filter(transaction =>
        isSameDay(transaction.date, day)
      );

      const dailyTotal = dayTransactions.reduce((total, transaction) => {
        if (transaction.type === 'income') {
          return total + transaction.amount;
        } else {
          return total - transaction.amount;
        }
      }, 0);

      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      days.push({
        date: day,
        transactions: dayTransactions,
        dailyTotal,
        income,
        expense,
        isCurrentMonth: isSameMonth(day, monthStart),
        isToday: isToday(day)
      });

      day = addDays(day, 1);
    }

    return days;
  }, [currentDate, transactions]);

  // 월 변경
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // 월별 통계
  const monthlyStats = useMemo(() => {
    const monthTransactions = transactions.filter(transaction =>
      isSameMonth(transaction.date, currentDate)
    );

    const totalIncome = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const netIncome = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      netIncome,
      transactionCount: monthTransactions.length
    };
  }, [transactions, currentDate]);

  // 날짜별 분류별 지출 통계
  const getCategoryStats = (dayTransactions: Transaction[]) => {
    const stats: { [categoryId: string]: number } = {};
    
    dayTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryId = transaction.category;
        stats[categoryId] = (stats[categoryId] || 0) + transaction.amount;
      });

    return stats;
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold">
              {format(currentDate, 'yyyy년 M월', { locale: ko })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <button
            onClick={onAddTransaction}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus size={16} />
            <span>거래 추가</span>
          </button>
        </div>

        {/* 월별 통계 */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {monthlyStats.totalIncome.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-500">총 수입</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {monthlyStats.totalExpense.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-500">총 지출</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              monthlyStats.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {monthlyStats.netIncome.toLocaleString()}원
            </div>
            <div className="text-sm text-gray-500">순수익</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {monthlyStats.transactionCount}건
            </div>
            <div className="text-sm text-gray-500">거래 건수</div>
          </div>
        </div>
      </div>

      {/* 달력 */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {['일', '월', '화', '수', '목', '금', '토'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* 달력 그리드 */}
        <div className="grid grid-cols-7">
          {calendarData.map((day, index) => {
            const categoryStats = getCategoryStats(day.transactions);
            const topCategory = Object.entries(categoryStats)
              .sort(([,a], [,b]) => b - a)[0];

            return (
              <div
                key={index}
                className={`min-h-[120px] border-r border-b border-gray-200 p-2 cursor-pointer hover:bg-gray-50 ${
                  !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                } ${day.isToday ? 'bg-blue-50' : ''}`}
                onClick={() => onDateClick(day.date)}
              >
                {/* 날짜 */}
                <div className={`text-sm font-medium mb-1 ${
                  day.isToday ? 'text-blue-600' : ''
                }`}>
                  {format(day.date, 'd')}
                </div>

                {/* 거래내역 요약 */}
                {day.transactions.length > 0 && (
                  <div className="space-y-1">
                    {/* 일별 총액 */}
                    <div className={`text-xs font-medium ${
                      day.dailyTotal >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {day.dailyTotal >= 0 ? '+' : ''}{day.dailyTotal.toLocaleString()}원
                    </div>

                    {/* 거래 건수 */}
                    <div className="text-xs text-gray-500">
                      {day.transactions.length}건
                    </div>

                    {/* 주요 분류 */}
                    {topCategory && (
                      <div className="text-xs">
                        <div
                          className="inline-block px-1 py-0.5 rounded text-white text-xs"
                          style={{
                            backgroundColor: categories.find(c => c.id === topCategory[0])?.color || '#gray'
                          }}
                        >
                          {categories.find(c => c.id === topCategory[0])?.name}
                        </div>
                      </div>
                    )}

                    {/* 수입/지출 표시 */}
                    {day.income > 0 && (
                      <div className="text-xs text-green-600">
                        +{day.income.toLocaleString()}원
                      </div>
                    )}
                    {day.expense > 0 && (
                      <div className="text-xs text-red-600">
                        -{day.expense.toLocaleString()}원
                      </div>
                    )}
                  </div>
                )}

                {/* 거래가 많은 날 표시 */}
                {day.transactions.length > 3 && (
                  <div className="absolute bottom-1 right-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 범례 */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <h3 className="font-medium mb-3">분류별 색상</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm">{category.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
