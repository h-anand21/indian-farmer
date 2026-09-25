import React, { createContext, useContext, useState, useEffect } from 'react';
import { Storage } from '../lib/storage';
import { INDIAN_LANGUAGES, IndianLanguage } from '../lib/languages';

type TranslationKey =
  | 'appName'
  | 'tagline'
  | 'farmersFirst'
  | 'brighterTomorrow'
  | 'heroDesc'
  | 'easyBooking'
  | 'noQueues'
  | 'fairPrices'
  | 'transparentMSP'
  | 'empowered'
  | 'digitalHassleFree'
  | 'welcomeTo'
  | 'signInGoogleDesc'
  | 'continueWithGoogle'
  | 'instantDemoLogin'
  | 'or'
  | 'securedBy'
  | 'transparent'
  | 'getFairPricesMsp'
  | 'bookMandiSlotsInMin'
  | 'digitalServicesEveryFarmer'
  | 'termsAgreement'
  | 'termsOfService'
  | 'privacyPolicy'
  | 'chooseLanguage'
  | 'selectPreferredLang'
  | 'skip'
  | 'next'
  | 'getStarted'
  | 'onboarding1Title'
  | 'onboarding1Highlight'
  | 'onboarding1Desc'
  | 'onboarding2Title'
  | 'onboarding2Highlight'
  | 'onboarding2Desc'
  | 'onboarding3Title'
  | 'onboarding3Highlight'
  | 'onboarding3Desc'
  | 'onboarding4Title'
  | 'onboarding4Highlight'
  | 'onboarding4Desc';

