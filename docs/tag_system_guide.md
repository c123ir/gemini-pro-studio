# 🏷️ راهنمای سیستم برچسب‌گذاری حرفه‌ای Gemini Pro Studio

## 📌 مقدمه

سیستم برچسب‌گذاری Gemini Pro Studio یک قابلیت حرفه‌ای و انعطاف‌پذیر است که به شما امکان می‌دهد محتوای مختلف را دسته‌بندی، سازماندهی و به سرعت پیدا کنید. با استفاده از برچسب‌های رنگی و قابل شخصی‌سازی، می‌توانید تمام انواع محتوا را مدیریت کنید.

## 🎯 ویژگی‌های اصلی

### 🎨 رنگ‌های تصادفی و قابل تغییر
- هر برچسب به طور خودکار یک رنگ تصادفی دریافت می‌کند
- امکان تغییر رنگ برچسب به دلخواه
- پیشنهاد خودکار رنگ جدید برای هر برچسب
- طیف گسترده‌ای از رنگ‌های سازگار با تم شب و روز

### 📊 قابل استفاده در تمام بخش‌های برنامه
- برچسب‌گذاری گفتگوهای چت
- برچسب‌گذاری تصاویر و نتایج پردازش تصویری
- برچسب‌گذاری فایل‌های صوتی
- برچسب‌گذاری محتوای تولیدی
- برچسب‌گذاری پرومپت‌های ذخیره شده

### 🧠 سازماندهی هوشمند
- دسته‌بندی خودکار بر اساس الگوهای استفاده
- پیشنهاد برچسب بر اساس محتوای مشابه
- امکان مرتب‌سازی بر اساس برچسب‌ها
- گزارش کاربرد برچسب‌ها

## 🛠️ نحوه استفاده

### 🔖 ایجاد برچسب جدید
1. روی آیکون "+" در بخش برچسب‌ها کلیک کنید
2. نام برچسب را وارد کنید
3. رنگ پیشنهادی را بپذیرید یا رنگ دلخواه را انتخاب کنید
4. دکمه "ایجاد" را بزنید

### 🔄 تغییر رنگ برچسب
1. روی برچسب مورد نظر کلیک راست کنید
2. گزینه "تغییر رنگ" را انتخاب کنید
3. رنگ جدید را از پالت رنگ انتخاب کنید یا دکمه "رنگ تصادفی" را بزنید
4. تغییرات را ذخیره کنید

### 🔍 جستجو بر اساس برچسب
1. در قسمت جستجو، روی آیکون برچسب کلیک کنید
2. برچسب‌های مورد نظر را انتخاب کنید
3. برای جستجوی ترکیبی چند برچسب، گزینه "AND" یا "OR" را انتخاب کنید

### ✏️ ویرایش برچسب‌ها
1. به بخش "مدیریت برچسب‌ها" در تنظیمات بروید
2. روی برچسب مورد نظر کلیک کنید
3. نام یا رنگ را تغییر دهید
4. برای حذف برچسب، روی آیکون سطل زباله کلیک کنید

### 🔀 ادغام برچسب‌ها
1. در بخش "مدیریت برچسب‌ها"، چند برچسب را انتخاب کنید
2. روی دکمه "ادغام برچسب‌ها" کلیک کنید
3. نام و رنگ برچسب جدید را تعیین کنید
4. تأیید کنید

## 🧩 کامپوننت‌های سیستم برچسب‌گذاری

### TagPicker.tsx
کامپوننت انتخاب و مدیریت برچسب‌ها که امکان انتخاب چند برچسب به صورت همزمان را فراهم می‌کند.

```tsx
// این کامپوننت برای انتخاب برچسب‌ها استفاده می‌شود
import React, { useState, useEffect } from 'react';
import { Tag, TagService } from '../services/tagService';

interface TagPickerProps {
  selectedTags: Tag[];
  onChange: (tags: Tag[]) => void;
  maxTags?: number;
}

export const TagPicker: React.FC<TagPickerProps> = ({ 
  selectedTags, 
  onChange, 
  maxTags = 10 
}) => {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  
  useEffect(() => {
    // بارگذاری تمام برچسب‌ها
    TagService.getAllTags().then(tags => setAllTags(tags));
  }, []);
  
  const handleAddTag = (tag: Tag) => {
    if (selectedTags.length < maxTags) {
      onChange([...selectedTags, tag]);
    }
  };
  
  const handleRemoveTag = (tagId: number) => {
    onChange(selectedTags.filter(tag => tag.id !== tagId));
  };
  
  const handleCreateTag = () => {
    if (newTagName.trim()) {
      // ایجاد برچسب جدید با رنگ تصادفی
      TagService.createTag(newTagName).then(newTag => {
        setAllTags([...allTags, newTag]);
        handleAddTag(newTag);
        setNewTagName('');
      });
    }
  };
  
  return (
    <div className="tag-picker">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span 
            key={tag.id}
            className="tag" 
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
            <button onClick={() => handleRemoveTag(tag.id)}>×</button>
          </span>
        ))}
      </div>
      
      <div className="tag-input">
        <input
          type="text"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="برچسب جدید..."
        />
        <button onClick={handleCreateTag}>افزودن</button>
      </div>
      
      <div className="available-tags">
        {allTags
          .filter(tag => !selectedTags.some(st => st.id === tag.id))
          .map(tag => (
            <span
              key={tag.id}
              className="tag"
              style={{ backgroundColor: tag.color }}
              onClick={() => handleAddTag(tag)}
            >
              {tag.name}
            </span>
          ))}
      </div>
    </div>
  );
};
```

