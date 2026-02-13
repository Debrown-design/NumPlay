export const generateMathQuestion = (gradeLevel) => {
  let q = "";
  let answer = 0;
  let options = [];
  
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


  switch (gradeLevel) {
    case 1: 
      {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        q = `${a} + ${b} = ?`;
        answer = a + b;
      }
      break;
    case 2: 
      {
        const a = randomInt(10, 30);
        const b = randomInt(1, a);
        q = `${a} - ${b} = ?`;
        answer = a - b;
      }
      break;
    case 3: 
      {
        const a = randomInt(2, 10);
        const b = randomInt(2, 10);
        q = `${a} × ${b} = ?`;
        answer = a * b;
      }
      break;
    case 4: 
      {
        const b = randomInt(2, 9);
        const ans = randomInt(2, 9);
        const a = b * ans;
        q = `${a} ÷ ${b} = ?`;
        answer = ans;
      }
      break;
    case 5: 
      {
        const a = randomInt(5, 15);
        const b = randomInt(2, 4);
        const c = randomInt(1, 20);
        q = `(${a} × ${b}) + ${c} = ?`;
        answer = (a * b) + c;
      }
      break;
    case 6: 
      {
        const a = randomInt(2, 12);
        q = `${a}² = ?`;
        answer = a * a;
      }
      break;
    case 7: 
      {
        const a = randomInt(-10, 10);
        const b = randomInt(1, 20);
        q = `${a} - ${b} = ?`;
        answer = a - b;
      }
      break;
    case 8: 
      {
        const x = randomInt(2, 10);
        const a = randomInt(2, 5);
        const b = randomInt(1, 15);
        const c = a * x + b;
        q = `Solve: ${a}x + ${b} = ${c}`;
        answer = x;
      }
      break;
    case 9: 
      {
        const m = randomInt(2, 6);
        const b = randomInt(1, 20);
        const type = randomInt(1, 2);
        if (type === 1) {
          q = `Slope of y = ${m}x + ${b}?`;
          answer = m;
        } else {
          q = `Y-intercept of y = 2x + ${b}?`;
          answer = b;
        }
      }
      break;
    case 10: 
      {
        const side = randomInt(4, 12);
        const type = randomInt(1, 2);
        if (type === 1) {
          q = `Area of square (side ${side})`;
          answer = side * side;
        } else {
          const s = randomInt(2, 5);
          q = `Volume of cube (side ${s})`;
          answer = s * s * s;
        }
      }
      break;
    case 11: 
      {
        const x = randomInt(4, 15);
        const type = randomInt(1, 2);
        if (type === 1) {
          q = `√${x * x} = ?`;
          answer = x;
        } else {
          const a = randomInt(1, 5);
          const b = randomInt(1, 5);
          q = `(x + ${a})(x + ${b}) constant?`;
          answer = a * b;
        }
      }
      break;
    case 12: 
      {
        const type = randomInt(1, 2);
        if (type === 1) {
          const exp = randomInt(2, 5);
          const val = Math.pow(2, exp);
          q = `log₂(${val}) = ?`;
          answer = exp;
        } else {
          q = `sin(90°) = ?`;
          answer = 1;
        }
      }
      break;
    default:
      {
        const a = randomInt(1, 10);
        const b = randomInt(1, 10);
        q = `${a} + ${b} = ?`;
        answer = a + b;
      }
  }

  
  options = [answer.toString()];
  while (options.length < 4) {
    const offset = randomInt(-5, 5);
    const wrong = answer + offset;
    if (wrong !== answer && !options.includes(wrong.toString())) {
      options.push(wrong.toString());
    }
  }

  options.sort(() => Math.random() - 0.5);

  return {
    question: q,
    options,
    correctAnswerIndex: options.indexOf(answer.toString())
  };
};

