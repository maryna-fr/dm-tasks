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

function generateEmptyMatrix(size) {
    return Array(size).fill(0).map(() => Array(size).fill(0));
}

function isRelationTrue(x, y, relation) {
    try {
        // Видаляємо пробіли на початку і в кінці, а також замінюємо кілька пробілів на один
        let cleanedRelation = relation.trim().replace(/\s+/g, ' ');
        
        // Перевіряємо, чи вираз порожній після очищення
        if (!cleanedRelation) {
            throw new Error("Некоректне введення");
        }

        // Замінюємо x і y на їх значення
        let expression = cleanedRelation.replace(/\bx\b/g, x).replace(/\by\b/g, y);
        
        // Виконуємо вираз
        return Function(`"use strict";return (${expression})`)();
    } catch (e) {
        throw new Error("Некоректне введення");
    }
}

function generateMatrix(setA, relation) {
    let matrix = generateEmptyMatrix(setA.length);
    for (let i = 0; i < setA.length; i++) {
        for (let j = 0; j < setA.length; j++) {
            if (isRelationTrue(setA[i], setA[j], relation)) {
                matrix[i][j] = 1;
            }
        }
    }
    return matrix;
}

function displayMatrix(matrix, setA, clickable = true) {
    if (!setA.length) return "Множина порожня - матриця не створюється";
    
    let html = '<table border="1" cellspacing="0" cellpadding="5">';
    html += `<tr><th colspan="2" rowspan="2"></th><th colspan="${setA.length}">A</th></tr>`;
    html += `<tr>${setA.map(a => `<th>${a}</th>`).join('')}</tr>`;
    
    setA.forEach((a, i) => {
        if (i === 0) {
            html += `<tr><th rowspan="${setA.length}">A</th><th>${a}</th>`;
        } else {
            html += `<tr><th>${a}</th>`;
        }
        html += matrix[i].map((value, j) => 
            `<td id="cell-${i}-${j}" ${clickable ? `onclick="toggleCell(${i},${j})" style="cursor:pointer"` : ''}>${value}</td>`
        ).join('');
        html += '</tr>';
    });
    
    html += '</table>';
    return html;
}

function toggleCell(i, j) {
    let cell = document.getElementById(`cell-${i}-${j}`);
    cell.innerText = cell.innerText === '0' ? '1' : '0';
    // Очищаємо результати при зміні матриці
    document.getElementById('Res').innerHTML = '';
    // Скидаємо вибір варіанту
    document.getElementById('presetOptions').value = '';
}

function getMatrixFromTable(setA) {
    let matrix = generateEmptyMatrix(setA.length);
    for (let i = 0; i < setA.length; i++) {
        for (let j = 0; j < setA.length; j++) {
            let cell = document.getElementById(`cell-${i}-${j}`);
            if (cell) matrix[i][j] = parseInt(cell.innerText) || 0;
        }
    }
    return matrix;
}

function updateMatrix() {
    let setAInput = document.getElementById('setA').value;
    let setA;
    try {
        setA = parseSet(setAInput);
    } catch (e) {
        document.getElementById('matrix').innerHTML = '';
        document.getElementById('Res').innerHTML = `<b style="color: red;">Помилка: ${e.message}</span>`;
        return;
    }

    // Якщо множина порожня, очищаємо матрицю і результати
    if (setA.length === 0) {
        document.getElementById('matrix').innerHTML = "Множина порожня - матриця не створюється";
        document.getElementById('Res').innerHTML = '';
        return;
    }

    let matrix = generateEmptyMatrix(setA.length);
    document.getElementById('matrix').innerHTML = displayMatrix(matrix, setA);
    document.getElementById('Res').innerHTML = '';
}

// Перевірка рефлексивності
function checkReflexive(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][i] !== 1) {
            return `R не є рефлексивним, бо (${setA[i]},${setA[i]}) ∉ R`;
        }
    }
    return "R є рефлексивним";
}

// Перевірка антирефлексивності
function checkAntireflexive(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        if (matrix[i][i] === 1) {
            return `R не є антирефлексивним, бо (${setA[i]},${setA[i]}) ∈ R`;
        }
    }
    return "R є антирефлексивним";
}

// Перевірка симетричності
function checkSymmetric(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (matrix[i][j] === 1 && matrix[j][i] !== 1) {
                return `R не є симетричним, бо (${setA[i]},${setA[j]}) ∈ R, але (${setA[j]},${setA[i]}) ∉ R`;
            }
        }
    }
    return "R є симетричним";
}

// Перевірка антисиметричності
function checkAntisymmetric(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (i !== j && matrix[i][j] === 1 && matrix[j][i] === 1) {
                return `R не є антисиметричним, бо (${setA[i]},${setA[j]}) ∈ R і (${setA[j]},${setA[i]}) ∈ R, але ${setA[i]} ≠ ${setA[j]}`;
            }
        }
    }
    return "R є антисиметричним";
}