### TagManager.tsx
کامپوننت مدیریت برچسب‌ها برای ایجاد، ویرایش، حذف و ادغام برچسب‌ها.

```tsx
// این کامپوننت برای مدیریت برچسب‌ها استفاده می‌شود
import React, { useState, useEffect } from 'react';
import { Tag, TagService } from '../services/tagService';
import { ColorPicker } from './ColorPicker';

export const TagManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  
  useEffect(() => {
    loadTags();
  }, []);
  
  const loadTags = () => {
    TagService.getAllTags().then(setTags);
  };
  
  const handleEdit = (tag: Tag) => {
    setEditingTag({ ...tag });
  };
  
  const handleSaveEdit = () => {
    if (editingTag) {
      TagService.updateTag(editingTag).then(() => {
        loadTags();
        setEditingTag(null);
      });
    }
  };
  
  const handleDelete = (id: number) => {
    if (window.confirm('آیا از حذف این برچسب اطمینان دارید؟')) {
      TagService.deleteTag(id).then(loadTags);
    }
  };
  
  const handleRandomColor = () => {
    if (editingTag) {
      setEditingTag({
        ...editingTag,
        color: TagService.getRandomColor()
      });
    }
  };
  
  const handleMergeTags = () => {
    if (selectedTags.length < 2) {
      alert('حداقل دو برچسب برای ادغام انتخاب کنید');
      return;
    }
    
    const newName = window.prompt('نام برچسب جدید را وارد کنید:');
    if (newName) {
      TagService.mergeTags(selectedTags, newName).then(() => {
        loadTags();
        setSelectedTags([]);
      });
    }
  };
  
  const toggleTagSelection = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  return (
    <div className="tag-manager">
      <h2>مدیریت برچسب‌ها</h2>
      
      {selectedTags.length > 0 && (
        <div className="merge-controls">
          <span>{selectedTags.length} برچسب انتخاب شده</span>
          <button onClick={handleMergeTags}>ادغام برچسب‌ها</button>
          <button onClick={() => setSelectedTags([])}>لغو انتخاب</button>
        </div>
      )}
      
      <table className="tags-table">
        <thead>
          <tr>
            <th></th>
            <th>نام</th>
            <th>رنگ</th>
            <th>تعداد استفاده</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {tags.map(tag => (
            <tr key={tag.id}>
              <td>
                <input 
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => toggleTagSelection(tag.id)}
                />
              </td>
              <td>{tag.name}</td>
              <td>
                <span
                  className="color-preview"
                  style={{ backgroundColor: tag.color }}
                />
              </td>
              <td>{tag.usageCount}</td>
              <td>
                <button onClick={() => handleEdit(tag)}>ویرایش</button>
                <button onClick={() => handleDelete(tag.id)}>حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingTag && (
        <div className="edit-dialog">
          <h3>ویرایش برچسب</h3>
          <input
            type="text"
            value={editingTag.name}
            onChange={e => setEditingTag({...editingTag, name: e.target.value})}
          />
          <ColorPicker
            color={editingTag.color}
            onChange={color => setEditingTag({...editingTag, color})}
          />
          <button onClick={handleRandomColor}>رنگ تصادفی</button>
          <div className="dialog-actions">
            <button onClick={handleSaveEdit}>ذخیره</button>
            <button onClick={() => setEditingTag(null)}>انصراف</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

### tagService.ts
سرویس مدیریت برچسب‌ها برای ارتباط با API و مدیریت رنگ‌های تصادفی.

```typescript
// خدمات مرتبط با برچسب‌ها
import { apiService } from './apiService';

export interface Tag {
  id: number;
  name: string;
  color: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

class TagServiceClass {
  // رنگ‌های پایه برای تولید رنگ تصادفی
  private baseColors = [
    '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
    '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
    '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
    '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
  ];

