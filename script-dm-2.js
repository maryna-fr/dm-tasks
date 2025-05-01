 // Функція для парсингу множини
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


        // Функція для перевірки валідності множини
        function validateSet(input, setName) {
            const trimmed = input.trim();
            if (!trimmed) return `Помилка: множина ${setName} порожня!`;
            const items = trimmed.split(',').map(item => item.trim());
            for (let item of items) {
                if (!/^-?\d+$/.test(item)) {
                    return `Помилка: множина ${setName} містить некоректні елементи!`;
                }
            }
            return "";
        }

        // Функція для генерації таблиці матриці відношення
        function generateTable(matrix, setA, setB) {
            let html = '<table border="1" cellspacing="0" cellpadding="5">';
            html += `<tr><th colspan="2" rowspan="2" class="header-cell"></th><th colspan="${setB.length}" class="header-cell">B</th></tr>`;
            html += `<tr>${setB.map(b => `<th class="header-cell">${b}</th>`).join('')}</tr>`;
            setA.forEach((a, i) => {
                if (i === 0) {
                    html += `<tr><th rowspan="${setA.length}" class="header-cell">A</th><th class="header-cell">${a}</th>`;
                } else {
                    html += `<tr><th class="header-cell">${a}</th>`;
                }
                html += matrix[i].map(value => `<td class="number-cell">${value}</td>`).join('');
                html += '</tr>';
            });
            html += '</table>';
            return html;
        }

        // Функція для малювання діаграми
        function drawHasseDiagram(relation, setA, setB) {
            const canvas = document.getElementById("HasseCanvas");
            const ctx = canvas.getContext("2d");
            canvas.style.display = "block";
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Визначаємо максимальну довжину числа в множині A (як рядок)
            const maxLabelLengthA = Math.max(...setA.map(a => ("" + a).length), 1);
            const labelWidth = maxLabelLengthA * 10; // Приблизно 10 пікселів на символ

            // Збільшуємо ширину полотна, якщо є числа з 10+ цифрами
            const baseWidth = 400;
            const extraWidth = maxLabelLengthA >= 10 ? (maxLabelLengthA - 9) * 10 : 0; // Додаємо 10 пікселів за кожну цифру понад 9
            canvas.width = baseWidth + extraWidth;
            const width = canvas.width;
            const height = canvas.height;

            const nodeCount = Math.max(setA.length, setB.length, 1);
            const spacingY = height / (nodeCount + 1);

            // Динамічне зміщення для міток чисел A
            const offsetA = labelWidth + 10; // 10 пікселів для запасу
            const nodeAX = width * 0.3; // Позиція вузлів A
            const labelAX = nodeAX - offsetA; // Мітки чисел A зсунуто ліворуч

            // Позиціонування вузлів
            const nodeA = setA.map((a, i) => ({
                x: nodeAX,
                y: spacingY * (i + 1) || height / 2, // Центрування для одного елемента
                label: a
            }));

            const nodeB = setB.map((b, i) => ({
                x: width * 0.7,
                y: spacingY * (i + 1) || height / 2, // Центрування для одного елемента
                label: b
            }));

            ctx.font = "bold 32px Arial";
            ctx.fillStyle = "black";
            // Малюємо A і B (оригінальні позиції)
            ctx.fillText("A", width * 0.15, height / 2);
            ctx.fillText("B", width * 0.85, height / 2);

            ctx.font = "18px Arial"; // Більший шрифт для чисел

            // Малюємо точки
            for (let node of nodeA.concat(nodeB)) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI);
                ctx.fill();
                // Зміщення міток: A лівіше з урахуванням offsetA, B правіше
                const labelX = nodeA.includes(node) ? labelAX : node.x + 8;
                ctx.fillText(node.label, labelX, node.y + 4);
            }

            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;

            for (let [a, b] of relation) {
                let from = nodeA.find(n => n.label === a);
                let to = nodeB.find(n => n.label === b);
                if (from && to) {
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const unitX = dx / length;
                    const unitY = dy / length;
                    const radius = 4;

                    const newFromX = from.x + unitX * radius;
                    const newFromY = from.y + unitY * radius;
                    const newToX = to.x - unitX * radius;
                    const newToY = to.y - unitY * radius;

                    ctx.beginPath();
                    ctx.moveTo(newFromX, newFromY);
                    ctx.lineTo(newToX, newToY);
                    ctx.stroke();

                    const arrowSize = 6;
                    const angle = Math.atan2(dy, dx);
                    ctx.beginPath();
                    ctx.moveTo(newToX, newToY);
                    ctx.lineTo(newToX - arrowSize * Math.cos(angle - Math.PI / 6), newToY - arrowSize * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(newToX, newToY);
                    ctx.lineTo(newToX - arrowSize * Math.cos(angle + Math.PI / 6), newToY - arrowSize * Math.sin(angle + Math.PI / 6));
                    ctx.stroke();
                }
            }
        }

        // Основна функція для обчислення
        function Calculate() {
            document.getElementById('Res').innerHTML = '';

            const setAInput = document.getElementById('setA').value;
            const setBInput = document.getElementById('setB').value;
            const condition = document.getElementById('R').value.trim();

            // Валідація множин
            const errorA = validateSet(setAInput, "A");
            const errorB = validateSet(setBInput, "B");
            if (errorA || errorB) {
                document.getElementById('Res').innerHTML = `<b style="color:red;">${errorA || errorB}</b>`;
                document.getElementById("HasseTitle").style.display = "none";
                document.getElementById("HasseCanvas").style.display = "none";
                return;
            }

            const setA = parseSet(setAInput);
            const setB = parseSet(setBInput);

            if (setA.length === 0 || setB.length === 0) {
                document.getElementById('Res').innerHTML = `<b style="color:red;">Помилка: множини A або B порожні!</b>`;
                document.getElementById("HasseTitle").style.display = "none";
                document.getElementById("HasseCanvas").style.display = "none";
                return;
            }

            if (!condition) {
                document.getElementById('Res').innerHTML = `<b style="color:red;">Помилка: введіть умову для R!</b>`;
                document.getElementById("HasseTitle").style.display = "none";
                document.getElementById("HasseCanvas").style.display = "none";
                return;
            }

            const regexX = /x/g;
            const regexY = /y/g;

            const relation = [];
            const complementR = [];

            try {
                for (let a of setA) {
                    for (let b of setB) {
                        let evalCondition = condition.replace(regexX, a).replace(regexY, b);
                        let isRelated = new Function(`return (${evalCondition});`)();
                        if (isRelated) {
                            relation.push([a, b]);
                        } else {
                            complementR.push([a, b]);
                        }
                    }
                }
            } catch (error) {
                document.getElementById('Res').innerHTML = `<b style="color:red;">Помилка у введеній умові!</b>`;
                document.getElementById("HasseTitle").style.display = "none";
                document.getElementById("HasseCanvas").style.display = "none";
                return;
            }

            const matrix = setA.map(a => setB.map(b => (relation.some(pair => pair[0] === a && pair[1] === b) ? 1 : 0)));
            const domain = [...new Set(relation.map(pair => pair[0]))];
            const range = [...new Set(relation.map(pair => pair[1]))];
            const reverseR = relation.map(pair => [pair[1], pair[0]]);

            const results = `
                A × B = { ${setA.flatMap(a => setB.map(b => `(${a},${b})`)).join(', ')} } <br>
                <b>|A × B| = ${setA.length * setB.length}</b><br><br>
                R = { ${relation.map(pair => `(${pair[0]},${pair[1]})`).join(', ')} }<br>
                <b>|R| = ${relation.length}</b><br>
                <div style="margin-top: 20px;">Матриця відношення:</div>
                ${generateTable(matrix, setA, setB)}<br>
                ${relation.length > 0 ? '<div style="margin-top: 20px;">Діаграма Хассе:</div><canvas id="HasseCanvas" width="400" height="300"></canvas><br>' : ''}
                D<sub>R</sub> = { ${domain.join(', ')} }<br><br>
                E<sub>R</sub> = { ${range.join(', ')} }<br><br>
                R<sup>-1</sup> = { ${reverseR.map(pair => `(${pair[0]},${pair[1]})`).join(', ')} }<br><br>
                <span style='text-decoration:overline;'>R</span> = { ${complementR.map(pair => `(${pair[0]},${pair[1]})`).join(', ')} }<br><br>
            `;

            document.getElementById('Res').innerHTML = results;

            if (relation.length > 0) {
                document.getElementById("HasseTitle").style.display = "block";
                drawHasseDiagram(relation, setA, setB);
            } else {
                document.getElementById("HasseTitle").style.display = "none";
                document.getElementById("HasseCanvas").style.display = "none";
            }
        }

        function autofillSets() {
            const optionValue = document.getElementById('presetOptions').value;
            if (!optionValue) {
                document.getElementById('setA').value = "";
                document.getElementById('setB').value = "";
                document.getElementById('R').value = "";
                return;
            }
            const [A, B, R] = optionValue.split('||');
            document.getElementById('setA').value = A;
            document.getElementById('setB').value = B;
            document.getElementById('R').value = R;
        }

        function clearResults() {
            document.getElementById('Res').innerHTML = "";
            document.getElementById("HasseTitle").style.display = "none";
            const canvas = document.getElementById("HasseCanvas");
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = "none";
        }

        document.addEventListener("DOMContentLoaded", function() {
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

            //кнопка обчислення
        document.getElementById("calcBtn").addEventListener("click", Calculate);

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


        
       
