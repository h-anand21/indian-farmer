import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BookingRecord {
  id: string;
  token: string;
  qrData: string;
  mandi: string;
  mandiId: string;
  date: string;
  time: string;
  crop: string;
  quantity: string;
  vehicle: string;
  farmerName: string;
  farmerPhone: string;
  status: 'BOOKED' | 'CHECKED_IN' | 'WEIGHING' | 'COMPLETED' | 'CANCELLED';
  badgeColor: string;
  badgeBg: string;
  createdAt: string;
}

const BOOKINGS_STORAGE_KEY = '@kisanqueue_bookings';

export const DEFAULT_BOOKINGS: BookingRecord[] = [
  {
    id: 'KQ-1048',
    token: 'KQ-1048',
    qrData: 'KQ-BOOKING-KQ-1048',
    mandi: 'Khanna Main Grain Market (Yard #1)',
    mandiId: 'PB-KHN-01',
    date: '15 Sep 2026',
    time: 'Mon, 6:00 - 8:00 AM',
    crop: 'Wheat (Sharbati)',
    quantity: '50 Qt',
    vehicle: 'PB 10 AB 1234',
    farmerName: 'Ram Singh Gurjar',
    farmerPhone: '+91 98765 43210',
    status: 'BOOKED',
    badgeColor: '#E6A219',
    badgeBg: '#FFF8E6',
    createdAt: '12 Sep 2026',
  },
  {
    id: 'KQ-1047',
    token: 'KQ-1047',
    qrData: 'KQ-BOOKING-KQ-1047',
    mandi: 'Rajpura APMC Grain Procurement Complex',
    mandiId: 'PB-RJP-02',
    date: '14 Sep 2026',
    time: 'Sun, 8:00 - 10:00 AM',
    crop: 'Rice (Basmati)',
    quantity: '32 Qt',
    vehicle: 'PB 11 CD 5678',
    farmerName: 'Sita Devi',
    farmerPhone: '+91 98123 45678',
    status: 'COMPLETED',
    badgeColor: '#2D8A39',
    badgeBg: '#EBF4E5',
    createdAt: '11 Sep 2026',
  },
  {
    id: 'KQ-1046',
    token: 'KQ-1046',
    qrData: 'KQ-BOOKING-KQ-1046',
    mandi: 'Karnal Anaj Mandi Complex Gate #2',
    mandiId: 'HR-KRN-04',
    date: '10 Sep 2026',
    time: 'Sat, 10:00 AM - 12:00 PM',
    crop: 'Maize',
    quantity: '40 Qt',
    vehicle: 'HR 05 EF 9012',
    farmerName: 'Gurdeep Singh',
    farmerPhone: '+91 98140 55432',
    status: 'WEIGHING',
    badgeColor: '#E66919',
    badgeBg: '#FFF2EB',
    createdAt: '10 Sep 2026',
  },
];

export async function getBookings(): Promise<BookingRecord[]> {
  try {
    const json = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // Initialize default bookings if empty
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(DEFAULT_BOOKINGS));
  } catch (e) {
    console.log('Error reading bookings from AsyncStorage:', e);
  }
  return DEFAULT_BOOKINGS;
}

export async function getBookingByToken(tokenOrCode: string): Promise<BookingRecord | null> {
  if (!tokenOrCode) return null;
  let cleanToken = tokenOrCode.trim().toUpperCase();
  if (cleanToken.startsWith('KQ-BOOKING-')) {
    cleanToken = cleanToken.replace('KQ-BOOKING-', '');
  }

  const allBookings = await getBookings();
  const found = allBookings.find(
    (b) =>
      b.id.toUpperCase() === cleanToken ||
      b.token.toUpperCase() === cleanToken ||
      b.qrData.toUpperCase() === cleanToken ||
      b.qrData.toUpperCase() === `KQ-BOOKING-${cleanToken}`
  );
  return found || null;
}

