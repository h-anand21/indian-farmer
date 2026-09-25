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
  grossWeight?: string;
  tareWeight?: string;
  netWeight?: string;
  netQuintals?: string;
  grade?: string;
  moisture?: string;
  mspRate?: number;
  totalAmount?: number;
  receiptNumber?: string;
  paymentStatus?: string;
  bankRef?: string;
  completedAt?: string;
}

const BOOKINGS_STORAGE_KEY = '@kisanqueue_bookings';

export const DEFAULT_BOOKINGS: BookingRecord[] = [];

export async function getBookings(farmerIdentifier?: string): Promise<BookingRecord[]> {
  try {
    const json = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
    let list: BookingRecord[] = [];
    if (json) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Filter out old dummy mock bookings ('KQ-1048', 'KQ-1047', 'KQ-1046') if present
    const cleaned = list.filter((b) => b.id !== 'KQ-1048' && b.id !== 'KQ-1047' && b.id !== 'KQ-1046');
    if (cleaned.length !== list.length) {
      list = cleaned;
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(list));
    }

    if (farmerIdentifier && list.length > 0) {
      const cleanTarget = farmerIdentifier.replace(/\s+/g, '').toLowerCase();
      const filtered = list.filter((b) => {
        const cleanPhone = (b.farmerPhone || '').replace(/\s+/g, '').toLowerCase();
        const cleanName = (b.farmerName || '').replace(/\s+/g, '').toLowerCase();
        return (
          cleanPhone.includes(cleanTarget) ||
          cleanTarget.includes(cleanPhone) ||
          cleanName.includes(cleanTarget) ||
          cleanTarget.includes(cleanName)
        );
      });
      return filtered;
    }

    return list;
  } catch (e) {
    console.log('Error reading bookings from AsyncStorage:', e);
  }
  return [];
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

export async function updateBookingStatus(
  token: string,
  newStatus: BookingRecord['status'],
  extraDetails?: Partial<BookingRecord>
): Promise<void> {
  if (!token) return;
  const rawToken = token.trim().toUpperCase();
  const cleanToken = rawToken.replace('KQ-BOOKING-', '').trim();
  const all = await getBookings();
  const updated = all.map((b) => {
    const bToken = (b.token || '').toUpperCase().trim();
    const bId = (b.id || '').toUpperCase().trim();
    const matches =
      bToken === cleanToken ||
      bToken === rawToken ||
      bId === cleanToken ||
      bId === rawToken ||
      (cleanToken.length > 3 && (bToken.includes(cleanToken) || cleanToken.includes(bToken)));

    if (matches) {
      return {
        ...b,
        ...extraDetails,
        status: newStatus,
        badgeColor:
          newStatus === 'CHECKED_IN'
            ? '#2B70C9'
            : newStatus === 'COMPLETED'
            ? '#2D8A39'
            : newStatus === 'WEIGHING'
            ? '#E66919'
            : '#E6A219',
        badgeBg:
          newStatus === 'CHECKED_IN'
            ? '#EDF4FC'
            : newStatus === 'COMPLETED'
            ? '#EBF4E5'
            : newStatus === 'WEIGHING'
            ? '#FFEDD5'
            : '#FFF8E6',
        completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : b.completedAt,
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

