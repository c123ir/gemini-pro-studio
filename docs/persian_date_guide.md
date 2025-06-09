# 📅 راهنمای پیاده‌سازی تاریخ هجری شمسی در پروژه Gemini Pro Studio

## 🎯 مقدمه

پروژه Gemini Pro Studio به عنوان یک وب اپلیکیشن فارسی، نیاز به پشتیبانی کامل از تاریخ هجری شمسی دارد. این مستند، راهنمای جامعی برای پیاده‌سازی، نمایش و مدیریت تاریخ‌های شمسی در سراسر برنامه ارائه می‌دهد.

## 🛠️ کتابخانه‌های مورد استفاده

برای پیاده‌سازی تاریخ شمسی در پروژه، از کتابخانه‌های زیر استفاده می‌کنیم:

1. **Moment-Jalaali**: کتابخانه اصلی برای تبدیل و مدیریت تاریخ شمسی
   - نصب: `npm install moment-jalaali`
   - تایپ‌اسکریپت: `npm install @types/moment-jalaali`

2. **Date-FNS-Jalali**: برای توابع متنوع کار با تاریخ شمسی
   - نصب: `npm install date-fns-jalali`

## ⚙️ پیکربندی اولیه

### تنظیمات در فرانت‌اند

برای استفاده از Moment-Jalaali در پروژه React:

```typescript
// src/utils/dateUtils.ts
import moment from 'moment-jalaali';

// تنظیم لوکال فارسی
moment.loadPersian({ dialect: 'persian-modern', usePersianDigits: true });

// فرمت‌های تاریخ پرکاربرد
export const DATE_FORMATS = {
  FULL_DATE: 'dddd D MMMM YYYY',       // چهارشنبه 12 خرداد 1403
  SHORT_DATE: 'YYYY/MM/DD',             // 1403/03/12
  MONTH_DAY: 'D MMMM',                 // 12 خرداد
  TIME: 'HH:mm',                       // 14:30
  FULL_DATETIME: 'YYYY/MM/DD HH:mm:ss' // 1403/03/12 14:30:25
};

// تبدیل تاریخ میلادی به شمسی
export const toJalali = (date: Date | string | null): string => {
  if (!date) return '-';
  return moment(date).format(DATE_FORMATS.SHORT_DATE);
};

// تبدیل تاریخ شمسی به میلادی
export const toGregorian = (jDate: string): Date => {
  return moment.jMoment(jDate, DATE_FORMATS.SHORT_DATE).toDate();
};

// فرمت تاریخ شمسی با الگوی دلخواه
export const formatJalali = (date: Date | string | null, format: string): string => {
  if (!date) return '-';
  return moment(date).format(format);
};

// تاریخ فعلی به شمسی
export const nowJalali = (): string => {
  return moment().format(DATE_FORMATS.FULL_DATE);
};

// محاسبه اختلاف زمانی به صورت متنی (مثلا: 3 روز پیش)
export const timeFromNow = (date: Date | string | null): string => {
  if (!date) return '-';
  return moment(date).fromNow();
};

// روز هفته به فارسی
export const weekDayName = (date: Date): string => {
  return moment(date).format('dddd');
};

// ماه به فارسی
export const monthName = (date: Date): string => {
  return moment(date).format('MMMM');
};
```

### تنظیمات در بک‌اند

برای مدیریت تاریخ شمسی در سرور Node.js:

```typescript
// src/utils/jalaliDate.ts
import moment from 'moment-jalaali';

// تبدیل تاریخ میلادی به شمسی در سرور
export const toJalali = (date: Date): string => {
  return moment(date).format('YYYY/MM/DD');
};

// تبدیل تاریخ شمسی به میلادی برای ذخیره در دیتابیس
export const toGregorian = (jalaliDate: string): Date => {
  try {
    return moment.jMoment(jalaliDate, 'YYYY/MM/DD').toDate();
  } catch (error) {
    console.error('Invalid Jalali date:', jalaliDate);
    return new Date();
  }
};

// اعتبارسنجی تاریخ شمسی
export const isValidJalaliDate = (jalaliDate: string): boolean => {
  return moment.jMoment(jalaliDate, 'YYYY/MM/DD').isValid();
};
```

