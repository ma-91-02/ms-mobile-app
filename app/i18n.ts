import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

// اللغات التي تستخدم اتجاه RTL
export const RTL_LANGUAGES = ['ar', 'ku'];

// موارد الترجمة
const resources = {
  en: {
    translation: {
      // عام
      welcome: 'Welcome',
      continue: 'Continue',
      cancel: 'Cancel',
      filter: 'Filter',
      applyingLanguage: 'Applying language changes...',
      selectLanguage: 'Select your preferred language',
      loginToAccess: 'Please login to view your profile and manage your ads',
      edit: 'Edit',
      myProfile: 'My Profile',
      
      // التنقل
      home: 'Home',
      profile: 'Profile',
      settings: 'Settings',
      ads: 'Ads',
      
      // المصادقة
      login: 'Login',
      register: 'Register',
      createAccount: 'Create Account',
      enterPhoneToRegister: 'Enter your phone number to register',
      phoneNumber: 'Phone Number',
      enterPhoneNumber: 'Enter your phone number',
      sendVerificationCode: 'Send Verification Code',
      alreadyHaveAccount: 'Already have an account?',
      pleaseEnterValidPhone: 'Please enter a valid phone number',
      
      // التحقق من OTP
      verifyOTP: 'Verify Code',
      enterOTP: 'Enter the verification code sent to your phone',
      verifyCode: 'Verify Code',
      resendCode: 'Resend Code',
      resendCodeIn: 'Resend code in',
      seconds: 'seconds',
      pleaseEnterValidOTP: 'Please enter a valid verification code',
      
      // إكمال الملف الشخصي
      completeProfile: 'Complete Profile',
      completeProfileInfo: 'Please complete your profile information',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      enterFirstName: 'Enter your first name',
      enterLastName: 'Enter your last name',
      enterEmail: 'Enter your email',
      enterPassword: 'Enter your password',
      reEnterPassword: 'Re-enter your password',
      completeRegistration: 'Complete Registration',
      registrationDisclaimer: 'By registering, you agree to our Terms of Service and Privacy Policy',
      
      // رسائل التحقق
      pleaseEnterFirstName: 'Please enter your first name',
      firstNameTooShort: 'First name should be at least 2 characters',
      pleaseEnterLastName: 'Please enter your last name',
      lastNameTooShort: 'Last name should be at least 2 characters',
      invalidEmail: 'Please enter a valid email address',
      pleaseEnterPassword: 'Please enter a password',
      passwordTooShort: 'Password should be at least 6 characters',
      pleaseConfirmPassword: 'Please confirm your password',
      passwordsDoNotMatch: 'Passwords do not match',
      
      // الإعدادات
      account_settings: 'Account Settings',
      account_information: 'Account Information',
      change_password: 'Change Password',
      notification_preferences: 'Notification Preferences',
      app_settings: 'App Settings',
      dark_mode: 'Dark Mode',
      enable_notifications: 'Enable Notifications',
      location_services: 'Location Services',
      language: 'Language',
      about: 'About',
      about_app: 'About App',
      help_support: 'Help & Support',
      privacy_policy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      contactUs: 'Contact Us',
      rate_app: 'Rate App',
      version: 'Version',
      logout: 'Logout',
      
      // الملف الشخصي
      login_required: 'Login Required',
      please_login_to_view_profile: 'Please login to view your profile',
      
      // الإعلانات
      no_ads: 'No Ads',
      no_ads_message: 'There are no ads available at the moment',

      // الإعلانات والبحث
      search: "Search",
      searchPlaceholder: "Search for ads...",
      categories: "Categories",
      allCategories: "All Categories",
      addAd: "Add Ad",
      myAds: "My Ads",
      adDetails: "Ad Details",
      price: "Price",
      location: "Location",
      description: "Description",
      contactSeller: "Contact Seller",
      share: "Share",
      report: "Report",
      save: "Save",
      filters: "Filters",
      applyFilters: "Apply Filters",
      resetFilters: "Reset Filters",
      sortBy: "Sort By",
      newest: "Newest",
      oldest: "Oldest",
      priceLowToHigh: "Price: Low to High",
      priceHighToLow: "Price: High to Low",
      category: "Category",
      subCategory: "Sub Category",
      condition: "Condition",
      new: "New",
      used: "Used",
      priceRange: "Price Range",
      from: "From",
      to: "To",
      adTitle: "Ad Title",
      adDescription: "Ad Description",
      uploadImages: "Upload Images",
      contactInformation: "Contact Information",
      phoneNumber: "Phone Number",
      email: "Email",
      address: "Address",
      submit: "Submit",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      confirmDelete: "Are you sure you want to delete this ad?",
      yes: "Yes",
      no: "No",
      adPostedSuccessfully: "Ad posted successfully",
      adUpdatedSuccessfully: "Ad updated successfully",
      adDeletedSuccessfully: "Ad deleted successfully",
      errorPostingAd: "Error posting ad",
      errorUpdatingAd: "Error updating ad",
      errorDeletingAd: "Error deleting ad",
      fillAllRequiredFields: "Please fill all required fields",
      selectAtLeastOneImage: "Please select at least one image",
      selectCategory: "Please select a category",
      enterValidPrice: "Please enter a valid price",
      enterValidPhoneNumber: "Please enter a valid phone number",
      enterValidEmail: "Please enter a valid email",
      enterValidAddress: "Please enter a valid address",
      enterValidTitle: "Please enter a valid title",
      enterValidDescription: "Please enter a valid description",

      // التصنيفات
      allAds: "All Ads",
      electronics: "Electronics",
      vehicles: "Vehicles",
      property: "Property",
      furniture: "Furniture",
      fashion: "Fashion",
      jobs: "Jobs",
      services: "Services",

      // للعربية
      "settings": {
        "account_settings": "إعدادات الحساب",
        "account_information": "معلومات الحساب",
        "change_password": "تغيير كلمة المرور",
        "notification_preferences": "تفضيلات الإشعارات",
        "app_settings": "إعدادات التطبيق",
        "dark_mode": "الوضع الداكن",
        "enable_notifications": "تفعيل الإشعارات",
        "location_services": "خدمات الموقع",
        "language": "اللغة",
        "about": "حول",
        "about_app": "حول التطبيق",
        "help_support": "المساعدة والدعم",
        "privacy_policy": "سياسة الخصوصية",
        "termsOfService": "شروط الخدمة",
        "contactUs": "اتصل بنا",
        "rate_app": "تقييم التطبيق",
        "version": "الإصدار",
        "applyingLanguage": "جاري تطبيق تغييرات اللغة..."
      },
      "navigation": {
        "settings": "الإعدادات",
        "home": "الرئيسية",
        "ads": "الإعلانات",
        "favorites": "المفضلة",
        "profile": "الملف الشخصي"
      },
      "common": {
        "error": "خطأ",
        "success": "نجاح",
        "ok": "موافق",
        "cancel": "إلغاء"
      },
      "auth": {
        "invalidPhoneNumber": "رقم هاتف غير صالح"
      }
    }
  },
  ar: {
    translation: {
      // عام
      welcome: 'مرحباً بك',
      continue: 'متابعة',
      cancel: 'إلغاء',
      filter: 'تصفية',
      applyingLanguage: 'جاري تطبيق تغييرات اللغة...',
      selectLanguage: 'اختر لغتك المفضلة',
      loginToAccess: 'يرجى تسجيل الدخول لعرض ملفك الشخصي وإدارة إعلاناتك',
      edit: 'تعديل',
      myProfile: 'ملفي الشخصي',
      
      // التنقل
      home: 'الرئيسية',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      ads: 'الإعلانات',
      
      // المصادقة
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      createAccount: 'إنشاء حساب',
      enterPhoneToRegister: 'أدخل رقم هاتفك للتسجيل',
      phoneNumber: 'رقم الهاتف',
      enterPhoneNumber: 'أدخل رقم الهاتف',
      sendVerificationCode: 'إرسال رمز التحقق',
      alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
      pleaseEnterValidPhone: 'الرجاء إدخال رقم هاتف صالح',
      
      // التحقق من OTP
      verifyOTP: 'التحقق من الرمز',
      enterOTP: 'أدخل رمز التحقق المرسل إلى هاتفك',
      verifyCode: 'تحقق من الرمز',
      resendCode: 'إعادة إرسال الرمز',
      resendCodeIn: 'إعادة إرسال الرمز خلال',
      seconds: 'ثانية',
      pleaseEnterValidOTP: 'الرجاء إدخال رمز تحقق صالح',
      
      // إكمال الملف الشخصي
      completeProfile: 'إكمال الملف الشخصي',
      completeProfileInfo: 'يرجى إكمال معلومات ملفك الشخصي',
      firstName: 'الاسم الأول',
      lastName: 'اسم العائلة',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      enterFirstName: 'أدخل الاسم الأول',
      enterLastName: 'أدخل اسم العائلة',
      enterEmail: 'أدخل البريد الإلكتروني',
      enterPassword: 'أدخل كلمة المرور',
      reEnterPassword: 'أعد إدخال كلمة المرور',
      completeRegistration: 'إكمال التسجيل',
      registrationDisclaimer: 'بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية',
      
      // رسائل التحقق
      pleaseEnterFirstName: 'الرجاء إدخال الاسم الأول',
      firstNameTooShort: 'يجب أن يكون الاسم الأول مكونًا من حرفين على الأقل',
      pleaseEnterLastName: 'الرجاء إدخال اسم العائلة',
      lastNameTooShort: 'يجب أن يكون اسم العائلة مكونًا من حرفين على الأقل',
      invalidEmail: 'الرجاء إدخال عنوان بريد إلكتروني صالح',
      pleaseEnterPassword: 'الرجاء إدخال كلمة المرور',
      passwordTooShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      pleaseConfirmPassword: 'الرجاء تأكيد كلمة المرور',
      passwordsDoNotMatch: 'كلمات المرور غير متطابقة',
      
      // الإعدادات
      account_settings: 'إعدادات الحساب',
      account_information: 'معلومات الحساب',
      change_password: 'تغيير كلمة المرور',
      notification_preferences: 'تفضيلات الإشعارات',
      app_settings: 'إعدادات التطبيق',
      dark_mode: 'الوضع الداكن',
      enable_notifications: 'تفعيل الإشعارات',
      location_services: 'خدمات الموقع',
      language: 'اللغة',
      about: 'حول',
      about_app: 'حول التطبيق',
      help_support: 'المساعدة والدعم',
      privacy_policy: 'سياسة الخصوصية',
      termsOfService: 'شروط الخدمة',
      contactUs: 'اتصل بنا',
      rate_app: 'تقييم التطبيق',
      version: 'الإصدار',
      logout: 'تسجيل الخروج',
      
      // الملف الشخصي
      login_required: 'تسجيل الدخول مطلوب',
      please_login_to_view_profile: 'يرجى تسجيل الدخول لعرض ملفك الشخصي',
      
      // الإعلانات
      no_ads: 'لا توجد إعلانات',
      no_ads_message: 'لا توجد إعلانات متاحة في الوقت الحالي',

      // الإعلانات والبحث
      search: "بحث",
      searchPlaceholder: "ابحث عن إعلانات...",
      categories: "التصنيفات",
      allCategories: "جميع التصنيفات",
      addAd: "إضافة إعلان",
      myAds: "إعلاناتي",
      adDetails: "تفاصيل الإعلان",
      price: "السعر",
      location: "الموقع",
      description: "الوصف",
      contactSeller: "التواصل مع البائع",
      share: "مشاركة",
      report: "إبلاغ",
      save: "حفظ",
      filters: "تصفية",
      applyFilters: "تطبيق التصفية",
      resetFilters: "إعادة ضبط التصفية",
      sortBy: "ترتيب حسب",
      newest: "الأحدث",
      oldest: "الأقدم",
      priceLowToHigh: "السعر: من الأقل إلى الأعلى",
      priceHighToLow: "السعر: من الأعلى إلى الأقل",
      category: "التصنيف",
      subCategory: "التصنيف الفرعي",
      condition: "الحالة",
      new: "جديد",
      used: "مستعمل",
      priceRange: "نطاق السعر",
      from: "من",
      to: "إلى",
      adTitle: "عنوان الإعلان",
      adDescription: "وصف الإعلان",
      uploadImages: "تحميل الصور",
      contactInformation: "معلومات الاتصال",
      phoneNumber: "رقم الهاتف",
      email: "البريد الإلكتروني",
      address: "العنوان",
      submit: "إرسال",
      cancel: "إلغاء",
      edit: "تعديل",
      delete: "حذف",
      confirmDelete: "هل أنت متأكد من حذف هذا الإعلان؟",
      yes: "نعم",
      no: "لا",
      adPostedSuccessfully: "تم نشر الإعلان بنجاح",
      adUpdatedSuccessfully: "تم تحديث الإعلان بنجاح",
      adDeletedSuccessfully: "تم حذف الإعلان بنجاح",
      errorPostingAd: "خطأ في نشر الإعلان",
      errorUpdatingAd: "خطأ في تحديث الإعلان",
      errorDeletingAd: "خطأ في حذف الإعلان",
      fillAllRequiredFields: "يرجى ملء جميع الحقول المطلوبة",
      selectAtLeastOneImage: "يرجى اختيار صورة واحدة على الأقل",
      selectCategory: "يرجى اختيار تصنيف",
      enterValidPrice: "يرجى إدخال سعر صالح",
      enterValidPhoneNumber: "يرجى إدخال رقم هاتف صالح",
      enterValidEmail: "يرجى إدخال بريد إلكتروني صالح",
      enterValidAddress: "يرجى إدخال عنوان صالح",
      enterValidTitle: "يرجى إدخال عنوان صالح للإعلان",
      enterValidDescription: "يرجى إدخال وصف صالح",

      // التصنيفات
      allAds: "جميع الإعلانات",
      electronics: "إلكترونيات",
      vehicles: "مركبات",
      property: "عقارات",
      furniture: "أثاث",
      fashion: "أزياء",
      jobs: "وظائف",
      services: "خدمات",

      // للعربية
      "settings": {
        "account_settings": "إعدادات الحساب",
        "account_information": "معلومات الحساب",
        "change_password": "تغيير كلمة المرور",
        "notification_preferences": "تفضيلات الإشعارات",
        "app_settings": "إعدادات التطبيق",
        "dark_mode": "الوضع الداكن",
        "enable_notifications": "تفعيل الإشعارات",
        "location_services": "خدمات الموقع",
        "language": "اللغة",
        "about": "حول",
        "about_app": "حول التطبيق",
        "help_support": "المساعدة والدعم",
        "privacy_policy": "سياسة الخصوصية",
        "termsOfService": "شروط الخدمة",
        "contactUs": "اتصل بنا",
        "rate_app": "تقييم التطبيق",
        "version": "الإصدار",
        "applyingLanguage": "جاري تطبيق تغييرات اللغة..."
      },
      "navigation": {
        "settings": "الإعدادات",
        "home": "الرئيسية",
        "ads": "الإعلانات",
        "favorites": "المفضلة",
        "profile": "الملف الشخصي"
      },
      "common": {
        "error": "خطأ",
        "success": "نجاح",
        "ok": "موافق",
        "cancel": "إلغاء"
      },
      "auth": {
        "invalidPhoneNumber": "رقم هاتف غير صالح"
      }
    }
  },
  ku: {
    translation: {
      // عام
      welcome: 'بەخێر بێیت',
      continue: 'بەردەوامبوون',
      cancel: 'پاشگەزبوونەوە',
      filter: 'فلتەر',
      applyingLanguage: 'گۆڕینی زمان...',
      selectLanguage: 'زمانی دڵخوازی خۆت هەڵبژێرە',
      loginToAccess: 'تکایە بچۆرە ژوورەوە بۆ بینینی پرۆفایلەکەت و بەڕێوەبردنی ڕیکلامەکانت',
      edit: 'دەستکاری',
      myProfile: 'پرۆفایلەکەم',
      
      // التنقل
      home: 'سەرەکی',
      profile: 'پرۆفایل',
      settings: 'ڕێکخستنەکان',
      ads: 'ڕیکلامەکان',
      
      // المصادقة
      login: 'چوونەژوورەوە',
      register: 'تۆمارکردن',
      createAccount: 'دروستکردنی هەژمار',
      enterPhoneToRegister: 'ژمارەی مۆبایلەکەت بنووسە بۆ تۆمارکردن',
      phoneNumber: 'ژمارەی مۆبایل',
      enterPhoneNumber: 'ژمارەی مۆبایل بنووسە',
      sendVerificationCode: 'ناردنی کۆدی پشتڕاستکردنەوە',
      alreadyHaveAccount: 'پێشتر هەژمارت هەیە؟',
      pleaseEnterValidPhone: 'تکایە ژمارەیەکی دروست بنووسە',
      
      // التحقق من OTP
      verifyOTP: 'پشتڕاستکردنەوەی کۆد',
      enterOTP: 'کۆدی پشتڕاستکردنەوە بنووسە کە بۆ مۆبایلەکەت نێردراوە',
      verifyCode: 'پشتڕاستکردنەوەی کۆد',
      resendCode: 'دووبارە ناردنەوەی کۆد',
      resendCodeIn: 'دووبارە ناردنەوەی کۆد لە',
      seconds: 'چرکە',
      pleaseEnterValidOTP: 'تکایە کۆدێکی دروست بنووسە',
      
      // إكمال الملف الشخصي
      completeProfile: 'تەواوکردنی پرۆفایل',
      completeProfileInfo: 'تکایە زانیاریەکانی پرۆفایلەکەت تەواو بکە',
      firstName: 'ناوی یەکەم',
      lastName: 'ناوی خێزان',
      email: 'ئیمەیل',
      password: 'وشەی نهێنی',
      confirmPassword: 'دڵنیاکردنەوەی وشەی نهێنی',
      enterFirstName: 'ناوی یەکەمت بنووسە',
      enterLastName: 'ناوی خێزانت بنووسە',
      enterEmail: 'ئیمەیلەکەت بنووسە',
      enterPassword: 'وشەی نهێنی بنووسە',
      reEnterPassword: 'دووبارە وشەی نهێنی بنووسە',
      completeRegistration: 'تەواوکردنی تۆمارکردن',
      registrationDisclaimer: 'بە تۆمارکردن، تۆ ڕەزامەندی دەدەیت بە مەرجەکانی خزمەتگوزاری و سیاسەتی تایبەتمەندی',
      
      // رسائل التحقق
      pleaseEnterFirstName: 'تکایە ناوی یەکەمت بنووسە',
      firstNameTooShort: 'ناوی یەکەم دەبێت لانیکەم ٢ پیت بێت',
      pleaseEnterLastName: 'تکایە ناوی خێزانت بنووسە',
      lastNameTooShort: 'ناوی خێزان دەبێت لانیکەم ٢ پیت بێت',
      invalidEmail: 'تکایە ئیمەیلێکی دروست بنووسە',
      pleaseEnterPassword: 'تکایە وشەی نهێنی بنووسە',
      passwordTooShort: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت',
      pleaseConfirmPassword: 'تکایە وشەی نهێنی دڵنیا بکەرەوە',
      passwordsDoNotMatch: 'وشە نهێنیەکان یەک ناگرنەوە',
      
      // الإعدادات
      account_settings: 'ڕێکخستنەکانی هەژمار',
      account_information: 'زانیاری هەژمار',
      change_password: 'گۆڕینی وشەی نهێنی',
      notification_preferences: 'ڕێکخستنەکانی ئاگادارکردنەوە',
      app_settings: 'ڕێکخستنەکانی ئەپ',
      dark_mode: 'دۆخی تاریک',
      enable_notifications: 'چالاککردنی ئاگادارکردنەوەکان',
      location_services: 'خزمەتگوزاریەکانی شوێن',
      language: 'زمان',
      about: 'دەربارە',
      about_app: 'دەربارەی ئەپ',
      help_support: 'یارمەتی و پشتگیری',
      privacy_policy: 'سیاسەتی تایبەتمەندی',
      termsOfService: 'مەرجەکانی خزمەتگوزاری',
      contactUs: 'پەیوەندیمان پێوە بکە',
      rate_app: 'هەڵسەنگاندنی ئەپ',
      version: 'وەشان',
      logout: 'چوونەدەرەوە',
      
      // الملف الشخصي
      login_required: 'چوونەژوورەوە پێویستە',
      please_login_to_view_profile: 'تکایە بچۆ ژوورەوە بۆ بینینی پرۆفایلەکەت',
      
      // الإعلانات
      no_ads: 'هیچ ڕیکلامێک نییە',
      no_ads_message: 'لە ئێستادا هیچ ڕیکلامێک بەردەست نییە',

      // الإعلانات والبحث
      search: "گەڕان",
      searchPlaceholder: "گەڕان بۆ ڕیکلامەکان...",
      categories: "پۆلەکان",
      allCategories: "هەموو پۆلەکان",
      addAd: "زیادکردنی ڕیکلام",
      myAds: "ڕیکلامەکانم",
      adDetails: "وردەکاریەکانی ڕیکلام",
      price: "نرخ",
      location: "شوێن",
      description: "وەسف",
      contactSeller: "پەیوەندی بە فرۆشیارەوە",
      share: "هاوبەشکردن",
      report: "ڕاپۆرت",
      save: "پاشەکەوتکردن",
      filters: "فلتەرەکان",
      applyFilters: "جێبەجێکردنی فلتەرەکان",
      resetFilters: "ڕێکخستنەوەی فلتەرەکان",
      sortBy: "ڕیزکردن بەپێی",
      newest: "نوێترین",
      oldest: "کۆنترین",
      priceLowToHigh: "نرخ: لە کەمەوە بۆ زۆر",
      priceHighToLow: "نرخ: لە زۆرەوە بۆ کەم",
      category: "پۆل",
      subCategory: "پۆلی لاوەکی",
      condition: "دۆخ",
      new: "نوێ",
      used: "بەکارهاتوو",
      priceRange: "بەرزی نرخ",
      from: "لە",
      to: "بۆ",
      adTitle: "ناونیشانی ڕیکلام",
      adDescription: "وەسفی ڕیکلام",
      uploadImages: "بارکردنی وێنەکان",
      contactInformation: "زانیاری پەیوەندی",
      phoneNumber: "ژمارەی تەلەفۆن",
      email: "ئیمەیل",
      address: "ناونیشان",
      submit: "ناردن",
      cancel: "هەڵوەشاندنەوە",
      edit: "دەستکاریکردن",
      delete: "سڕینەوە",
      confirmDelete: "دڵنیایت لە سڕینەوەی ئەم ڕیکلامە؟",
      yes: "بەڵێ",
      no: "نەخێر",
      adPostedSuccessfully: "ڕیکلام بە سەرکەوتوویی بڵاوکرایەوە",
      adUpdatedSuccessfully: "ڕیکلام بە سەرکەوتوویی نوێکرایەوە",
      adDeletedSuccessfully: "ڕیکلام بە سەرکەوتوویی سڕایەوە",
      errorPostingAd: "هەڵە لە بڵاوکردنەوەی ڕیکلام",
      errorUpdatingAd: "هەڵە لە نوێکردنەوەی ڕیکلام",
      errorDeletingAd: "هەڵە لە سڕینەوەی ڕیکلام",
      fillAllRequiredFields: "تکایە هەموو خانە پێویستەکان پڕبکەوە",
      selectAtLeastOneImage: "تکایە لانیکەم یەک وێنە هەڵبژێرە",
      selectCategory: "تکایە پۆلێک هەڵبژێرە",
      enterValidPrice: "تکایە نرخێکی دروست بنووسە",
      enterValidPhoneNumber: "تکایە ژمارەی تەلەفۆنێکی دروست بنووسە",
      enterValidEmail: "تکایە ئیمەیلێکی دروست بنووسە",
      enterValidAddress: "تکایە ناونیشانێکی دروست بنووسە",
      enterValidTitle: "تکایە ناونیشانێکی دروست بۆ ڕیکلام بنووسە",
      enterValidDescription: "تکایە وەسفێکی دروست بنووسە",

      // التصنيفات
      allAds: "هەموو ڕیکلامەکان",
      electronics: "ئەلیکترۆنیات",
      vehicles: "ئۆتۆمبێل",
      property: "موڵک",
      furniture: "کەلوپەل",
      fashion: "جلوبەرگ",
      jobs: "کار",
      services: "خزمەتگوزاری",

      // للعربية
      "settings": {
        "account_settings": "إعدادات الحساب",
        "account_information": "معلومات الحساب",
        "change_password": "تغيير كلمة المرور",
        "notification_preferences": "تفضيلات الإشعارات",
        "app_settings": "إعدادات التطبيق",
        "dark_mode": "الوضع الداكن",
        "enable_notifications": "تفعيل الإشعارات",
        "location_services": "خدمات الموقع",
        "language": "اللغة",
        "about": "حول",
        "about_app": "حول التطبيق",
        "help_support": "المساعدة والدعم",
        "privacy_policy": "سياسة الخصوصية",
        "termsOfService": "شروط الخدمة",
        "contactUs": "اتصل بنا",
        "rate_app": "تقييم التطبيق",
        "version": "الإصدار",
        "applyingLanguage": "جاري تطبيق تغييرات اللغة..."
      },
      "navigation": {
        "settings": "الإعدادات",
        "home": "الرئيسية",
        "ads": "الإعلانات",
        "favorites": "المفضلة",
        "profile": "الملف الشخصي"
      },
      "common": {
        "error": "خطأ",
        "success": "نجاح",
        "ok": "موافق",
        "cancel": "إلغاء"
      },
      "auth": {
        "invalidPhoneNumber": "رقم هاتف غير صالح"
      }
    }
  }
};

