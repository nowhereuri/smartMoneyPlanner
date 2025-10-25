import { Transaction, TransactionType } from '../types';

// 텍스트에서 금액 추출하는 함수
export function extractAmount(text: string): number | null {
  // 다양한 금액 패턴 매칭
  const patterns = [
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*원/g, // 1,000원, 1000원
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*₩/g, // 1,000₩
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*W/g, // 1,000W
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*$/g, // 끝에 숫자만
    /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g // 일반 숫자
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      // 가장 큰 금액을 선택 (보통 총액)
      const amounts = matches.map(match => {
        const cleanAmount = match.replace(/[^\d.,]/g, '');
        return parseFloat(cleanAmount.replace(/,/g, ''));
      });
      
      if (amounts.length > 0) {
        return Math.max(...amounts);
      }
    }
  }

  return null;
}

// 텍스트에서 날짜 추출하는 함수
export function extractDate(text: string): Date | null {
  const now = new Date();
  
  // 다양한 날짜 패턴
  const patterns = [
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/g, // 2024-01-15, 2024/01/15
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/g, // 01-15-2024, 01/15/2024
    /(\d{1,2})[-\/](\d{1,2})/g, // 01-15 (올해 기준)
    /(\d{1,2})월\s*(\d{1,2})일/g, // 1월 15일
    /(\d{1,2})\.(\d{1,2})\.(\d{4})/g, // 01.15.2024
    /(\d{1,2})\.(\d{1,2})/g // 01.15 (올해 기준)
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const parts = match[0].match(/\d+/g);
      if (parts) {
        let year = now.getFullYear();
        let month = 0;
        let day = 0;

        if (parts.length === 3) {
          // 년월일 모두 있는 경우
          if (pattern.source.includes('(\\d{4})')) {
            year = parseInt(parts[0]);
            month = parseInt(parts[1]) - 1;
            day = parseInt(parts[2]);
          } else {
            month = parseInt(parts[0]) - 1;
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
          }
        } else if (parts.length === 2) {
          // 월일만 있는 경우
          month = parseInt(parts[0]) - 1;
          day = parseInt(parts[1]);
        }

        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
  }

  return null;
}

// 텍스트에서 거래 유형 판단 (수입/지출)
export function determineTransactionType(text: string): TransactionType {
  const incomeKeywords = ['입금', '수입', '급여', '월급', '보너스', '용돈', '선물', '환급', '적립'];
  const expenseKeywords = ['출금', '지출', '결제', '구매', '이용', '이용료', '수수료', '요금'];

  const lowerText = text.toLowerCase();

  for (const keyword of incomeKeywords) {
    if (lowerText.includes(keyword)) {
      return 'income';
    }
  }

  for (const keyword of expenseKeywords) {
    if (lowerText.includes(keyword)) {
      return 'expense';
    }
  }

  // 기본값은 지출
  return 'expense';
}

// 텍스트에서 상점명이나 설명 추출
export function extractDescription(text: string): string {
  // 일반적인 패턴들
  const patterns = [
    /([가-힣\w\s]+)\s*\d+[,\d]*원/, // 상점명 + 금액
    /([가-힣\w\s]+)\s*결제/, // 상점명 + 결제
    /([가-힣\w\s]+)\s*이용/, // 상점명 + 이용
    /([가-힣\w\s]+)\s*구매/ // 상점명 + 구매
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  // 패턴이 없으면 첫 번째 줄이나 의미있는 부분 추출
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  if (lines.length > 0) {
    return lines[0].trim();
  }

  return text.trim();
}

// 영수증이나 카톡 텍스트를 파싱하여 거래내역 생성
export function parseTextToTransaction(text: string): Partial<Transaction> {
  const amount = extractAmount(text);
  const date = extractDate(text) || new Date();
  const type = determineTransactionType(text);
  const description = extractDescription(text);

  return {
    date,
    type,
    amount: amount || 0,
    description,
    source: 'receipt',
    originalText: text
  };
}

// 카카오톡 메시지 특화 파싱
export function parseKakaoMessage(text: string): Partial<Transaction> {
  // 카카오톡 메시지의 일반적인 패턴
  const kakaoPatterns = [
    /([가-힣\w\s]+)\s*(\d{1,3}(?:,\d{3})*)\s*원\s*결제/, // 상점명 + 금액 + 결제
    /(\d{1,3}(?:,\d{3})*)\s*원\s*([가-힣\w\s]+)\s*결제/, // 금액 + 상점명 + 결제
    /([가-힣\w\s]+)\s*(\d{1,3}(?:,\d{3})*)\s*원/, // 상점명 + 금액
  ];

  for (const pattern of kakaoPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = extractAmount(match[0]);
      const description = match[1] || match[2] || extractDescription(text);
      
      return {
        date: extractDate(text) || new Date(),
        type: determineTransactionType(text),
        amount: amount || 0,
        description,
        source: 'kakao',
        originalText: text
      };
    }
  }

  // 일반 파싱으로 폴백
  return parseTextToTransaction(text);
}
