import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function calculateFPE(fat: number, protein: number): { kcal: number; fpe: number; duration: number } {
  const kcal = fat * 9 + protein * 4;
  const fpe = kcal / 100;
  let duration = 3;
  if (fpe >= 2 && fpe < 3) duration = 4;
  else if (fpe >= 3 && fpe < 4) duration = 5;
  else if (fpe >= 4) duration = 6 + Math.floor(fpe - 4);
  return { kcal, fpe, duration };
}

function getTrendArrowRecommendation(trend: string): string {
  switch (trend) {
    case 'up':
      return 'Blutzucker steigt: Erwäge Korrektur oder warte mit Bolus.';
    case 'down':
      return 'Blutzucker sinkt: Reduziere Bolus oder warte.';
    case 'flat':
      return 'Blutzucker stabil: Normale Berechnung.';
    default:
      return '';
  }
}

function calculateInsulinDose(carbs: number, fpe: number, bloodGlucose: number, target: number, carbFactor: number, fpeFactor: number, correctionFactor: number): number {
  // Correct formula: Dosis = (KH * KH-Faktor) + (FPE * FPE-Faktor) + ((BZ - Zielwert) / Korrekturfaktor)
  return ((carbs * carbFactor) + (fpe * fpeFactor) + ((bloodGlucose - target) / correctionFactor)) / 10; // Convert to IE
  // Note: Ensure all inputs are in mmol/l and grams
}

