import { Solar } from 'lunar-javascript';
import { STEMS, BRANCHES } from './constants.js';

export function calculateSaju(year, month, day, hour, minute, isMale) {
  const solar = Solar.fromYmdHms(year, month, day, hour, minute, 0);
  const lunar = solar.getLunar();
  const baZi = lunar.getEightChar();
  
  const ys = STEMS.indexOf(baZi.getYearGan());
  const yb = BRANCHES.indexOf(baZi.getYearZhi());
  const ms = STEMS.indexOf(baZi.getMonthGan());
  const mb = BRANCHES.indexOf(baZi.getMonthZhi());
  const ds = STEMS.indexOf(baZi.getDayGan());
  const db = BRANCHES.indexOf(baZi.getDayZhi());
  const hs = STEMS.indexOf(baZi.getTimeGan());
  const hb = BRANCHES.indexOf(baZi.getTimeZhi());

  const pillars = [
    { label: "year", kr: "년주", s: ys, b: yb, isDay: false },
    { label: "month", kr: "월주", s: ms, b: mb, isDay: false },
    { label: "day", kr: "일주", s: ds, b: db, isDay: true },
    { label: "hour", kr: "시주", s: hs, b: hb, isDay: false },
  ];

  const yun = baZi.getYun(isMale ? 1 : 0);
  const daYunArr = yun.getDaYun();
  const startAge = yun.getStartYear();

  const cycles = [];
  // The first DaYun (index 0) is childhood before the cycle officially initiates. We skip it, mapping exactly 8 active cycles.
  for (let i = 1; i <= Math.min(8, daYunArr.length - 1); i++) {
    const dy = daYunArr[i];
    const ganzhi = dy.getGanZhi();
    cycles.push({
      s: STEMS.indexOf(ganzhi.substring(0, 1)),
      b: BRANCHES.indexOf(ganzhi.substring(1, 2)),
      ageStart: dy.getStartAge(),
      ageEnd: dy.getEndAge(),
      yrStart: dy.getStartYear(),
      yrEnd: dy.getEndYear()
    });
  }

  // 4. Edge Case Detection (±1 Day Transition Check)
  const rawPrev = new Date(year, month-1, day-1, hour, minute);
  const prevSolar = Solar.fromYmdHms(rawPrev.getFullYear(), rawPrev.getMonth()+1, rawPrev.getDate(), rawPrev.getHours(), rawPrev.getMinutes(), 0);
  const rawNext = new Date(year, month-1, day+1, hour, minute);
  const nextSolar = Solar.fromYmdHms(rawNext.getFullYear(), rawNext.getMonth()+1, rawNext.getDate(), rawNext.getHours(), rawNext.getMinutes(), 0);
  
  const isEdgeCase = (baZi.getMonthZhi() !== prevSolar.getLunar().getEightChar().getMonthZhi()) || 
                     (baZi.getMonthZhi() !== nextSolar.getLunar().getEightChar().getMonthZhi());

  return {
    pillars,
    ds,
    cycles,
    startAge,
    startMonth: yun.getStartMonth(),
    startDay: yun.getStartDay(),
    direction: yun.isForward() ? 1 : -1,
    ys,
    isEdgeCase
  };
}
