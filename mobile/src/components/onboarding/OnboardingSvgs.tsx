import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  G,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SVG_SIZE = Math.min(SCREEN_WIDTH * 0.82, 310);

// =========================================================================
// SLIDE 1 SVG: Mandi Slot Booking (Phone + Calendar + Mandi Gate + Sunlight)
// =========================================================================
export function MandiSlotBookingSvg() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SVG_SIZE} height={SVG_SIZE * 0.9} viewBox="0 0 320 280">
        <Defs>
          <LinearGradient id="bgGlow1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#EAF7EC" />
            <Stop offset="1" stopColor="#DCFCE7" />
          </LinearGradient>
          <LinearGradient id="phoneGrad1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1E293B" />
            <Stop offset="1" stopColor="#0F172A" />
          </LinearGradient>
          <LinearGradient id="greenAccent1" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#15803D" />
            <Stop offset="1" stopColor="#22C55E" />
          </LinearGradient>
          <LinearGradient id="goldSun" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#F59E0B" />
            <Stop offset="1" stopColor="#FDE047" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow Circular Backdrop */}
        <Circle cx="160" cy="140" r="125" fill="url(#bgGlow1)" opacity="0.8" />

        {/* Rising Morning Sun */}
        <Circle cx="240" cy="65" r="28" fill="url(#goldSun)" opacity="0.85" />
        <Path d="M240 28 L240 20 M240 102 L240 110 M203 65 L195 65 M277 65 L285 65" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />

        {/* Mandi Warehouse Gate (Background Left) */}
        <G transform="translate(20, 70)">
          {/* Warehouse roof */}
          <Path d="M0 45 L50 20 L100 45 Z" fill="#334155" />
          {/* APMC Sign */}
          <Rect x="15" y="32" width="70" height="12" rx="2" fill="#15803D" />
          <SvgText x="50" y="41" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">APMC MANDI</SvgText>
          {/* Columns */}
          <Rect x="8" y="45" width="6" height="55" fill="#94A3B8" />
          <Rect x="86" y="45" width="6" height="55" fill="#94A3B8" />
          <Rect x="18" y="70" width="22" height="30" rx="3" fill="#D97706" />
          <Rect x="20" y="60" width="18" height="25" rx="3" fill="#B45309" />
        </G>

        {/* Rolling Green Crops Ground */}
        <Path d="M0 210 Q80 185 160 200 T320 190 L320 280 L0 280 Z" fill="#86EFAC" opacity="0.6" />
        <Path d="M0 230 Q120 210 220 225 T320 215 L320 280 L0 280 Z" fill="#22C55E" opacity="0.4" />

        {/* Hero Smartphone (Center Foreground) */}
        <G transform="translate(105, 45)">
          {/* Phone Outer Shell */}
          <Rect x="0" y="0" width="115" height="195" rx="20" fill="url(#phoneGrad1)" />
          {/* Screen */}
          <Rect x="5" y="5" width="105" height="185" rx="16" fill="#FFFFFF" />

          {/* Top Notch & Speaker */}
          <Rect x="38" y="8" width="38" height="5" rx="2.5" fill="#334155" />

          {/* App Header on Screen */}
          <Rect x="10" y="20" width="95" height="22" rx="6" fill="#F0FDF4" />
          <Circle cx="22" cy="31" r="6" fill="#15803D" />
          <Path d="M19 31 L21 33 L25 29" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          <SvgText x="34" y="34" fill="#15803D" fontSize="8" fontWeight="bold">Slot Booking</SvgText>

          {/* Calendar Widget on Screen */}
          <Rect x="10" y="48" width="95" height="65" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
          {/* Calendar Header */}
          <Rect x="10" y="48" width="95" height="16" rx="6" fill="#166534" />
          <SvgText x="57" y="59" fill="#FFFFFF" fontSize="7.5" fontWeight="bold" textAnchor="middle">Today • 10:00 AM</SvgText>
          {/* Day Grid */}
          <Circle cx="26" cy="74" r="7" fill="#E2E8F0" />
          <Circle cx="44" cy="74" r="7" fill="#E2E8F0" />
          <Circle cx="62" cy="74" r="8" fill="#22C55E" />
          <SvgText x="62" y="77" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">✓</SvgText>
          <Circle cx="80" cy="74" r="7" fill="#E2E8F0" />
          <Circle cx="98" cy="74" r="7" fill="#E2E8F0" />

          <SvgText x="57" y="98" fill="#1E293B" fontSize="7.5" fontWeight="bold" textAnchor="middle">Entry Gate #2 Confirmed</SvgText>
          <SvgText x="57" y="107" fill="#64748B" fontSize="6" textAnchor="middle">Wheat • 40 Quintals</SvgText>

          {/* Action Button on Screen */}
          <Rect x="15" y="122" width="85" height="20" rx="10" fill="url(#greenAccent1)" />
          <SvgText x="57" y="135" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">BOOKED CONFIRMED</SvgText>

          {/* QR Code / Barcode Preview */}
          <Rect x="35" y="148" width="44" height="28" rx="4" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
          <Rect x="40" y="153" width="7" height="7" fill="#0F172A" />
          <Rect x="67" y="153" width="7" height="7" fill="#0F172A" />
          <Rect x="40" y="164" width="7" height="7" fill="#0F172A" />
          <Rect x="54" y="158" width="6" height="6" fill="#15803D" />
        </G>

        {/* Floating Green Verified Badge (Right) */}
        <G transform="translate(205, 125)">
          <Circle cx="22" cy="22" r="20" fill="#22C55E" />
          <Circle cx="22" cy="22" r="16" fill="#15803D" />
          <Path d="M16 22 L20 26 L29 17" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>

        {/* Small Tractor Passing (Left Foreground) */}
        <G transform="translate(30, 210) scale(0.85)">
          <Circle cx="16" cy="24" r="10" fill="#0F172A" />
          <Circle cx="16" cy="24" r="5" fill="#94A3B8" />
          <Circle cx="40" cy="26" r="7" fill="#0F172A" />
          <Circle cx="40" cy="26" r="3.5" fill="#94A3B8" />
          <Rect x="12" y="8" width="22" height="14" rx="3" fill="#16A34A" />
          <Rect x="24" y="2" width="10" height="9" rx="1.5" fill="#BBF7D0" />
          <Path d="M10 14 L4 18" stroke="#15803D" strokeWidth="3" strokeLinecap="round" />
        </G>
      </Svg>
    </View>
  );
}

