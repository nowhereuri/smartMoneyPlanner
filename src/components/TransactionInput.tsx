import React, { useState } from 'react';
import { Transaction, Category, Subcategory } from '../types';
import { parseTextToTransaction, parseKakaoMessage } from '../utils/textParser';
import { matchCategory, suggestCategories } from '../utils/categoryMatcher';
import { Calendar, DollarSign, FileText, MessageSquare, Plus, X } from 'lucide-react';

interface TransactionInputProps {
  categories: Category[];
  subcategories: Subcategory[];
  onAddTransaction: (transaction: Transaction) => void;
  onClose: () => void;
  isModal?: boolean;
}

type InputMode = 'manual' | 'text' | 'kakao';

const TransactionInput: React.FC<TransactionInputProps> = ({
  categories,
  subcategories,
  onAddTransaction,
  onClose,
  isModal = true
}) => {
  const [mode, setMode] = useState<InputMode>('text');
  const [formData, setFormData] = useState<Partial<Transaction>>({
    date: new Date(),
    type: 'expense',
    amount: 0,
    description: '',
    category: '',
    subcategory: '',
    memo: ''
  });
  const [textInput, setTextInput] = useState('');
  const [suggestedCategories, setSuggestedCategories] = useState<Category[]>([]);

  // 폼 데이터 업데이트
  const updateFormData = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 설명이 변경되면 분류항목 추천
    if (field === 'description' && value) {
      const suggestions = suggestCategories(value, categories);
      setSuggestedCategories(suggestions);
    }
  };

  // 텍스트 파싱 처리
  const handleTextParse = () => {
    let parsedData: Partial<Transaction>;
    
    if (mode === 'kakao') {
      parsedData = parseKakaoMessage(textInput);
    } else {
      parsedData = parseTextToTransaction(textInput);
    }

    // 파싱된 데이터로 폼 업데이트
    setFormData(prev => ({ ...prev, ...parsedData }));
    
    // 자동 분류
    const { category, subcategory } = matchCategory(
      textInput, 
      categories, 
      subcategories
    );
    
    if (category) {
      setFormData(prev => ({
        ...prev,
        category: category.id,
        subcategory: subcategory?.id || ''
      }));
    }
  };

  // 거래내역 저장
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      alert('금액과 설명을 입력해주세요.');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: formData.date || new Date(),
      type: formData.type || 'expense',
      amount: formData.amount,
      description: formData.description,
      category: formData.category || '',
      subcategory: formData.subcategory,
      memo: formData.memo,
      source: mode === 'manual' ? 'manual' : mode === 'kakao' ? 'kakao' : 'receipt',
      originalText: mode !== 'manual' ? textInput : undefined
    };

    onAddTransaction(transaction);
    onClose();
  };

  // 분류항목 선택
  const handleCategorySelect = (categoryId: string) => {
    setFormData(prev => ({ ...prev, category: categoryId }));
    setSuggestedCategories([]);
  };

  const content = (
    <div className={`${isModal ? 'bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto' : 'w-full'}`}>
        {/* 헤더 */}
        {isModal && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">거래내역 추가</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* 입력 모드 선택 */}
        <div className="p-4 border-b">
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 p-2 rounded text-sm font-medium ${
                mode === 'manual' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Plus size={16} className="inline mr-1" />
              직접입력
            </button>
            <button
              onClick={() => setMode('text')}
              className={`flex-1 p-2 rounded text-sm font-medium ${
                mode === 'text' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <FileText size={16} className="inline mr-1" />
              영수증
            </button>
            <button
              onClick={() => setMode('kakao')}
              className={`flex-1 p-2 rounded text-sm font-medium ${
                mode === 'kakao' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <MessageSquare size={16} className="inline mr-1" />
              카톡
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 텍스트 입력 모드 */}
          {mode !== 'manual' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'kakao' ? '카카오톡 메시지' : '영수증 내용'} 붙여넣기
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder={mode === 'kakao' 
                  ? "카카오톡 결제 알림 메시지를 붙여넣으세요..."
                  : "영수증 내용을 붙여넣으세요..."
                }
                className="w-full p-3 border border-gray-300 rounded-md resize-none"
                rows={4}
              />
              <button
                type="button"
                onClick={handleTextParse}
                disabled={!textInput.trim()}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300"
              >
                자동 분석
              </button>
            </div>
          )}

          {/* 거래 유형 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              거래 유형
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="mr-2"
                />
                지출
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => updateFormData('type', e.target.value)}
                  className="mr-2"
                />
                수입
              </label>
            </div>
          </div>

          {/* 날짜 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              날짜
            </label>
            <input
              type="date"
              value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
              onChange={(e) => updateFormData('date', new Date(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* 금액 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign size={16} className="inline mr-1" />
              금액
            </label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              설명
            </label>
            <input
              type="text"
              value={formData.description || ''}
              onChange={(e) => updateFormData('description', e.target.value)}
              placeholder="거래 내용을 입력하세요"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* 추천 분류항목 */}
          {suggestedCategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 분류
              </label>
              <div className="flex flex-wrap gap-2">
                {suggestedCategories.map(category => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleCategorySelect(category.id)}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: category.color + '20',
                      color: category.color,
                      border: `1px solid ${category.color}`
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 분류항목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분류
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => updateFormData('category', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">분류를 선택하세요</option>
              {categories
                .filter(cat => cat.type === formData.type)
                .map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
          </div>

          {/* 하위 분류 */}
          {formData.category && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                하위 분류
              </label>
              <select
                value={formData.subcategory || ''}
                onChange={(e) => updateFormData('subcategory', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">하위 분류를 선택하세요</option>
                {subcategories
                  .filter(sub => sub.parentCategoryId === formData.category)
                  .map(subcategory => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모
            </label>
            <textarea
              value={formData.memo || ''}
              onChange={(e) => updateFormData('memo', e.target.value)}
              placeholder="추가 메모 (선택사항)"
              className="w-full p-2 border border-gray-300 rounded-md resize-none"
              rows={2}
            />
          </div>

          {/* 버튼 */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              저장
            </button>
          </div>
        </form>
      </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default TransactionInput;
