# نظام المحاسبة الذكي - النسخة الجاهزة للنشر

## محتويات هذا الملف:
جميع ملفات المشروع المطلوبة لنشر نظام المحاسبة العربي على Railway أو أي منصة أخرى.

## خطوات النشر على Railway:

### 1. إنشاء مستودع GitHub:
- اذهب إلى github.com
- أنشئ حساب جديد (مجاني)
- اضغط "New repository"
- اسم المستودع: `arabic-accounting-system`
- اجعله Public
- اضغط "Create repository"

### 2. رفع الملفات:
- في صفحة المستودع، اضغط "uploading an existing file"
- اسحب جميع ملفات هذا المجلد إلى GitHub
- اضغط "Commit changes"

### 3. النشر على Railway:
- اذهب إلى railway.app
- سجل دخول بحساب GitHub
- اضغط "Deploy from GitHub repo"
- اختر المستودع الذي أنشأته
- Railway سيكتشف أنه مشروع Node.js تلقائياً

### 4. إعداد متغيرات البيئة:
أضف هذه المتغيرات في إعدادات Railway:

```
DATABASE_URL=postgresql://neondb_owner:npg_nGuzMX1gPL6w@ep-sparkling-frog-a5fmiu9e.us-east-2.aws.neon.tech/neondb?sslmode=require

TELEGRAM_BOT_TOKEN=8095604439:AAHD9GlgGgCpVVCMLp-thNsfbn8I0gqk_Do
```

### 5. النشر:
- اضغط "Deploy"
- انتظر 2-3 دقائق
- ستحصل على رابط مثل: https://your-app.railway.app

### 6. تفعيل التيليجرام بوت:
- ادخل إلى التطبيق المنشور
- اذهب إلى صفحة "بوت تيليجرام"
- اضبط رابط الويب هوك: https://your-app.railway.app/api/telegram/webhook

## ميزات النظام:
✅ نظام محاسبة عربي كامل
✅ واجهة RTL (من اليمين لليسار)
✅ بوت تيليجرام للأوامر العربية
✅ دليل الحسابات والقيود
✅ التقارير المالية
✅ إدارة المستخدمين والشركات
✅ قاعدة بيانات PostgreSQL

## معلومات الدخول:
- اسم المستخدم: admin
- كلمة المرور: admin123

النظام جاهز للاستخدام فوراً!