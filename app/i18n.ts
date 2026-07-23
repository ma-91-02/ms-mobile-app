import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { I18nManager, Platform } from 'react-native';

// تحديد اللغات التي تستخدم اتجاه RTL
export const RTL_LANGUAGES = ['ar', 'ku'];

// الترجمات
const resources = {
  en: {
    translation: {
      resetLanguageConfirm: 'You will return to the language selection screen to choose again.',
      lastUpdated: 'Last updated: July 2026',
      privacyIntro: 'This policy explains what data Mustamsakati collects and how it is used. The guiding principle: we collect only what the service needs to return a document to its owner.',
      privacyS1Title: 'Data we collect',
      privacyS1Body: 'Your phone number and full name when you create an account. When you post an advertisement: document type and number, owner name, governorate, description, contact number, and any photos you upload.',
      privacyS2Title: 'How we use it',
      privacyS2Body: 'To show your advertisement to searchers, to run automatic matching between lost and found documents, and to notify you when a possible match is found.',
      privacyS3Title: 'Revealing contact details',
      privacyS3Body: 'Your phone number stays hidden by default. It is revealed only after another user submits a contact request stating their reason and an admin approves it. You can keep it hidden or show it from the advertisement settings.',
      privacyS4Title: 'Data sharing',
      privacyS4Body: 'We do not sell your data or share it with advertisers. It is shared only with the party whose contact request an admin approved.',
      privacyS5Title: 'Your rights',
      privacyS5Body: 'You can edit your details or delete your advertisements at any time. To request full account deletion, email us at the address listed on the settings screen.',
      termsIntro: 'By using Mustamsakati you agree to these terms. The app is an intermediary that helps return lost documents to their owners and is not responsible for dealings between users.',
      termsS1Title: 'Use of the service',
      termsS1Body: 'The service is intended for reporting lost and found documents inside Iraq. Using it for any other purpose is prohibited.',
      termsS2Title: 'Accuracy of information',
      termsS2Body: 'You are responsible for the accuracy of what you post. Posting false information or impersonating someone else may result in your account being blocked.',
      termsS3Title: 'Advertisement review',
      termsS3Body: 'Every advertisement is reviewed by an admin before it appears. Admins may reject or remove any violating advertisement without prior notice.',
      termsS4Title: 'Limitation of liability',
      termsS4Body: 'The app does not guarantee that a document will be found and does not mediate any payment. Any agreement between users is their sole responsibility.',
      termsS5Title: 'Changes to these terms',
      termsS5Body: 'We may update these terms. Continuing to use the app after an update means you accept them.',
      lost: 'Lost',
      found: 'Found',
      saladin: 'Salah al-Din',
      enterPhoneAndPassword: 'Please enter your phone number and password',
      forgotPassword: 'Forgot your password?',
      noAccountRegister: 'No account? Register now',
      phoneExample: 'Example: phone number',
      logoutError: 'Something went wrong while signing out',
      loading: 'Loading...',
      success: 'Success',
      selectProvince: 'Select governorate',
      languageChanged: 'Language changed successfully',
      languageChangeError: 'Could not change the language',
      phoneNumber: 'Phone number',
      password: 'Password',
      photos: 'Photos',
      addPhoto: 'Add photo',
      imagesHint: 'Up to {{count}} photos. A clear photo of the document greatly helps identification.',
      maxImagesReached: 'You can attach up to {{count}} photos',
      galleryPermissionDenied: 'Gallery access is required to attach photos',
      myAdsDescription: 'View and manage the ads you posted',
      favoritesDescription: 'Ads you saved to come back to',
      notificationsDescription: 'Matches and contact request updates',
      noAdsYet: 'You have not posted any advertisement yet',
      noNotifications: 'No notifications yet',
      noFavorites: 'You have not saved any advertisement yet',
      markAllRead: 'Mark all as read',
      removeFromFavorites: 'Remove from favorites',
      featureComingSoon: 'This screen is not available yet',
      // شاشتا إنشاء الإعلان وتفاصيله
      adType: 'Advertisement type',
      documentType: 'Document type',
      province: 'Governorate',
      ownerName: 'Owner name',
      ownerNameOptional: 'Owner name (optional)',
      ownerNamePlaceholder: 'Name as written on the document',
      itemNumber: 'Document number',
      itemNumberOptional: 'Document number (optional)',
      itemNumberPlaceholder: 'e.g. A12345678',
      itemNumberHint: 'The document number is the strongest matching signal. Adding it greatly raises the chance of a match.',
      description: 'Description',
      descriptionPlaceholder: 'Where and when it was lost or found, and any distinguishing details',
      descriptionTooShort: 'Please write a description of at least 10 characters',
      contactPhone: 'Contact number',
      contactPhoneRequired: 'Contact number is required',
      hideContactInfo: 'Hide my number',
      hideContactHint: 'Your number stays hidden until you approve a contact request.',
      publishAd: 'Publish advertisement',
      adReviewNotice: 'The advertisement is reviewed by an admin before it appears publicly.',
      adPendingReview: 'Your advertisement was submitted and is awaiting review.',
      selectCategoryFirst: 'Please choose a document type',
      selectProvinceFirst: 'Please choose a governorate',
      loginToPostAd: 'You need an account to publish an advertisement.',
      adDetails: 'Advertisement details',
      adNotFound: 'Advertisement not found',
      backToAds: 'Back to advertisements',
      publishedAt: 'Published',
      requestContact: 'Request contact',
      addToFavorites: 'Add to favorites',
      addedToFavorites: 'Added to favorites',
      contactHiddenHint: 'The number is hidden. Send a contact request and it is revealed after admin approval.',
      contactReasonHint: 'Explain why you want to contact the owner. An admin reads this before approving.',
      contactReasonPlaceholder: 'For example: I found this document and want to return it',
      contactRequestSent: 'Your request was sent and is awaiting admin approval.',
      reasonTooShort: 'Please write a clearer reason',
      loginToContact: 'You need an account to request contact.',
      done: 'Done',
      ok: 'OK',
      send: 'Send',
      // التسجيل وشريط التثبيت
      alreadyHaveAccount: 'Already have an account? Sign in',
      registerWithOtpHint: 'We will send a verification code to your phone number.',
      registerDirectHint: 'Enter your details to create an account right away.',
      fullName: 'Full name',
      fullNameRequired: 'Please enter your full name',
      confirmPassword: 'Confirm password',
      passwordsDoNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      invalidPhone: 'Invalid phone number',
      sendCode: 'Send code',
      alert: 'Notice',
      error: 'Error',
      install: 'Install',
      installBannerTitle: 'Install the app',
      installBannerSubtitle: 'Faster access, straight from your home screen',
      // صفحة التثبيت
      installTitle: 'Install مستمسكاتي',
      installSubtitle: 'Add the app to your home screen and use it like any other app — no app store needed.',
      installNow: 'Install now',
      installDismissed: 'Installation cancelled. You can try again anytime.',
      alreadyInstalled: 'The app is already installed',
      openApp: 'Open the app',
      orInstallManually: 'Or install manually on',
      howToInstallOn: 'How to install on',
      continueInBrowser: 'Continue in the browser',
      orDownloadFromStore: 'Or download from the store',
      iphone: 'iPhone',
      android: 'Android',
      desktop: 'Desktop',
      benefitFast: 'Opens instantly, like a native app',
      benefitNotifications: 'Get notified when your document is found',
      benefitOffline: 'Browse what you already opened without internet',
      benefitNoStore: 'No app store, no storage space taken',
      iosStep1: 'Open this page in Safari',
      iosStep2: 'Tap the Share button at the bottom of the screen',
      iosStep3: 'Choose "Add to Home Screen"',
      iosStep4: 'Tap "Add" — the icon appears on your home screen',
      androidStep1: 'Tap the three dots menu at the top right',
      androidStep2: 'Choose "Install app" or "Add to Home screen"',
      androidStep3: 'Confirm — the icon appears on your home screen',
      desktopStep1: 'Look for the install icon in the address bar',
      desktopStep2: 'Click it and confirm the installation',
      iosSafariOnly: 'On iPhone, installation works in Safari only. Chrome and other browsers on iOS cannot add apps to the home screen.',
      // حالات ونوع الإعلان — تُستخدم بعد الربط بالخادم
      retry: 'Retry',
      noAdsFound: 'No advertisements found',
      lostItem: 'Lost',
      foundItem: 'Found',
      pending: 'Under review',
      approved: 'Approved',
      rejected: 'Rejected',
      resolved: 'Recovered',
      national_id: 'National ID',
      driving_license: 'Driving license',
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
      
      // التبويبات
      ads: 'Ads',
      profile: 'Profile',
      settings: 'Settings',
      
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
      logout: 'Logout',
      version: 'Version',
      
      // إعدادات اللغة
      resetLanguageSelection: 'Reset Language Selection',
      resetLanguageTitle: 'Reset Language Settings',
      resetLanguageMessage: 'Are you sure you want to reset language settings?',
      resetButton: 'Reset',
      settingsResetTitle: 'Settings Reset',
      settingsResetMessage: 'Language selection will appear on next app launch',
      
      // الملف الشخصي
      login_required: 'Login Required',
      please_login_to_view_profile: 'Please login to view your profile',
      login: 'Login',
      register: 'Register',
      user_name: 'User Name',
      my_ads: 'My Ads',
      favorites: 'Favorites',
      notifications: 'Notifications',
      createAccount: 'Create Account',
      loginRequired: 'Login Required',
      
      // الإعلانات
      search_ads: 'Search ads',
      search: 'Search',
      categories: 'Categories',
      allAds: 'All Ads',
      add_ad: 'Post Ad',
      postAd: 'Post Ad',
      
      // فئات الإعلانات
      electronics: 'Electronics',
      vehicles: 'Vehicles',
      property: 'Property',
      furniture: 'Furniture',
      jobs: 'Jobs',
      services: 'Services',
      fashion: 'Fashion',
      other: 'Other',

      // المناطق
      allIraq: 'All Iraq',
      baghdad: 'Baghdad',
      basra: 'Basra',
      erbil: 'Erbil',
      sulaymaniyah: 'Sulaymaniyah',
      duhok: 'Duhok',
      kirkuk: 'Kirkuk',
      najaf: 'Najaf',
      karbala: 'Karbala',
      anbar: 'Anbar',
      diyala: 'Diyala',
      wasit: 'Wasit',
      maysan: 'Maysan',
      babil: 'Babylon',
      diwaniyah: 'Diwaniyah',
      dhiqar: 'Dhi Qar',
      muthanna: 'Muthanna',
      nineveh: 'Nineveh',
      salahuddin: 'Salah al-Din',

      // الفئات الإضافية
      passport: 'Passport',
      residency: 'Residency',
      nationalID: 'National ID',
      drivingLicense: 'Driving License',
      birthCertificate: 'Birth Certificate',
      marriageCertificate: 'Marriage Certificate',
      educationalCertificates: 'Educational Certificates',
      legalDocuments: 'Legal Documents',
      medicalDocuments: 'Medical Documents',
      otherDocuments: 'Other Documents'
    }
  },
  ar: {
    translation: {
      resetLanguageConfirm: 'ستعود إلى شاشة اختيار اللغة لتختار من جديد.',
      lastUpdated: 'آخر تحديث: تموز 2026',
      privacyIntro: 'تشرح هذه السياسة البيانات التي يجمعها تطبيق مستمسكاتي وكيف تُستخدم. المبدأ الحاكم: لا نجمع إلا ما تحتاجه الخدمة لإعادة المستمسك إلى صاحبه.',
      privacyS1Title: 'البيانات التي نجمعها',
      privacyS1Body: 'رقم هاتفك واسمك الكامل عند إنشاء الحساب. وعند نشر إعلان: نوع المستمسك ورقمه واسم صاحبه والمحافظة والوصف ورقم التواصل والصور التي ترفعها.',
      privacyS2Title: 'كيف نستخدمها',
      privacyS2Body: 'لعرض إعلانك للباحثين، وللمطابقة الآلية بين المستمسكات المفقودة والموجودة، ولإشعارك عند العثور على تطابق محتمل.',
      privacyS3Title: 'كشف بيانات التواصل',
      privacyS3Body: 'رقم هاتفك يبقى مخفيًا افتراضيًا. لا يُكشف إلا بعد أن يقدّم مستخدم آخر طلب تواصل مع بيان سببه، وتوافق عليه الإدارة. يمكنك إبقاء الرقم مخفيًا أو إظهاره من إعدادات الإعلان.',
      privacyS4Title: 'مشاركة البيانات',
      privacyS4Body: 'لا نبيع بياناتك ولا نشاركها مع معلنين. تُشارك فقط مع الطرف الذي وافقت الإدارة على طلب تواصله معك.',
      privacyS5Title: 'حقوقك',
      privacyS5Body: 'يمكنك تعديل بياناتك أو حذف إعلاناتك في أي وقت. لطلب حذف حسابك بالكامل راسلنا على البريد المذكور في صفحة الإعدادات.',
      termsIntro: 'باستخدامك تطبيق مستمسكاتي فأنت توافق على هذه الشروط. التطبيق وسيط يساعد على إعادة المستمسكات المفقودة إلى أصحابها، ولا يتحمّل مسؤولية التعاملات بين المستخدمين.',
      termsS1Title: 'استخدام الخدمة',
      termsS1Body: 'الخدمة مخصّصة للإبلاغ عن المستمسكات المفقودة والموجودة داخل العراق. يُمنع استخدامها لأي غرض آخر.',
      termsS2Title: 'صحة المعلومات',
      termsS2Body: 'أنت مسؤول عن صحة ما تنشره. نشر معلومات كاذبة أو انتحال هوية غيرك يعرّض حسابك للحظر.',
      termsS3Title: 'مراجعة الإعلانات',
      termsS3Body: 'كل إعلان يمرّ بمراجعة إدارية قبل ظهوره. للإدارة أن ترفض أو تحذف أي إعلان مخالف دون إشعار مسبق.',
      termsS4Title: 'حدود المسؤولية',
      termsS4Body: 'التطبيق لا يضمن العثور على المستمسك ولا يتوسّط في أي مقابل مالي. أي اتفاق بين المستخدمين يجري على مسؤوليتهم وحدهم.',
      termsS5Title: 'تعديل الشروط',
      termsS5Body: 'قد نحدّث هذه الشروط. استمرارك في استخدام التطبيق بعد التحديث يعني قبولك بها.',
      lost: 'مفقود',
      found: 'موجود',
      saladin: 'صلاح الدين',
      enterPhoneAndPassword: 'الرجاء إدخال رقم الهاتف وكلمة المرور',
      forgotPassword: 'نسيت كلمة السر؟',
      noAccountRegister: 'ليس لديك حساب؟ سجّل الآن',
      phoneExample: 'مثال: رقم هاتف',
      logoutError: 'حدث خطأ أثناء تسجيل الخروج',
      loading: 'جاري التحميل...',
      success: 'تم بنجاح',
      selectProvince: 'اختر المحافظة',
      languageChanged: 'تم تغيير اللغة بنجاح',
      languageChangeError: 'تعذّر تغيير اللغة',
      phoneNumber: 'رقم الهاتف',
      password: 'كلمة المرور',
      photos: 'الصور',
      addPhoto: 'إضافة صورة',
      imagesHint: 'حتى {{count}} صور. صورة واضحة للمستمسك تساعد كثيرًا في التعرّف عليه.',
      maxImagesReached: 'يمكنك إرفاق {{count}} صور كحدّ أقصى',
      galleryPermissionDenied: 'يلزم الإذن بالوصول إلى الصور لإرفاقها',
      myAdsDescription: 'اعرض إعلاناتك المنشورة وأدرها',
      favoritesDescription: 'الإعلانات التي حفظتها للرجوع إليها',
      notificationsDescription: 'المطابقات وتحديثات طلبات التواصل',
      noAdsYet: 'لم تنشر أي إعلان بعد',
      noNotifications: 'لا توجد إشعارات بعد',
      noFavorites: 'لم تحفظ أي إعلان بعد',
      markAllRead: 'تعليم الكل كمقروء',
      removeFromFavorites: 'إزالة من المفضلة',
      featureComingSoon: 'هذه الشاشة غير متاحة بعد',
      // شاشتا إنشاء الإعلان وتفاصيله
      adType: 'نوع الإعلان',
      documentType: 'نوع المستمسك',
      province: 'المحافظة',
      ownerName: 'اسم صاحب المستمسك',
      ownerNameOptional: 'اسم صاحب المستمسك (اختياري)',
      ownerNamePlaceholder: 'الاسم كما هو مكتوب في المستمسك',
      itemNumber: 'رقم المستمسك',
      itemNumberOptional: 'رقم المستمسك (اختياري)',
      itemNumberPlaceholder: 'مثال: A12345678',
      itemNumberHint: 'رقم المستمسك أقوى دليل للمطابقة. إضافته ترفع فرصة العثور كثيرًا.',
      description: 'الوصف',
      descriptionPlaceholder: 'أين ومتى فُقد أو وُجد، وأي تفاصيل مميّزة',
      descriptionTooShort: 'يرجى كتابة وصف لا يقل عن 10 أحرف',
      contactPhone: 'رقم التواصل',
      contactPhoneRequired: 'رقم التواصل مطلوب',
      hideContactInfo: 'إخفاء رقمي',
      hideContactHint: 'يبقى رقمك مخفيًا حتى توافق على طلب تواصل.',
      publishAd: 'نشر الإعلان',
      adReviewNotice: 'يراجع المشرف الإعلان قبل ظهوره للعموم.',
      adPendingReview: 'أُرسل إعلانك وهو بانتظار المراجعة.',
      selectCategoryFirst: 'يرجى اختيار نوع المستمسك',
      selectProvinceFirst: 'يرجى اختيار المحافظة',
      loginToPostAd: 'تحتاج حسابًا لنشر إعلان.',
      adDetails: 'تفاصيل الإعلان',
      adNotFound: 'الإعلان غير موجود',
      backToAds: 'العودة إلى الإعلانات',
      publishedAt: 'نُشر',
      requestContact: 'طلب التواصل',
      addToFavorites: 'إضافة للمفضلة',
      addedToFavorites: 'أُضيف إلى المفضلة',
      contactHiddenHint: 'الرقم مخفي. أرسل طلب تواصل ويُكشف بعد موافقة الإدارة.',
      contactReasonHint: 'وضّح سبب رغبتك بالتواصل. يقرأه المشرف قبل الموافقة.',
      contactReasonPlaceholder: 'مثال: عثرت على هذا المستمسك وأريد إعادته',
      contactRequestSent: 'أُرسل طلبك وهو بانتظار موافقة الإدارة.',
      reasonTooShort: 'يرجى كتابة سبب أوضح',
      loginToContact: 'تحتاج حسابًا لطلب التواصل.',
      done: 'تم',
      ok: 'حسنًا',
      send: 'إرسال',
      // التسجيل وشريط التثبيت
      alreadyHaveAccount: 'لديك حساب؟ سجّل الدخول',
      registerWithOtpHint: 'سنرسل رمز تحقق إلى رقم هاتفك.',
      registerDirectHint: 'أدخل بياناتك لإنشاء حسابك مباشرةً.',
      fullName: 'الاسم الكامل',
      fullNameRequired: 'يرجى إدخال الاسم الكامل',
      confirmPassword: 'تأكيد كلمة المرور',
      passwordsDoNotMatch: 'كلمتا المرور غير متطابقتين',
      passwordTooShort: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل',
      invalidPhone: 'رقم الهاتف غير صحيح',
      sendCode: 'إرسال الرمز',
      alert: 'تنبيه',
      error: 'خطأ',
      install: 'تثبيت',
      installBannerTitle: 'ثبّت التطبيق',
      installBannerSubtitle: 'وصول أسرع من شاشتك الرئيسية مباشرةً',
      // صفحة التثبيت
      installTitle: 'ثبّت تطبيق مستمسكاتي',
      installSubtitle: 'أضف التطبيق إلى شاشتك الرئيسية واستخدمه كأي تطبيق آخر — دون الحاجة لمتجر.',
      installNow: 'ثبّت الآن',
      installDismissed: 'أُلغي التثبيت. يمكنك المحاولة في أي وقت.',
      alreadyInstalled: 'التطبيق مثبَّت بالفعل',
      openApp: 'افتح التطبيق',
      orInstallManually: 'أو ثبّته يدويًا على',
      howToInstallOn: 'كيفية التثبيت على',
      continueInBrowser: 'المتابعة في المتصفّح',
      orDownloadFromStore: 'أو نزّله من المتجر',
      iphone: 'الآيفون',
      android: 'الأندرويد',
      desktop: 'الحاسوب',
      benefitFast: 'يفتح فورًا كأي تطبيق أصلي',
      benefitNotifications: 'يصلك إشعار فور العثور على مستمسكك',
      benefitOffline: 'تتصفّح ما فتحته سابقًا دون إنترنت',
      benefitNoStore: 'بلا متجر وبلا مساحة تخزين تُذكر',
      iosStep1: 'افتح هذه الصفحة في متصفّح Safari',
      iosStep2: 'اضغط زر المشاركة أسفل الشاشة',
      iosStep3: 'اختر «إضافة إلى الشاشة الرئيسية»',
      iosStep4: 'اضغط «إضافة» — تظهر الأيقونة على شاشتك',
      androidStep1: 'اضغط قائمة النقاط الثلاث أعلى اليمين',
      androidStep2: 'اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية»',
      androidStep3: 'أكّد — تظهر الأيقونة على شاشتك',
      desktopStep1: 'ابحث عن أيقونة التثبيت في شريط العنوان',
      desktopStep2: 'اضغطها وأكّد التثبيت',
      iosSafariOnly: 'في الآيفون يعمل التثبيت عبر Safari فقط. متصفّح Chrome وغيره على iOS لا يستطيع إضافة التطبيقات إلى الشاشة الرئيسية.',
      // حالات ونوع الإعلان — تُستخدم بعد الربط بالخادم
      retry: 'إعادة المحاولة',
      noAdsFound: 'لا توجد إعلانات',
      lostItem: 'مفقود',
      foundItem: 'موجود',
      pending: 'قيد المراجعة',
      approved: 'معتمد',
      rejected: 'مرفوض',
      resolved: 'تم الاسترجاع',
      national_id: 'بطاقة وطنية',
      driving_license: 'إجازة سوق',
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
      
      // التبويبات
      ads: 'الإعلانات',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      
      // الإعدادات
      account_settings: 'إعدادات الحساب',
      account_information: 'معلومات الحساب',
      change_password: 'تغيير كلمة المرور',
      notification_preferences: 'إعدادات الإشعارات',
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
      logout: 'تسجيل الخروج',
      version: 'الإصدار',
      
      // إعدادات اللغة
      resetLanguageSelection: 'إعادة تعيين اختيار اللغة',
      resetLanguageTitle: 'إعادة تعيين إعدادات اللغة',
      resetLanguageMessage: 'هل أنت متأكد من رغبتك في إعادة تعيين إعدادات اللغة؟',
      resetButton: 'إعادة تعيين',
      settingsResetTitle: 'تم إعادة التعيين',
      settingsResetMessage: 'سيظهر اختيار اللغة عند تشغيل التطبيق في المرة القادمة',
      
      // الملف الشخصي
      login_required: 'تسجيل الدخول مطلوب',
      please_login_to_view_profile: 'يرجى تسجيل الدخول لعرض ملفك الشخصي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      user_name: 'اسم المستخدم',
      my_ads: 'إعلاناتي',
      favorites: 'المفضلة',
      notifications: 'الإشعارات',
      createAccount: 'إنشاء حساب',
      loginRequired: 'تسجيل الدخول مطلوب',
      
      // الإعلانات
      search_ads: 'البحث في الإعلانات',
      search: 'بحث',
      categories: 'الفئات',
      allAds: 'جميع الإعلانات',
      add_ad: 'إضافة إعلان',
      postAd: 'نشر إعلان',
      
      // فئات الإعلانات
      electronics: 'إلكترونيات',
      vehicles: 'مركبات',
      property: 'عقارات',
      furniture: 'أثاث',
      jobs: 'وظائف',
      services: 'خدمات',
      fashion: 'أزياء',
      other: 'أخرى',

      // المناطق
      allIraq: 'كل العراق',
      baghdad: 'بغداد',
      basra: 'البصرة',
      erbil: 'أربيل',
      sulaymaniyah: 'السليمانية',
      duhok: 'دهوك',
      kirkuk: 'كركوك',
      najaf: 'النجف',
      karbala: 'كربلاء',
      anbar: 'الأنبار',
      diyala: 'ديالى',
      wasit: 'واسط',
      maysan: 'ميسان',
      babil: 'بابل',
      diwaniyah: 'الديوانية',
      dhiqar: 'ذي قار',
      muthanna: 'المثنى',
      nineveh: 'نينوى',
      salahuddin: 'صلاح الدين',

      // الفئات الإضافية
      passport: 'جواز السفر',
      residency: 'الإقامة',
      nationalID: 'البطاقة الوطنية',
      drivingLicense: 'رخصة القيادة',
      birthCertificate: 'شهادة الميلاد',
      marriageCertificate: 'عقد الزواج',
      educationalCertificates: 'الشهادات التعليمية',
      legalDocuments: 'الوثائق القانونية',
      medicalDocuments: 'الوثائق الطبية',
      otherDocuments: 'وثائق أخرى'
    }
  },
  ku: {
    translation: {
      resetLanguageConfirm: 'دەگەڕێیتەوە بۆ ڕوونمای هەڵبژاردنی زمان.',
      lastUpdated: 'دوایین نوێکردنەوە: تەمووزی ٢٠٢٦',
      privacyIntro: 'ئەم سیاسەتە ڕوون دەکاتەوە چ زانیارییەک کۆدەکرێتەوە و چۆن بەکاردێت. بنەما: تەنها ئەوەی پێویستە بۆ گەڕاندنەوەی بەڵگەنامە.',
      privacyS1Title: 'ئەو زانیاریانەی کۆیان دەکەینەوە',
      privacyS1Body: 'ژمارەی مۆبایل و ناوی تەواوت لە کاتی دروستکردنی هەژمار، و زانیاری ڕیکلامەکە کاتێک بڵاوی دەکەیتەوە.',
      privacyS2Title: 'چۆن بەکاری دەهێنین',
      privacyS2Body: 'بۆ پیشاندانی ڕیکلامەکەت و دۆزینەوەی خۆکار و ئاگادارکردنەوەت.',
      privacyS3Title: 'ئاشکراکردنی زانیاری پەیوەندی',
      privacyS3Body: 'ژمارەکەت شاراوە دەمێنێتەوە تا بەڕێوەبەر ڕەزامەندی لەسەر داواکارییەک دەدات.',
      privacyS4Title: 'هاوبەشکردنی زانیاری',
      privacyS4Body: 'زانیارییەکانت نافرۆشین و لەگەڵ ڕیکلامکاران هاوبەشی ناکەین.',
      privacyS5Title: 'مافەکانت',
      privacyS5Body: 'دەتوانیت زانیارییەکانت بگۆڕیت یان ڕیکلامەکانت بسڕیتەوە هەر کاتێک.',
      termsIntro: 'بە بەکارهێنانی ئەپەکە ڕازی دەبیت بەم مەرجانە. ئەپەکە ناوەندگیرە و بەرپرس نییە لە مامەڵەکانی نێوان بەکارهێنەران.',
      termsS1Title: 'بەکارهێنانی خزمەتگوزاری',
      termsS1Body: 'خزمەتگوزارییەکە بۆ ڕاپۆرتکردنی بەڵگەنامەی ون و دۆزراوەیە لە ناو عێراق.',
      termsS2Title: 'ڕاستی زانیاری',
      termsS2Body: 'تۆ بەرپرسیت لە ڕاستی ئەوەی بڵاوی دەکەیتەوە.',
      termsS3Title: 'پێداچوونەوەی ڕیکلام',
      termsS3Body: 'هەر ڕیکلامێک پێداچوونەوەی بۆ دەکرێت پێش دەرکەوتنی.',
      termsS4Title: 'سنووری بەرپرسیارێتی',
      termsS4Body: 'ئەپەکە دڵنیایی نادات بەڵگەنامەکە بدۆزرێتەوە.',
      termsS5Title: 'گۆڕینی مەرجەکان',
      termsS5Body: 'لەوانەیە ئەم مەرجانە نوێ بکەینەوە.',
      lost: 'ون بوو',
      found: 'دۆزرایەوە',
      saladin: 'سەڵاحەدین',
      enterPhoneAndPassword: 'تکایە ژمارەی مۆبایل و وشەی نهێنی بنووسە',
      forgotPassword: 'وشەی نهێنیت لەبیرچووە؟',
      noAccountRegister: 'هەژمارت نییە؟ ئێستا خۆت تۆمار بکە',
      phoneExample: 'نموونە: ژمارەی مۆبایل',
      logoutError: 'هەڵەیەک ڕوویدا لە کاتی چوونەدەرەوە',
      loading: 'بارکردن...',
      success: 'سەرکەوتوو بوو',
      selectProvince: 'پارێزگا هەڵبژێرە',
      languageChanged: 'زمان بە سەرکەوتوویی گۆڕدرا',
      languageChangeError: 'نەتوانرا زمان بگۆڕدرێت',
      phoneNumber: 'ژمارەی مۆبایل',
      password: 'وشەی نهێنی',
      photos: 'وێنەکان',
      addPhoto: 'زیادکردنی وێنە',
      imagesHint: 'تا {{count}} وێنە. وێنەیەکی ڕوون زۆر یارمەتیدەرە.',
      maxImagesReached: 'دەتوانیت تا {{count}} وێنە هاوپێچ بکەیت',
      galleryPermissionDenied: 'مۆڵەتی گەلەری پێویستە',
      myAdsDescription: 'ڕیکلامە بڵاوکراوەکانت ببینە و بەڕێوەیان ببە',
      favoritesDescription: 'ئەو ڕیکلامانەی پاشەکەوتت کردوون',
      notificationsDescription: 'دۆزینەوەکان و نوێکارییەکانی داواکاری پەیوەندی',
      noAdsYet: 'هێشتا هیچ ڕیکلامێکت بڵاو نەکردووەتەوە',
      noNotifications: 'هێشتا هیچ ئاگادارکردنەوەیەک نییە',
      noFavorites: 'هێشتا هیچ ڕیکلامێکت پاشەکەوت نەکردووە',
      markAllRead: 'هەمووی وەک خوێندراوە دیاری بکە',
      removeFromFavorites: 'لابردن لە دڵخوازەکان',
      featureComingSoon: 'ئەم ڕوونمایە هێشتا بەردەست نییە',
      // شاشتا إنشاء الإعلان وتفاصيله
      adType: 'جۆری ڕیکلام',
      documentType: 'جۆری بەڵگەنامە',
      province: 'پارێزگا',
      ownerName: 'ناوی خاوەن بەڵگەنامە',
      ownerNameOptional: 'ناوی خاوەن بەڵگەنامە (ئارەزوومەندانە)',
      ownerNamePlaceholder: 'ناو وەک لە بەڵگەنامەکەدا نووسراوە',
      itemNumber: 'ژمارەی بەڵگەنامە',
      itemNumberOptional: 'ژمارەی بەڵگەنامە (ئارەزوومەندانە)',
      itemNumberPlaceholder: 'نموونە: A12345678',
      itemNumberHint: 'ژمارەی بەڵگەنامە بەهێزترین نیشانەیە بۆ دۆزینەوە.',
      description: 'وەسف',
      descriptionPlaceholder: 'لەکوێ و کەی ون بوو یان دۆزرایەوە',
      descriptionTooShort: 'تکایە وەسفێک بنووسە کە لانیکەم ١٠ پیت بێت',
      contactPhone: 'ژمارەی پەیوەندی',
      contactPhoneRequired: 'ژمارەی پەیوەندی پێویستە',
      hideContactInfo: 'ژمارەکەم بشارەوە',
      hideContactHint: 'ژمارەکەت شاراوە دەمێنێتەوە تا ڕەزامەندی دەدەیت.',
      publishAd: 'بڵاوکردنەوەی ڕیکلام',
      adReviewNotice: 'بەڕێوەبەر ڕیکلامەکە پێداچوونەوەی بۆ دەکات پێش دەرکەوتنی.',
      adPendingReview: 'ڕیکلامەکەت نێردرا و چاوەڕێی پێداچوونەوەیە.',
      selectCategoryFirst: 'تکایە جۆری بەڵگەنامە هەڵبژێرە',
      selectProvinceFirst: 'تکایە پارێزگا هەڵبژێرە',
      loginToPostAd: 'پێویستت بە هەژمارە بۆ بڵاوکردنەوە.',
      adDetails: 'وردەکاری ڕیکلام',
      adNotFound: 'ڕیکلامەکە نەدۆزرایەوە',
      backToAds: 'گەڕانەوە بۆ ڕیکلامەکان',
      publishedAt: 'بڵاوکرایەوە',
      requestContact: 'داواکاری پەیوەندی',
      addToFavorites: 'زیادکردن بۆ دڵخوازەکان',
      addedToFavorites: 'زیادکرا بۆ دڵخوازەکان',
      contactHiddenHint: 'ژمارەکە شاراوەیە. داواکاری بنێرە.',
      contactReasonHint: 'ڕوونی بکەوە بۆچی دەتەوێت پەیوەندی بکەیت.',
      contactReasonPlaceholder: 'نموونە: ئەم بەڵگەنامەیەم دۆزیەوە',
      contactRequestSent: 'داواکارییەکەت نێردرا.',
      reasonTooShort: 'تکایە هۆکارێکی ڕوونتر بنووسە',
      loginToContact: 'پێویستت بە هەژمارە بۆ داواکاری پەیوەندی.',
      done: 'تەواو',
      ok: 'باشە',
      send: 'ناردن',
      // التسجيل وشريط التثبيت
      alreadyHaveAccount: 'هەژمارت هەیە؟ بچۆ ژوورەوە',
      registerWithOtpHint: 'کۆدی پشتڕاستکردنەوە بۆ ژمارەکەت دەنێرین.',
      registerDirectHint: 'زانیارییەکانت بنووسە بۆ دروستکردنی هەژمار.',
      fullName: 'ناوی تەواو',
      fullNameRequired: 'تکایە ناوی تەواو بنووسە',
      confirmPassword: 'دووپاتکردنەوەی وشەی نهێنی',
      passwordsDoNotMatch: 'وشە نهێنییەکان وەک یەک نین',
      passwordTooShort: 'وشەی نهێنی دەبێت لانیکەم ٦ پیت بێت',
      invalidPhone: 'ژمارەی مۆبایل هەڵەیە',
      sendCode: 'ناردنی کۆد',
      alert: 'ئاگاداری',
      error: 'هەڵە',
      install: 'دامەزراندن',
      installBannerTitle: 'ئەپەکە دابمەزرێنە',
      installBannerSubtitle: 'دەستڕاگەیشتنی خێراتر لە ڕوونمای سەرەکییەوە',
      // صفحة التثبيت
      installTitle: 'ئەپی مستمسكاتی دابمەزرێنە',
      installSubtitle: 'ئەپەکە بۆ ڕوونمای سەرەکی زیاد بکە و وەک هەر ئەپێکی تر بەکاریبهێنە — بێ پێویست بە کۆگا.',
      installNow: 'ئێستا دایبمەزرێنە',
      installDismissed: 'دامەزراندن هەڵوەشێنرایەوە. دەتوانیت هەر کاتێک هەوڵ بدەیتەوە.',
      alreadyInstalled: 'ئەپەکە پێشتر دامەزراوە',
      openApp: 'ئەپەکە بکەرەوە',
      orInstallManually: 'یان بە دەست دایبمەزرێنە لەسەر',
      howToInstallOn: 'چۆن دایبمەزرێنیت لەسەر',
      continueInBrowser: 'بەردەوامبوون لە وێبگەڕدا',
      orDownloadFromStore: 'یان لە کۆگاوە دایبگرە',
      iphone: 'ئایفۆن',
      android: 'ئەندرۆید',
      desktop: 'کۆمپیوتەر',
      benefitFast: 'دەستبەجێ دەکرێتەوە وەک ئەپێکی ڕەسەن',
      benefitNotifications: 'ئاگادارکردنەوەت بۆ دێت کاتێک بەڵگەنامەکەت دەدۆزرێتەوە',
      benefitOffline: 'بەبێ ئینتەرنێت ئەوەی پێشتر کردووتەوە دەبینیت',
      benefitNoStore: 'بەبێ کۆگا و بەبێ شوێنی خەزنکردن',
      iosStep1: 'ئەم لاپەڕەیە لە وێبگەڕی Safari بکەرەوە',
      iosStep2: 'دوگمەی هاوبەشکردن لە خوارەوەی ڕوونماکە دابگرە',
      iosStep3: '«زیادکردن بۆ ڕوونمای سەرەکی» هەڵبژێرە',
      iosStep4: '«زیادکردن» دابگرە — وێنۆچکەکە دەردەکەوێت',
      androidStep1: 'لیستی سێ خاڵ لە سەرەوەی ڕاست دابگرە',
      androidStep2: '«دامەزراندنی ئەپ» یان «زیادکردن بۆ ڕوونمای سەرەکی» هەڵبژێرە',
      androidStep3: 'پشتڕاست بکەرەوە — وێنۆچکەکە دەردەکەوێت',
      desktopStep1: 'بەدوای وێنۆچکەی دامەزراندن بگەڕێ لە شریتی ناونیشان',
      desktopStep2: 'کلیکی لێبکە و دامەزراندن پشتڕاست بکەرەوە',
      iosSafariOnly: 'لە ئایفۆندا دامەزراندن تەنها لە Safari کاردەکات. Chrome و وێبگەڕەکانی تر لەسەر iOS ناتوانن ئەپ زیاد بکەن.',
      // حالات ونوع الإعلان — تُستخدم بعد الربط بالخادم
      retry: 'دووبارە هەوڵبدەرەوە',
      noAdsFound: 'هیچ ڕیکلامێک نەدۆزرایەوە',
      lostItem: 'ون بوو',
      foundItem: 'دۆزرایەوە',
      pending: 'لە پێداچوونەوەدایە',
      approved: 'پەسەندکرا',
      rejected: 'ڕەتکرایەوە',
      resolved: 'گەڕێندرایەوە',
      national_id: 'ناسنامەی نیشتمانی',
      driving_license: 'مۆڵەتی شۆفێری',
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
      
      // التبويبات
      ads: 'ڕیکلامەکان',
      profile: 'پرۆفایل',
      settings: 'ڕێکخستنەکان',
      
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
      logout: 'چوونەدەرەوە',
      version: 'وەشان',
      
      // إعدادات اللغة
      resetLanguageSelection: 'ڕێکخستنەوەی هەڵبژاردنی زمان',
      resetLanguageTitle: 'ڕێکخستنەوەی ڕێکخستنەکانی زمان',
      resetLanguageMessage: 'دڵنیای لە ڕێکخستنەوەی ڕێکخستنەکانی زمان؟',
      resetButton: 'ڕێکخستنەوە',
      settingsResetTitle: 'ڕێکخستنەوە',
      settingsResetMessage: 'هەڵبژاردنی زمان لە داگیرسانەوەی داهاتوودا دەردەکەوێت',
      
      // الملف الشخصي
      login_required: 'چوونەژوورەوە پێویستە',
      please_login_to_view_profile: 'تکایە بچۆرە ژوورەوە بۆ بینینی پرۆفایلەکەت',
      login: 'چوونەژوورەوە',
      register: 'تۆمارکردن',
      user_name: 'ناوی بەکارهێنەر',
      my_ads: 'ڕیکلامەکانم',
      favorites: 'دڵخوازەکان',
      notifications: 'ئاگادارکردنەوەکان',
      createAccount: 'دروستکردنی هەژمار',
      loginRequired: 'چوونەژوورەوە پێویستە',
      
      // الإعلانات
      search_ads: 'گەڕان لە ڕیکلامەکان',
      search: 'گەڕان',
      categories: 'پۆلەکان',
      allAds: 'هەموو ڕیکلامەکان',
      add_ad: 'زیادکردنی ڕیکلام',
      postAd: 'بڵاوکردنەوەی ڕیکلام',
      
      // فئات الإعلانات
      electronics: 'ئەلیکترۆنیات',
      vehicles: 'ئۆتۆمبێل',
      property: 'خانوبەرە',
      furniture: 'کەلوپەلی ناوماڵ',
      jobs: 'کار',
      services: 'خزمەتگوزاریەکان',
      fashion: 'جلوبەرگ',
      other: 'هیتر',

      // المناطق
      allIraq: 'هەموو عێراق',
      baghdad: 'بەغدا',
      basra: 'بەسرە',
      erbil: 'هەولێر',
      sulaymaniyah: 'سلێمانی',
      duhok: 'دهۆک',
      kirkuk: 'کەرکوک',
      najaf: 'نەجەف',
      karbala: 'کەربەلا',
      anbar: 'ئەنبار',
      diyala: 'دیالە',
      wasit: 'واست',
      maysan: 'مەیسان',
      babil: 'بابل',
      diwaniyah: 'دیوانیە',
      dhiqar: 'زیقار',
      muthanna: 'موسەننا',
      nineveh: 'نەینەوا',
      salahuddin: 'سەڵاحەدین',

      // الفئات الإضافية
      passport: 'پاسپۆرت',
      residency: 'نیشتەجێبوون',
      nationalID: 'ناسنامەی نیشتمانی',
      drivingLicense: 'مۆڵەتی شوفێری',
      birthCertificate: 'بڕوانامەی لەدایکبوون',
      marriageCertificate: 'گرێبەستی هاوسەرگیری',
      educationalCertificates: 'بڕوانامەی خوێندن',
      legalDocuments: 'بەڵگەنامە یاساییەکان',
      medicalDocuments: 'بەڵگەنامە پزیشکییەکان',
      otherDocuments: 'بەڵگەنامەی تر'
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

// تهيئة i18n
const i18n = i18next.createInstance();

i18n
  .use(initReactI18next)
  .init({
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

    // تطبيق RTL للـ iOS
    if (Platform.OS === 'ios') {
      const isRTL = RTL_LANGUAGES.includes(language);
      if (isRTL) {
        I18nManager.allowRTL(true);
        I18nManager.forceRTL(true);
        if (!I18nManager.isRTL) {
          I18nManager.forceRTL(true);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      } else {
        I18nManager.allowRTL(false);
        I18nManager.forceRTL(false);
        if (I18nManager.isRTL) {
          I18nManager.forceRTL(false);
          // Updates.reloadAsync(); // إذا كنت تستخدم Expo
        }
      }
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

    return true;
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

export default i18n; 