// Перевірка транзитивності
function checkTransitive(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            for (let k = 0; k < matrix.length; k++) {
                if (matrix[i][j] === 1 && matrix[j][k] === 1 && matrix[i][k] !== 1) {
                    return `R не є транзитивним, бо (${setA[i]},${setA[j]}) ∈ R і (${setA[j]},${setA[k]}) ∈ R, але (${setA[i]},${setA[k]}) ∉ R`;
                }
            }
        }
    }
    return "R є транзитивним";
}

// Перевірка, чи є відношення порівнюваним
function checkComparable(matrix, setA) {
    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix.length; j++) {
            if (i !== j && matrix[i][j] === 0 && matrix[j][i] === 0) {
                return `R не є відношенням лінійного порядку, бо елементи ${setA[i]} і ${setA[j]} не порівнювані: (${setA[i]},${setA[j]}) ∉ R і (${setA[j]},${setA[i]}) ∉ R`;
            }
        }
    }
    return "R є відношенням лінійного порядку";
}

// Знаходження класів еквівалентності
function findEquivalenceClasses(matrix, setA) {
    let classes = [];
    let visited = new Set();
    for (let i = 0; i < matrix.length; i++) {
        if (!visited.has(i)) {
            let cls = [];
            for (let j = 0; j < matrix.length; j++) {
                if (matrix[i][j] === 1 && matrix[j][i] === 1) {
                    cls.push(setA[j]);
                    visited.add(j);
                }
            }
            if (cls.length > 0) classes.push(cls);
        }
    }
    return classes;
}

// Основна функція для обчислень
function Calculate() {
    let setAInput = document.getElementById('setA').value;
    let setA;
    try {
        setA = parseSet(setAInput);
    } catch (e) {
        document.getElementById('Res').innerHTML = `<b style="color: red;">Помилка: ${e.message}</span>`;

        return;
    }

    // Якщо множина порожня, очищаємо результати і завершуємо
    if (setA.length === 0) {
        document.getElementById('Res').innerHTML = '';
        return;
    }

    let relation = document.getElementById('R').value;
    let isRelationMode = document.querySelector('input[name="mode"]:checked') === document.querySelector('input[type="radio"]:first-child');
    
    // Перевірка коректності введення для поля R (якщо в матричному режимі, це не потрібно)
    if (isRelationMode && !relation.trim()) {
        document.getElementById('Res').innerHTML = "Помилка: Некоректне введення";
        return;
    }

    let matrix;
    try {
        matrix = isRelationMode ? 
            generateMatrix(setA, relation) : 
            getMatrixFromTable(setA);
    } catch (e) {
        document.getElementById('Res').innerHTML = `<b style="color: red;">Помилка: ${e.message}</span>`;

        return;
    }

    let result = "Матриця відношення:<br>";
    result += displayMatrix(matrix, setA, false) + "<br>";
    
    // Перевірка основних властивостей
    let reflexiveResult = checkReflexive(matrix, setA);
    let antireflexiveResult = checkAntireflexive(matrix, setA);
    let symmetricResult = checkSymmetric(matrix, setA);
    let antisymmetricResult = checkAntisymmetric(matrix, setA);
    let transitiveResult = checkTransitive(matrix, setA);

    result += reflexiveResult + "<br><br>";
    result += antireflexiveResult + "<br><br>";
    result += symmetricResult + "<br><br>";
    result += antisymmetricResult + "<br><br>";
    result += transitiveResult + "<br><br>";

    // Перевірка на відношення еквівалентності
    let isEquivalence = (reflexiveResult === "R є рефлексивним") && 
                       (symmetricResult === "R є симетричним") && 
                       (transitiveResult === "R є транзитивним");
    
    if (isEquivalence) {
        let classes = findEquivalenceClasses(matrix, setA);
        result += "R є відношенням еквівалентності<br>";
        
        // Виводимо класи еквівалентності для кожного елемента
        result += "Класи еквівалентності елементів:<br>";
        setA.forEach(x => {
            let equivalenceClass = classes.find(cls => cls.includes(x));
            result += `[${x}]<sub>R</sub> = {${equivalenceClass.join(",")}}`;
        });
        result += "<br>";

        // Виводимо розбиття множини A на систему класів
        result += "Розбиття множини A на систему класів:<br>";
        classes.forEach((cls, index) => {
            result += `A<sub>${index + 1}</sub> = {${cls.join(",")}}`;
            if (index < classes.length - 1) result += ", ";
        });
        result += "<br><br>";
    } else {
        let reasons = [];
        if (reflexiveResult !== "R є рефлексивним") reasons.push("рефлексивним");
        if (symmetricResult !== "R є симетричним") reasons.push("симетричним");
        if (transitiveResult !== "R є транзитивним") reasons.push("транзитивним");
        result += `R не є відношенням еквівалентності, бо воно не є ${reasons.join(", не є ")}<br><br>`;
    }

    // Перевірка на відношення порядку
    let isOrder = (antisymmetricResult === "R є антисиметричним") && 
                 (transitiveResult === "R є транзитивним");
    
    if (isOrder) {
        result += "R є відношенням порядку<br><br>";

        // Перевірка на строгий/нестрогий порядок
        let isReflexive = (reflexiveResult === "R є рефлексивним");
        let isAntireflexive = (antireflexiveResult === "R є антирефлексивним");

        if (isReflexive) {
            result += "R є відношенням нестрогого порядку<br><br>";
        } else {
            result += `R не є відношенням нестрогого порядку, бо воно не є рефлексивним<br><br>`;
        }

        if (isAntireflexive) {
            result += "R є відношенням строгого порядку<br><br>";
        } else {
            result += `R не є відношенням строгого порядку, бо воно не є антирефлексивним<br><br>`;
        }

        // Перевірка на лінійний порядок
        let comparableResult = checkComparable(matrix, setA);
        result += comparableResult + "<br><br>";
        
        if (comparableResult === "R є відношенням лінійного порядку") {
            if (isReflexive) {
                result += "R є відношенням нестрогого лінійного порядку<br><br>";
            } else {
                result += `R не є відношенням нестрогого лінійного порядку, бо воно не є рефлексивним<br><br>`;
            }

            if (isAntireflexive) {
                result += "R є відношенням строгого лінійного порядку<br><br>";
            } else {
                result += `R не є відношенням строгого лінійного порядку, бо воно не є антирефлексивним<br><br>`;
            }
        } else {
            result += `R не є відношенням нестрогого лінійного порядку, бо воно не є відношенням лінійного порядку<br><br>`;
            result += `R не є відношенням строгого лінійного порядку, бо воно не є відношенням лінійного порядку<br><br>`;
        }
    } else {
        let reasons = [];
        if (antisymmetricResult !== "R є антисиметричним") reasons.push("антисиметричним");
        if (transitiveResult !== "R є транзитивним") reasons.push("транзитивним");
        result += `R не є відношенням порядку, бо воно не є ${reasons.join(", не є ")}<br><br>`;
        result += `R не є відношенням нестрогого порядку, бо воно взагалі не є відношенням порядку<br><br>`;
        result += `R не є відношенням строгого порядку, бо воно взагалі не є відношенням порядку<br><br>`;
        result += `R не є відношенням лінійного порядку, бо воно взагалі не є відношенням порядку<br><br>`;
        result += `R не є відношенням нестрогого лінійного порядку, бо воно взагалі не є відношенням порядку<br><br>`;
        result += `R не є відношенням строгого лінійного порядку, бо воно взагалі не є відношенням порядку<br><br>`;
    }

    document.getElementById('Res').innerHTML = result;
}

