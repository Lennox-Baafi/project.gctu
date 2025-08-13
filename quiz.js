
// Initialize quiz functionality
function initQuiz() {
    // Check if there's an ongoing quiz in session storage
    const quizData = sessionStorage.getItem('currentQuiz');
    if (quizData) {
        openQuizModal();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initQuiz);
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded"); // Debug line
    
    // Get references to all buttons
    const mathBtn = document.getElementById('math-btn');
    const scienceBtn = document.getElementById('science-btn');
    const historyBtn = document.getElementById('history-btn');
    
    console.log("Button references:", {mathBtn, scienceBtn, historyBtn}); // Debug line

    // Add click event listeners
    mathBtn.addEventListener('click', function() {
        console.log("Math button clicked"); // Debug line
        loadQuiz('math');
    });
    
    scienceBtn.addEventListener('click', function() {
        console.log("Science button clicked");
        loadQuiz('science');
    });
    
    historyBtn.addEventListener('click', function() {
        console.log("History button clicked");
        loadQuiz('history');
    });

    // Rest of your code...
});

function loadQuiz(subject) {
    console.log(`Loading ${subject} quiz`); // Debug line
    
    // Ensure we have questions for this subject
    if (!quizQuestions[subject]) {
        console.error(`No questions found for ${subject}`);
        alert(`Sorry, the ${subject} quiz isn't available yet.`);
        return;
    }

    selectedSubject = subject;
    currentScore = 0;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    // Hide subject selection and show quiz
    document.getElementById('subject-selection').classList.add('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');
    
    // Update quiz title
    document.getElementById('quiz-title').textContent = 
        `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz`;
    
    // Load first question
    showQuestion();
}
// Sample questions database
const quizQuestions = {
  mathematics: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: 1, // Index of correct option (0-based)
      explanation: "Basic addition: 2 + 2 = 4"
    },
    {
      question: "What is 5 × 3?",
      options: ["8", "12", "15", "18"],
      answer: 2,
      explanation: "5 multiplied by 3 equals 15"
    },
    {
      question: "What is 10 ÷ 2?",
      options: ["2", "3", "4", "5"],
      answer: 3,
      explanation: "10 divided by 2 equals 5"
    }
  ],
  science: [
    {
      question: "What is the chemical symbol for water?",
      options: ["H2O", "CO2", "NaCl", "O2"],
      answer: 0,
      explanation: "Water is composed of two hydrogen atoms and one oxygen atom"
    },
    {
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      answer: 1,
      explanation: "Mars appears red due to iron oxide on its surface"
    }
  ],
  history: [
    {
      question: "In which year did World War II end?",
      options: ["1943", "1945", "1950", "1939"],
      answer: 1,
      explanation: "World War II ended in 1945"
    }
  ]
};

let currentScore = 0;
let currentQuestionIndex = 0;
let selectedSubject = null;
let userAnswers = [];

function loadQuiz(subject) {
  selectedSubject = subject;
  currentScore = 0;
  currentQuestionIndex = 0;
  userAnswers = [];
  
  document.getElementById('quiz-title').textContent = `${subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz`;
  document.getElementById('subject-selection').classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  
  showQuestion();
}

function showQuestion() {
  const questions = quizQuestions[selectedSubject];
  const currentQuestion = questions[currentQuestionIndex];
  
  document.getElementById('question-number').textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  document.getElementById('question-text').textContent = currentQuestion.question;
  
  const optionsContainer = document.getElementById('options-container');
  optionsContainer.innerHTML = '';
  
  currentQuestion.options.forEach((option, index) => {
    const optionElement = document.createElement('div');
    optionElement.className = 'option';
    optionElement.textContent = option;
    optionElement.dataset.index = index;
    optionElement.addEventListener('click', selectOption);
    optionsContainer.appendChild(optionElement);
  });
  
  updateProgressBar();
}

function selectOption(e) {
  // Remove previous selection
  document.querySelectorAll('.option').forEach(opt => {
    opt.classList.remove('selected');
  });
  
  // Mark selected option
  e.target.classList.add('selected');
  
  // Store user's answer
  userAnswers[currentQuestionIndex] = parseInt(e.target.dataset.index);
}

function nextQuestion() {
  const questions = quizQuestions[selectedSubject];
  
  // Verify an option was selected
  if (typeof userAnswers[currentQuestionIndex] === 'undefined') {
    alert('Please select an answer');
    return;
  }
  
  // Check if answer was correct
  if (userAnswers[currentQuestionIndex] === questions[currentQuestionIndex].answer) {
    currentScore++;
  }
  
  currentQuestionIndex++;
  
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  const questions = quizQuestions[selectedSubject];
  const scorePercentage = Math.round((currentScore / questions.length) * 100);
  
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('results-container').classList.remove('hidden');
  
  document.getElementById('score').textContent = `${currentScore} out of ${questions.length} (${scorePercentage}%)`;
  
  // Generate feedback
  let feedback = '';
  if (scorePercentage >= 80) {
    feedback = 'Excellent work!';
  } else if (scorePercentage >= 60) {
    feedback = 'Good job, but keep practicing!';
  } else {
    feedback = 'Keep studying! Review the material and try again.';
  }
  document.getElementById('feedback').textContent = feedback;
  
  // Display answer review
  const reviewContainer = document.getElementById('answer-review');
  reviewContainer.innerHTML = '<h3>Answer Review</h3>';
  
  questions.forEach((question, index) => {
    const userAnswerIndex = userAnswers[index];
    const isCorrect = userAnswerIndex === question.answer;
    
    const questionElement = document.createElement('div');
    questionElement.className = `review-item ${isCorrect ? 'correct' : 'incorrect'}`;
    questionElement.innerHTML = `
      <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
      <p>Your answer: ${question.options[userAnswerIndex]}</p>
      ${!isCorrect ? `<p>Correct answer: ${question.options[question.answer]}</p>` : ''}
      <p class="explanation">${question.explanation}</p>
    `;
    reviewContainer.appendChild(questionElement);
  });
}

