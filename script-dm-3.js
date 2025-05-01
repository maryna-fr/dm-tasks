document.addEventListener('DOMContentLoaded', function() {
    formula.focus();
  
    var direction = '',
        mouseDownOffset = null;
  
    function getDirection(e) {
      if (e.type == 'mousedown') mouseDownOffset = e.clientX;
      else if (e.type == 'mouseup') {
        direction = e.clientX < mouseDownOffset ? 'left' : 'right';
      }
    }
  
    function FixPosition() {
      if (direction == 'right') {
        formula.selectionStart = formula.selectionEnd;
        if (formula.selectionStart == 0) return;
        formula.removeEventListener("select", FixPosition);
        while (formula.value[formula.selectionStart - 1] != ' ') {
          formula.selectionEnd = formula.selectionEnd + 1;
          formula.selectionStart = formula.selectionEnd;
        }
        formula.addEventListener("select", FixPosition);
      } else {
        formula.selectionEnd = formula.selectionStart;
        if (formula.selectionStart == 0) return;
        formula.removeEventListener("select", FixPosition);
        if (formula.value[formula.selectionStart] == ' ') {
          formula.selectionStart = formula.selectionStart + 1;
          formula.selectionEnd = formula.selectionStart;
          formula.addEventListener("select", FixPosition);
          return;
        }
        while (formula.selectionStart > 0 && formula.value[formula.selectionStart - 1] != ' ') {
          formula.selectionStart = formula.selectionStart - 1;
          formula.selectionEnd = formula.selectionStart;
        }
        formula.addEventListener("select", FixPosition);
      }
    }
  
    formula.addEventListener("keydown", function() {
      event.preventDefault();
    }, false);
  
    formula.addEventListener("click", FixPosition);
  
    formula.addEventListener("mousedown", function() {
      getDirection(event);
    }, false);
  
    formula.addEventListener("mouseup", function() {
      getDirection(event);
    }, false);
  
    formula.addEventListener("select", FixPosition);
  
    // Факторіал
    function factorial(n) {
      n = BigInt(n);
      if (n < 0n) throw new Error("Факторіал визначений лише для невід'ємних чисел");
      let result = 1n;
      for (let i = 2n; i <= n; i++) {
        result *= i;
      }
      return result;
    }
  
    // C(n,k)
    function C(n, k) {
      n = BigInt(n);
      k = BigInt(k);
      if (k < 0n || k > n) return 0n;
      return factorial(n) / (factorial(k) * factorial(n - k));
    }
  
    // C̅(n,k)
    function C_(n, k) {
      n = BigInt(n);
      k = BigInt(k);
      if (k < 0n) return 0n;
      if (n <= 0n && k === 0n) return 1n;
      if (n <= 0n) return 0n;
      return C(n + k - 1n, k);
    }
  
    // A(n,k)
    function A(n, k) {
      n = BigInt(n);
      k = BigInt(k);
      if (k < 0n || k > n) return 0n;
      return factorial(n) / factorial(n - k);
    }
  
    // A̅(n,k)
    function A_(n, k) {
      n = BigInt(n);
      k = BigInt(k);
      if (k < 0n) return 0n;
      if (n === 0n && k === 0n) return 1n;
      if (n === 0n) return 0n;
      return n ** k;
    }
  
    // P(n)
    function P(n) {
      return factorial(BigInt(n));
    }
  
    // P̅(n1,n2,...,nk)
    function P_(...args) {
      args = args.map(BigInt);
      const n = args.reduce((sum, val) => sum + val, 0n);
      if (args.some(val => val < 0n)) return 0n;
      const denominator = args.reduce((prod, val) => prod * factorial(val), 1n);
      return factorial(n) / denominator;
    }
  
    function evaluateExpression(expr) {
      const tokens = expr.trim().split(" ").filter(t => t !== "");
      const values = [];
      const operators = [];
      const stack = []; // Стек для значень
      const opStack = []; // Стек для операторів
  
      const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  
      function applyOperator() {
        if (values.length < 2 || operators.length < 1) throw new Error("Некоректний вираз.");
        const b = values.pop();
        const a = values.pop();
        const op = operators.pop();
        let result;
        switch (op) {
          case "+": result = a + b; break;
          case "-": result = a - b; break;
          case "*": result = a * b; break;
          case "/":
            if (b === 0n) throw new Error("Ділення на нуль.");
            result = a / b;
            break;
        }
        values.push(result);
      }
  
      for (let token of tokens) {
        if (token === "(") {
          // Відкриваюча дужка: додаємо стек
          stack.push([...values]);
          opStack.push([...operators]);
          values.length = 0;
          operators.length = 0;
        } else if (token === ")") {
          // Закриваюча дужка: обчислюємо вираз у дужках
          if (stack.length === 0) throw new Error("Невідповідність дужок: зайва закриваюча дужка.");
          while (operators.length > 0) {
            applyOperator();
          }
          if (values.length !== 1) throw new Error("Некоректний вираз у дужках.");
          const result = values.pop();
          values.length = 0;
          operators.length = 0;
          values.push(...stack.pop(), result);
          operators.push(...opStack.pop());
        } else if (["+", "-", "*", "/"].includes(token)) {
          while (
            operators.length > 0 &&
            precedence[operators[operators.length - 1]] >= precedence[token]
          ) {
            applyOperator();
          }
          operators.push(token);
        } else {
          const match = token.match(/^([A-Z_]+)\(([^)]+)\)$/);
          if (match) {
            const func = match[1];
            const args = match[2].split(",").map(a => parseInt(a.trim()));
            let result;
            switch (func) {
              case "C": result = C(args[0], args[1]); break;
              case "C_": result = C_(args[0], args[1]); break;
              case "A": result = A(args[0], args[1]); break;
              case "A_": result = A_(args[0], args[1]); break;
              case "P": result = P(args[0]); break;
              case "P_": result = P_(...args); break;
              default: throw new Error(`Невідома функція: ${func}`);
            }
            values.push(result);
          } else {
            throw new Error(`Некоректний токен: ${token}`);
          }
        }
      }
  
      if (stack.length > 0) throw new Error("Невідповідність дужок: не вистачає закриваючої дужки.");
  
      while (operators.length > 0) {
        applyOperator();
      }
  
      if (values.length !== 1) throw new Error("Некоректний вираз.");
      return values[0];
    }
  
    function AddInput(s) {
      resultArea.style.display = "none";
      const ignored = new Set(["(", ")", "+", "-", "*", "/"]);
      if (!ignored.has(s)) {
        let args;
        let expectedArgs;
        if (s == "P") {
          args = prompt("Введіть аргумент числа:", "0");
          expectedArgs = 1;
        } else {
          args = prompt("Введіть аргументи числа через кому:", "0,0");
          expectedArgs = (s === "P_") ? null : 2;
        }
        if (args != null) {
          const argArray = args.split(",").map(a => a.trim());
          // Перевірка кількості аргументів
          if (expectedArgs !== null && argArray.length !== expectedArgs) {
            alert(`Помилка: ${s} потребує ${expectedArgs} аргумент${expectedArgs === 1 ? "" : "и"}.`);
            return;
          }
          // Перевірка, чи всі аргументи є цілими невід'ємними числами
          if (!argArray.every(a => /^\d+$/.test(a))) {
            alert("Помилка: Усі аргументи мають бути цілими невід'ємними числами.");
            return;
          }
          s += `(${args})`;
        } else {
          return;
        }
      }
      tmp = formula.selectionStart;
      formula.value = formula.value.substring(0, tmp) + s.trim() + " " + formula.value.substring(tmp, formula.value.length);
      formula.selectionStart = formula.selectionEnd = tmp + s.length + 1;
      formula.focus();
    }
  
    document.querySelectorAll(".normal").forEach(function(item) {
      item.addEventListener("click", function() {
        AddInput(this.value);
      }, false);
    });
  
    function Backspace() {
      resultArea.style.display = "none";
      formula.removeEventListener("select", FixPosition);
      do {
        if (formula.selectionStart != 0) {
          formula.setRangeText("", formula.selectionStart - 1, formula.selectionEnd, "start");
        }
        formula.focus();
      } while (formula.selectionStart != 0 && (formula.value[formula.selectionStart - 1] != ' '))
      setTimeout(function() { formula.addEventListener("select", FixPosition); }, 10);
    }
  
    buttonBackspace.addEventListener("click", Backspace);
  
    function Clear() {
      resultArea.style.display = "none";
      formula.value = "";
      formula.focus();
    }
  
    buttonClear.addEventListener("click", Clear);
  
    buttonCalc.addEventListener("click", function() {
      try {
        const expr = formula.value.trim();
        if (!expr) {
          alert("Введіть вираз для обчислення.");
          return;
        }
        const result = evaluateExpression(expr);
        if (result < 0n) {
          throw new Error("Результат не може бути від'ємним.");
        }
        resultArea.style.display = "block";
        document.getElementById("result").value = result.toString();
        document.getElementById("result").title = `Цифр у числі: ${result.toString().length}`;
      } catch (e) {
        alert(`Помилка: ${e.message}`);
        resultArea.style.display = "none";
      }
    }, false);
  
    // Функція копіювання значення поля з заданим ідентифікатором в буфер обміну
    function CopyToClipboard(id) {
      buttonCopy.style.visibility = "hidden";
      var tmp = document.createElement('input');
      focus = document.activeElement;
      tmp.value = document.getElementById(id).value;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
      focus.focus();
      setTimeout(function() { buttonCopy.style.visibility = "visible"; }, 100);
    }
  
    // Задання обробника для кнопки копіювання
    buttonCopy.addEventListener("click", function() {
      CopyToClipboard("result");
    }, false);
  
  
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
  
  
  });
  