export async function createBooking(
  newBooking: Omit<BookingRecord, 'id' | 'token' | 'qrData' | 'status' | 'badgeColor' | 'badgeBg' | 'createdAt'>
): Promise<BookingRecord> {
  // Generate a guaranteed unique 4-digit token
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const tokenNumber = `KQ-${randomSuffix}`;
  
  const created: BookingRecord = {
    ...newBooking,
    id: tokenNumber,
    token: tokenNumber,
    qrData: `KQ-BOOKING-${tokenNumber}`,
    status: 'BOOKED',
    badgeColor: '#E6A219',
    badgeBg: '#FFF8E6',
    createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  const current = await getBookings();
  const updated = [created, ...current];
  try {
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log('Error saving new booking:', e);
  }

  return created;
}

export async function updateBookingStatus(token: string, newStatus: BookingRecord['status']): Promise<void> {
  const cleanToken = token.trim().toUpperCase().replace('KQ-BOOKING-', '');
  const all = await getBookings();
  const updated = all.map((b) => {
    if (b.token.toUpperCase() === cleanToken || b.id.toUpperCase() === cleanToken) {
      return {
        ...b,
        status: newStatus,
        badgeColor: newStatus === 'CHECKED_IN' ? '#2B70C9' : newStatus === 'COMPLETED' ? '#2D8A39' : '#E6A219',
        badgeBg: newStatus === 'CHECKED_IN' ? '#EDF4FC' : newStatus === 'COMPLETED' ? '#EBF4E5' : '#FFF8E6',
      };
    }
    return b;
  });

  try {
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.log('Error updating booking status:', e);
  }
}

export interface FarmerPaymentItem {
  id: string;
  date: string;
  mandi: string;
  crop: string;
  msp: string;
  amount: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  bankRef: string;
  color: string;
  bg: string;
  token: string;
  rawAmount: number;
}

export async function getFarmerPayments(): Promise<FarmerPaymentItem[]> {
  const bookings = await getBookings();

  return bookings.map((b) => {
    const qtyNum = parseFloat(b.quantity) || 40;
    let rate = 2425;
    let emoji = '🌾';

    if (b.crop.toLowerCase().includes('rice') || b.crop.toLowerCase().includes('paddy')) {
      rate = 2300;
    } else if (b.crop.toLowerCase().includes('mustard') || b.crop.toLowerCase().includes('sarson')) {
      rate = 5950;
      emoji = '🌱';
    } else if (b.crop.toLowerCase().includes('maize')) {
      rate = 2225;
      emoji = '🌽';
    } else if (b.crop.toLowerCase().includes('chana') || b.crop.toLowerCase().includes('gram')) {
      rate = 5650;
      emoji = '🫘';
    }

    const totalVal = Math.round(qtyNum * rate);
    const payStatus: 'COMPLETED' | 'PENDING' | 'FAILED' =
      b.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING';

    return {
      id: `pay-${b.token}`,
      date: b.date || b.createdAt,
      mandi: b.mandi,
      crop: `${b.crop} (${b.quantity})`,
      msp: `₹ ${rate.toLocaleString('en-IN')}/Qt`,
      amount: `₹ ${totalVal.toLocaleString('en-IN')}`,
      status: payStatus,
      bankRef: `SBI-DBT-${Math.floor(10000000 + Math.random() * 90000000)}`,
      color: payStatus === 'COMPLETED' ? '#2D8A39' : payStatus === 'PENDING' ? '#2B70C9' : '#D93838',
      bg: payStatus === 'COMPLETED' ? '#ECF8EE' : payStatus === 'PENDING' ? '#EDF4FC' : '#FFF2F2',
      token: `#${b.token}`,
      rawAmount: totalVal,
    };
  });
}

export interface FarmerProcurementItem {
  id: string;
  date: string;
  mandi: string;
  crop: string;
  cropEmoji: string;
  netWeight: string;
  grade: string;
  mspRate: string;
  amount: string;
  formJ: string;
  token: string;
  grossKg: string;
  tareKg: string;
  netKg: string;
  moisture: string;
  foreignMatter: string;
  impurities: string;
}

export async function getFarmerProcurements(): Promise<FarmerProcurementItem[]> {
  const bookings = await getBookings();

  return bookings.map((b) => {
    const qtyNum = parseFloat(b.quantity) || 40;
    let rate = 2425;
    let emoji = '🌾';

    if (b.crop.toLowerCase().includes('rice') || b.crop.toLowerCase().includes('paddy')) {
      rate = 2300;
    } else if (b.crop.toLowerCase().includes('mustard') || b.crop.toLowerCase().includes('sarson')) {
      rate = 5950;
      emoji = '🌱';
    } else if (b.crop.toLowerCase().includes('maize')) {
      rate = 2225;
      emoji = '🌽';
    }

    const totalVal = Math.round(qtyNum * rate);
    const grossKgNum = Math.round(qtyNum * 100 + 450);
    const tareKgNum = 450;
    const netKgNum = Math.round(qtyNum * 100);

    return {
      id: `proc-${b.token}`,
      date: b.date || b.createdAt,
      mandi: b.mandi,
      crop: b.crop,
      cropEmoji: emoji,
      netWeight: `${qtyNum} Qt`,
      grade: 'A Grade',
      mspRate: `₹ ${rate.toLocaleString('en-IN')}/Qt`,
      amount: `₹ ${totalVal.toLocaleString('en-IN')}`,
      formJ: `FJ/2026/${b.token.replace('KQ-', '')}`,
      token: `#${b.token}`,
      grossKg: `${grossKgNum.toLocaleString('en-IN')} kg`,
      tareKg: `${tareKgNum} kg`,
      netKg: `${netKgNum.toLocaleString('en-IN')} kg`,
      moisture: '11.5%',
      foreignMatter: '0.4%',
      impurities: '0.2%',
    };
  });
}

