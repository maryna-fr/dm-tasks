function parseSet(input) {
    if (!input.trim()) return [];
    
    // Видаляємо всі пробіли і залишаємо лише цифри та коми
    let cleanedInput = input.trim().replace(/\s+/g, '');
    
    // Перевіряємо, чи введення містить лише цифри і коми
    if (!/^[0-9,]+$/.test(cleanedInput)) {
        throw new Error("Некоректне введення");
    }
    
    let numbers = cleanedInput.split(',').map(x => parseInt(x.trim())).filter(x => !isNaN(x));
    return [...new Set(numbers)].sort((a, b) => a - b);
}


// Сортування та форматування множини для виведення
function formatSet(set) {
  return `{ ${[...set].sort((a,b)=>{return a-b}).join(', ')} }`;
}

// Різниця множин A \ B
function difference(setA, setB) {
  return setA.filter(element => setB.indexOf(element) === -1);
}

// Об’єднання множин A ∪ B
function union(setA, setB) {
  return [...setA, ...setB.filter(element => setA.indexOf(element) === -1)];
}

// Перетин множин A ∩ B
function intersection(setA, setB) {
  return setA.filter(element => setB.indexOf(element) !== -1);
}

// Симетрична різниця множин A Δ B
function symmetricDifference(setA, setB) {
  const diffAB = difference(setA, setB);
  const diffBA = difference(setB, setA);
  return [...diffAB, ...diffBA];
}

// Доповнення множини A відносно універсальної множини U : U \ A
function complement(universe, set) {
  return difference(universe, set);
}

// Очищення полів вводу
function clearFields() {
  document.getElementById('setA').value = '';
  document.getElementById('setB').value = '';
  document.getElementById('setC').value = '';
  document.getElementById('setU').value = '';
  document.getElementById('Res').innerHTML = '';
}

// Очищення результатів
function clearResults() {
    document.getElementById('Res').innerHTML = '';
}

// Автоматичне заповнення полів на основі варіанта
function autofillSets() {
  const optionValue = document.getElementById('presetOptions').value;

  if (!optionValue) {
    clearFields(); 
    return;
  }
  
  const [setA, setB, setC, setU] = optionValue.split('||');
  document.getElementById('setA').value = setA;
  document.getElementById('setB').value = setB;
  document.getElementById('setC').value = setC;
  document.getElementById('setU').value = setU;

  clearResults();
}

// Основна функція для обчислення результатів
function Calculate() {
  try{
  const setA = parseSet(document.getElementById('setA').value);
  const setB = parseSet(document.getElementById('setB').value);
  const setC = parseSet(document.getElementById('setC').value);
  const setU = parseSet(document.getElementById('setU').value);

 // Додаткова перевірка
 if (setU.length === 0) {
  throw new Error("Універсальна множина повинна містити хоча б один елемент!");
}

  // Обчислення 
  const complementCB = difference(setC, setB); // C \ B
  const complementCBBar = complement(setU, complementCB); // (C \ B)'
  const D = intersection(complementCBBar, setA); // (C \ B)' ∩ A
  const unionBC = union(setB, setC); // B ∪ C
  const AminusUnionBC = difference(setA, unionBC); // A \ (B ∪ C)
  const unionBCminusA = difference(unionBC, setA); // (B ∪ C) \ A
  const E = symmetricDifference(setA, unionBC); // A Δ (B ∪ C)

  
  const results = `
    C \\ B = ${formatSet(complementCB)}<br><br>
    <span style='text-decoration:overline;'>C \\ B</span> = ${formatSet(complementCBBar)}<br><br>
    D = (<span style='text-decoration:overline;'>C \\ B</span>) &cap; A = ${formatSet(D)}<br><br>
    <hr width='50%'><br>
    B &cup; C = ${formatSet(unionBC)}<br><br>
    A \\ (B &cup; C) = ${formatSet(AminusUnionBC)}<br><br>
    (B &cup; C) \\ A = ${formatSet(unionBCminusA)}<br><br>
    E = A &Delta; (B &cup; C) = ${formatSet(E)}<br><br>
  `;


  document.getElementById('Res').innerHTML = results;
} catch (error) {
  document.getElementById('Res').innerHTML = `<b style="color:red;">Помилка: ${error.message}</span>`;
}
}

document.addEventListener("DOMContentLoaded", function() {
  //кнопка обчислення
  document.getElementById('calculateBtn').addEventListener('click', Calculate);

  // Додаємо Обробники подій "input" і "change" для всіх полів
  document.querySelectorAll('input[type="text"], select').forEach(element => {
    element.addEventListener('input', clearResults);
    element.addEventListener('change', clearResults);
});

document.getElementById('presetOptions').addEventListener('change', autofillSets);

const presetSelect = document.getElementById('presetOptions');
const inputs = document.querySelectorAll('input[type="text"]');



// Очищення результатів і скидання presetSelect при зміні полів вводу
inputs.forEach(input => {
    input.addEventListener('input', () => {
        clearResults();
        presetSelect.value = ""; // Скидаємо до "Виберіть варіант ..."
    });
    input.addEventListener('change', () => {
        clearResults();
        presetSelect.value = ""; // Скидаємо до "Виберіть варіант ..."
    });
});

// Очищення результатів при зміні presetSelect, але без скидання самого select
presetSelect.addEventListener('change', () => {
    clearResults();
    autofillSets();
});

// Логіка навігації
const pages = ['DM-1', 'DM-2', 'DM-3', 'DM-4'];
  let currentPage = window.location.pathname.split('/').pop();

  if (!currentPage || currentPage === 'index.html') {
    currentPage = 'DM-1';
  }

  currentPage = currentPage.toLowerCase().replace('.html', '');

  console.log('Current page:', currentPage);

  const currentIndex = pages.findIndex(page => page.toLowerCase() === currentPage);
  console.log('Current index:', currentIndex);
  
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const homeBtn = document.getElementById('homeBtn');

// Перевірка наявності кнопок
if (!prevBtn || !nextBtn || !homeBtn) {
  console.error('One or more navigation buttons are missing:', { prevBtn, nextBtn, homeBtn });
  return;
}

// Логіка для кнопки "Назад"
if (currentIndex <= 0) {
  console.log('Disabling prev button because this is the first page');
  prevBtn.disabled = true;
} else {
  console.log('Adding click event to prev button');
  prevBtn.addEventListener('click', function() {
    window.location.href = pages[currentIndex - 1];
  });
}

// Логіка для кнопки "Вперед"
if (currentIndex >= pages.length - 1) {
  console.log('Disabling next button because this is the last page');
  nextBtn.disabled = true;
} else {
  console.log('Adding click event to next button');
  nextBtn.addEventListener('click', function() {
    window.location.href = pages[currentIndex + 1];
  });
}

// Логіка для кнопки "На головну"
if (currentPage === 'index.html') {
  console.log('Disabling home button because current page is index.html');
  homeBtn.disabled = true;
} else {
  console.log('Adding click event to home button to redirect to index.html');
  homeBtn.addEventListener('click', function() {
    console.log('Redirecting to index.html');
    window.location.href = 'index.html';
  });
}

});