// =========================================================================
// SLIDE 2 SVG: Digital Weighment & Transparent MSP (Scale + Grain + ₹ Coin)
// =========================================================================
export function DigitalWeighmentSvg() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SVG_SIZE} height={SVG_SIZE * 0.9} viewBox="0 0 320 280">
        <Defs>
          <LinearGradient id="bgGlow2" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FEF9C3" />
            <Stop offset="1" stopColor="#E0F2FE" />
          </LinearGradient>
          <LinearGradient id="scalePlatGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#475569" />
            <Stop offset="0.5" stopColor="#64748B" />
            <Stop offset="1" stopColor="#334155" />
          </LinearGradient>
          <LinearGradient id="goldCoinGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FBBF24" />
            <Stop offset="0.5" stopColor="#F59E0B" />
            <Stop offset="1" stopColor="#D97706" />
          </LinearGradient>
          <LinearGradient id="screenLedGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#0F172A" />
            <Stop offset="1" stopColor="#022C22" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="160" cy="140" r="125" fill="url(#bgGlow2)" opacity="0.75" />

        {/* Digital Weighing Scale Platform (Center Ground) */}
        <G transform="translate(60, 160)">
          {/* Heavy Base Support */}
          <Rect x="20" y="32" width="160" height="14" rx="4" fill="#1E293B" />
          {/* Platform Surface */}
          <Rect x="10" y="20" width="180" height="12" rx="3" fill="url(#scalePlatGrad)" />

          {/* Stamped Jute Sacks on Scale */}
          {/* Bag 1 */}
          <G transform="translate(30, -50)">
            <Path d="M4 14 C4 -4, 46 -4, 46 14 L48 68 C48 76, 2 76, 2 68 Z" fill="#D97706" />
            <Path d="M12 10 L38 10" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <SvgText x="25" y="44" fill="#78350F" fontSize="10" fontWeight="bold" textAnchor="middle">WHEAT</SvgText>
            <SvgText x="25" y="56" fill="#78350F" fontSize="8" textAnchor="middle">50 KG</SvgText>
          </G>
          {/* Bag 2 */}
          <G transform="translate(74, -50)">
            <Path d="M4 14 C4 -4, 46 -4, 46 14 L48 68 C48 76, 2 76, 2 68 Z" fill="#F59E0B" />
            <Path d="M12 10 L38 10" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <SvgText x="25" y="44" fill="#78350F" fontSize="10" fontWeight="bold" textAnchor="middle">PADDY</SvgText>
            <SvgText x="25" y="56" fill="#78350F" fontSize="8" textAnchor="middle">50 KG</SvgText>
          </G>
          {/* Bag 3 (Top Pyramid) */}
          <G transform="translate(52, -100)">
            <Path d="M4 12 C4 -4, 42 -4, 42 12 L44 56 C44 64, 2 64, 2 56 Z" fill="#B45309" />
            <Path d="M10 8 L36 8" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
            <SvgText x="23" y="36" fill="#FEF3C7" fontSize="8" fontWeight="bold" textAnchor="middle">MSP GRADE</SvgText>
          </G>
        </G>

        {/* Digital Weighing Terminal Indicator Pillar (Right Side) */}
        <G transform="translate(230, 95)">
          <Rect x="12" y="55" width="8" height="55" fill="#475569" />
          {/* Terminal Box */}
          <Rect x="-15" y="0" width="62" height="55" rx="8" fill="url(#screenLedGrad)" stroke="#10B981" strokeWidth="2" />
          {/* Glowing Green LED Display */}
          <Rect x="-8" y="7" width="48" height="24" rx="4" fill="#064E3B" />
          <SvgText x="16" y="23" fill="#34D399" fontSize="11" fontWeight="bold" textAnchor="middle">2,500 KG</SvgText>
          <SvgText x="16" y="42" fill="#A7F3D0" fontSize="7" fontWeight="bold" textAnchor="middle">DIGITAL VERIFIED</SvgText>
        </G>

        {/* Giant Floating Golden Rupee Coin & MSP Direct Bank Badge (Left) */}
        <G transform="translate(42, 45)">
          <Circle cx="30" cy="30" r="28" fill="url(#goldCoinGrad)" />
          <Circle cx="30" cy="30" r="23" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
          <SvgText x="30" y="39" fill="#FFFFFF" fontSize="26" fontWeight="bold" textAnchor="middle">₹</SvgText>

          {/* Sparkles around Rupee */}
          <Path d="M5 12 L8 5 L11 12 L18 15 L11 18 L8 25 L5 18 L-2 15 Z" fill="#FBBF24" />
          <Path d="M52 45 L54 40 L56 45 L61 47 L56 49 L54 54 L52 49 L47 47 Z" fill="#FBBF24" />
        </G>

        {/* Bank Direct Deposit Guarantee Ribbon */}
        <G transform="translate(75, 222)">
          <Rect x="0" y="0" width="170" height="28" rx="14" fill="#FFFFFF" stroke="#10B981" strokeWidth="1.5" />
          <Circle cx="18" cy="14" r="9" fill="#10B981" />
          <SvgText x="18" y="18" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">✓</SvgText>
          <SvgText x="92" y="18" fill="#065F46" fontSize="9" fontWeight="bold" textAnchor="middle">100% Direct Bank DBT Transfer</SvgText>
        </G>
      </Svg>
    </View>
  );
}