  // دریافت تمام برچسب‌های کاربر
  async getAllTags(): Promise<Tag[]> {
    return apiService.get('/api/tags');
  }
  
  // ایجاد برچسب جدید
  async createTag(name: string, color?: string): Promise<Tag> {
    const tagData = {
      name,
      color: color || this.getRandomColor()
    };
    
    return apiService.post('/api/tags', tagData);
  }
  
  // به‌روزرسانی برچسب
  async updateTag(tag: Tag): Promise<Tag> {
    return apiService.put(`/api/tags/${tag.id}`, tag);
  }
  
  // حذف برچسب
  async deleteTag(id: number): Promise<void> {
    return apiService.delete(`/api/tags/${id}`);
  }
  
  // ادغام چند برچسب
  async mergeTags(tagIds: number[], newName: string): Promise<Tag> {
    return apiService.post('/api/tags/merge', {
      tagIds,
      newName,
      color: this.getRandomColor()
    });
  }
  
  // افزودن برچسب به یک محتوا
  async tagItem(tagId: number, itemType: string, itemId: number): Promise<void> {
    return apiService.post('/api/taggable', {
      tagId,
      taggableType: itemType,
      taggableId: itemId
    });
  }
  
  // حذف برچسب از یک محتوا
  async untagItem(tagId: number, itemType: string, itemId: number): Promise<void> {
    return apiService.delete('/api/taggable', {
      data: {
        tagId,
        taggableType: itemType,
        taggableId: itemId
      }
    });
  }
  
  // دریافت برچسب‌های یک محتوا
  async getItemTags(itemType: string, itemId: number): Promise<Tag[]> {
    return apiService.get(`/api/taggable/${itemType}/${itemId}`);
  }
  
  // تولید رنگ تصادفی
  getRandomColor(): string {
    // انتخاب یک رنگ پایه به صورت تصادفی
    const baseColor = this.baseColors[Math.floor(Math.random() * this.baseColors.length)];
    
    // ایجاد واریانس کوچک در رنگ
    const color = baseColor.slice(1); // حذف #
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    
    // ایجاد تغییرات کوچک در هر کانال رنگ
    const variance = 15;
    const newR = Math.max(0, Math.min(255, r + Math.random() * variance * 2 - variance));
    const newG = Math.max(0, Math.min(255, g + Math.random() * variance * 2 - variance));
    const newB = Math.max(0, Math.min(255, b + Math.random() * variance * 2 - variance));
    
    // تبدیل به فرمت hex
    return `#${Math.round(newR).toString(16).padStart(2, '0')}${
      Math.round(newG).toString(16).padStart(2, '0')}${
      Math.round(newB).toString(16).padStart(2, '0')}`;
  }
  