const TRANSLATIONS: Record<string, Record<TranslationKey, string>> = {
  en: {
    appName: 'KisanQueue',
    tagline: 'Smart Mandi. Fair Prices. Better Tomorrow.',
    farmersFirst: 'Farmers First',
    brighterTomorrow: 'A Brighter Tomorrow',
    heroDesc: 'Book mandi slots, track your produce, get fair prices — all in one app.',
    easyBooking: 'Easy Booking',
    noQueues: 'No long queues',
    fairPrices: 'Fair Prices',
    transparentMSP: 'Transparent MSP',
    empowered: 'Empowered',
    digitalHassleFree: 'Digital & Hassle Free',
    welcomeTo: 'Welcome to',
    signInGoogleDesc: 'Sign in with your Google account to get started',
    continueWithGoogle: 'Continue with Google',
    instantDemoLogin: 'Instant Demo Login (1-Tap)',
    or: 'OR',
    securedBy: 'Secured by Google & Firebase Authentication',
    transparent: 'Transparent',
    getFairPricesMsp: 'Get fair prices\nwith MSP',
    bookMandiSlotsInMin: 'Book mandi slots\nin minutes',
    digitalServicesEveryFarmer: 'Digital services\nfor every farmer',
    termsAgreement: "By continuing, you agree to KisanQueue's",
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    chooseLanguage: 'Choose Language',
    selectPreferredLang: 'Select your preferred language',
    skip: 'Skip',
    next: 'Next',
    getStarted: 'Get Started',
    onboarding1Title: 'Mandi me bina line lage',
    onboarding1Highlight: 'slot book karo',
    onboarding1Desc: 'Save time, book your APMC mandi entry slot effortlessly in 2 minutes.',
    onboarding2Title: 'Digital weighment,',
    onboarding2Highlight: 'transparent MSP payment',
    onboarding2Desc: 'Accurate weight, guaranteed MSP direct into your bank account with zero deductions.',
    onboarding3Title: 'Real-time queue',
    onboarding3Highlight: 'tracking on your phone',
    onboarding3Desc: 'Check live token position, estimated wait time and avoid mandi crowd.',
    onboarding4Title: 'Government schemes &',
    onboarding4Highlight: 'DigiLocker KYC',
    onboarding4Desc: 'Instant subsidy eligibility, PM-Kisan tracking and 1-click verified KYC.',
  },
  hi: {
    appName: 'किसानकतार',
    tagline: 'स्मार्ट मंडी। सही दाम। बेहतर कल।',
    farmersFirst: 'किसान पहले',
    brighterTomorrow: 'उज्ज्वल कल',
    heroDesc: 'मंडी स्लॉट बुक करें, अपनी उपज ट्रैक करें, सही दाम पाएं — सब एक ऐप में।',
    easyBooking: 'आसान बुकिंग',
    noQueues: 'लंबी लाइनें नहीं',
    fairPrices: 'उचित मूल्य',
    transparentMSP: 'पारदर्शी एमएसपी',
    empowered: 'सशक्त किसान',
    digitalHassleFree: 'डिजिटल और झंझट-मुक्त',
    welcomeTo: 'स्वागत है',
    signInGoogleDesc: 'शुरू करने के लिए अपने गूगल अकाउंट से साइन इन करें',
    continueWithGoogle: 'गूगल के साथ जारी रखें',
    instantDemoLogin: 'त्वरित डेमो लॉगिन (1-टैप)',
    or: 'या',
    securedBy: 'गूगल और फायरबेस प्रमाणीकरण द्वारा सुरक्षित',
    transparent: 'पारदर्शी',
    getFairPricesMsp: 'एमएसपी के साथ\nउचित मूल्य पाएं',
    bookMandiSlotsInMin: 'मिनटों में मंडी\nस्लॉट बुक करें',
    digitalServicesEveryFarmer: 'हर किसान के लिए\nडिजिटल सेवाएं',
    termsAgreement: 'जारी रखकर, आप KisanQueue की',
    termsOfService: 'सेवा की शर्तें',
    privacyPolicy: 'गोपनीयता नीति',
    chooseLanguage: 'भाषा चुनें',
    selectPreferredLang: 'अपनी पसंदीदा भाषा का चयन करें',
    skip: 'छोड़ें',
    next: 'आगे बढ़ें',
    getStarted: 'शुरू करें',
    onboarding1Title: 'मंडी में बिना लाइन लगे',
    onboarding1Highlight: 'स्लॉट बुक करें',
    onboarding1Desc: 'अपना समय बचाएं, आसानी से अपनी मंडी का टोकन स्लॉट बुक करें।',
    onboarding2Title: 'डिजिटल तौल,',
    onboarding2Highlight: 'पारदर्शी एमएसपी भुगतान',
    onboarding2Desc: 'सही तौल, सही दाम, बिना किसी कटौती के सीधे आपके बैंक खाते में।',
    onboarding3Title: 'लाइव कतार',
    onboarding3Highlight: 'ट्रैकिंग आपके फोन पर',
    onboarding3Desc: 'अपनी पोजीशन, अनुमानित समय लाइव देखें और मंडी भीड़ से बचें।',
    onboarding4Title: 'सरकारी योजनाएं और',
    onboarding4Highlight: 'डिजीलॉकर केवाईसी',
    onboarding4Desc: 'सरकारी योजनाओं की जानकारी, पात्रता जांच और आसान डिजिटल सत्यापन।',
  },
  pa: {
    appName: 'ਕਿਸਾਨਕਤਾਰ',
    tagline: 'ਸਮਾਰਟ ਮੰਡੀ। ਸਹੀ ਮੁੱਲ। ਬਿਹਤਰ ਭਲਕ।',
    farmersFirst: 'ਕਿਸਾਨ ਪਹਿਲਾਂ',
    brighterTomorrow: 'ਸੁਨਹਿਰੀ ਭਵਿੱਖ',
    heroDesc: 'ਮੰਡੀ ਸਲਾਟ ਬੁੱਕ ਕਰੋ, ਫਸਲ ਟ੍ਰੈਕ ਕਰੋ, ਸਹੀ ਮੁੱਲ ਪਾਓ — ਸਭ ਇੱਕੋ ਐਪ ਵਿੱਚ।',
    easyBooking: 'ਸੌਖੀ ਬੁਕਿੰਗ',
    noQueues: 'ਲੰਬੀਆਂ ਲਾਈਨਾਂ ਨਹੀਂ',
    fairPrices: 'ਸਹੀ ਮੁੱਲ',
    transparentMSP: 'ਪਾਰਦਰਸ਼ੀ ਐਮਐਸਪੀ',
    empowered: 'ਸਮਰੱਥ ਕਿਸਾਨ',
    digitalHassleFree: 'ਡਿਜੀਟਲ ਤੇ ਅਸਾਨ',
    welcomeTo: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    signInGoogleDesc: 'ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਗੂਗਲ ਖਾਤੇ ਨਾਲ ਸਾਈਨ ਇਨ ਕਰੋ',
    continueWithGoogle: 'ਗੂਗਲ ਨਾਲ ਜਾਰੀ ਰੱਖੋ',
    instantDemoLogin: 'ਤੁਰੰਤ ਡੈਮੋ ਲੌਗਇਨ (1-ਟੈਪ)',
    or: 'ਜਾਂ',
    securedBy: 'ਗੂਗਲ ਤੇ ਫਾਇਰਬੇਸ ਨਾਲ ਸੁਰੱਖਿਅਤ',
    transparent: 'ਪਾਰਦਰਸ਼ੀ',
    getFairPricesMsp: 'ਐਮਐਸਪੀ ਨਾਲ\nਸਹੀ ਮੁੱਲ ਪਾਓ',
    bookMandiSlotsInMin: 'ਮਿੰਟਾਂ ਵਿੱਚ ਮੰਡੀ\nਸਲਾਟ ਬੁੱਕ ਕਰੋ',
    digitalServicesEveryFarmer: 'ਹਰ ਕਿਸਾਨ ਲਈ\nਡਿਜੀਟਲ ਸੇਵਾਵਾਂ',
    termsAgreement: 'ਜਾਰੀ ਰੱਖ ਕੇ, ਤੁਸੀਂ ਸਹਿਮਤ ਹੁੰਦੇ ਹੋ',
    termsOfService: 'ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ',
    privacyPolicy: 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
    chooseLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    selectPreferredLang: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ',
    skip: 'ਛੱਡੋ',
    next: 'ਅੱਗੇ',
    getStarted: 'ਸ਼ੁਰੂ ਕਰੋ',
    onboarding1Title: 'ਮੰਡੀ ਵਿੱਚ ਬਿਨਾਂ ਲਾਈਨ',
    onboarding1Highlight: 'ਸਲਾਟ ਬੁੱਕ ਕਰੋ',
    onboarding1Desc: 'ਸਮਾਂ ਬਚਾਓ, ਆਸਾਨੀ ਨਾਲ ਆਪਣੀ ਮੰਡੀ ਦਾ ਸਲਾਟ ਬੁੱਕ ਕਰੋ।',
    onboarding2Title: 'ਡਿਜੀਟਲ ਤੋਲ,',
    onboarding2Highlight: 'ਸਿੱਧਾ ਐਮਐਸਪੀ ਭੁਗਤਾਨ',
    onboarding2Desc: 'ਸਹੀ ਤੋਲ, ਸਹੀ ਮੁੱਲ, ਸਿੱਧਾ ਤੁਹਾਡੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਬਿਨਾਂ ਕਟੌਤੀ ਦੇ।',
    onboarding3Title: 'ਰੀਅਲ-ਟਾਈਮ ਕਤਾਰ',
    onboarding3Highlight: 'ਟ੍ਰੈਕਿੰਗ ਫੋਨ ਉੱਤੇ',
    onboarding3Desc: 'ਆਪਣਾ ਨੰਬਰ ਅਤੇ ਸਮਾਂ ਲਾਈਵ ਦੇਖੋ ਅਤੇ ਮੰਡੀ ਦੀ ਭੀੜ ਤੋਂ ਬਚੋ।',
    onboarding4Title: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਤੇ',
    onboarding4Highlight: 'ਡਿਜੀਲੌਕਰ ਕੇਵਾਈਸੀ',
    onboarding4Desc: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਸੌਖੀ ਡਿਜੀਟਲ ਪੜਤਾਲ।',
  },
  mr: {
    appName: 'किसानरांग',
    tagline: 'स्मार्ट बाजारपेठ. योग्य भाव. उज्ज्वल भविष्य.',
    farmersFirst: 'शेतकरी प्रथम',
    brighterTomorrow: 'उज्ज्वल भविष्य',
    heroDesc: 'मार्केट स्लॉट बुक करा, उत्पादन ट्रॅक करा, योग्य भाव मिळवा — एकाच ॲपमध्ये.',
    easyBooking: 'सुलभ बुकिंग',
    noQueues: 'रांगांची चिंता नाही',
    fairPrices: 'योग्य दर',
    transparentMSP: 'पारदर्शक हमीभाव',
    empowered: 'सशक्त शेतकरी',
    digitalHassleFree: 'डिजिटल आणि सुलभ',
    welcomeTo: 'स्वागत आहे',
    signInGoogleDesc: 'सुरू करण्यासाठी आपल्या Google खात्याने साइन इन करा',
    continueWithGoogle: 'Google सह पुढे जा',
    instantDemoLogin: 'झटपट डेमो लॉगिन (1-टॅप)',
    or: 'किंवा',
    securedBy: 'Google आणि Firebase द्वारे सुरक्षित',
    transparent: 'पारदर्शक',
    getFairPricesMsp: 'हमीभावासह\nयोग्य दर मिळवा',
    bookMandiSlotsInMin: 'काही मिनिटांत\nमार्केट स्लॉट बुक करा',
    digitalServicesEveryFarmer: 'प्रत्येक शेतकऱ्यासाठी\nडिजिटल सेवा',
    termsAgreement: 'पुढे जाऊन, आपण सहमत आहात',
    termsOfService: 'सेवा अटी',
    privacyPolicy: 'गोपनीयता धोरण',
    chooseLanguage: 'भाषा निवडा',
    selectPreferredLang: 'आपली पसंतीची भाषा निवडा',
    skip: 'वगळा',
    next: 'पुढे',
    getStarted: 'सुरू करा',
    onboarding1Title: 'मार्केटमध्ये रांगेत न थांबता',
    onboarding1Highlight: 'स्लॉट बुक करा',
    onboarding1Desc: 'वेळ वाचवा, सहजतेने आपला मार्केट प्रवेश स्लॉट बुक करा.',
    onboarding2Title: 'डिजिटल वजन,',
    onboarding2Highlight: 'पारदर्शक हमीभाव जमा',
    onboarding2Desc: 'अचूक वजन, थेट आपल्या बँक खात्यात हमीभाव रक्कम.',
    onboarding3Title: 'रिअल-टाइम रांग',
    onboarding3Highlight: 'फोनवर थेट ट्रॅकिंग',
    onboarding3Desc: 'आपला नंबर आणि अंदाजे वेळ थेट पहा आणि गर्दी टाळा.',
    onboarding4Title: 'सरकारी योजना आणि',
    onboarding4Highlight: 'डिजिलॉकर केवायसी',
    onboarding4Desc: 'सरकारी योजनांची माहिती आणि जलद डिजिटल पडताळणी.',
  },
  gu: {
    appName: 'કિસાનકતાર',
    tagline: 'સ્માર્ટ માર્કેટ. યોગ્ય ભાવ. ઉજ્જવળ આવતીકાલ.',
    farmersFirst: 'ખેડૂત પ્રથમ',
    brighterTomorrow: 'ઉજ્જવળ આવતીકાલ',
    heroDesc: 'માર્કેટિંગ યાર્ડ સ્લોટ બુક કરો, પાક ટ્રેક કરો, સાચા ભાવ મેળવો — એક જ ઍપમાં.',
    easyBooking: 'સરળ બુકિંગ',
    noQueues: 'લાંબી લાઈનો નહીં',
    fairPrices: 'સાચા ભાવ',
    transparentMSP: 'પારદર્શક ટેકાના ભાવ',
    empowered: 'સક્ષમ ખેડૂત',
    digitalHassleFree: 'ડિજિટલ અને ઝંઝટમુક્ત',
    welcomeTo: 'સ્વાગત છે',
    signInGoogleDesc: 'શરૂ કરવા માટે Google એકાઉન્ટથી સાઇન ઇન કરો',
    continueWithGoogle: 'Google સાથે આગળ વધો',
    instantDemoLogin: 'ઇન્સ્ટન્ટ ડેમો લૉગિન (1-ટૅપ)',
    or: 'અથવા',
    securedBy: 'Google અને Firebase દ્વારા સુરક્ષિત',
    transparent: 'પારદર્શક',
    getFairPricesMsp: 'ટેકાના ભાવ સાથે\nસાચા ભાવ મેળવો',
    bookMandiSlotsInMin: 'મિનિટોમાં યાર્ડ\nસ્લોટ બુક કરો',
    digitalServicesEveryFarmer: 'દરેક ખેડૂત માટે\nડિજિટલ સેવાઓ',
    termsAgreement: 'આગળ વધીને, તમે સંમત થાઓ છો',
    termsOfService: 'સેવાની શરતો',
    privacyPolicy: 'ગોપનીયતા નીતિ',
    chooseLanguage: 'ભાષા પસંદ કરો',
    selectPreferredLang: 'તમારી પસંદગીની ભાષા પસંદ કરો',
    skip: 'છોડો',
    next: 'આગળ',
    getStarted: 'શરૂ કરો',
    onboarding1Title: 'યાર્ડમાં લાઈનમાં ઊભા રહ્યા વિના',
    onboarding1Highlight: 'સ્લોટ બુક કરો',
    onboarding1Desc: 'સમય બચાવો, સરળતાથી તમારો યાર્ડ સ્લોટ બુક કરો.',
    onboarding2Title: 'ડિજિટલ વજન,',
    onboarding2Highlight: 'સીધું ખાતામાં ચુકવણું',
    onboarding2Desc: 'સાચું વજન, સાચા ટેકાના ભાવ સીધા તમારા બેંક ખાતામાં.',
    onboarding3Title: 'રિયલ-ટાઇમ લાઇન',
    onboarding3Highlight: 'મોબાઇલ પર લાઇવ ટ્રેકિંગ',
    onboarding3Desc: 'તમારો નંબર અને સમય લાઇવ જુઓ અને ભીડથી બચો.',
    onboarding4Title: 'સરકારી યોજનાઓ અને',
    onboarding4Highlight: 'ડિજીલૉકર KYC',
    onboarding4Desc: 'સરકારી યોજનાઓની સંપૂર્ણ માહિતી અને સરળ ડિજિટલ ચકાસણી.',
  },
  te: {
    appName: 'కిసాన్ క్యూ',
    tagline: 'స్మార్ట్ మార్కెట్. సరసమైన ధరలు. మెరుగైన భవిష్యత్తు.',
    farmersFirst: 'రైతులే ప్రథమం',
    brighterTomorrow: 'ఉజ్వల భవిష్యత్తు',
    heroDesc: 'మార్కెట్ స్లాట్ బుక్ చేయండి, ఉత్పత్తులను ట్రాక్ చేయండి, సరసమైన ధరలు పొందండి.',
    easyBooking: 'సులభమైన బుకింగ్',
    noQueues: 'పొడవైన క్యూలు లేవు',
    fairPrices: 'సరసమైన ధరలు',
    transparentMSP: 'పారదర్శక MSP',
    empowered: 'సాధికారత',
    digitalHassleFree: 'డిజిటల్ & సులభం',
    welcomeTo: 'స్వాగతం',
    signInGoogleDesc: 'ప్రారంభించడానికి మీ Google ఖాతాతో సైన్ ఇన్ చేయండి',
    continueWithGoogle: 'Google తో కొనసాగించండి',
    instantDemoLogin: 'తక్షణ డెమో లాగిన్ (1-ట్యాప్)',
    or: 'లేదా',
    securedBy: 'Google & Firebase ద్వారా సురక్షితం',
    transparent: 'పారదర్శకం',
    getFairPricesMsp: 'MSP తో\nసరసమైన ధరలు',
    bookMandiSlotsInMin: 'నిమిషాల్లో స్లాట్\nబుక్ చేయండి',
    digitalServicesEveryFarmer: 'ప్రతి రైతుకు\nడిజిటల్ సేవలు',
    termsAgreement: 'కొనసాగడం ద్వారా మీరు అంగీకరిస్తున్నారు',
    termsOfService: 'సేవా నిబంధనలు',
    privacyPolicy: 'గోప్యతా విధానం',
    chooseLanguage: 'భాషను ఎంచుకోండి',
    selectPreferredLang: 'మీ ప్రాధాన్యత గల భాషను ఎంచుకోండి',
    skip: 'దాటవేయి',
    next: 'తరువాత',
    getStarted: 'ప్రారంభించండి',
    onboarding1Title: 'మార్కెట్లో క్యూలో నిలబడకుండా',
    onboarding1Highlight: 'స్లాట్ బుక్ చేయండి',
    onboarding1Desc: 'సమయాన్ని ఆదా చేసుకోండి, మీ మార్కెట్ స్లాట్‌ను సులభంగా బుక్ చేయండి.',
    onboarding2Title: 'డిజిటల్ బరువు,',
    onboarding2Highlight: 'ఖాతాలోకి నేరుగా MSP',
    onboarding2Desc: 'ఖచ్చితమైన బరువు, కటింగ్ లేకుండా మీ బ్యాంకు ఖాతాలోకి నేరుగా నిధులు.',
    onboarding3Title: 'రియల్-టైమ్ క్యూ',
    onboarding3Highlight: 'ఫోన్ లో లైవ్ ట్రాకింగ్',
    onboarding3Desc: 'మీ టోకెన్ స్థితిని ప్రత్యక్షంగా ట్రాక్ చేయండి మరియు రద్దీని నివారించండి.',
    onboarding4Title: 'ప్రభుత్వ పథకాలు &',
    onboarding4Highlight: 'డిజిలాకర్ కేవైసీ',
    onboarding4Desc: 'అన్ని ప్రభుత్వ వ్యవసాయ పథకాలు మరియు సులభమైన ధృవీకరణ.',
  },
  bn: {
    appName: 'কিষাণকিউ',
    tagline: 'স্মার্ট মান্ডি। ন্যায্য দাম। উজ্জ্বল ভবিষ্যৎ।',
    farmersFirst: 'কৃষক প্রথম',
    brighterTomorrow: 'উজ্জ্বল ভবিষ্যৎ',
    heroDesc: 'মান্ডি স্লট বুক করুন, ফসল ট্র্যাক করুন, ন্যায্য দাম পান — একটি অ্যাপেই।',
    easyBooking: 'সহজ বুকিং',
    noQueues: 'দীর্ঘ লাইনের ঝামেলা নেই',
    fairPrices: 'ন্যায্য দাম',
    transparentMSP: 'স্বচ্ছ এমএসপি',
    empowered: 'সশক্ত কৃষক',
    digitalHassleFree: 'ডিজিটাল ও সহজ',
    welcomeTo: 'স্বাগতম',
    signInGoogleDesc: 'শুরু করতে আপনার গুগল অ্যাকাউন্ট দিয়ে সাইন ইন করুন',
    continueWithGoogle: 'গুগল দিয়ে এগিয়ে যান',
    instantDemoLogin: 'তাত্ক্ষণিক ডেমো লগইন (১-ট্যাপ)',
    or: 'অথবা',
    securedBy: 'গুগল ও ফায়ারবেস দ্বারা সুরক্ষিত',
    transparent: 'স্বচ্ছ',
    getFairPricesMsp: 'এমএসপি সহ\nন্যায্য দাম পান',
    bookMandiSlotsInMin: 'মিনিটেই মান্ডি\nস্লট বুক করুন',
    digitalServicesEveryFarmer: 'প্রতিটি কৃষকের জন্য\nডিজিটাল সেবা',
    termsAgreement: 'চালিয়ে গিয়ে, আপনি সম্মত হচ্ছেন',
    termsOfService: 'সেবার শর্তাবলী',
    privacyPolicy: 'গোপনীয়তা নীতি',
    chooseLanguage: 'ভাষা নির্বাচন করুন',
    selectPreferredLang: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
    skip: 'এড়িয়ে যান',
    next: 'পরবর্তী',
    getStarted: 'শুরু করুন',
    onboarding1Title: 'লাইনে না দাঁড়িয়ে মান্ডিতে',
    onboarding1Highlight: 'স্লট বুক করুন',
    onboarding1Desc: 'সময় বাঁচান, সহজেই আপনার মান্ডির এন্ট্রি স্লট বুক করুন।',
    onboarding2Title: 'ডিজিটাল ওজন,',
    onboarding2Highlight: 'স্বচ্ছ এমএসপি প্রদান',
    onboarding2Desc: 'সঠিক ওজন, সরাসরি আপনার ব্যাংক অ্যাকাউন্টে এমএসপি টাকা।',
    onboarding3Title: 'রিয়েল-টাইম কিউ',
    onboarding3Highlight: 'ফোনেই লাইভ ট্র্যাকিং',
    onboarding3Desc: 'আপনার অবস্থান ও আনুমানিক সময় লাইভ দেখুন ও ভিড় এড়ান।',
    onboarding4Title: 'সরকারি প্রকল্প ও',
    onboarding4Highlight: 'ডিজিলকার কেওয়াইসি',
    onboarding4Desc: 'সরকারি কৃষি প্রকল্পের তথ্য এবং সহজ ডিজিটাল যাচাইকরণ।',
  },
  ta: {
    appName: 'கிசான்கியூ',
    tagline: 'ஸ்மார்ட் மண்டி. நியாயமான விலை. சிறந்த எதிர்காலம்.',
    farmersFirst: 'விவசாயிகள் முதலில்',
    brighterTomorrow: 'சிறந்த எதிர்காலம்',
    heroDesc: 'மண்டி ஸ்லாட் முன்பதிவு, பயிர் கண்காணிப்பு, நியாயமான விலை — ஒரே செயலியில்.',
    easyBooking: 'எளிய முன்பதிவு',
    noQueues: 'நீண்ட வரிசைகள் இல்லை',
    fairPrices: 'நியாயமான விலை',
    transparentMSP: 'வெளிப்படையான MSP',
    empowered: 'வலுவான விவசாயி',
    digitalHassleFree: 'டிஜிட்டல் மற்றும் சுலபம்',
    welcomeTo: 'வரவேற்கிறோம்',
    signInGoogleDesc: 'தொடங்க உங்கள் கூகிள் கணக்கு மூலம் உள்நுழைக',
    continueWithGoogle: 'கூகிள் மூலம் தொடரவும்',
    instantDemoLogin: 'உடனடி டெமோ உள்நுழைவு (1-தட்டு)',
    or: 'அல்லது',
    securedBy: 'Google & Firebase மூலம் பாதுகாக்கப்பட்டது',
    transparent: 'வெளிப்படையானது',
    getFairPricesMsp: 'MSP மூலம்\nநியாயமான விலை',
    bookMandiSlotsInMin: 'நிமிடங்களில் ஸ்லாட்\nமுன்பதிவு செய்யுங்கள்',
    digitalServicesEveryFarmer: 'ஒவ்வொரு விவசாயிக்கும்\nடிஜிட்டல் சேவை',
    termsAgreement: 'தொடர்வதன் மூலம் நீங்கள் ஒப்புக்கொள்கிறீர்கள்',
    termsOfService: 'சேவை விதிமுறைகள்',
    privacyPolicy: 'தனியுரிமைக் கொள்கை',
    chooseLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
    selectPreferredLang: 'உங்கள் விருப்ப மொழியைத் தேர்ந்தெடுக்கவும்',
    skip: 'தவிர்',
    next: 'அடுத்து',
    getStarted: 'தொடங்கவும்',
    onboarding1Title: 'வரிசையில் நிற்காமல் மண்டியில்',
    onboarding1Highlight: 'ஸ்லாட் முன்பதிவு செய்க',
    onboarding1Desc: 'நேரத்தை மிச்சப்படுத்துங்கள், மண்டி நுழைவு ஸ்லாட்டை எளிதாக பதிவு செய்க.',
    onboarding2Title: 'டிஜிட்டல் எடை,',
    onboarding2Highlight: 'நேரடி MSP பணம்',
    onboarding2Desc: 'துல்லியமான எடை, வங்கி கணக்கில் நேரடியாக முழு MSP பணம்.',
    onboarding3Title: 'நேரலை வரிசை',
    onboarding3Highlight: 'போனில் நேரலை கண்காணிப்பு',
    onboarding3Desc: 'டோக்கன் நிலை மற்றும் காத்திருப்பு நேரத்தை போனில் பாருங்கள்.',
    onboarding4Title: 'அரசு திட்டங்கள் &',
    onboarding4Highlight: 'டிஜிலாக்கர் KYC',
    onboarding4Desc: 'அனைத்து அரசு திட்டங்கள் மற்றும் எளிதான டிஜிட்டல் சரிபார்ப்பு.',
  },
};

