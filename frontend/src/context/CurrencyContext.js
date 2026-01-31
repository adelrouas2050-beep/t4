import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// قائمة الدول والعملات المدعومة
export const countries = [
  {
    code: 'SA',
    nameAr: 'السعودية',
    nameEn: 'Saudi Arabia',
    currency: 'SAR',
    currencySymbolAr: 'ر.س',
    currencySymbolEn: 'SAR',
    currencyNameAr: 'ريال سعودي',
    currencyNameEn: 'Saudi Riyal',
    flag: '🇸🇦'
  },
  {
    code: 'AE',
    nameAr: 'الإمارات',
    nameEn: 'UAE',
    currency: 'AED',
    currencySymbolAr: 'د.إ',
    currencySymbolEn: 'AED',
    currencyNameAr: 'درهم إماراتي',
    currencyNameEn: 'UAE Dirham',
    flag: '🇦🇪'
  },
  {
    code: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    currency: 'KWD',
    currencySymbolAr: 'د.ك',
    currencySymbolEn: 'KWD',
    currencyNameAr: 'دينار كويتي',
    currencyNameEn: 'Kuwaiti Dinar',
    flag: '🇰🇼'
  },
  {
    code: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    currency: 'QAR',
    currencySymbolAr: 'ر.ق',
    currencySymbolEn: 'QAR',
    currencyNameAr: 'ريال قطري',
    currencyNameEn: 'Qatari Riyal',
    flag: '🇶🇦'
  },
  {
    code: 'BH',
    nameAr: 'البحرين',
    nameEn: 'Bahrain',
    currency: 'BHD',
    currencySymbolAr: 'د.ب',
    currencySymbolEn: 'BHD',
    currencyNameAr: 'دينار بحريني',
    currencyNameEn: 'Bahraini Dinar',
    flag: '🇧🇭'
  },
  {
    code: 'OM',
    nameAr: 'عمان',
    nameEn: 'Oman',
    currency: 'OMR',
    currencySymbolAr: 'ر.ع',
    currencySymbolEn: 'OMR',
    currencyNameAr: 'ريال عماني',
    currencyNameEn: 'Omani Rial',
    flag: '🇴🇲'
  },
  {
    code: 'JO',
    nameAr: 'الأردن',
    nameEn: 'Jordan',
    currency: 'JOD',
    currencySymbolAr: 'د.أ',
    currencySymbolEn: 'JOD',
    currencyNameAr: 'دينار أردني',
    currencyNameEn: 'Jordanian Dinar',
    flag: '🇯🇴'
  },
  {
    code: 'EG',
    nameAr: 'مصر',
    nameEn: 'Egypt',
    currency: 'EGP',
    currencySymbolAr: 'ج.م',
    currencySymbolEn: 'EGP',
    currencyNameAr: 'جنيه مصري',
    currencyNameEn: 'Egyptian Pound',
    flag: '🇪🇬'
  },
  {
    code: 'LB',
    nameAr: 'لبنان',
    nameEn: 'Lebanon',
    currency: 'LBP',
    currencySymbolAr: 'ل.ل',
    currencySymbolEn: 'LBP',
    currencyNameAr: 'ليرة لبنانية',
    currencyNameEn: 'Lebanese Pound',
    flag: '🇱🇧'
  },
  {
    code: 'MA',
    nameAr: 'المغرب',
    nameEn: 'Morocco',
    currency: 'MAD',
    currencySymbolAr: 'د.م',
    currencySymbolEn: 'MAD',
    currencyNameAr: 'درهم مغربي',
    currencyNameEn: 'Moroccan Dirham',
    flag: '🇲🇦'
  },
  {
    code: 'DZ',
    nameAr: 'الجزائر',
    nameEn: 'Algeria',
    currency: 'DZD',
    currencySymbolAr: 'د.ج',
    currencySymbolEn: 'DZD',
    currencyNameAr: 'دينار جزائري',
    currencyNameEn: 'Algerian Dinar',
    flag: '🇩🇿'
  },
  {
    code: 'TN',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    currency: 'TND',
    currencySymbolAr: 'د.ت',
    currencySymbolEn: 'TND',
    currencyNameAr: 'دينار تونسي',
    currencyNameEn: 'Tunisian Dinar',
    flag: '🇹🇳'
  }
];

export const CurrencyProvider = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // اكتشاف البلد تلقائياً
  useEffect(() => {
    const detectCountry = async () => {
      try {
        // محاولة الحصول على البلد من localStorage أولاً
        const savedCountryCode = localStorage.getItem('countryCode');
        if (savedCountryCode) {
          const savedCountry = countries.find(c => c.code === savedCountryCode);
          if (savedCountry) {
            setCurrentCountry(savedCountry);
            setIsLoading(false);
            return;
          }
        }

        // محاولة اكتشاف البلد من المتصفح
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let detectedCountry = countries[0]; // السعودية كافتراضي

        // تحديد البلد بناءً على المنطقة الزمنية
        if (timezone.includes('Dubai')) {
          detectedCountry = countries.find(c => c.code === 'AE');
        } else if (timezone.includes('Kuwait')) {
          detectedCountry = countries.find(c => c.code === 'KW');
        } else if (timezone.includes('Qatar')) {
          detectedCountry = countries.find(c => c.code === 'QA');
        } else if (timezone.includes('Bahrain')) {
          detectedCountry = countries.find(c => c.code === 'BH');
        } else if (timezone.includes('Muscat')) {
          detectedCountry = countries.find(c => c.code === 'OM');
        } else if (timezone.includes('Amman')) {
          detectedCountry = countries.find(c => c.code === 'JO');
        } else if (timezone.includes('Cairo')) {
          detectedCountry = countries.find(c => c.code === 'EG');
        } else if (timezone.includes('Beirut')) {
          detectedCountry = countries.find(c => c.code === 'LB');
        } else if (timezone.includes('Casablanca')) {
          detectedCountry = countries.find(c => c.code === 'MA');
        } else if (timezone.includes('Algiers')) {
          detectedCountry = countries.find(c => c.code === 'DZ');
        } else if (timezone.includes('Tunis')) {
          detectedCountry = countries.find(c => c.code === 'TN');
        }

        setCurrentCountry(detectedCountry || countries[0]);
        localStorage.setItem('countryCode', (detectedCountry || countries[0]).code);
      } catch (error) {
        console.error('Error detecting country:', error);
        setCurrentCountry(countries[0]);
      } finally {
        setIsLoading(false);
      }
    };

    detectCountry();
  }, []);

  const changeCountry = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    if (country) {
      setCurrentCountry(country);
      localStorage.setItem('countryCode', countryCode);
    }
  };

  const formatPrice = (price, language = 'ar') => {
    if (!currentCountry) return price;
    
    const symbol = language === 'ar' 
      ? currentCountry.currencySymbolAr 
      : currentCountry.currencySymbolEn;
    
    return `${symbol} ${price}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currentCountry,
      countries,
      changeCountry,
      formatPrice,
      isLoading
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};