  // دریافت رنگ‌های پیشنهادی
  getSuggestedColors(): string[] {
    return this.baseColors.map(() => this.getRandomColor());
  }
}

export const TagService = new TagServiceClass();
```

## 🎭 استایلینگ برچسب‌ها

برای استایل‌دهی برچسب‌ها، می‌توانید از کلاس‌های Tailwind CSS زیر استفاده کنید:

```css
/* در فایل CSS یا کلاس‌های Tailwind */

/* استایل پایه برچسب */
.tag {
  @apply inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mr-2 mb-2;
  @apply transition-all duration-200;
}

/* انیمیشن هنگام هاور */
.tag:hover {
  @apply transform scale-105;
}

/* استایل برچسب در تم روشن */
.light-theme .tag {
  @apply bg-opacity-20 border border-opacity-30;
}

/* استایل برچسب در تم تاریک */
.dark-theme .tag {
  @apply bg-opacity-30 border border-opacity-50;
}

/* نشانگر حذف */
.tag-remove {
  @apply ml-2 -mr-1 rounded-full hover:bg-opacity-25 p-1;
}
```

## 🔄 ارتباط با API

### API Endpoints

برای مدیریت برچسب‌ها، API های زیر در فایل routes/tags.ts پیاده‌سازی شده‌اند:

```
GET    /api/tags              - دریافت تمام برچسب‌های کاربر
POST   /api/tags              - ایجاد برچسب جدید
GET    /api/tags/:id          - دریافت یک برچسب خاص
PUT    /api/tags/:id          - به‌روزرسانی برچسب
DELETE /api/tags/:id          - حذف برچسب
POST   /api/tags/merge        - ادغام چند برچسب
POST   /api/taggable          - افزودن برچسب به محتوا
DELETE /api/taggable          - حذف برچسب از محتوا
GET    /api/taggable/:type/:id - دریافت برچسب‌های یک محتوا
```

## 🗃️ ساختار دیتابیس

برچسب‌ها در دیتابیس به شکل زیر ذخیره می‌شوند:

### جدول tags
```sql
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(20) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tags_userId_fk` (`userId`),
  CONSTRAINT `tags_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

### جدول taggables (برای ارتباط با سایر جداول)
```sql
CREATE TABLE `taggables` (
  `tagId` int NOT NULL,
  `taggableId` int NOT NULL,
  `taggableType` varchar(50) NOT NULL,
  PRIMARY KEY (`tagId`, `taggableId`, `taggableType`),
  KEY `taggables_tagId_idx` (`tagId`),
  CONSTRAINT `taggables_tagId_fk` FOREIGN KEY (`tagId`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```

## 💡 نکات و ترفندها

1. **استفاده از کلیدهای میانبر**: برای مدیریت سریع‌تر برچسب‌ها، کلیدهای میانبر تعریف شده‌اند:
   - `Alt+T` : باز کردن پنل برچسب‌گذاری
   - `Alt+N` : ایجاد برچسب جدید
   - `Enter` : تأیید انتخاب برچسب
   - `Escape` : بستن پنل

2. **ترکیب برچسب‌ها**: برای جستجوی پیشرفته می‌توانید چندین برچسب را با هم ترکیب کنید:
   - حالت `AND`: نمایش محتوایی که همه برچسب‌های انتخاب شده را دارد
   - حالت `OR`: نمایش محتوایی که حداقل یکی از برچسب‌های انتخاب شده را دارد

3. **استفاده هوشمند**: سیستم با تحلیل محتوای شما، برچسب‌های مرتبط را پیشنهاد می‌دهد.

4. **برچسب‌های پیشنهادی**: برچسب‌هایی که بیشتر استفاده کرده‌اید، در بالای لیست نمایش داده می‌شوند.

## 📝 نمونه کاربرد

### 1. سازماندهی گفتگوها

برچسب‌گذاری گفتگوهای Gemini برای دسته‌بندی بر اساس موضوع:
- `#ترجمه` - گفتگوهای مرتبط با ترجمه متون
- `#برنامه‌نویسی` - گفتگوهای مربوط به کدنویسی
- `#پروژه-الف` - گفتگوهای مرتبط با پروژه خاص

### 2. دسته‌بندی تصاویر

برچسب‌گذاری تصاویر بر اساس نوع و محتوا:
- `#معماری` - تصاویر ساختمان و معماری
- `#طبیعت` - تصاویر مناظر طبیعی
- `#مرجع` - تصاویر مورد استفاده به عنوان مرجع

### 3. سازماندهی محتوای تولیدی

دسته‌بندی محتوای تولید شده:
- `#مقاله` - متن‌های مقاله مانند
- `#شعر` - اشعار تولید شده
- `#ایده` - ایده‌های خلاق

## ✨ نمونه UI برچسب‌گذاری

```jsx
// نمونه استفاده از برچسب‌ها در صفحه چت
import React from 'react';
import { TagPicker } from '../components/tags/TagPicker';
import { useTagStore } from '../store/tagStore';

export const ChatHeader = () => {
  const { currentConversationTags, updateConversationTags } = useTagStore();
  const conversationId = useParams().id;
  
  return (
    <div className="chat-header">
      <h2>گفتگوی جدید</h2>
      
      <div className="chat-actions">
        <TagPicker
          selectedTags={currentConversationTags}
          onChange={(tags) => updateConversationTags(conversationId, tags)}
        />
        
        <button className="filter-button">
          <FilterIcon />
          فیلتر بر اساس برچسب
        </button>
      </div>
    </div>
  );
};
```

---

## 🔄 طرح توسعه آینده

برای نسخه‌های بعدی، قابلیت‌های زیر به سیستم برچسب‌گذاری اضافه خواهند شد:

1. **برچسب‌گذاری خودکار** - پیشنهاد خودکار برچسب‌ها بر اساس محتوا با استفاده از هوش مصنوعی
2. **دسته‌بندی برچسب‌ها** - امکان گروه‌بندی برچسب‌ها در دسته‌های مختلف
3. **اشتراک‌گذاری برچسب** - امکان اشتراک‌گذاری برچسب‌ها بین کاربران
4. **آمار استفاده از برچسب** - نمودارهای آماری استفاده از برچسب‌ها در طول زمان
5. **برچسب‌های سیستمی** - برچسب‌های پیش‌فرض سیستم برای دسته‌بندی‌های رایج

---

راهنمای فوق توسط تیم توسعه Gemini Pro Studio تهیه شده است.  
نسخه 1.0 - تاریخ: ۱۴۰۳/۰۳/۲۵ 