interface LanguageContextType {
  currentLanguage: string;
  activeLanguageInfo: IndianLanguage;
  setLanguage: (langCode: string) => Promise<void>;
  t: (key: TranslationKey) => string;
  isReady: boolean;
}

const defaultLangInfo = INDIAN_LANGUAGES[0];

const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'en',
  activeLanguageInfo: defaultLangInfo,
  setLanguage: async () => {},
  t: (key: TranslationKey) => key,
  isReady: false,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<string>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const saved = await Storage.getItem<string>('kisan_lang');
        if (saved && (saved in TRANSLATIONS || INDIAN_LANGUAGES.some((l) => l.code === saved))) {
          setCurrentLanguageState(saved);
        }
      } catch {
        // fallback to en
      } finally {
        setIsReady(true);
      }
    }
    init();
  }, []);

  const changeLang = async (langCode: string) => {
    setCurrentLanguageState(langCode);
    await Storage.setItem('kisan_lang', langCode);
  };

  const activeLanguageInfo =
    INDIAN_LANGUAGES.find((l) => l.code === currentLanguage) || INDIAN_LANGUAGES[0];

  const t = (key: TranslationKey): string => {
    const langDict = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return TRANSLATIONS.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        activeLanguageInfo,
        setLanguage: changeLang,
        t,
        isReady,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage() {
  return useContext(LanguageContext);
}