function App() {
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [bloodGlucose, setBloodGlucose] = useState('');
  const [trend, setTrend] = useState('flat');
  const [fpeFactor, setFpeFactor] = useState('1'); // Standard: 1 IE/FPE
  const [correctionFactor, setCorrectionFactor] = useState('1.7'); // Standard: 1 IE senkt 1.7 mmol/l
  const [targetGlucose, setTargetGlucose] = useState('5.6'); // Standard Zielwert in mmol/l
  const [fpeResult, setFpeResult] = useState<{ kcal: number; fpe: number; duration: number } | null>(null);
  const [insulinDose, setInsulinDose] = useState<number | null>(null);
  const [trendRecommendation, setTrendRecommendation] = useState('');
  const [savedDoses, setSavedDoses] = useState<{ time: number; dose: number; duration: number }[]>(() => {
    const data = localStorage.getItem('bolusDoses');
    return data ? JSON.parse(data) : [];
  });
  const [activeInsulin, setActiveInsulin] = useState<number>(0);
  // User settings state
  const [showSettings, setShowSettings] = useState(false);
  // New: Tageszeit und Spritzfaktoren
  const [daytime, setDaytime] = useState<'morning' | 'noon' | 'evening'>('morning');
  const [carbFactorMorning, setCarbFactorMorning] = useState('10');
  const [carbFactorNoon, setCarbFactorNoon] = useState('10');
  const [carbFactorEvening, setCarbFactorEvening] = useState('10');

  // Calculate active insulin on load and when savedDoses changes
  useEffect(() => {
    const now = Date.now();
    const remaining = savedDoses
      .map(d => {
        const elapsed = (now - d.time) / 3600000; // hours
        if (elapsed < d.duration) {
          // Linear decay
          return d.dose * (1 - elapsed / d.duration);
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
    setActiveInsulin(remaining);
  }, [savedDoses]);

  // Persist/load user settings (carbFactor, fpeFactor, correctionFactor, targetGlucose)
  useEffect(() => {
    const settings = localStorage.getItem('bolusSettings');
    if (settings) {
      const s = JSON.parse(settings);
      setCarbFactorMorning(s.carbFactorMorning || '1');
      setCarbFactorNoon(s.carbFactorNoon || '1');
      setCarbFactorEvening(s.carbFactorEvening || '1');
      setFpeFactor(s.fpeFactor || '1');
      setCorrectionFactor(s.correctionFactor || '1.7');
      setTargetGlucose(s.targetGlucose || '5.6');
    }
  }, []);

  // Use correct factor for selected daytime
  const getCurrentCarbFactor = () => {
    if (daytime === 'morning') return parseFloat(carbFactorMorning) || 1;
    if (daytime === 'noon') return parseFloat(carbFactorNoon) || 0.5;
    if (daytime === 'evening') return parseFloat(carbFactorEvening) || 0.5;
    return 10;
  };

  const handleCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const fatVal = parseFloat(fat) || 0;
    const proteinVal = parseFloat(protein) || 0;
    const carbsVal = parseFloat(carbs) || 0;
    const bgVal = parseFloat(bloodGlucose) || 0;
    const carbF = getCurrentCarbFactor();
    const fpeF = parseFloat(fpeFactor) || 1;
    const corrF = parseFloat(correctionFactor) || 1.7;
    const target = parseFloat(targetGlucose) || 5.6;
    const fpeCalc = calculateFPE(fatVal, proteinVal);
    setFpeResult(fpeCalc);
    setTrendRecommendation(getTrendArrowRecommendation(trend));
    const dose = calculateInsulinDose(carbsVal, fpeCalc.fpe, bgVal, target, carbF, fpeF, corrF);
    setInsulinDose(Math.max(0, dose));
  };

  const handleSaveDose = () => {
    if (insulinDose && fpeResult) {
      const newDose = { time: Date.now(), dose: insulinDose, duration: fpeResult.duration };
      const updated = [...savedDoses, newDose].filter(d => {
        // Remove expired
        const elapsed = (Date.now() - d.time) / 3600000;
        return elapsed < d.duration;
      });
      setSavedDoses(updated);
      localStorage.setItem('bolusDoses', JSON.stringify(updated));
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('bolusSettings', JSON.stringify({
      carbFactorMorning,
      carbFactorNoon,
      carbFactorEvening,
      fpeFactor,
      correctionFactor,
      targetGlucose
    }));
    setShowSettings(false);
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-primary">Profi Bolus Calc</h1>
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-secondary" onClick={() => setShowSettings(s => !s)} type="button">
          {showSettings ? 'Einstellungen ausblenden' : 'Einstellungen anzeigen'}
        </button>
      </div>
      <div className="mb-3">
        <label className="form-label me-3">Tageszeit:</label>
        <div className="btn-group" role="group">
          <button type="button" className={`btn btn-outline-primary${daytime === 'morning' ? ' active' : ''}`} onClick={() => setDaytime('morning')}>Morgens</button>
          <button type="button" className={`btn btn-outline-primary${daytime === 'noon' ? ' active' : ''}`} onClick={() => setDaytime('noon')}>Mittags</button>
          <button type="button" className={`btn btn-outline-primary${daytime === 'evening' ? ' active' : ''}`} onClick={() => setDaytime('evening')}>Abends</button>
        </div>
      </div>
      {showSettings && (
        <div className="card mb-4 shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Persönliche Einstellungen</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">KH-Faktor morgens (g/IE)</label>
                <input type="number" className="form-control" value={carbFactorMorning} onChange={e => setCarbFactorMorning(e.target.value)} min="1" step="any" />
              </div>
              <div className="col-md-4">
                <label className="form-label">KH-Faktor mittags (g/IE)</label>
                <input type="number" className="form-control" value={carbFactorNoon} onChange={e => setCarbFactorNoon(e.target.value)} min="1" step="any" />
              </div>
              <div className="col-md-4">
                <label className="form-label">KH-Faktor abends (g/IE)</label>
                <input type="number" className="form-control" value={carbFactorEvening} onChange={e => setCarbFactorEvening(e.target.value)} min="1" step="any" />
              </div>
              <div className="col-md-4">
                <label className="form-label">FPE-Faktor (IE/FPE)</label>
                <input type="number" className="form-control" value={fpeFactor} onChange={e => setFpeFactor(e.target.value)} min="0.1" step="any" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Korrekturfaktor (mmol/l/IE)</label>
                <input type="number" className="form-control" value={correctionFactor} onChange={e => setCorrectionFactor(e.target.value)} min="0.1" step="any" />
              </div>
              <div className="col-md-4">
                <label className="form-label">Ziel-Blutzucker (mmol/l)</label>
                <input type="number" className="form-control" value={targetGlucose} onChange={e => setTargetGlucose(e.target.value)} min="0" step="any" />
              </div>
            </div>
            <div className="mt-3 text-end">
              <button className="btn btn-primary" onClick={handleSaveSettings} type="button">Einstellungen speichern</button>
            </div>
          </div>
        </div>
      )}
      <form className="row g-3 bg-light p-4 rounded shadow-sm" onSubmit={handleCalc}>
        <div className="col-md-4">
          <label className="form-label">Kohlenhydrate (g)</label>
          <input type="number" className="form-control" value={carbs} onChange={e => setCarbs(e.target.value)} min="0" step="any" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Fett (g)</label>
          <input type="number" className="form-control" value={fat} onChange={e => setFat(e.target.value)} min="0" step="any" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Eiweiß (g)</label>
          <input type="number" className="form-control" value={protein} onChange={e => setProtein(e.target.value)} min="0" step="any" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Blutzucker (mmol/l)</label>
          <input type="number" className="form-control" value={bloodGlucose} onChange={e => setBloodGlucose(e.target.value)} min="0" step="any" />
        </div>
        <div className="col-md-4">
          <label className="form-label">Trendpfeil</label>
          <select className="form-select" value={trend} onChange={e => setTrend(e.target.value)}>
            <option value="flat">→ (stabil)</option>
            <option value="up">↑ (steigend)</option>
            <option value="down">↓ (fallend)</option>
          </select>
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary btn-lg w-100">Berechnen</button>
        </div>
      </form>
      {fpeResult && (
        <div className="alert alert-info mt-4">
          <strong>FPE Ergebnis:</strong><br />
          Kalorien aus Fett/Eiweiß: {fpeResult.kcal.toFixed(0)} kcal<br />
          FPE: {fpeResult.fpe.toFixed(2)}<br />
          Wirkdauer: {fpeResult.duration} Stunden
        </div>
      )}
      {trendRecommendation && (
        <div className="alert alert-warning mt-2">
          <strong>Trendpfeil-Empfehlung:</strong> {trendRecommendation}
        </div>
      )}
      {insulinDose !== null && (
        <div className="alert alert-success mt-4">
          <strong>Empfohlene Insulindosis:</strong> {insulinDose.toFixed(2)} IE
          <button className="btn btn-outline-success btn-sm ms-3" onClick={handleSaveDose} type="button">Dosis speichern</button>
        </div>
      )}
      <div className="alert alert-secondary mt-2 fs-5">
        <strong>Wirksames Restinsulin:</strong> {activeInsulin.toFixed(2)} IE
      </div>
    </div>
  );
}

export default App;
