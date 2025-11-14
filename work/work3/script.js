"use strict";

// DOM элементы
const btn = document.getElementById('go');
const results = document.getElementById('results');
const selectFormula = document.getElementById('formula');

// Пути к изображениям (файлы лежат В ЭТОЙ ЖЕ папке work3)
const formulaImg = [ null,
  'formula_1.JPG',
  'formula_2.JPG',
  'formula_3.JPG'
];
const smileOk  = 'sm_1.png';
const smileBad = 'sm_2.png';

// Кэш предзагруженных изображений
const IMG_CACHE = Object.create(null);

// Предзагрузка изображений
function preloadImages(urls) {
  return Promise.all(
    urls.map(url => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { IMG_CACHE[url] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = url;
    }))
  );
}

// Авто-инициализация
(async function init() {
  const all = [formulaImg[1], formulaImg[2], formulaImg[3], smileOk, smileBad];
  await preloadImages(all);
  btn.disabled = false;
})();

// Формулы
const calc1 = (a, b, c) => Math.PI * Math.sqrt(a * a) / (b * b * c);
const calc2 = (a, b, c) => Math.pow(a + Math.sqrt(b), 2) / Math.pow(c, 3);
const calc3 = (a, b, c) => (Math.sqrt(a) + b + Math.sqrt(c)) / (Math.PI * b);
const calculators = [ null, calc1, calc2, calc3 ];

// Проверки
const check1 = (a, b, c) => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return 'Введите числа.';
  if (b === 0 || c === 0) return 'Деление на ноль (b или c = 0).';
  return null;
};
const check2 = (a, b, c) => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return 'Введите числа.';
  if (b < 0) return 'Подкоренное выражение: b < 0.';
  if (c === 0) return 'Деление на ноль (c = 0).';
  return null;
};
const check3 = (a, b, c) => {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return 'Введите числа.';
  if (a < 0 || c < 0) return 'Подкоренное выражение: a < 0 или c < 0.';
  if (b === 0) return 'Деление на ноль (b = 0).';
  return null;
};
const validators = [ null, check1, check2, check3 ];

// Ввод
function askABC() {
  const sa = prompt('Введите a:'); if (sa === null) return { cancel: true };
  const sb = prompt('Введите b:'); if (sb === null) return { cancel: true };
  const sc = prompt('Введите c:'); if (sc === null) return { cancel: true };
  return { cancel: false, a: Number(sa), b: Number(sb), c: Number(sc) };
}

// Создаём img (высоту задаём сразу — как в твоём исходнике)
function createImg(src, className, alt, heightPx) {
  const img = document.createElement('img');
  img.className = className;
  img.alt = alt;
  img.decoding = 'sync';
  img.loading = 'eager';
  img.src = src;
  if (heightPx) img.style.height = heightPx + 'px';
  return img;
}

// Карточка результата
function addCard(formulaNo, text, ok) {
  const card = document.createElement('div');
  card.className = 'result-card';   // новый класс (без "card")

  const img = createImg(formulaImg[formulaNo], 'formula', 'Формула ' + formulaNo, 54);
  const p = document.createElement('p');
  p.textContent = 'Результат: ' + text;
  const sm = createImg(ok ? smileOk : smileBad, 'smile', ok ? 'успешно' : 'ошибка', 28);

  card.appendChild(img);
  card.appendChild(p);
  card.appendChild(sm);
  results.appendChild(card);
}

// Финальная карточка
function addEndCard() {
  const end = document.createElement('div');
  end.className = 'result-card result-end'; // новый класс
  end.textContent = 'Вычисления завершены';
  results.appendChild(end);
}

// Дождаться отрисовки перед confirm()
function nextPaint() {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      results.offsetHeight;
      requestAnimationFrame(resolve);
    });
  });
}

// Основная логика
let mode = 'idle';

btn.addEventListener('click', async function () {
  if (btn.disabled) return;

  const choice = Number(selectFormula.value);
  if (![1,2,3].includes(choice)) {
    alert('Сначала выберите формулу (1–3).');
    return;
  }

  const input = askABC();
  if (input.cancel) return;
  const { a, b, c } = input;

  const err = validators[choice](a, b, c);
  if (err) {
    addCard(choice, err, false);
  } else {
    const value = calculators[choice](a, b, c);
    const ok = Number.isFinite(value);
    addCard(choice, ok ? value.toFixed(4) : 'Ошибка вычисления', ok);
  }

  await nextPaint();
  const cont = confirm('Продолжаем дальше?');

  if (cont) {
    mode = 'await-next';
    btn.textContent = 'Продолжить';
  } else {
    addEndCard();
    mode = 'idle';
    btn.textContent = 'Посчитать';
  }
});
