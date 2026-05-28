/* =============================================
   Calculator — CodeAlpha Internship Project
   Developer : Lalit Yadav
   Task       : 02 — Basic Calculator
   File       : script.js
   ============================================= */

'use strict';

/* ── DOM References ── */
const resultEl = document.getElementById('result');
const exprEl   = document.getElementById('expression');

/* ── State ── */
let current    = '0';   // number currently on screen
let prev       = null;  // previous operand
let operator   = null;  // pending operator
let freshInput = false; // next digit replaces display
let justEvaled = false; // result was just calculated

/* ══════════════════════════════════
   DISPLAY HELPERS
══════════════════════════════════ */

/**
 * Push current state to the display.
 * Shrinks font when the number is long.
 */
function updateDisplay() {
  resultEl.textContent = current;
  const len = current.replace('-', '').length;
  if      (len > 13) resultEl.style.fontSize = '20px';
  else if (len > 10) resultEl.style.fontSize = '28px';
  else if (len > 7)  resultEl.style.fontSize = '34px';
  else               resultEl.style.fontSize = '40px';
}

/** Brief colour-flash on the result when = is pressed. */
function flash() {
  resultEl.classList.add('flash');
  setTimeout(() => resultEl.classList.remove('flash'), 200);
}

/** Highlight the active operator button. */
function highlightOp(val) {
  document.querySelectorAll('.btn.op').forEach(btn => {
    btn.classList.toggle('active-op', btn.dataset.value === val);
  });
}

/** Remove all operator highlights. */
function clearActiveOp() {
  document.querySelectorAll('.btn.op').forEach(btn =>
    btn.classList.remove('active-op')
  );
}

/* ══════════════════════════════════
   CORE CALCULATOR LOGIC
══════════════════════════════════ */

/** Handle a digit button press. */
function inputNum(val) {
  // After a finished evaluation, start fresh
  if (justEvaled) {
    prev       = null;
    operator   = null;
    justEvaled = false;
  }

  if (freshInput) {
    current    = (val === '.') ? '0.' : val;
    freshInput = false;
  } else {
    if (current === '0' && val !== '.') {
      current = val;
    } else if (current.length < 16) {
      current += val;
    }
  }

  updateDisplay();
}

/** Handle the decimal point button. */
function inputDecimal() {
  if (freshInput) {
    current    = '0.';
    freshInput = false;
    updateDisplay();
    return;
  }
  if (!current.includes('.')) {
    current += '.';
    updateDisplay();
  }
}

/** Handle an operator button press (+, −, ×, ÷). */
function inputOp(op) {
  justEvaled = false;

  // Chain operations: calculate previous pending op first
  if (operator && !freshInput) {
    calculate(false);
  }

  prev       = parseFloat(current);
  operator   = op;
  freshInput = true;

  exprEl.textContent = `${formatNum(prev)} ${op}`;
  highlightOp(op);
}

/**
 * Perform the pending calculation.
 * @param {boolean} final — true when = is pressed; false for chained ops
 */
function calculate(final = true) {
  if (prev === null || operator === null) return;

  const a = prev;
  const b = parseFloat(current);
  let result;

  switch (operator) {
    case '+': result = a + b;                              break;
    case '−': result = a - b;                              break;
    case '×': result = a * b;                              break;
    case '÷': result = (b === 0) ? null : a / b;          break;
    default:  return;
  }

  if (result === null) {
    // Division by zero
    current    = 'Error';
    exprEl.textContent = `${formatNum(a)} ${operator} 0 =`;
    operator   = null;
    prev       = null;
    freshInput = true;
    justEvaled = true;
    clearActiveOp();
    updateDisplay();
    return;
  }

  // Round floating-point imprecision
  const rounded = parseFloat(result.toFixed(10)).toString();

  if (final) {
    exprEl.textContent = `${formatNum(a)} ${operator} ${formatNum(b)} =`;
    clearActiveOp();
    flash();
    operator   = null;
    prev       = null;
    justEvaled = true;
  }

  current    = rounded;
  freshInput = true;
  updateDisplay();
}

/** Clear everything — reset to initial state. */
function clearAll() {
  current    = '0';
  prev       = null;
  operator   = null;
  freshInput = false;
  justEvaled = false;
  exprEl.textContent = '';
  clearActiveOp();
  updateDisplay();
}

/** Toggle positive / negative sign of the current number. */
function toggleSign() {
  if (current === '0' || current === 'Error') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay();
}

/** Convert current number to its percentage equivalent. */
function applyPercent() {
  if (current === 'Error') return;
  current = (parseFloat(current) / 100).toString();
  updateDisplay();
}

/** Delete the last typed digit (Backspace). */
function deleteLast() {
  if (current === 'Error') { current = '0'; updateDisplay(); return; }
  if (freshInput || justEvaled) return;
  current = current.length > 1 ? current.slice(0, -1) : '0';
  updateDisplay();
}

/* ══════════════════════════════════
   UTILITY
══════════════════════════════════ */

/** Format a number for the expression line (trim long decimals). */
function formatNum(n) {
  return parseFloat(n.toFixed(6)).toString();
}

/* ══════════════════════════════════
   EVENT LISTENERS — MOUSE / TOUCH
══════════════════════════════════ */

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const { action, value } = btn.dataset;
    switch (action) {
      case 'num':     inputNum(value);    break;
      case 'decimal': inputDecimal();     break;
      case 'op':      inputOp(value);     break;
      case 'equals':  calculate(true);    break;
      case 'clear':   clearAll();         break;
      case 'sign':    toggleSign();       break;
      case 'percent': applyPercent();     break;
    }
  });
});

/* ══════════════════════════════════
   EVENT LISTENERS — KEYBOARD
══════════════════════════════════ */

document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') {
    inputNum(e.key);
  } else {
    switch (e.key) {
      case '.':
        inputDecimal(); break;
      case '+':
        inputOp('+'); break;
      case '-':
        inputOp('−'); break;
      case '*':
        inputOp('×'); break;
      case '/':
        e.preventDefault();
        inputOp('÷'); break;
      case 'Enter':
      case '=':
        calculate(true); break;
      case 'Backspace':
        deleteLast(); break;
      case 'Escape':
        clearAll(); break;
      case '%':
        applyPercent(); break;
    }
  }
});