const getDeviceLanguage = () => {
  try {
    const locale = Localization.locale;
    const languageCode = locale.split('-')[0];
    return ['en', 'ar', 'ku'].includes(languageCode) ? languageCode : 'en';
  } catch (error) {
    console.warn('Failed to get device language:', error);
    return 'en';
  }
};

// تعيين العربية كلغة افتراضية
const DEFAULT_LANGUAGE = 'ar';

// تهيئة i18next
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources,
    lng: DEFAULT_LANGUAGE,
    fallbackLng: DEFAULT_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export const loadSavedLanguage = async () => {
  try {
    let savedLanguage = await AsyncStorage.getItem('user-language');
    console.log('Loading saved language:', savedLanguage);

    if (!savedLanguage) {
      savedLanguage = DEFAULT_LANGUAGE;
      await AsyncStorage.setItem('user-language', DEFAULT_LANGUAGE);
    }

    // تطبيق RTL للـ iOS
    if (Platform.OS === 'ios') {
      const isRTL = RTL_LANGUAGES.includes(savedLanguage);
      if (isRTL) {
        // تطبيق RTL للغات العربية والكردية
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        // إعادة تشغيل التطبيق إذا كان الاتجاه مختلفاً
        if (!I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      } else {
        // تطبيق LTR للغة الإنجليزية
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      }
    }

    // تطبيق اللغة
    await i18n.changeLanguage(savedLanguage);

    return savedLanguage;
  } catch (error) {
    console.error('Error in loadSavedLanguage:', error);
    return DEFAULT_LANGUAGE;
  }
};

export const changeLanguage = async (language: string) => {
  try {
    console.log('Starting language change to:', language);

    // حفظ اللغة في AsyncStorage
    await AsyncStorage.setItem('user-language', language);
    console.log('Language saved in AsyncStorage');

    // تطبيق RTL للـ iOS و Android
    const isRTL = RTL_LANGUAGES.includes(language);
    
    // تطبيق RTL/LTR
    if (isRTL) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } else {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }

    // تغيير اللغة في i18next
    await i18n.changeLanguage(language);
    console.log('Language changed in i18next');

    // التحقق من الحفظ
    const verifiedLanguage = await AsyncStorage.getItem('user-language');
    console.log('Verified saved language:', verifiedLanguage);

    if (verifiedLanguage !== language) {
      throw new Error('Language verification failed');
    }

    // حفظ حالة اختيار اللغة
    await AsyncStorage.setItem('has-selected-language', 'true');
    console.log('Language selection state saved');

    // إعادة تحميل التطبيق إذا تغير اتجاه RTL/LTR
    const needsReload = (isRTL && !I18nManager.isRTL) || (!isRTL && I18nManager.isRTL);
    
    // إضافة هذا السطر لإعادة تحميل التطبيق دائماً عند تغيير اللغة
    return { success: true, needsReload: true };
  } catch (error) {
    console.error('Error in changeLanguage:', error);
    await AsyncStorage.setItem('user-language', DEFAULT_LANGUAGE);
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    throw error;
  }
};

// إضافة وظيفة للتحقق من حالة اختيار اللغة
export const hasSelectedLanguage = async () => {
  try {
    return await AsyncStorage.getItem('has-selected-language') === 'true';
  } catch (error) {
    console.error('Error checking language selection state:', error);
    return false;
  }
};

// إضافة وظيفة لإعادة تعيين حالة اللغة
export const resetLanguageState = async () => {
  try {
    await AsyncStorage.removeItem('has-selected-language');
    await AsyncStorage.removeItem('user-language');
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
    console.log('Language state reset successfully');
  } catch (error) {
    console.error('Error resetting language state:', error);
  }
};

// إضافة وظيفة لإعادة تحميل الترجمات
export const reloadTranslations = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    if (savedLanguage) {
      await i18n.changeLanguage(savedLanguage);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error reloading translations:', error);
    return false;
  }
};

export default i18n; 