## 🎨 کامپوننت‌های تاریخ شمسی

### 1. انتخاب‌گر تاریخ شمسی (DatePicker)

```tsx
// src/components/ui/PersianDatePicker.tsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker2';
import moment from 'moment-jalaali';
import 'react-datepicker2/dist/react-datepicker2.css';

interface PersianDatePickerProps {
  value?: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
}

export const PersianDatePicker: React.FC<PersianDatePickerProps> = ({
  value,
  onChange,
  placeholder = 'انتخاب تاریخ',
  className = '',
  disabled = false,
  minDate,
  maxDate,
  showTime = false,
}) => {
  // تبدیل Date به moment-jalaali
  const momentValue = value ? moment(value) : null;
  
  // تغییر ورودی
  const handleChange = (date: moment.Moment | null) => {
    onChange(date ? date.toDate() : null);
  };
  
  return (
    <div className={`persian-datepicker-wrapper ${className}`}>
      <DatePicker
        value={momentValue}
        onChange={handleChange}
        disabled={disabled}
        timePicker={showTime}
        placeholder={placeholder}
        isGregorian={false}
        minDate={minDate ? moment(minDate) : undefined}
        maxDate={maxDate ? moment(maxDate) : undefined}
        className={`persian-datepicker ${disabled ? 'disabled' : ''}`}
      />
    </div>
  );
};
```

### 2. نمایش‌دهنده تاریخ شمسی

```tsx
// src/components/ui/PersianDate.tsx
import React from 'react';
import { formatJalali, DATE_FORMATS } from '../../utils/dateUtils';

interface PersianDateProps {
  date: Date | string | null;
  format?: string;
  className?: string;
}

export const PersianDate: React.FC<PersianDateProps> = ({
  date,
  format = DATE_FORMATS.SHORT_DATE,
  className = '',
}) => {
  if (!date) return <span className={className}>-</span>;
  
  return (
    <time 
      dateTime={new Date(date).toISOString()} 
      className={`persian-date ${className}`}
    >
      {formatJalali(date, format)}
    </time>
  );
};
```

### 3. انتخاب‌گر محدوده تاریخ

```tsx
// src/components/ui/PersianDateRangePicker.tsx
import React from 'react';
import { PersianDatePicker } from './PersianDatePicker';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface PersianDateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export const PersianDateRangePicker: React.FC<PersianDateRangePickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const { startDate, endDate } = value;
  
  const handleStartDateChange = (date: Date | null) => {
    onChange({
      startDate: date,
      endDate: endDate && date && date > endDate ? date : endDate,
    });
  };
  
  const handleEndDateChange = (date: Date | null) => {
    onChange({
      startDate,
      endDate: date,
    });
  };
  
  return (
    <div className={`persian-date-range-picker ${className}`}>
      <div className="date-range-row">
        <div className="date-range-field">
          <label>از تاریخ:</label>
          <PersianDatePicker
            value={startDate}
            onChange={handleStartDateChange}
            maxDate={endDate || undefined}
            placeholder="تاریخ شروع"
          />
        </div>
        
        <div className="date-range-field">
          <label>تا تاریخ:</label>
          <PersianDatePicker
            value={endDate}
            onChange={handleEndDateChange}
            minDate={startDate || undefined}
            placeholder="تاریخ پایان"
          />
        </div>
      </div>
    </div>
  );
};
```

## 🔄 تعامل با API

### ارسال و دریافت تاریخ‌ها

تاریخ‌ها در API به صورت ISO string ارسال و دریافت می‌شوند و در فرانت‌اند به شمسی تبدیل می‌شوند:

