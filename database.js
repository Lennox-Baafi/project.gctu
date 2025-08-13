// Initialize the database
let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('SmartStudyDB', 1);
        
        request.onerror = function(event) {
            console.error('Database error:', event.target.error);
            reject('Database error');
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            resolve(db);
        };
        
        request.onupgradeneeded = function(event) {
            const db = event.target.result;
            
            // Create users store
            const usersStore = db.createObjectStore('users', { keyPath: 'email' });
            usersStore.createIndex('email', 'email', { unique: true });
            usersStore.createIndex('userType', 'userType', { unique: false });
            
            // Create quizzes store
            const quizzesStore = db.createObjectStore('quizzes', { keyPath: 'id', autoIncrement: true });
            quizzesStore.createIndex('subject', 'subject', { unique: false });
            
            // Create notes store
            const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
            notesStore.createIndex('subject', 'subject', { unique: false });
            
            // Create results store
            const resultsStore = db.createObjectStore('results', { keyPath: 'id', autoIncrement: true });
            resultsStore.createIndex('userId', 'userId', { unique: false });
            resultsStore.createIndex('quizId', 'quizId', { unique: false });
        };
    });
}

// User operations
function addUser(user) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readwrite');
        const store = transaction.objectStore('users');
        
        const request = store.add(user);
        
        request.onsuccess = function() {
            resolve(user);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getUser(email) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['users'], 'readonly');
        const store = transaction.objectStore('users');
        
        const request = store.get(email);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Quiz operations
function addQuiz(quiz) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['quizzes'], 'readwrite');
        const store = transaction.objectStore('quizzes');
        
        const request = store.add(quiz);
        
        request.onsuccess = function() {
            resolve(quiz);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getQuizzesBySubject(subject) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['quizzes'], 'readonly');
        const store = transaction.objectStore('quizzes');
        const index = store.index('subject');
        
        const request = index.getAll(subject);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getQuizById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['quizzes'], 'readonly');
        const store = transaction.objectStore('quizzes');
        
        const request = store.get(id);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Notes operations
function addNote(note) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        
        const request = store.add(note);
        
        request.onsuccess = function() {
            resolve(note);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getNotesBySubject(subject) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const index = store.index('subject');
        
        const request = subject === 'all' ? store.getAll() : index.getAll(subject);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getNoteById(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        
        const request = store.get(id);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Results operations
function addResult(result) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['results'], 'readwrite');
        const store = transaction.objectStore('results');
        
        const request = store.add(result);
        
        request.onsuccess = function() {
            resolve(result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

function getResultsByUser(userId) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['results'], 'readonly');
        const store = transaction.objectStore('results');
        const index = store.index('userId');
        
        const request = index.getAll(userId);
        
        request.onsuccess = function() {
            resolve(request.result);
        };
        
        request.onerror = function(event) {
            reject(event.target.error);
        };
    });
}

// Initialize the database when the script loads
initDB().then(() => {
    console.log('Database initialized');
}).catch(error => {
    console.error('Failed to initialize database:', error);
});