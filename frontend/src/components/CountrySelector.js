import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { useCurrency, countries } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Check } from 'lucide-react';

const CountrySelector = () => {
  const { currentCountry, changeCountry } = useCurrency();
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);

  const handleSelectCountry = (countryCode) => {
    changeCountry(countryCode);
    setOpen(false);
  };

  if (!currentCountry) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">{currentCountry.flag}</span>
          <span className="hidden sm:inline">
            {language === 'ar' ? currentCountry.currencySymbolAr : currentCountry.currencySymbolEn}
          </span>
          <Globe className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('اختر بلدك', 'Select Your Country')}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                currentCountry.code === country.code
                  ? 'border-2 border-blue-600 bg-blue-50'
                  : 'hover:border-slate-300'
              }`}
              onClick={() => handleSelectCountry(country.code)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{country.flag}</span>
                  <div>
                    <h3 className="font-semibold">
                      {language === 'ar' ? country.nameAr : country.nameEn}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {language === 'ar' ? country.currencyNameAr : country.currencyNameEn}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'ar' ? country.currencySymbolAr : country.currencySymbolEn}
                    </p>
                  </div>
                </div>
                {currentCountry.code === country.code && (
                  <Check className="w-6 h-6 text-blue-600" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CountrySelector;