```typescript
// src/services/apiService.ts
import { toJalali, toGregorian } from '../utils/dateUtils';

// پیش از ارسال به API، تاریخ‌های شمسی را به میلادی تبدیل می‌کنیم
const prepareDataForApi = (data: any): any => {
  if (!data) return data;
  
  // اگر داده یک آبجکت باشد
  if (typeof data === 'object' && !Array.isArray(data)) {
    const result: any = {};
    
    for (const key in data) {
      // تشخیص فیلدهای تاریخ شمسی (با پسوند JalaliDate)
      if (key.endsWith('JalaliDate') && typeof data[key] === 'string') {
        // تبدیل به تاریخ میلادی
        const baseKey = key.replace('JalaliDate', '');
        result[baseKey] = toGregorian(data[key]);
      } else {
        // بازگشتی برای آبجکت‌های تودرتو
        result[key] = prepareDataForApi(data[key]);
      }
    }
    
    return result;
  }
  
  // اگر داده یک آرایه باشد
  if (Array.isArray(data)) {
    return data.map(item => prepareDataForApi(item));
  }
  
  return data;
};

// برای تاریخ‌های دریافتی از سرور، تبدیل به شمسی انجام می‌شود
const convertDatesToJalali = (data: any): any => {
  if (!data) return data;
  
  // اگر داده یک آبجکت باشد
  if (typeof data === 'object' && !Array.isArray(data)) {
    const result: any = { ...data };
    
    for (const key in data) {
      // تشخیص فیلدهای تاریخ (با پسوندهای Date یا At)
      if (
        (key.endsWith('Date') || key.endsWith('At')) && 
        typeof data[key] === 'string' &&
        /^\d{4}-\d{2}-\d{2}/.test(data[key]) // الگوی ISO date
      ) {
        // اضافه کردن فیلد تاریخ شمسی
        result[`${key}Jalali`] = toJalali(data[key]);
      } else if (typeof data[key] === 'object') {
        // بازگشتی برای آبجکت‌های تودرتو
        result[key] = convertDatesToJalali(data[key]);
      }
    }
    
    return result;
  }
  
  // اگر داده یک آرایه باشد
  if (Array.isArray(data)) {
    return data.map(item => convertDatesToJalali(item));
  }
  
  return data;
};

// ارسال درخواست به API با تبدیل تاریخ‌های شمسی
export const apiRequest = async (url: string, method: string, data?: any) => {
  const preparedData = data ? prepareDataForApi(data) : undefined;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: preparedData ? JSON.stringify(preparedData) : undefined,
  });
  
  const responseData = await response.json();
  return convertDatesToJalali(responseData);
};
```

## 🗓️ کاربرد در کامپوننت‌های مختلف

### 1. نمایش تاریخ در لیست گفتگوها

```tsx
// src/components/chat/ConversationItem.tsx
import React from 'react';
import { PersianDate } from '../ui/PersianDate';
import { DATE_FORMATS } from '../../utils/dateUtils';

interface ConversationItemProps {
  conversation: {
    id: number;
    title: string;
    lastMessageAt: string;
    // سایر فیلدها
  };
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  const { id, title, lastMessageAt } = conversation;
  
  return (
    <div className="conversation-item">
      <div className="conversation-title">{title}</div>
      <div className="conversation-date">
        <PersianDate 
          date={lastMessageAt} 
          format={DATE_FORMATS.SHORT_DATE + ' - ' + DATE_FORMATS.TIME}
        />
      </div>
    </div>
  );
};
```

### 2. فیلتر گفتگوها بر اساس تاریخ

```tsx
// src/components/chat/ConversationFilter.tsx
import React, { useState } from 'react';
import { PersianDateRangePicker } from '../ui/PersianDateRangePicker';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface ConversationFilterProps {
  onFilterChange: (filters: any) => void;
}

export const ConversationFilter: React.FC<ConversationFilterProps> = ({ onFilterChange }) => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    onFilterChange({
      dateRange: range
    });
  };
  
  return (
    <div className="conversation-filter">
      <h3>فیلتر بر اساس تاریخ</h3>
      <PersianDateRangePicker
        value={dateRange}
        onChange={handleDateRangeChange}
      />
    </div>
  );
};
```

### 3. نمایش تاریخ شمسی در پیام‌های چت

