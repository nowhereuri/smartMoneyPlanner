import React, { useState } from 'react';
import { Category, Subcategory, Transaction } from '../types';
import { sampleCategories } from '../data/sampleCategories';
import { getCategoryStats } from '../utils/categoryMatcher';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Settings, 
  Download,
  Upload,
  Palette,
  Tag
} from 'lucide-react';

interface CategoryManagementProps {
  categories: Category[];
  subcategories: Subcategory[];
  transactions: Transaction[];
  onUpdateCategories: (categories: Category[]) => void;
  onUpdateSubcategories: (subcategories: Subcategory[]) => void;
  onApplySampleCategories: () => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  subcategories,
  transactions,
  onUpdateCategories,
  onUpdateSubcategories,
  onApplySampleCategories
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    type: 'expense',
    keywords: [],
    color: '#3B82F6'
  });
  const [newSubcategory, setNewSubcategory] = useState<Partial<Subcategory>>({
    name: '',
    parentCategoryId: '',
    keywords: []
  });

  // 분류별 통계
  const categoryStats = getCategoryStats(
    transactions.map(t => ({ category: t.category, amount: t.amount }))
  );

  // 색상 옵션
  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
    '#14B8A6', '#F43F5E', '#8B5A2B', '#64748B', '#A855F7'
  ];

  // 분류항목 저장
  const handleSaveCategory = () => {
    if (!newCategory.name) {
      alert('분류명을 입력해주세요.');
      return;
    }

    if (editingCategory) {
      // 수정
      const updatedCategories = categories.map(cat =>
        cat.id === editingCategory.id ? { ...editingCategory, ...newCategory } as Category : cat
      );
      onUpdateCategories(updatedCategories);
      setEditingCategory(null);
    } else {
      // 추가
      const category: Category = {
        id: Date.now().toString(),
        name: newCategory.name,
        type: newCategory.type || 'expense',
        keywords: newCategory.keywords || [],
        color: newCategory.color || '#3B82F6'
      };
      onUpdateCategories([...categories, category]);
      setShowAddCategory(false);
    }

    setNewCategory({
      name: '',
      type: 'expense',
      keywords: [],
      color: '#3B82F6'
    });
  };

  // 하위 분류항목 저장
  const handleSaveSubcategory = () => {
    if (!newSubcategory.name || !newSubcategory.parentCategoryId) {
      alert('하위 분류명과 상위 분류를 선택해주세요.');
      return;
    }

    if (editingSubcategory) {
      // 수정
      const updatedSubcategories = subcategories.map(sub =>
        sub.id === editingSubcategory.id ? { ...editingSubcategory, ...newSubcategory } as Subcategory : sub
      );
      onUpdateSubcategories(updatedSubcategories);
      setEditingSubcategory(null);
    } else {
      // 추가
      const subcategory: Subcategory = {
        id: Date.now().toString(),
        name: newSubcategory.name,
        parentCategoryId: newSubcategory.parentCategoryId,
        keywords: newSubcategory.keywords || []
      };
      onUpdateSubcategories([...subcategories, subcategory]);
      setShowAddSubcategory(false);
    }

    setNewSubcategory({
      name: '',
      parentCategoryId: '',
      keywords: []
    });
  };

  // 분류항목 삭제
  const handleDeleteCategory = (categoryId: string) => {
    if (window.confirm('이 분류를 삭제하시겠습니까? 관련된 거래내역의 분류가 초기화됩니다.')) {
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      const updatedSubcategories = subcategories.filter(sub => sub.parentCategoryId !== categoryId);
      onUpdateCategories(updatedCategories);
      onUpdateSubcategories(updatedSubcategories);
    }
  };

  // 하위 분류항목 삭제
  const handleDeleteSubcategory = (subcategoryId: string) => {
    if (window.confirm('이 하위 분류를 삭제하시겠습니까?')) {
      const updatedSubcategories = subcategories.filter(sub => sub.id !== subcategoryId);
      onUpdateSubcategories(updatedSubcategories);
    }
  };

  // 키워드 추가
  const addKeyword = (keywords: string[], setKeywords: (keywords: string[]) => void) => {
    const keyword = prompt('추가할 키워드를 입력하세요:');
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
    }
  };

  // 키워드 삭제
  const removeKeyword = (keywords: string[], setKeywords: (keywords: string[]) => void, index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  // 분류항목 편집 시작
  const startEditCategory = (category: Category) => {
    setEditingCategory(category);
    setNewCategory(category);
  };

  // 하위 분류항목 편집 시작
  const startEditSubcategory = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setNewSubcategory(subcategory);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <Settings className="mr-2" />
            분류항목 관리
          </h2>
          
          <div className="flex space-x-2">
            <button
              onClick={onApplySampleCategories}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <Download size={16} />
              <span>샘플 적용</span>
            </button>
            <button
              onClick={() => setShowAddCategory(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus size={16} />
              <span>분류 추가</span>
            </button>
          </div>
        </div>
      </div>

      {/* 분류항목 목록 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 지출 분류 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-red-600">지출 분류</h3>
          </div>
          <div className="p-4 space-y-3">
            {categories
              .filter(cat => cat.type === 'expense')
              .map(category => {
                const stats = categoryStats.find(s => s.categoryId === category.id);
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          {stats ? `${stats.count}건, ${stats.totalAmount.toLocaleString()}원` : '사용 안함'}
                        </div>
                        <div className="text-xs text-gray-400">
                          키워드: {category.keywords.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditCategory(category)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 수입 분류 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-green-600">수입 분류</h3>
          </div>
          <div className="p-4 space-y-3">
            {categories
              .filter(cat => cat.type === 'income')
              .map(category => {
                const stats = categoryStats.find(s => s.categoryId === category.id);
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          {stats ? `${stats.count}건, ${stats.totalAmount.toLocaleString()}원` : '사용 안함'}
                        </div>
                        <div className="text-xs text-gray-400">
                          키워드: {category.keywords.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEditCategory(category)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* 하위 분류항목 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">하위 분류</h3>
          <button
            onClick={() => setShowAddSubcategory(true)}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
          >
            <Plus size={14} />
            <span>하위 분류 추가</span>
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {subcategories.map(subcategory => {
              const parentCategory = categories.find(cat => cat.id === subcategory.parentCategoryId);
              return (
                <div key={subcategory.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{subcategory.name}</div>
                    <div className="text-sm text-gray-500">
                      {parentCategory?.name} 하위
                    </div>
                    <div className="text-xs text-gray-400">
                      키워드: {subcategory.keywords.join(', ')}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => startEditSubcategory(subcategory)}
                      className="p-1 text-gray-400 hover:text-blue-500"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteSubcategory(subcategory.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 분류항목 추가/편집 모달 */}
      {(showAddCategory || editingCategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingCategory ? '분류 수정' : '분류 추가'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                  setNewCategory({
                    name: '',
                    type: 'expense',
                    keywords: [],
                    color: '#3B82F6'
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  분류명
                </label>
                <input
                  type="text"
                  value={newCategory.name || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="분류명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래 유형
                </label>
                <select
                  value={newCategory.type || 'expense'}
                  onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="expense">지출</option>
                  <option value="income">수입</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  색상
                </label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategory({ ...newCategory, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newCategory.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자동 분류 키워드
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(newCategory.keywords || []).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center space-x-1"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(
                          newCategory.keywords || [], 
                          (keywords) => setNewCategory({ ...newCategory, keywords }),
                          index
                        )}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => addKeyword(
                    newCategory.keywords || [], 
                    (keywords) => setNewCategory({ ...newCategory, keywords })
                  )}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  키워드 추가
                </button>
              </div>
            </div>

            <div className="flex space-x-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowAddCategory(false);
                  setEditingCategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveCategory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 하위 분류항목 추가/편집 모달 */}
      {(showAddSubcategory || editingSubcategory) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingSubcategory ? '하위 분류 수정' : '하위 분류 추가'}
              </h3>
              <button
                onClick={() => {
                  setShowAddSubcategory(false);
                  setEditingSubcategory(null);
                  setNewSubcategory({
                    name: '',
                    parentCategoryId: '',
                    keywords: []
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  상위 분류
                </label>
                <select
                  value={newSubcategory.parentCategoryId || ''}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, parentCategoryId: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">상위 분류를 선택하세요</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  하위 분류명
                </label>
                <input
                  type="text"
                  value={newSubcategory.name || ''}
                  onChange={(e) => setNewSubcategory({ ...newSubcategory, name: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="하위 분류명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  자동 분류 키워드
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(newSubcategory.keywords || []).map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm flex items-center space-x-1"
                    >
                      <span>{keyword}</span>
                      <button
                        onClick={() => removeKeyword(
                          newSubcategory.keywords || [], 
                          (keywords) => setNewSubcategory({ ...newSubcategory, keywords }),
                          index
                        )}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => addKeyword(
                    newSubcategory.keywords || [], 
                    (keywords) => setNewSubcategory({ ...newSubcategory, keywords })
                  )}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                >
                  키워드 추가
                </button>
              </div>
            </div>

            <div className="flex space-x-3 p-4 border-t">
              <button
                onClick={() => {
                  setShowAddSubcategory(false);
                  setEditingSubcategory(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSaveSubcategory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
