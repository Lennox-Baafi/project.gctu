let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizResults = [];

function initQuiz() {
    const subjectListItems = document.querySelectorAll('#subjectList li');
    subjectListItems.forEach(item => {
        item.addEventListener('click', function() {
            loadQuizzesForSubject(this.dataset.subject);
        });
    });
    
    document.getElementById('nextQuestion').addEventListener('click', nextQuestion);
    document.getElementById('retakeQuiz').addEventListener('click', retakeQuiz);
    document.getElementById('viewAnswers').addEventListener('click', viewAnswers);
}

function loadQuizzesForSubject(subject) {
    document.getElementById('quizTitle').textContent = `Quizzes for ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;
    
    getQuizzesBySubject(subject).then(quizzes => {
        const quizList = document.getElementById('quizList');
        quizList.innerHTML = '';
        
        if (quizzes.length === 0) {
            quizList.innerHTML = '<p>No quizzes available for this subject yet.</p>';
            return;
        }
        
        quizzes.forEach(quiz => {
            const quizCard = document.createElement('div');
            quizCard.className = 'quiz-card';
            quizCard.innerHTML = `
                <h3>${quiz.name}</h3>
                <p>${quiz.questions.length} questions</p>
                <p>Created by: ${quiz.createdBy}</p>
            `;
            quizCard.addEventListener('click', function() {
                startQuiz(quiz);
            });
            quizList.appendChild(quizCard);
        });
    }).catch(error => {
        console.error('Error loading quizzes:', error);
        alert('Failed to load quizzes. Please try again.');
    });
}

function startQuiz(quiz) {
    currentQuiz = quiz;
    currentQuestionIndex = 0;
    userAnswers = [];
    
    document.getElementById('quizSelection').classList.add('hidden');
    document.getElementById('quizTaking').classList.remove('hidden');
    
    document.getElementById('currentQuizName').textContent = quiz.name;
    document.getElementById('totalQuestions').textContent = quiz.questions.length;
    
    loadQuestion();
}

function loadQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    document.getElementById('currentQuestionNumber').textContent = currentQuestionIndex + 1;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        optionElement.addEventListener('click', function() {
            selectOption(this);
        });
        optionsContainer.appendChild(optionElement);
    });
    
    // Update progress bar
    const progress = ((currentQuestionIndex) / currentQuiz.questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

function selectOption(optionElement) {
    // Remove selected class from all options
    const options = document.querySelectorAll('.option');
    options.forEach(opt => opt.classList.remove('selected'));
    
    // Add selected class to clicked option
    optionElement.classList.add('selected');
    
    // Store the user's answer
    userAnswers[currentQuestionIndex] = parseInt(optionElement.dataset.index);
}

function nextQuestion() {
    // Check if an option is selected
    if (typeof userAnswers[currentQuestionIndex] === 'undefined') {
        alert('Please select an answer before proceeding.');
        return;
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuiz.questions.length) {
        loadQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    // Calculate score
    let correctAnswers = 0;
    currentQuiz.questions.forEach((question, index) => {
        if (userAnswers[index] === question.answer) {
            correctAnswers++;
        }
    });
    
    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    
    // Save result
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        const result = {
            userId: currentUser.email,
            quizId: currentQuiz.id,
            score,
            answers: userAnswers,
            completedAt: new Date().toISOString()
        };
        
        addResult(result).then(() => {
            // Update user stats
            if (currentUser.userType === 'student') {
                currentUser.quizzesTaken = (currentUser.quizzesTaken || 0) + 1;
                
                // Calculate new average score
                const totalQuizzes = currentUser.quizzesTaken;
                const currentAverage = currentUser.averageScore || 0;
                currentUser.averageScore = Math.round(((currentAverage * (totalQuizzes - 1)) + score) / totalQuizzes);
                
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
        }).catch(error => {
            console.error('Error saving result:', error);
        });
    }
    
    // Show results
    document.getElementById('quizTaking').classList.add('hidden');
    document.getElementById('quizResults').classList.remove('hidden');
    
    document.getElementById('resultScore').textContent = `Score: ${score}%`;
    
    let feedback;
    if (score >= 80) {
        feedback = 'Excellent work! You have a strong understanding of this material.';
    } else if (score >= 60) {
        feedback = 'Good job! You have a decent understanding but could use some more practice.';
    } else {
        feedback = 'Keep practicing! Review the material and try again.';
    }
    
    document.getElementById('resultFeedback').textContent = feedback;
}

function retakeQuiz() {
    document.getElementById('quizResults').classList.add('hidden');
    startQuiz(currentQuiz);
}

function viewAnswers() {
    let answersHtml = '<h3>Quiz Answers</h3>';
    
    currentQuiz.questions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.answer;
        
        answersHtml += `
            <div class="question-review ${isCorrect ? 'correct' : 'incorrect'}">
                <p><strong>Question ${index + 1}:</strong> ${question.question}</p>
                <p>Your answer: ${question.options[userAnswer]}</p>
                ${!isCorrect ? `<p>Correct answer: ${question.options[question.answer]}</p>` : ''}
            </div>
        `;
    });
    
    alert(answersHtml); 
}

// Updated registerUser function in auth.js
function registerUser(name, email, password, userType) {
    return new Promise((resolve, reject) => {
        getUser(email).then(existingUser => {
            if (existingUser) {
                alert('Email already registered. Please login instead.');
                reject('Email already registered');
                return;
            }
            
            const newUser = {
                name,
                email,
                password, // Note: In production, hash this password
                userType,
                createdAt: new Date().toISOString()
            };
            
            if (userType === 'student') {
                newUser.quizzesTaken = 0;
                newUser.averageScore = 0;
                newUser.notesViewed = 0;
            } else {
                newUser.students = 0;
                newUser.quizzesCreated = 0;
                newUser.notesShared = 0;
            }
            
            addUser(newUser).then(() => {
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                alert('Registration successful! Redirecting to your dashboard...');
                
                // Add a small delay before redirecting to ensure localStorage is set
                setTimeout(() => {
                    window.location.href = userType === 'teacher' ? 'teacher.html' : 'student.html';
                }, 500);
                
                resolve(newUser);
            }).catch(error => {
                console.error('Registration failed:', error);
                alert('Registration failed. Please try again.');
                reject(error);
            });
        }).catch(error => {
            console.error('Error checking user:', error);
            alert('An error occurred. Please try again.');
            reject(error);
        });
    });
}

// Modified loginUser function
function loginUser(email, password, userType) {
    return new Promise((resolve, reject) => {
        getUser(email).then(user => {
            if (!user) {
                alert('User not found. Please register first.');
                reject('User not found');
                return;
            }
            
            if (user.password !== password) {
                alert('Incorrect password. Please try again.');
                reject('Incorrect password');
                return;
            }
            
            if (user.userType !== userType) {
                alert(`Please login as a ${user.userType}`);
                reject('Wrong user type');
                return;
            }
            
            // Store user in localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirect after successful login
            setTimeout(() => {
                window.location.href = userType === 'teacher' ? 'teacher.html' : 'student.html';
            }, 100);
            
            resolve(user);
        }).catch(error => {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
            reject(error);
        });
    });
}

// Updated login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
    
    loginUser(email, password, userType)
        .catch(error => {
            // Reset button if login fails
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        });
});