```tsx
// src/components/chat/MessageItem.tsx
import React from 'react';
import { PersianDate } from '../ui/PersianDate';
import { timeFromNow } from '../../utils/dateUtils';

interface MessageItemProps {
  message: {
    id: number;
    content: string;
    role: 'user' | 'assistant';
    createdAt: string;
    // سایر فیلدها
  };
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const { content, role, createdAt } = message;
  
  return (
    <div className={`message-item ${role}`}>
      <div className="message-content">{content}</div>
      <div className="message-meta">
        <span className="message-time" title={timeFromNow(createdAt)}>
          <PersianDate date={createdAt} format="HH:mm" />
        </span>
      </div>
    </div>
  );
};
```

## 📝 نمایش آمار و گزارش‌ها

### گزارش‌های با محدوده زمانی شمسی

```tsx
// src/components/analytics/UsageReport.tsx
import React, { useState, useEffect } from 'react';
import { PersianDateRangePicker } from '../ui/PersianDateRangePicker';
import { Chart } from '../ui/Chart';
import { apiService } from '../../services/apiService';
import { formatJalali, DATE_FORMATS } from '../../utils/dateUtils';

interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export const UsageReport: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 روز قبل
    endDate: new Date(),
  });
  
  const [usageData, setUsageData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadUsageData();
  }, [dateRange]);
  
  const loadUsageData = async () => {
    if (!dateRange.startDate || !dateRange.endDate) return;
    
    setIsLoading(true);
    try {
      const data = await apiService.get('/api/analytics/usage', {
        params: {
          startDate: dateRange.startDate.toISOString(),
          endDate: dateRange.endDate.toISOString(),
        },
      });
      
      // تبدیل تاریخ‌ها به شمسی در داده‌های نمودار
      const formattedData = data.map((item: any) => ({
        ...item,
        dateJalali: formatJalali(item.date, DATE_FORMATS.SHORT_DATE),
      }));
      
      setUsageData(formattedData);
    } catch (error) {
      console.error('Error loading usage data', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="usage-report">
      <h2>گزارش مصرف API</h2>
      
      <div className="report-controls">
        <PersianDateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />
        <button 
          onClick={loadUsageData} 
          disabled={isLoading || !dateRange.startDate || !dateRange.endDate}
        >
          {isLoading ? 'در حال بارگذاری...' : 'بروزرسانی'}
        </button>
      </div>
      
      {usageData.length > 0 && (
        <Chart
          data={usageData}
          xField="dateJalali"
          yField="totalTokens"
          title="میزان مصرف توکن"
        />
      )}
      
      {usageData.length === 0 && !isLoading && (
        <div className="no-data">داده‌ای برای نمایش وجود ندارد</div>
      )}
    </div>
  );
};
```

## 📊 مدیریت تاریخ در نمودارها

```tsx
// src/components/ui/Chart.tsx
import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: any[];
  xField: string; // فیلد تاریخ شمسی
  yField: string;
  title?: string;
  color?: string;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  xField,
  yField,
  title = '',
  color = '#4c8bf5'
}) => {
  // تنظیم تیک‌های محور X برای فارسی
  const customTickFormatter = (value: string) => {
    return value.replace(/[0-9]/g, (digit) => {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return persianDigits[parseInt(digit)];
    });
  };

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey={xField} 
            tickFormatter={customTickFormatter}
            style={{ fontFamily: 'Vazir', fontSize: '12px' }}
          />
          <YAxis 
            tickFormatter={(value) => customTickFormatter(value.toString())}
            style={{ fontFamily: 'Vazir', fontSize: '12px' }}
          />
          <Tooltip 
            formatter={(value) => [customTickFormatter(value.toString()), '']}
            labelFormatter={(label) => `تاریخ: ${customTickFormatter(label.toString())}`}
          />
          <Legend />
          <Line type="monotone" dataKey={yField} stroke={color} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
```

## 🌙 استایلینگ برای تقویم شمسی