// =========================================================================
// SLIDE 3 SVG: Real-Time Queue Tracking (Map / Radar + Token + Road + Gate)
// =========================================================================
export function LiveQueueTrackingSvg() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SVG_SIZE} height={SVG_SIZE * 0.9} viewBox="0 0 320 280">
        <Defs>
          <LinearGradient id="bgGlow3" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#E0F2FE" />
            <Stop offset="1" stopColor="#ECFDF5" />
          </LinearGradient>
          <LinearGradient id="radarPulse" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#38BDF8" stopOpacity="0.4" />
            <Stop offset="1" stopColor="#0284C7" stopOpacity="0.05" />
          </LinearGradient>
          <LinearGradient id="tokenCardGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#1E3A8A" />
            <Stop offset="1" stopColor="#0284C7" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="160" cy="140" r="125" fill="url(#bgGlow3)" opacity="0.8" />

        {/* Live Radar Concentric Waves */}
        <Circle cx="160" cy="120" r="85" fill="url(#radarPulse)" />
        <Circle cx="160" cy="120" r="60" stroke="#0284C7" strokeWidth="1" strokeDasharray="4,4" fill="none" opacity="0.5" />
        <Circle cx="160" cy="120" r="35" stroke="#0284C7" strokeWidth="1.2" fill="none" opacity="0.6" />

        {/* Winding Road to APMC Mandi */}
        <Path
          d="M30 250 Q110 210 160 160 T250 80"
          stroke="#94A3B8"
          strokeWidth="32"
          strokeLinecap="round"
          fill="none"
        />
        <Path
          d="M30 250 Q110 210 160 160 T250 80"
          stroke="#F8FAFC"
          strokeWidth="2.5"
          strokeDasharray="8,8"
          fill="none"
        />

        {/* Mandi Entry Destination Pin (Top Right) */}
        <G transform="translate(230, 45)">
          <Circle cx="20" cy="20" r="18" fill="#15803D" />
          <SvgText x="20" y="24" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">APMC</SvgText>
          <Path d="M20 38 L14 26 L26 26 Z" fill="#15803D" />
        </G>

        {/* Moving Tractor on Road (Center) */}
        <G transform="translate(125, 135) scale(0.9)">
          <Circle cx="16" cy="24" r="10" fill="#0F172A" />
          <Circle cx="16" cy="24" r="5" fill="#94A3B8" />
          <Circle cx="42" cy="26" r="7.5" fill="#0F172A" />
          <Circle cx="42" cy="26" r="4" fill="#94A3B8" />
          <Rect x="12" y="8" width="24" height="15" rx="3" fill="#0284C7" />
          <Rect x="26" y="2" width="10" height="9" rx="2" fill="#BAE6FD" />
          {/* Signal Wave from Tractor */}
          <Circle cx="30" cy="2" r="5" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
        </G>

        {/* Floating Live Token Card (Left Foreground) */}
        <G transform="translate(25, 60)">
          <Rect x="0" y="0" width="105" height="90" rx="14" fill="url(#tokenCardGrad)" />
          <Circle cx="20" cy="20" r="10" fill="#38BDF8" />
          <SvgText x="20" y="24" fill="#0C4A6E" fontSize="9" fontWeight="bold" textAnchor="middle">#</SvgText>
          <SvgText x="58" y="24" fill="#FFFFFF" fontSize="9" fontWeight="bold">LIVE QUEUE</SvgText>

          <SvgText x="52" y="52" fill="#38BDF8" fontSize="22" fontWeight="900" textAnchor="middle">#14</SvgText>
          <SvgText x="52" y="66" fill="#E0F2FE" fontSize="8" textAnchor="middle">Vehicles Ahead: 3</SvgText>
          <Rect x="12" y="72" width="81" height="12" rx="6" fill="#10B981" />
          <SvgText x="52" y="81" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">Est: 12 Mins Wait</SvgText>
        </G>

        {/* Step Progression Timeline (Bottom) */}
        <G transform="translate(45, 230)">
          <Rect x="0" y="0" width="230" height="34" rx="17" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Step 1 */}
          <Circle cx="30" cy="17" r="10" fill="#10B981" />
          <SvgText x="30" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">✓</SvgText>
          <SvgText x="30" y="31" fill="#047857" fontSize="5.5" fontWeight="bold" textAnchor="middle">Booked</SvgText>
          {/* Line 1 */}
          <Rect x="42" y="16" width="38" height="2" fill="#10B981" />
          {/* Step 2 */}
          <Circle cx="90" cy="17" r="10" fill="#0284C7" />
          <SvgText x="90" y="21" fill="#FFFFFF" fontSize="9" fontWeight="bold" textAnchor="middle">2</SvgText>
          <SvgText x="90" y="31" fill="#0369A1" fontSize="5.5" fontWeight="bold" textAnchor="middle">In Queue</SvgText>
          {/* Line 2 */}
          <Rect x="102" y="16" width="38" height="2" fill="#CBD5E1" />
          {/* Step 3 */}
          <Circle cx="150" cy="17" r="10" fill="#E2E8F0" />
          <SvgText x="150" y="21" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">3</SvgText>
          <SvgText x="150" y="31" fill="#64748B" fontSize="5.5" textAnchor="middle">Weighing</SvgText>
          {/* Line 3 */}
          <Rect x="162" y="16" width="38" height="2" fill="#CBD5E1" />
          {/* Step 4 */}
          <Circle cx="210" cy="17" r="10" fill="#E2E8F0" />
          <SvgText x="210" y="21" fill="#64748B" fontSize="9" fontWeight="bold" textAnchor="middle">₹</SvgText>
          <SvgText x="210" y="31" fill="#64748B" fontSize="5.5" textAnchor="middle">Paid</SvgText>
        </G>
      </Svg>
    </View>
  );
}

