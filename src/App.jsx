import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  STEMS, STEMS_NAME, STEMS_ELEMENT, STEMS_POLARITY,
  BRANCHES, BRANCHES_NAME, BRANCHES_EMOJI, BRANCHES_ELEMENT, BRANCHES_POLARITY,
  ELEM_COLOR
} from './constants.js';
import { calculateSaju } from './calculator.js';

function PillarCard({ label, krLabel, s, b, isDay }) {
  const { t } = useTranslation();
  const elemS = STEMS_ELEMENT[s];
  const elemB = BRANCHES_ELEMENT[b];
  const cs = ELEM_COLOR[elemS];
  const cb = ELEM_COLOR[elemB];

  return (
    <div className={`pillar-card ${isDay ? 'day-master' : ''}`}>
      <div className="pillar-top">
        <span className="pillar-top-name">
          {label}
          {isDay && <span className="pillar-day-badge">{t('pillar.day_master_badge')}</span>}
        </span>
        <span className="pillar-top-kr">{krLabel}</span>
      </div>
      <div className="pillar-stem">
        <span className={`pillar-hanja c-${cs}`}>{STEMS[s]}</span>
        <span className="pillar-romaji">{STEMS_NAME[s]}</span>
        <span className={`pillar-elem c-${cs}`}>{t(`elements.${elemS}`)} · {t(`polarity.${STEMS_POLARITY[s]}`)}</span>
      </div>
      <div className="pillar-branch">
        <span className="pillar-animal">{BRANCHES_EMOJI[b]}</span>
        <span className={`pillar-hanja c-${cb}`}>{BRANCHES[b]}</span>
        <span className="pillar-romaji">{BRANCHES_NAME[b]} / {t(`animals.${b}`)}</span>
        <span className={`pillar-elem c-${cb}`}>{t(`elements.${elemB}`)} · {t(`polarity.${BRANCHES_POLARITY[b]}`)}</span>
      </div>
    </div>
  );
}

function ElementsAnalysis({ pillars, ds }) {
  const { t } = useTranslation();
  const elemCount = {};
  for (const p of pillars) {
    const eS = STEMS_ELEMENT[p.s];
    elemCount[eS] = (elemCount[eS] || 0) + 1;
    const eB = BRANCHES_ELEMENT[p.b];
    elemCount[eB] = (elemCount[eB] || 0) + 1;
  }
  const maxC = Math.max(...Object.values(elemCount), 0);
  const dayElem = STEMS_ELEMENT[ds];

  const elementsList = ["wood", "fire", "earth", "metal", "water"];

  return (
    <div className="elements-card">
      <div id="elements-bars">
        {elementsList.map(elem => {
          const c = elemCount[elem] || 0;
          const pct = maxC === 0 ? 0 : Math.round((c / maxC) * 100);
          const isDayMaster = elem === dayElem;

          return (
            <div key={elem} className="elem-row">
              <span className={`elem-name c-${ELEM_COLOR[elem]}`}>{t(`elements.${elem}`)}</span>
              <div className="elem-bar-bg">
                <div className={`elem-bar bar-${ELEM_COLOR[elem]}`} style={{ width: `${pct}%` }}></div>
              </div>
              <span className="elem-count">{c}</span>
              {isDayMaster ? <span className="elem-tag">{t('elements.day_master_tag')}</span> : <span className="elem-tag"></span>}
            </div>
          );
        })}
      </div>

      <div className="chart-meta">
        <ChartMeta pillars={pillars} ds={ds} elemCount={elemCount} dayElem={dayElem} />
      </div>
    </div>
  );
}

function ChartMeta({ pillars, ds, elemCount, dayElem }) {
  const { t } = useTranslation();
  const allYin = pillars.every(p => STEMS_POLARITY[p.s] === 'yin' && BRANCHES_POLARITY[p.b] === 'yin');
  const dmCount = elemCount[dayElem] || 0;
  const strength = dmCount >= 3 ? t('meta.strong') : dmCount === 2 ? t('meta.moderate') : t('meta.weak');

  return (
    <>
      <span className="meta-item">{t('meta.all_yin')}: <strong>{allYin ? t('meta.yes_rare') : t('meta.no')}</strong></span>
      <span className="meta-item">{t('meta.day_master')}: <strong>{STEMS[ds]} ({STEMS_NAME[ds]}) — {t(`elements.${dayElem}`)} {t(`polarity.${STEMS_POLARITY[ds]}`)}</strong></span>
      <span className="meta-item">{t('meta.strength_lbl')}: <strong>{strength}</strong></span>
    </>
  );
}