```scss
/* src/styles/persian-calendar.scss */

.persian-datepicker-wrapper {
  direction: rtl;
  width: 100%;
  
  .persian-datepicker {
    width: 100%;
    height: 40px;
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-family: 'Vazir', sans-serif;
    
    &:focus {
      outline: none;
      border-color: #4c8bf5;
      box-shadow: 0 0 0 2px rgba(76, 139, 245, 0.2);
    }
    
    &.disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
}

/* تنظیمات ظاهر تقویم */
.datepicker-container {
  font-family: 'Vazir', sans-serif !important;
  
  .days-titles {
    color: #555;
    font-size: 12px;
  }
  
  .today-button {
    color: #4c8bf5;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  .selected-day {
    background-color: #4c8bf5 !important;
    color: white !important;
  }
  
  .current-month-day {
    &:hover {
      background-color: rgba(76, 139, 245, 0.1);
    }
  }
}

/* تنظیمات برای تم تاریک */
.dark-theme {
  .persian-datepicker {
    background-color: #2a2a2a;
    color: #f0f0f0;
    border-color: #444;
    
    &.disabled {
      background-color: #333;
      color: #777;
    }
  }
  
  .datepicker-container {
    background-color: #2a2a2a;
    color: #f0f0f0;
    
    .days-titles {
      color: #bbb;
    }
    
    .today-button {
      color: #6c9cff;
    }
    
    .day-button {
      color: #f0f0f0 !important;
    }
    
    .selected-day {
      background-color: #4c8bf5 !important;
    }
    
    .current-month-day {
      &:hover {
        background-color: rgba(76, 139, 245, 0.2);
      }
    }
  }
}

/* ساختار انتخاب محدوده تاریخ */
.persian-date-range-picker {
  .date-range-row {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    
    @media (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }
  
  .date-range-field {
    flex: 1;
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }
  }
}
```

## 🔄 تاریخ شمسی در URL ها

```typescript
// src/utils/urlUtils.ts
import { toJalali, toGregorian } from './dateUtils';

// استفاده از تاریخ شمسی در URL ها
export const addJalaliDatesToUrl = (
  baseUrl: string, 
  params: { startDate?: Date, endDate?: Date, [key: string]: any }
): string => {
  const url = new URL(baseUrl, window.location.origin);
  
  // تبدیل تاریخ‌های میلادی به شمسی
  for (const key in params) {
    if (params[key] !== undefined) {
      if ((key === 'startDate' || key === 'endDate') && params[key] instanceof Date) {
        url.searchParams.append(key, toJalali(params[key]));
      } else {
        url.searchParams.append(key, String(params[key]));
      }
    }
  }
  
  return url.toString();
};

// استخراج تاریخ شمسی از URL و تبدیل به میلادی
export const getJalaliDatesFromUrl = (): { startDate?: Date, endDate?: Date } => {
  const searchParams = new URLSearchParams(window.location.search);
  const result: { startDate?: Date, endDate?: Date } = {};
  
  const startDateStr = searchParams.get('startDate');
  const endDateStr = searchParams.get('endDate');
  
  if (startDateStr) {
    try {
      result.startDate = toGregorian(startDateStr);
    } catch (e) {
      console.error('Invalid startDate in URL', e);
    }
  }
  
  if (endDateStr) {
    try {
      result.endDate = toGregorian(endDateStr);
    } catch (e) {
      console.error('Invalid endDate in URL', e);
    }
  }
  
  return result;
};
```

## 📝 مستندات API برای تاریخ‌های شمسی

### نمونه مستندات برای API کلاینت

```typescript
/**
 * دریافت گفتگوها با فیلتر تاریخ شمسی
 * 
 * @param {string} startJalaliDate - تاریخ شروع به فرمت شمسی (1403/03/01)
 * @param {string} endJalaliDate - تاریخ پایان به فرمت شمسی (1403/03/30)
 * @returns {Promise<Conversation[]>} - لیست گفتگوها
 * 
 * توجه: تاریخ‌های شمسی قبل از ارسال به API به میلادی تبدیل می‌شوند
 */
export const getConversationsByDateRange = async (
  startJalaliDate: string,
  endJalaliDate: string
): Promise<Conversation[]> => {
  return await apiService.get('/api/conversations', {
    startJalaliDate,
    endJalaliDate
  });
};
```

