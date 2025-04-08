/**
 * مكون مساعد للمطورين لفحص وتصحيح الترجمات
 *
 * هذا المكون مصمم للاستخدام في بيئة التطوير فقط
 * ويوفر واجهة مستخدم لفحص وتصحيح ومزامنة الترجمات
 *
 * المبادئ المتبعة:
 * - SOLID: فصل المسؤوليات
 * - KISS: بساطة الاستخدام
 * - YAGNI: عدم إضافة وظائف غير ضرورية
 * - Clean Code: كود واضح سهل القراءة والصيانة
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import i18next, {
  findMissingTranslationKeys,
  validateTranslations,
  syncTranslationFiles,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  reloadTranslations,
} from '../i18n/index';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  runTranslationDiagnostics,
  compareLanguages,
  getTextsNeedingTranslation,
} from '../i18n/utils';

/**
 * مكون مساعد للمطورين لتصحيح الترجمات
 *
 * @returns مكون React لفحص وتصحيح الترجمات
 */
export default function TranslationDebugger() {
  // تأكد من أننا في بيئة التطوير
  if (!__DEV__) {
    return null;
  }

  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState<any>(null);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [sourceLanguage, setSourceLanguage] = useState(DEFAULT_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState(
    SUPPORTED_LANGUAGES.find(lang => lang !== DEFAULT_LANGUAGE) || 'en',
  );
  const [namespace, setNamespace] = useState('common');

  // تنفيذ عملية تشخيص الترجمات
  const runDiagnostics = async (autoSync = false) => {
    setLoading(true);
    try {
      // استخدام setTimeout لتجنب تجميد واجهة المستخدم
      setTimeout(() => {
        try {
          const missingKeys = findMissingTranslationKeys(namespace);
          const validation = validateTranslations();

          if (autoSync && missingKeys.length > 0) {
            const syncResult = syncTranslationFiles(namespace);
            setDiagnosticsResult({
              missingKeys,
              validation,
              syncResult,
            });
          } else {
            setDiagnosticsResult({
              missingKeys,
              validation,
            });
          }

          setLoading(false);
        } catch (error) {
          console.error('خطأ في تشخيص الترجمات:', error);
          setDiagnosticsResult({ error });
          setLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error('خطأ في تشخيص الترجمات:', error);
      setDiagnosticsResult({ error });
      setLoading(false);
    }
  };

  // مقارنة لغتين
  const compareSelectedLanguages = () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const result = compareLanguages(sourceLanguage, targetLanguage, namespace);
        setComparisonResult(result);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error('خطأ في مقارنة اللغات:', error);
      setComparisonResult({ error });
      setLoading(false);
    }
  };

  // إعادة تحميل الترجمات
  const handleReloadTranslations = () => {
    setLoading(true);
    try {
      reloadTranslations();
      Alert.alert('تم بنجاح', 'تم إعادة تحميل الترجمات بنجاح');
    } catch (error) {
      console.error('خطأ في إعادة تحميل الترجمات:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء إعادة تحميل الترجمات');
    } finally {
      setLoading(false);
    }
  };

  // مزامنة الترجمات
  const handleSyncTranslations = () => {
    setLoading(true);
    try {
      setTimeout(() => {
        const result = syncTranslationFiles(namespace);
        Alert.alert(
          result.success ? 'تم بنجاح' : 'خطأ',
          result.success
            ? `تم مزامنة ${result.syncedLanguages.length} لغة بنجاح`
            : 'حدث خطأ أثناء مزامنة الترجمات',
        );
        setLoading(false);

        // إعادة تشغيل التشخيص لعرض النتائج المحدثة
        runDiagnostics(false);
      }, 100);
    } catch (error) {
      console.error('خطأ في مزامنة الترجمات:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء مزامنة الترجمات');
      setLoading(false);
    }
  };

  // التبديل بين التشخيص والمقارنة
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>جاري التنفيذ...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'diagnostics':
        return renderDiagnosticsTab();
      case 'compare':
        return renderCompareTab();
      default:
        return renderOverviewTab();
    }
  };

  // عرض الملخص
  const renderOverviewTab = () => {
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>معلومات عامة</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>اللغة الحالية: {i18next.language}</Text>
          <Text style={styles.infoText}>اللغة الافتراضية: {DEFAULT_LANGUAGE}</Text>
          <Text style={styles.infoText}>اللغات المدعومة: {SUPPORTED_LANGUAGES.join(', ')}</Text>
        </View>

        <Text style={styles.sectionTitle}>أدوات سريعة</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={handleReloadTranslations}>
            <Text style={styles.buttonText}>إعادة تحميل الترجمات</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => runDiagnostics(false)}>
            <Text style={styles.buttonText}>تشخيص الترجمات</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSyncTranslations}>
            <Text style={styles.buttonText}>مزامنة الترجمات</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>تحقق من ترجمة</Text>
        <View style={styles.translationTestContainer}>
          <TextInput
            style={styles.keyInput}
            placeholder="أدخل مفتاح الترجمة (مثال: common:hello)"
            placeholderTextColor="#999"
            onSubmitEditing={event => {
              const key = event.nativeEvent.text;
              let ns = 'common';
              let actualKey = key;

              if (key.includes(':')) {
                [ns, actualKey] = key.split(':');
              }

              const translated = i18next.t(key);
              Alert.alert(
                'نتيجة الترجمة',
                translated === key
                  ? `لم يتم العثور على مفتاح الترجمة: ${key}`
                  : `الترجمة: ${translated}`,
              );
            }}
          />
        </View>
      </View>
    );
  };

  // عرض نتائج التشخيص
  const renderDiagnosticsTab = () => {
    if (!diagnosticsResult) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.message}>اضغط على زر "تشخيص الترجمات" لعرض التشخيص</Text>
          <TouchableOpacity style={styles.button} onPress={() => runDiagnostics(false)}>
            <Text style={styles.buttonText}>تشخيص الترجمات</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (diagnosticsResult.error) {
      return (
        <View style={styles.tabContent}>
          <Text style={styles.errorMessage}>
            حدث خطأ أثناء التشخيص: {diagnosticsResult.error.message}
          </Text>
          <TouchableOpacity style={styles.button} onPress={() => runDiagnostics(false)}>
            <Text style={styles.buttonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>نتائج التشخيص</Text>

        {/* عرض المفاتيح المفقودة */}
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>المفاتيح المفقودة</Text>
          {diagnosticsResult.missingKeys.length === 0 ? (
            <Text style={styles.successMessage}>
              ✅ لا توجد مفاتيح مفقودة! جميع اللغات متطابقة.
            </Text>
          ) : (
            <>
              <Text style={styles.warningMessage}>
                ⚠️ تم العثور على {diagnosticsResult.missingKeys.length} لغات بها مفاتيح مفقودة:
              </Text>
              {diagnosticsResult.missingKeys.map((report: any, index: number) => (
                <View key={index} style={styles.missingKeysReport}>
                  <Text style={styles.languageTitle}>
                    🔹 اللغة: {report.language} ({report.missingKeys.length} مفتاح مفقود)
                  </Text>
                  <Text style={styles.keysListTitle}>المفاتيح المفقودة:</Text>
                  <Text style={styles.keysList}>
                    {report.missingKeys.slice(0, 10).join(', ')}
                    {report.missingKeys.length > 10 ? '...' : ''}
                  </Text>
                </View>
              ))}

              <TouchableOpacity style={styles.actionButton} onPress={handleSyncTranslations}>
                <Text style={styles.actionButtonText}>مزامنة المفاتيح المفقودة</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* عرض نتائج المزامنة */}
        {diagnosticsResult.syncResult && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>نتائج المزامنة</Text>
            {diagnosticsResult.syncResult.success ? (
              <>
                <Text style={styles.successMessage}>✅ تمت المزامنة بنجاح</Text>
                {diagnosticsResult.syncResult.syncedLanguages.length > 0 ? (
                  <>
                    <Text style={styles.infoText}>
                      تم مزامنة {diagnosticsResult.syncResult.syncedLanguages.length} لغات:
                    </Text>
                    {diagnosticsResult.syncResult.syncedLanguages.map(
                      (lang: string, index: number) => (
                        <Text key={index} style={styles.syncResultItem}>
                          • {lang}: تمت إضافة {diagnosticsResult.syncResult.addedKeys[lang].length}{' '}
                          مفتاح
                        </Text>
                      ),
                    )}
                  </>
                ) : (
                  <Text style={styles.infoText}>لم تتم مزامنة أي لغة، جميع المفاتيح متطابقة.</Text>
                )}
              </>
            ) : (
              <Text style={styles.errorMessage}>
                ❌ فشلت المزامنة: {diagnosticsResult.syncResult.error}
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // عرض نتائج المقارنة
  const renderCompareTab = () => {
    return (
      <ScrollView style={styles.tabContent}>
        <Text style={styles.sectionTitle}>مقارنة اللغات</Text>

        <View style={styles.languageSelectionContainer}>
          <View style={styles.languageSelection}>
            <Text style={styles.labelText}>اللغة المصدر:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={`source-${lang}`}
                  style={[
                    styles.languageButton,
                    sourceLanguage === lang && styles.languageButtonActive,
                  ]}
                  onPress={() => setSourceLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      sourceLanguage === lang && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.languageSelection}>
            <Text style={styles.labelText}>اللغة الهدف:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SUPPORTED_LANGUAGES.map(lang => (
                <TouchableOpacity
                  key={`target-${lang}`}
                  style={[
                    styles.languageButton,
                    targetLanguage === lang && styles.languageButtonActive,
                  ]}
                  onPress={() => setTargetLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.languageButtonText,
                      targetLanguage === lang && styles.languageButtonTextActive,
                    ]}
                  >
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TouchableOpacity style={styles.button} onPress={compareSelectedLanguages}>
            <Text style={styles.buttonText}>قارن اللغات</Text>
          </TouchableOpacity>
        </View>

        {comparisonResult && !comparisonResult.error && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>نتائج المقارنة</Text>
            <Text style={styles.infoText}>
              تطابق: {comparisonResult.percentage}% ({comparisonResult.commonKeys} مفتاح مشترك)
            </Text>
            <Text style={styles.infoText}>
              إجمالي المفاتيح ({comparisonResult.sourceLanguage}): {comparisonResult.sourceTotal}
            </Text>
            <Text style={styles.infoText}>
              إجمالي المفاتيح ({comparisonResult.targetLanguage}): {comparisonResult.targetTotal}
            </Text>

            {comparisonResult.missingInTarget.length > 0 && (
              <>
                <Text style={styles.warningMessage}>
                  المفاتيح المفقودة في {comparisonResult.targetLanguage}:{' '}
                  {comparisonResult.missingInTarget.length}
                </Text>
                <Text style={styles.keysList}>
                  {comparisonResult.missingInTarget.slice(0, 10).join(', ')}
                  {comparisonResult.missingInTarget.length > 10 ? '...' : ''}
                </Text>
              </>
            )}

            {comparisonResult.missingInSource.length > 0 && (
              <>
                <Text style={styles.warningMessage}>
                  المفاتيح المفقودة في {comparisonResult.sourceLanguage}:{' '}
                  {comparisonResult.missingInSource.length}
                </Text>
                <Text style={styles.keysList}>
                  {comparisonResult.missingInSource.slice(0, 10).join(', ')}
                  {comparisonResult.missingInSource.length > 10 ? '...' : ''}
                </Text>
              </>
            )}
          </View>
        )}

        {comparisonResult && comparisonResult.error && (
          <View style={styles.resultCard}>
            <Text style={styles.errorMessage}>خطأ: {comparisonResult.error}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  // عرض المكون الرئيسي
  return (
    <>
      <TouchableOpacity style={styles.debugButton} onPress={() => setIsVisible(true)}>
        <Ionicons name="language" size={24} color="white" />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>أداة فحص الترجمات</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.tabBar}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
                onPress={() => setActiveTab('overview')}
              >
                <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                  نظرة عامة
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'diagnostics' && styles.activeTab]}
                onPress={() => setActiveTab('diagnostics')}
              >
                <Text style={[styles.tabText, activeTab === 'diagnostics' && styles.activeTabText]}>
                  التشخيص
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tab, activeTab === 'compare' && styles.activeTab]}
                onPress={() => setActiveTab('compare')}
              >
                <Text style={[styles.tabText, activeTab === 'compare' && styles.activeTabText]}>
                  المقارنة
                </Text>
              </TouchableOpacity>
            </View>

            {renderContent()}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// الأنماط
const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginTop: 10,
    padding: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  activeTab: {
    borderBottomColor: '#007AFF',
    borderBottomWidth: 2,
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  debugButton: {
    alignItems: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 25,
    bottom: 20,
    elevation: 5,
    height: 50,
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 50,
  },
  errorMessage: {
    color: 'red',
    marginVertical: 5,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  headerTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    color: '#333',
    fontSize: 14,
    marginBottom: 5,
  },
  keyInput: {
    borderColor: '#ddd',
    borderRadius: 8,
    borderWidth: 1,
    color: '#333',
    marginBottom: 10,
    padding: 10,
  },
  keysList: {
    color: '#666',
    fontSize: 12,
  },
  keysListTitle: {
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  labelText: {
    color: '#666',
    marginBottom: 5,
  },
  languageButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  languageButtonActive: {
    backgroundColor: '#007AFF',
  },
  languageButtonText: {
    color: '#333',
  },
  languageButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  languageSelection: {
    marginBottom: 10,
  },
  languageSelectionContainer: {
    marginBottom: 15,
  },
  languageTitle: {
    color: '#333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: '#333',
    marginTop: 10,
  },
  message: {
    color: '#666',
    marginVertical: 20,
    textAlign: 'center',
  },
  missingKeysReport: {
    marginBottom: 10,
    marginTop: 5,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#f8f8f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    marginTop: 50,
    overflow: 'hidden',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 2,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 15,
  },
  successMessage: {
    color: 'green',
    marginVertical: 5,
  },
  syncResultItem: {
    color: '#333',
    marginVertical: 2,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    padding: 12,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabContent: {
    flex: 1,
    padding: 15,
  },
  tabText: {
    color: '#999',
    fontSize: 14,
  },
  translationTestContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 15,
  },
  warningMessage: {
    color: 'orange',
    marginVertical: 5,
  },
});
