import { Solar } from 'lunar-javascript';

// Simulated birth in Buenos Aires (UTC-3)
// User inputs: 1999-02-04 10:00 AM (Edge case for Spring Transition!)

// Method 1: fromYmdHms (What we use now)
const s1 = Solar.fromYmdHms(1999, 2, 4, 10, 0, 0);
console.log("Method 1 Pillar:", s1.getLunar().getEightChar().getMonthZhi());

// Method 2: using Date object mapped to UTC-3
const d = new Date(Date.UTC(1999, 1, 4, 13, 0, 0)); // 10:00 AM in UTC-3 = 13:00 UTC
const s2 = Solar.fromDate(d);
console.log("Method 2 Pillar:", s2.getLunar().getEightChar().getMonthZhi());

// Wait, does lunar-javascript actually recalculate the solar terms based on the input Date's True UTC time?
// Let's check the hour pillar.
console.log("Method 1 Hour:", s1.getLunar().getEightChar().getTimeZhi());
console.log("Method 2 Hour:", s2.getLunar().getEightChar().getTimeZhi());
