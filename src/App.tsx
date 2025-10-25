import React, { useState, useEffect } from 'react';
import { Transaction, Category, Subcategory } from './types';
import { sampleCategories } from './data/sampleCategories';
import { matchCategory, learnFromUserClassification } from './utils/categoryMatcher';
import TransactionInput from './components/TransactionInput';
import TransactionList from './components/TransactionList';
import CalendarView from './components/CalendarView';
import YearlyAnalysis from './components/YearlyAnalysis';
import CategoryManagement from './components/CategoryManagement';
import { 
  Calendar, 
  BarChart3, 
  Settings, 
  Plus,
  Menu,
  X,
  List
} from 'lucide-react';

type ViewType = 'add' | 'transactions' | 'calendar' | 'analysis' | 'categories';

const App: React.FC = () => {
  // 상태 관리
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('add');
  const [showTransactionInput, setShowTransactionInput] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // 로컬 스토리지에서 데이터 로드
  useEffect(() => {
    const savedTransactions = localStorage.getItem('smart-money-planner-transactions');
    const savedCategories = localStorage.getItem('smart-money-planner-categories');
    const savedSubcategories = localStorage.getItem('smart-money-planner-subcategories');

    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
      setTransactions(parsedTransactions);
    }

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      // 기본 분류항목 설정
      setCategories(sampleCategories.categories);
    }

    if (savedSubcategories) {
      setSubcategories(JSON.parse(savedSubcategories));
    } else {
      // 기본 하위 분류항목 설정
      setSubcategories(sampleCategories.subcategories);
    }
  }, []);

  // 데이터 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem('smart-money-planner-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smart-money-planner-categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('smart-money-planner-subcategories', JSON.stringify(subcategories));
  }, [subcategories]);

  // 거래내역 추가
  const handleAddTransaction = (transaction: Transaction) => {
    // 자동 분류가 안된 경우 자동 분류 시도
    if (!transaction.category) {
      const { category, subcategory } = matchCategory(
        transaction.description,
        categories,
        subcategories
      );
      
      if (category) {
        transaction.category = category.id;
        transaction.subcategory = subcategory?.id;
      }
    }

    setTransactions(prev => [transaction, ...prev].sort((a, b) => b.date.getTime() - a.date.getTime()));
  };

  // 거래내역 수정
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowTransactionInput(true);
  };

  // 거래내역 업데이트
  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
    );
    
    // 사용자 분류 학습
    if (updatedTransaction.category) {
      const updatedCategories = learnFromUserClassification(
        updatedTransaction.description,
        updatedTransaction.category,
        categories
      );
      setCategories(updatedCategories);
    }
  };

  // 거래내역 삭제
  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('이 거래내역을 삭제하시겠습니까?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  // 분류항목 업데이트
  const handleUpdateCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
  };

  // 하위 분류항목 업데이트
  const handleUpdateSubcategories = (newSubcategories: Subcategory[]) => {
    setSubcategories(newSubcategories);
  };

  // 샘플 분류항목 적용
  const handleApplySampleCategories = () => {
    if (window.confirm('샘플 분류항목을 적용하시겠습니까? 기존 분류항목이 대체됩니다.')) {
      setCategories(sampleCategories.categories);
      setSubcategories(sampleCategories.subcategories);
    }
  };

  // 날짜 클릭 처리
  const handleDateClick = (date: Date) => {
    setCurrentView('transactions');
  };

  // 거래내역 입력 모달 닫기
  const handleCloseTransactionInput = () => {
    setShowTransactionInput(false);
    setEditingTransaction(null);
  };

  // 네비게이션 메뉴
  const navigationItems = [
    { id: 'add', label: '거래 추가', icon: Plus },
    { id: 'transactions', label: '거래내역', icon: List },
    { id: 'calendar', label: '달력', icon: Calendar },
    { id: 'analysis', label: '분석', icon: BarChart3 },
    { id: 'categories', label: '분류관리', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">스마트 가계부</h1>
            </div>
            
            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* 거래 추가 버튼 (거래 추가 화면이 아닐 때만 표시) */}
            {currentView !== 'add' && (
              <button
                onClick={() => setCurrentView('add')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">거래 추가</span>
              </button>
            )}

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* 모바일 네비게이션 */}
        {showMobileMenu && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setShowMobileMenu(false);
                    }}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-sm font-medium ${
                      currentView === item.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'add' && (
          <div className="space-y-6">
            {/* 거래 추가 화면 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">거래내역 추가</h2>
              <TransactionInput
                categories={categories}
                subcategories={subcategories}
                onAddTransaction={(transaction) => {
                  handleAddTransaction(transaction);
                  // 거래 추가 후 거래내역 화면으로 이동
                  setCurrentView('transactions');
                }}
                onClose={() => setCurrentView('transactions')}
                isModal={false}
              />
            </div>
          </div>
        )}

        {currentView === 'transactions' && (
          <div className="space-y-6">
            {/* 요약 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">이번 달 수입</h3>
                <p className="text-3xl font-bold text-green-600">
                  {transactions
                    .filter(t => t.type === 'income' && 
                      t.date.getMonth() === new Date().getMonth() &&
                      t.date.getFullYear() === new Date().getFullYear())
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}원
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">이번 달 지출</h3>
                <p className="text-3xl font-bold text-red-600">
                  {transactions
                    .filter(t => t.type === 'expense' && 
                      t.date.getMonth() === new Date().getMonth() &&
                      t.date.getFullYear() === new Date().getFullYear())
                    .reduce((sum, t) => sum + t.amount, 0)
                    .toLocaleString()}원
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">이번 달 순수익</h3>
                <p className={`text-3xl font-bold ${
                  (() => {
                    const income = transactions
                      .filter(t => t.type === 'income' && 
                        t.date.getMonth() === new Date().getMonth() &&
                        t.date.getFullYear() === new Date().getFullYear())
                      .reduce((sum, t) => sum + t.amount, 0);
                    const expense = transactions
                      .filter(t => t.type === 'expense' && 
                        t.date.getMonth() === new Date().getMonth() &&
                        t.date.getFullYear() === new Date().getFullYear())
                      .reduce((sum, t) => sum + t.amount, 0);
                    return income - expense >= 0 ? 'text-blue-600' : 'text-orange-600';
                  })()
                }`}>
                  {(() => {
                    const income = transactions
                      .filter(t => t.type === 'income' && 
                        t.date.getMonth() === new Date().getMonth() &&
                        t.date.getFullYear() === new Date().getFullYear())
                      .reduce((sum, t) => sum + t.amount, 0);
                    const expense = transactions
                      .filter(t => t.type === 'expense' && 
                        t.date.getMonth() === new Date().getMonth() &&
                        t.date.getFullYear() === new Date().getFullYear())
                      .reduce((sum, t) => sum + t.amount, 0);
                    return (income - expense).toLocaleString();
                  })()}원
                </p>
              </div>
            </div>

            {/* 거래내역 목록 */}
            <TransactionList
              transactions={transactions}
              categories={categories}
              subcategories={subcategories}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {currentView === 'calendar' && (
          <CalendarView
            transactions={transactions}
            categories={categories}
            onDateClick={handleDateClick}
            onAddTransaction={() => setCurrentView('add')}
          />
        )}

        {currentView === 'analysis' && (
          <YearlyAnalysis
            transactions={transactions}
            categories={categories}
          />
        )}

        {currentView === 'categories' && (
          <CategoryManagement
            categories={categories}
            subcategories={subcategories}
            transactions={transactions}
            onUpdateCategories={handleUpdateCategories}
            onUpdateSubcategories={handleUpdateSubcategories}
            onApplySampleCategories={handleApplySampleCategories}
          />
        )}
      </main>

      {/* 거래내역 수정 모달 */}
      {showTransactionInput && editingTransaction && (
        <TransactionInput
          categories={categories}
          subcategories={subcategories}
          onAddTransaction={handleUpdateTransaction}
          onClose={handleCloseTransactionInput}
          isModal={true}
        />
      )}
    </div>
  );
};

export default App;