export const generateIntegerQuestion = (level = 1) => {
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  let q, answer;
  const category = randomInt(1, 5); 

  switch (category) {
    case 1: 
      {
        const a = randomInt(-25, 25);
        const b = randomInt(-25, 25);
        const op = Math.random() > 0.5 ? '+' : '-';
        q = `${a} ${op} (${b}) = ?`;
        answer = op === '+' ? a + b : a - b;
      }
      break;
    case 2: 
      {
        const x = randomInt(-10, 15);
        const b = randomInt(1, 20);
        const type = randomInt(1, 2);
        if (type === 1) {
          q = `Solve: x + ${b} = ${x + b}`;
        } else {
          q = `Solve: x - ${b} = ${x - b}`;
        }
        answer = x;
      }
      break;
    case 3: 
      {
        const a = randomInt(-30, -5);
        const b = randomInt(5, 20);
        q = `|${a}| + ${b} = ?`;
        answer = Math.abs(a) + b;
      }
      break;
    case 4: 
      {
        const base = randomInt(2, 6);
        const mult = randomInt(2, 5);
        const type = randomInt(1, 2);
        if (type === 1) {
          q = `Simplify ratio ${base * mult}:${mult}`;
          answer = base; 
        } else {
          q = `If 1 toy costs $${base}, how much for ${mult}?`;
          answer = base * mult;
        }
      }
      break;
    case 5: 
      {
        const percentages = [10, 20, 25, 50];
        const pct = percentages[randomInt(0, percentages.length - 1)];
        const total = randomInt(1, 10) * (pct === 25 ? 4 : 10);
        q = `${pct}% of ${total} = ?`;
        answer = (pct / 100) * total;
      }
      break;
    default:
      q = "10 + 10 = ?";
      answer = 20;
  }

  const options = [answer.toString()];
  while (options.length < 4) {
    const offset = randomInt(-10, 10);
    const wrong = answer + (offset === 0 ? 5 : offset);
    if (wrong !== answer && !options.includes(wrong.toString())) {
      options.push(wrong.toString());
    }
  }
  options.sort(() => Math.random() - 0.5);

  return {
    question: q,
    options,
    correctAnswerIndex: options.indexOf(answer.toString())
  };
};

const RACER_QUESTIONS_BANK = [
  { q: "Solve for x: log₂(x) = 6", a: "64", options: ["32", "64", "128", "16"] },
  { q: "What is the value of sin(30°)?", a: "0.5", options: ["0.5", "0.866", "1", "0.707"] },
  { q: "Derivative of f(x) = 4x²", a: "8x", options: ["4x", "8x", "x²", "16x"] },
  { q: "Solve: 2x + 15 = 35", a: "10", options: ["5", "10", "15", "20"] },
  { q: "Value of cos(π)", a: "-1", options: ["0", "1", "-1", "0.5"] },
  { q: "Calculate √196", a: "14", options: ["12", "14", "16", "18"] },
  { q: "i² is equal to:", a: "-1", options: ["1", "-1", "0", "i"] },
  { q: "Interior angles of a pentagon sum to:", a: "540°", options: ["360°", "540°", "720°", "180°"] },
  { q: "Value of 5!", a: "120", options: ["60", "100", "120", "720"] },
  { q: "Slope of the line y = -5x + 3", a: "-5", options: ["5", "-5", "3", "-3"] },
  { q: "Solve for x: 3^(x-1) = 27", a: "4", options: ["2", "3", "4", "5"] },
  { q: "What is log₁₀(1000)?", a: "3", options: ["1", "2", "3", "4"] },
  { q: "Area of a circle with radius 10 (approx)", a: "314", options: ["31.4", "62.8", "314", "100"] },
  { q: "Hypotenuse of triangle with legs 5 & 12", a: "13", options: ["10", "13", "15", "17"] },
  { q: "Value of tan(45°)", a: "1", options: ["0", "1", "√3", "√2/2"] },
  { q: "If f(x) = x³ - 8, find f(2)", a: "0", options: ["0", "2", "4", "8"] },
  { q: "What is 20% of 250?", a: "50", options: ["25", "40", "50", "60"] },
  { q: "Solve for x: x/4 + 2 = 10", a: "32", options: ["16", "24", "32", "40"] },
  { q: "Midpoint between (2, 4) and (8, 10)", a: "(5, 7)", options: ["(4, 6)", "(5, 7)", "(6, 8)", "(10, 14)"] },
  { q: "Degrees in 2π/3 radians", a: "120°", options: ["60°", "90°", "120°", "180°"] }
];

export const generateRacerQuestion = () => {
  const index = Math.floor(Math.random() * RACER_QUESTIONS_BANK.length);
  const data = RACER_QUESTIONS_BANK[index];
  
  
  return {
    question: data.q,
    options: data.options,
    correctAnswerIndex: data.options.indexOf(data.a)
  };
};