function DaeunCycles({ cycles, currentYear }) {
  const { t } = useTranslation();
  return (
    <div id="daeun-rows">
      {cycles.map((c, i) => {
        const isNow = currentYear >= c.yrStart && currentYear <= c.yrEnd;
        const cs = ELEM_COLOR[STEMS_ELEMENT[c.s]];
        const cb = ELEM_COLOR[BRANCHES_ELEMENT[c.b]];

        return (
          <div key={i} className={`daeun-row ${isNow ? 'now' : ''}`}>
            <span className="daeun-num">{i + 1}</span>
            <span className="daeun-hanja">
              <span className={`c-${cs}`}>{STEMS[c.s]}</span>
              <span className={`c-${cb}`}>{BRANCHES[c.b]}</span>
            </span>
            <span className="daeun-stem">{STEMS_NAME[c.s]} · {t(`elements.${STEMS_ELEMENT[c.s]}`)} {t(`polarity.${STEMS_POLARITY[c.s]}`)}</span>
            <span className="daeun-branch">
              {BRANCHES_NAME[c.b]}/{t(`animals.${c.b}`)} · {t(`elements.${BRANCHES_ELEMENT[c.b]}`)}
              {isNow && <span className="now-badge">{t('daeun.now')}</span>}
            </span>
            <span className="daeun-age">{c.ageStart}–{c.ageEnd} {t('daeun.years')}</span>
            <span className="daeun-years">{c.yrStart}–{c.yrEnd}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();

  const [formData, setFormData] = useState({
    year: '1999',
    month: '12',
    day: '31',
    hour: '23',
    minute: '59',
    sex: 'male'
  });

  const [calcData, setCalcData] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    const name = id.replace('inp-', '');
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const setSex = (sex) => {
    setFormData(prev => ({ ...prev, sex }));
  };

  const handleCalculate = () => {
    const y = parseInt(formData.year);
    const m = parseInt(formData.month);
    const d = parseInt(formData.day);
    const h = parseInt(formData.hour);
    const min = parseInt(formData.minute);
    const isMale = formData.sex === 'male';

    if (!y || !m || !d || isNaN(h) || isNaN(min)) return;

    const sajuData = calculateSaju(y, m, d, h, min, isMale);

    sajuData.pillars.forEach(p => p.label = t(`pillar.${p.label}`));

    setCalcData({
      ...sajuData,
      year: y,
      isMale,
      month: m,
      day: d,
      hour: h,
      minute: min,
    });
  };

  useEffect(() => {
    handleCalculate();
  }, [i18n.language]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = t('page.title');
  }, [i18n.language, t]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="page">
      <div className="header">
        <div className="header-eyebrow">{t('header.eyebrow')}</div>
        <h1>{t('header.title1')}<br /><em>{t('header.title2')}</em></h1>
        <div className="rule"></div>
      </div>

      <div className="section-label">{t('sections.calculator')}</div>

      <div className="form-card">
        <div className="form-title">{t('form.title')}</div>
        <div className="form-grid">
          <div className="form-group">
            <label>{t('form.year')}</label>
            <input type="number" id="inp-year" value={formData.year} onChange={handleInputChange} min="1900" max="2100" placeholder="1999" />
          </div>
          <div className="form-group">
            <label>{t('form.month')}</label>
            <input type="number" id="inp-month" value={formData.month} onChange={handleInputChange} min="1" max="12" placeholder="12" />
          </div>
          <div className="form-group">
            <label>{t('form.day')}</label>
            <input type="number" id="inp-day" value={formData.day} onChange={handleInputChange} min="1" max="31" placeholder="31" />
          </div>
          <div className="form-group">
            <label>{t('form.hour')}</label>
            <input type="number" id="inp-hour" value={formData.hour} onChange={handleInputChange} min="0" max="23" placeholder="23" />
          </div>
          <div className="form-group">
            <label>{t('form.minute')}</label>
            <input type="number" id="inp-minute" value={formData.minute} onChange={handleInputChange} min="0" max="59" placeholder="59" />
          </div>
          <div className="form-group">
            <label>{t('form.gender')}</label>
            <div className="sex-row">
              <div className={`sex-btn ${formData.sex === 'male' ? 'active' : ''}`} onClick={() => setSex('male')}>{t('form.male')}</div>
              <div className={`sex-btn ${formData.sex === 'female' ? 'active' : ''}`} onClick={() => setSex('female')}>{t('form.female')}</div>
            </div>
          </div>
        </div>
        <button className="calc-btn" onClick={handleCalculate}>{t('form.calc_btn')}</button>
      </div>

      {calcData && (
        <div id="results" className="visible">
          <div className="section-label">{t('sections.saju')}</div>

          {calcData.isEdgeCase && (
            <div className="boundary-warning" style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--ink)' }}>
              <strong>⚠️ {t('meta.edge_warning_title')}</strong><br />
              <span style={{ opacity: 0.8 }}>{t('meta.edge_warning_desc')}</span>
            </div>
          )}

          <div className="pillars-grid">
            {calcData.pillars.map((p, i) => (
              <PillarCard key={i} {...p} />
            ))}
          </div>

          <div className="ornament">✦ ✦ ✦</div>

          <div className="section-label">{t('sections.elements')}</div>
          <ElementsAnalysis pillars={calcData.pillars} ds={calcData.ds} />

          <div className="section-label">{t('sections.daeun')}</div>
          <div className="daeun-card">
            <div className="daeun-header">
              {STEMS[calcData.ys]} ({t('daeun.year')} {t(`polarity.${calcData.ys % 2 === 0 ? 'yang' : 'yin'}`)}) + {calcData.isMale ? t('footer.male') : t('footer.female')} → {calcData.direction === 1 ? t('daeun.forward') : t('daeun.backward')} &nbsp;·&nbsp; {t('daeun.first_cycle')} {calcData.startAge} {t('daeun.years_old')} (~{calcData.year + calcData.startAge}) &nbsp;·&nbsp; {t('daeun.transition', { day: calcData.transitionDay.toString().padStart(2, '0'), month: calcData.transitionMonth.toString().padStart(2, '0') })}
            </div>
            <DaeunCycles cycles={calcData.cycles} currentYear={new Date().getFullYear()} />
          </div>

          <div className="footer">
            {calcData.day.toString().padStart(2, '0')}/{calcData.month.toString().padStart(2, '0')}/{calcData.year} &nbsp; {calcData.hour.toString().padStart(2, '0')}:{calcData.minute.toString().padStart(2, '0')} &nbsp; {calcData.isMale ? t('footer.male') : t('footer.female')}<br />
            <em>{t('footer.disclaimer')}</em>

            <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => changeLanguage('en')}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>
                EN
              </button>
              <button
                onClick={() => changeLanguage('es')}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>
                ES
              </button>
              <button
                onClick={() => changeLanguage('pt')}
                style={{ background: 'transparent', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)' }}>
                PT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
