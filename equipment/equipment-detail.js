// URLからidを取得
const params = new URLSearchParams(window.location.search);
const rawId = params.get('id');
const id = typeof rawId === 'string' ? rawId.trim() : '';

function appendHighlightedText(target, text) {
  if (!target) return;
  const value = text == null ? '' : String(text);
  const parts = value.split(/([+-]?\d+(?:\.\d+)?%?)/g);

  parts.forEach(part => {
    if (!part) return;
    if (/^[+-]?\d+(?:\.\d+)?%?$/.test(part)) {
      const span = document.createElement('span');
      span.className = 'highlight';
      span.textContent = part;
      target.appendChild(span);
      return;
    }
    target.appendChild(document.createTextNode(part));
  });
}

function renderLineBreakText(target, lines, { highlightNumbers = false } = {}) {
  if (!target) return;
  target.replaceChildren();

  (lines || []).forEach((line, index) => {
    if (index > 0) {
      target.appendChild(document.createElement('br'));
    }
    if (highlightNumbers) {
      appendHighlightedText(target, line);
      return;
    }
    target.appendChild(document.createTextNode(line == null ? '' : String(line)));
  });
}

// データを画面に表示
const data = id && Object.prototype.hasOwnProperty.call(equipmentData, id)
  ? equipmentData[id]
  : null;

if (data) {
  document.getElementById('detail-name').textContent = data.name;
  document.getElementById('detail-slot').textContent = '部位：' + data.slot;
  const elementEl = document.getElementById('detail-element');
  if (data.element) {
    elementEl.textContent = '属性：' + data.element;
    elementEl.style.display = 'block';
  } else {
    elementEl.style.display = 'none';
  }
  const obtainEl = document.getElementById('detail-obtain');
  if (data.obtain && data.obtain !== "入手条件：") {
    obtainEl.textContent = data.obtain;
    obtainEl.style.display = 'block';
  } else {
    obtainEl.style.display = 'none';
  }

  const ageEl = document.getElementById('detail-age');
  if (data.age) {
    ageEl.textContent = '必要年齢：' + data.age;
    ageEl.style.display = 'block';
  } else {
    ageEl.style.display = 'none';
  }
  document.getElementById('detail-description').textContent = data.description;
  document.getElementById('equipment-splash').src = data.image;

  // スライダー
  const slider = document.getElementById('tier-slider');
  const tierLabel = document.getElementById('tier-label');

  function updateTier(tier) {
    const t = data.tiers[tier - 1];
    tierLabel.textContent = 'Tier ' + tier;

    document.getElementById('val-protein').textContent = t.protein;
    document.getElementById('val-mineral').textContent = t.mineral;
    document.getElementById('val-fat').textContent = t.fat;
    document.getElementById('val-mutagen').textContent = t.mutagen;

    document.getElementById('mat-protein').style.display = t.protein > 0 ? 'flex' : 'none';
    document.getElementById('mat-mineral').style.display = t.mineral > 0 ? 'flex' : 'none';
    document.getElementById('mat-fat').style.display = t.fat > 0 ? 'flex' : 'none';
    document.getElementById('mat-mutagen').style.display = t.mutagen > 0 ? 'flex' : 'none';

    // Tier1からそのティアまでの合計
    let totalProtein = 0;
    let totalMineral = 0;
    let totalFat = 0;
    let totalMutagen = 0;

    for (let i = 0; i < tier; i++) {
      totalProtein += data.tiers[i].protein;
      totalMineral += data.tiers[i].mineral;
      totalFat += data.tiers[i].fat;
      totalMutagen += data.tiers[i].mutagen;
    }

    document.getElementById('total-protein').textContent = '× ' + totalProtein;
    document.getElementById('total-mineral').textContent = '× ' + totalMineral;
    document.getElementById('total-fat').textContent = '× ' + totalFat;
    document.getElementById('total-mutagen').textContent = '× ' + totalMutagen;

    document.getElementById('total-mat-protein').style.display = totalProtein > 0 ? 'flex' : 'none';
    document.getElementById('total-mat-mineral').style.display = totalMineral > 0 ? 'flex' : 'none';
    document.getElementById('total-mat-fat').style.display = totalFat > 0 ? 'flex' : 'none';
    document.getElementById('total-mat-mutagen').style.display = totalMutagen > 0 ? 'flex' : 'none';

    // パッシブと特殊能力
    if (data.passive) {
      renderLineBreakText(document.getElementById('detail-passive'), t.passive, { highlightNumbers: true });
      document.getElementById('section-passive').style.display = 'block';
    } else {
      document.getElementById('section-passive').style.display = 'none';
    }

    if (data.special) {
      renderLineBreakText(document.getElementById('detail-special'), t.special, { highlightNumbers: true });
      document.getElementById('section-special').style.display = 'block';
    } else {
      document.getElementById('section-special').style.display = 'none';
    }

    if (data.ability) {
      renderLineBreakText(document.getElementById('detail-ability-desc'), data.abilityDesc);
      renderLineBreakText(document.getElementById('detail-ability-effect'), t.abilityEffect, { highlightNumbers: true });
      document.getElementById('section-ability').style.display = 'block';
    } else {
      document.getElementById('section-ability').style.display = 'none';
    }
  }

  updateTier(1);
  slider.addEventListener('input', () => updateTier(Number(slider.value)));
}