function resetPresetSelection() {
    document.getElementById('presetOptions').value = '';
}

function autofillSets() {
    let option = document.getElementById('presetOptions').value;
    document.getElementById('Res').innerHTML = '';
    if (option) {
        let [setA, , relation] = option.split('||');
        // Зберігаємо попередні значення для порівняння
        let prevSetA = document.getElementById('setA').value;
        let prevR = document.getElementById('R').value;
        
        document.getElementById('setA').value = setA;
        document.getElementById('R').value = relation;

        // Якщо значення не змінилося, не скидаємо вибір
        if (prevSetA === setA && prevR === relation) {
            return;
        }
    }
    if (document.getElementById('matrix').style.display === 'block') {
        updateMatrix();
    }
}


document.addEventListener("DOMContentLoaded", function () {
// Очищення при зміні полів
    document.getElementById('setA').addEventListener('input', function() {
        document.getElementById('Res').innerHTML = '';
        resetPresetSelection();
        if (document.getElementById('matrix').style.display === 'block') updateMatrix();
    });

    document.getElementById('R').addEventListener('input', function() {
        document.getElementById('Res').innerHTML = '';
        resetPresetSelection();
    });

//кнопка обчислення
    document.getElementById("calcBtn").addEventListener("click", Calculate);



    const matrix = document.getElementById("matrix");
    const res = document.getElementById("Res");
    const modeText = document.getElementById("modeText");
    const modeMatrix = document.getElementById("modeMatrix");

  
    modeText.addEventListener("click", function () {
        matrix.style.display = 'none';
        res.innerHTML = '';
    });

    modeMatrix.addEventListener("click", function () {
        matrix.style.display = 'block';
        res.innerHTML = '';
        updateMatrix();
    });

     // Логіка навігації
     const pages = ['DM-1.html', 'DM-2.html', 'DM-3.html', 'DM-4.html'];
     const currentPage = window.location.pathname.split('/').pop();
     console.log('Current page:', currentPage);
   
     const currentIndex = pages.indexOf(currentPage);
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
     
     document.getElementById("presetOptions").addEventListener("change", autofillSets);
});