// =========================================================================
// SLIDE 4 SVG: Government Schemes & DigiLocker KYC (Document + Shield + Flag)
// =========================================================================
export function GovtSchemesKycSvg() {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SVG_SIZE} height={SVG_SIZE * 0.9} viewBox="0 0 320 280">
        <Defs>
          <LinearGradient id="bgGlow4" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FEF3C7" />
            <Stop offset="1" stopColor="#DCFCE7" />
          </LinearGradient>
          <LinearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#15803D" />
            <Stop offset="1" stopColor="#047857" />
          </LinearGradient>
          <LinearGradient id="docGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FFFFFF" />
            <Stop offset="1" stopColor="#F8FAFC" />
          </LinearGradient>
        </Defs>

        {/* Ambient Glow */}
        <Circle cx="160" cy="140" r="125" fill="url(#bgGlow4)" opacity="0.8" />

        {/* Central Official DigiLocker Certificate / Document */}
        <G transform="translate(75, 45)">
          <Rect x="0" y="0" width="170" height="185" rx="14" fill="url(#docGrad)" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Indian Tricolor Ribbon Bar on Top of Doc */}
          <Rect x="0" y="0" width="170" height="4" rx="2" fill="#FF9933" />
          <Rect x="0" y="4" width="170" height="4" fill="#FFFFFF" />
          <Rect x="0" y="8" width="170" height="4" fill="#138808" />

          {/* Ashoka Chakra Wheel Emblem (Blue) */}
          <Circle cx="85" cy="30" r="12" stroke="#000080" strokeWidth="1.5" fill="#F8FAFC" />
          <Circle cx="85" cy="30" r="3" fill="#000080" />
          <Path d="M85 18 L85 42 M73 30 L97 30 M76 21 L94 39 M76 39 L94 21" stroke="#000080" strokeWidth="0.8" />

          <SvgText x="85" y="52" fill="#0F172A" fontSize="9" fontWeight="bold" textAnchor="middle">GOVERNMENT OF INDIA</SvgText>
          <SvgText x="85" y="63" fill="#15803D" fontSize="8" fontWeight="bold" textAnchor="middle">PM-KISAN SAMMAN NIDHI</SvgText>

          {/* Document Content Rows */}
          <Rect x="18" y="75" width="80" height="7" rx="3.5" fill="#E2E8F0" />
          <Rect x="18" y="87" width="115" height="6" rx="3" fill="#F1F5F9" />
          <Rect x="18" y="97" width="100" height="6" rx="3" fill="#F1F5F9" />

          {/* DigiLocker Verified Stamp Badge */}
          <G transform="translate(18, 114)">
            <Rect x="0" y="0" width="134" height="28" rx="8" fill="#EFF6FF" stroke="#3B82F6" strokeWidth="1.2" />
            <Circle cx="16" cy="14" r="8" fill="#3B82F6" />
            <SvgText x="16" y="17" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">✓</SvgText>
            <SvgText x="32" y="14" fill="#1D4ED8" fontSize="8" fontWeight="bold">DigiLocker Verified</SvgText>
            <SvgText x="32" y="23" fill="#60A5FA" fontSize="6.5">Aadhaar • Land Record Linked</SvgText>
          </G>

          {/* Subsidy Direct Benefit Box */}
          <G transform="translate(18, 148)">
            <Rect x="0" y="0" width="134" height="24" rx="6" fill="#F0FDF4" />
            <SvgText x="12" y="15" fill="#166534" fontSize="8" fontWeight="bold">Next Installment:</SvgText>
            <SvgText x="122" y="15" fill="#15803D" fontSize="9" fontWeight="900" textAnchor="end">₹2,000 APPROVED</SvgText>
          </G>
        </G>

        {/* Large Golden Security Shield (Right Foreground) */}
        <G transform="translate(210, 110)">
          <Path
            d="M30 0 L55 12 C55 42, 30 65, 30 65 C30 65, 5 42, 5 12 Z"
            fill="url(#shieldGrad)"
          />
          <Path
            d="M30 6 L49 16 C49 39, 30 57, 30 57 C30 57, 11 39, 11 16 Z"
            fill="#16A34A"
            opacity="0.8"
          />
          {/* White Checkmark in Shield */}
          <Path d="M21 30 L27 36 L40 22" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </G>

        {/* Wheat Sheaf Icon (Left Side) */}
        <G transform="translate(30, 120)">
          <Circle cx="22" cy="22" r="20" fill="#FEF3C7" />
          <SvgText x="22" y="28" fill="#D97706" fontSize="18" textAnchor="middle">🌾</SvgText>
        </G>
      </Svg>
    </View>
  );
}