## 🧪 تست تاریخ‌های شمسی

```typescript
// src/utils/__tests__/dateUtils.test.ts
import { toJalali, toGregorian, formatJalali, DATE_FORMATS } from '../dateUtils';

describe('تست توابع تاریخ شمسی', () => {
  test('تبدیل تاریخ میلادی به شمسی', () => {
    // تاریخ 2024-06-01 باید به 1403/03/12 تبدیل شود
    const date = new Date('2024-06-01T12:00:00Z');
    const jalali = toJalali(date);
    expect(jalali).toBe('1403/03/12');
  });

  test('تبدیل تاریخ شمسی به میلادی', () => {
    // تاریخ 1403/03/12 باید به 2024-06-01 تبدیل شود
    const jalali = '1403/03/12';
    const gregorian = toGregorian(jalali);
    
    // روز، ماه و سال میلادی را بررسی می‌کنیم
    expect(gregorian.getFullYear()).toBe(2024);
    expect(gregorian.getMonth()).toBe(5); // ژوئن (شروع از صفر)
    expect(gregorian.getDate()).toBe(1);
  });

  test('فرمت کردن تاریخ با الگوی دلخواه', () => {
    const date = new Date('2024-06-01T12:00:00Z');
    const formatted = formatJalali(date, DATE_FORMATS.FULL_DATE);
    // نتیجه باید شنبه 12 خرداد 1403 باشد
    expect(formatted).toContain('12 خرداد 1403');
  });
});
```

## 🔍 نکات مهم در پیاده‌سازی تاریخ شمسی

1. **اختلاف زمانی سرور و کلاینت**: 
   - همیشه از UTC برای ذخیره‌سازی در دیتابیس استفاده کنید
   - تبدیل به تاریخ شمسی را در سمت کلاینت انجام دهید

2. **بازخوردهای کاربری**:
   - همیشه فرمت تاریخ ورودی را به کاربر یادآوری کنید (مثلاً ورود به صورت 1403/03/12)
   - خطاهای ورودی تاریخ را با پیام مناسب نمایش دهید

3. **عملکرد بهینه**:
   - تاریخ‌های پرتکرار را در کش نگهداری کنید
   - از تبدیل‌های غیرضروری جلوگیری کنید

4. **سازگاری با موبایل**:
   - از کامپوننت‌های DatePicker سازگار با موبایل استفاده کنید
   - برای صفحات کوچک، رابط کاربری مناسب طراحی کنید

5. **دسترسی‌پذیری**:
   - امکان انتخاب تاریخ با کیبورد را فراهم کنید
   - توصیف‌های مناسب برای خوانندگان صفحه ارائه دهید

## 🔄 جدول تبدیل ماه‌های میلادی به شمسی

| ماه میلادی | ماه شمسی معادل (تقریبی) |
|------------|------------------------|
| January    | دی / بهمن              |
| February   | بهمن / اسفند           |
| March      | اسفند / فروردین        |
| April      | فروردین / اردیبهشت     |
| May        | اردیبهشت / خرداد       |
| June       | خرداد / تیر            |
| July       | تیر / مرداد            |
| August     | مرداد / شهریور         |
| September  | شهریور / مهر           |
| October    | مهر / آبان             |
| November   | آبان / آذر             |
| December   | آذر / دی                |

## 🌐 منابع مفید

1. [مستندات Moment-Jalaali](https://github.com/jalaali/moment-jalaali)
2. [کامپوننت React DatePicker2](https://github.com/mberneti/react-datepicker2)
3. [تقویم رسمی ایران](https://calendar.ut.ac.ir/)
4. [الگوریتم تبدیل تاریخ شمسی به میلادی](https://github.com/jalaali/jalaali-js)

---

راهنمای فوق توسط تیم توسعه Gemini Pro Studio تهیه شده است.  
نسخه 1.0 - تاریخ: ۱۴۰۳/۰۳/۲۵ 