function updateProgressBar() {
  const questions = quizQuestions[selectedSubject];
  const progress = ((currentQuestionIndex) / questions.length) * 100;
  document.getElementById('progress-bar').style.width = `${progress}%`;
}

function restartQuiz() {
  document.getElementById('results-container').classList.add('hidden');
  document.getElementById('subject-selection').classList.remove('hidden');
}

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('math-btn').addEventListener('click', () => loadQuiz('math'));
  document.getElementById('science-btn').addEventListener('click', () => loadQuiz('science'));
  document.getElementById('history-btn').addEventListener('click', () => loadQuiz('history'));
  
  document.getElementById('next-btn').addEventListener('click', nextQuestion);
  document.getElementById('restart-btn').addEventListener('click', restartQuiz);

});

// Local Storage Quiz System
document.addEventListener('DOMContentLoaded', function() {
  // Premade quizzes data
  const premadeQuizzes = {
    math: {
      title: "Mathematics Quiz",
      questions: [
        {
          text: "What is 2 + 2?",
          options: ["3", "4", "5", "6"],
          answer: 2
        },
        {
          text: "What is 3 × 5?",
          options: ["10", "15", "20", "25"],
          answer: 2
        }
      ]
    },
    science: {
      title: "Science Quiz",
      questions: [
        {
          text: "What is H₂O?",
          options: ["Gold", "Water", "Salt", "Oxygen"],
          answer: 2
        }
      ]
    }
  };

  // Initialize quiz buttons
  document.querySelectorAll('.quiz-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const subject = this.dataset.subject;
      startQuiz(premadeQuizzes[subject]);
    });
  });

  // Quiz functions
  function startQuiz(quizData) {
    // Store quiz in session
    sessionStorage.setItem('currentQuiz', JSON.stringify({
      ...quizData,
      startTime: Date.now(),
      answers: new Array(quizData.questions.length).fill(null)
    }));
    
    displayQuiz(quizData);
  }

  function displayQuiz(quiz) {
    const modal = document.getElementById('quizModal');
    document.getElementById('quizTitle').textContent = quiz.title;
    
    // Display questions
    const questionsHTML = quiz.questions.map((q, i) => `
      <div class="question">
        <h4>${i+1}. ${q.text}</h4>
        <div class="options">
          ${q.options.map((opt, j) => `
            <div class="option" data-q="${i}" data-a="${j}">
              ${opt}
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
    
    document.getElementById('quizQuestions').innerHTML = questionsHTML;
    
    // Add option selection
    document.querySelectorAll('.option').forEach(opt => {
      opt.addEventListener('click', function() {
        const qIndex = parseInt(this.dataset.q);
        const aIndex = parseInt(this.dataset.a);
        
        // Update UI
        this.parentNode.querySelectorAll('.option').forEach(o => 
          o.classList.remove('selected'));
        this.classList.add('selected');
        
        // Save answer
        const quiz = JSON.parse(sessionStorage.getItem('currentQuiz'));
        quiz.answers[qIndex] = aIndex + 1;
        sessionStorage.setItem('currentQuiz', JSON.stringify(quiz));
      });
    });
    
    modal.style.display = 'block';
  }

  // Submit quiz
  document.getElementById('submitQuiz').addEventListener('click', function() {
    const quiz = JSON.parse(sessionStorage.getItem('currentQuiz'));
    if (!quiz) return;
    
    // Calculate score
    let correct = 0;
    quiz.questions.forEach((q, i) => {
      if (quiz.answers[i] === q.answer) correct++;
    });
    
    const score = Math.round((correct / quiz.questions.length) * 100);
    const timeTaken = Math.floor((Date.now() - quiz.startTime) / 1000);
    
    // Save result
    saveQuizResult({
      title: quiz.title,
      score: score,
      date: new Date().toISOString(),
      correct: correct,
      total: quiz.questions.length
    });
    
    // Show result
    alert(`You scored ${score}% (${correct}/${quiz.questions.length})`);
    closeQuizModal();
    updateDashboard();
  });

  // Close modal
  document.querySelector('.close').addEventListener('click', closeQuizModal);
});

// Local storage functions
function saveQuizResult(result) {
  const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
  history.unshift(result); // Add newest first
  localStorage.setItem('quizHistory', JSON.stringify(history));
}

function getQuizHistory() {
  return JSON.parse(localStorage.getItem('quizHistory') || '[]');
}

function closeQuizModal() {
  document.getElementById('quizModal').style.display = 'none';
}
