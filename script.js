// Simple calculator
// Supports: +, -, ×, ÷, %, backspace, clear, decimal, keyboard input

const expressionEl = document.getElementById('expression');
const resultEl = document.getElementById('result');

let currentInput = '0';
let previousInput = '';
let operator = null;
let shouldResetInput = false;
let justEvaluated = false;

// --- Helper ---
function formatNumber(n) {
    if (n === undefined || n === null) return '0';
    const str = typeof n === 'string' ? n : String(n);
    // Limit length
    if (str.length > 12) {
        return parseFloat(str).toExponential(4);
    }
    return str;
}

function updateDisplay(expression = '') {
    // Format result
    let display = currentInput;
    if (currentInput.length > 12) {
        resultEl.classList.add('small');
    } else {
        resultEl.classList.remove('small');
    }
    if (currentInput.length > 16) {
        resultEl.classList.add('xsmall');
    } else {
        resultEl.classList.remove('xsmall');
    }
    resultEl.textContent = display || '0';
    expressionEl.textContent = expression;
}

function evaluate(a, op, b) {
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    let result;
    switch (op) {
        case '+': result = numA + numB; break;
        case '-': result = numA - numB; break;
        case '×': result = numA * numB; break;
        case '÷':
            if (numB === 0) return 'Error';
            result = numA / numB;
            break;
        case '%': result = numA % numB; break;
        default: return numB;
    }
    // Avoid floating point noise
    return Math.round(result * 1e12) / 1e12;
}

function getDisplayOperator(op) {
    const map = { '+': '+', '-': '−', '×': '×', '÷': '÷', '%': '%' };
    return map[op] || op;
}

// --- Actions ---
function inputNumber(value) {
    if (justEvaluated) {
        currentInput = '0';
        operator = null;
        previousInput = '';
        justEvaluated = false;
    }
    if (shouldResetInput) {
        currentInput = '0';
        shouldResetInput = false;
    }
    if (value === '.' && currentInput.includes('.')) return;
    if (value === '.' && currentInput === '') {
        currentInput = '0.';
    } else if (currentInput === '0' && value !== '.') {
        currentInput = value;
    } else {
        if (currentInput.length >= 16) return;
        currentInput += value;
    }
    updateDisplay(buildExpression());
}

function inputOperator(op) {
    justEvaluated = false;
    if (operator && !shouldResetInput) {
        // Chain calculation
        const result = evaluate(previousInput, operator, currentInput);
        if (result === 'Error') {
            currentInput = 'Error';
            operator = null;
            previousInput = '';
            updateDisplay('');
            return;
        }
        currentInput = String(result);
    }
    operator = op;
    previousInput = currentInput;
    shouldResetInput = true;
    updateDisplay(buildExpression());
}

function inputEquals() {
    if (!operator) return;
    const result = evaluate(previousInput, operator, currentInput);
    if (result === 'Error') {
        currentInput = 'Error';
        operator = null;
        previousInput = '';
        updateDisplay('');
        return;
    }
    const expr = `${formatNumber(previousInput)} ${getDisplayOperator(operator)} ${formatNumber(currentInput)} =`;
    currentInput = String(result);
    operator = null;
    previousInput = '';
    shouldResetInput = true;
    justEvaluated = true;
    updateDisplay(expr);
}

function inputClear() {
    currentInput = '0';
    operator = null;
    previousInput = '';
    shouldResetInput = false;
    justEvaluated = false;
    updateDisplay('');
}

function inputBackspace() {
    if (shouldResetInput || justEvaluated) return;
    if (currentInput.length <= 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay(buildExpression());
}

function inputPercent() {
    const num = parseFloat(currentInput);
    if (isNaN(num)) return;
    currentInput = String(num / 100);
    updateDisplay(buildExpression());
}

function buildExpression() {
    if (!operator) return '';
    return `${formatNumber(previousInput)} ${getDisplayOperator(operator)}`;
}

// --- Event handlers ---
document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    const value = btn.dataset.value;
    const action = btn.dataset.action;

    if (value !== undefined) {
        inputNumber(value);
    } else if (action === 'clear') {
        inputClear();
    } else if (action === 'backspace') {
        inputBackspace();
    } else if (action === 'percent') {
        inputPercent();
    } else if (action === 'equals') {
        inputEquals();
    } else if (['add', 'subtract', 'multiply', 'divide'].includes(action)) {
        const opMap = { add: '+', subtract: '-', multiply: '×', divide: '÷' };
        inputOperator(opMap[action]);
    }
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
    } else if (e.key === '.') {
        inputNumber('.');
    } else if (e.key === '+') {
        inputOperator('+');
    } else if (e.key === '-') {
        inputOperator('-');
    } else if (e.key === '*') {
        inputOperator('×');
    } else if (e.key === '/') {
        e.preventDefault();
        inputOperator('÷');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        inputEquals();
    } else if (e.key === 'Backspace') {
        inputBackspace();
    } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        inputClear();
    } else if (e.key === '%') {
        inputPercent();
    }
});

// Init
updateDisplay('');
