let currentNote = null;
let isEditing = false;

function initNotes() {
    // Load notes for the default filter
    loadNotes('all');
    
    // Set up event listeners
    document.getElementById('searchBtn').addEventListener('click', function() {
        const searchTerm = document.getElementById('searchNotes').value.trim();
        const subject = document.getElementById('subjectFilter').value;
        loadNotes(subject, searchTerm);
    });
    
    document.getElementById('subjectFilter').addEventListener('change', function() {
        const subject = this.value;
        const searchTerm = document.getElementById('searchNotes').value.trim();
        loadNotes(subject, searchTerm);
    });
    
    document.getElementById('addNoteBtn').addEventListener('click', function() {
        showNoteEditor();
    });
    
    document.getElementById('noteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveNote();
    });
    
    document.getElementById('cancelEdit').addEventListener('click', function() {
        hideNoteEditor();
    });
    
    document.getElementById('closeViewer').addEventListener('click', function() {
        hideNoteViewer();
    });
}

function loadNotes(subject = 'all', searchTerm = '') {
    getNotesBySubject(subject).then(notes => {
        // Filter by search term if provided
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            notes = notes.filter(note => 
                note.title.toLowerCase().includes(term) || 
                note.content.toLowerCase().includes(term)
            );
        }
        
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        
        if (notes.length === 0) {
            notesList.innerHTML = '<p>No notes found.</p>';
            return;
        }
        
        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'note-card';
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <p class="note-meta">Subject: ${note.subject.charAt(0).toUpperCase() + note.subject.slice(1)}</p>
                <div class="note-preview">${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}</div>
            `;
            noteCard.addEventListener('click', function() {
                viewNote(note.id);
            });
            notesList.appendChild(noteCard);
        });
    }).catch(error => {
        console.error('Error loading notes:', error);
        alert('Failed to load notes. Please try again.');
    });
}

function viewNote(noteId) {
    getNoteById(noteId).then(note => {
        currentNote = note;
        
        document.getElementById('viewNoteTitle').textContent = note.title;
        document.getElementById('viewNoteSubject').textContent = note.subject.charAt(0).toUpperCase() + note.subject.slice(1);
        document.getElementById('viewNoteContent').textContent = note.content;
        
        // Update user stats if student
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.userType === 'student') {
            currentUser.notesViewed = (currentUser.notesViewed || 0) + 1;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
        
        document.getElementById('notesControls').classList.add('hidden');
        document.getElementById('notesList').classList.add('hidden');
        document.getElementById('noteViewer').classList.remove('hidden');
    }).catch(error => {
        console.error('Error viewing note:', error);
        alert('Failed to load note. Please try again.');
    });
}

function showNoteEditor(note = null) {
    isEditing = note !== null;
    currentNote = note;
    
    document.getElementById('editorTitle').textContent = isEditing ? 'Edit Note' : 'New Note';
    
    if (isEditing) {
        document.getElementById('noteTitle').value = note.title;
        document.getElementById('noteSubject').value = note.subject;
        document.getElementById('noteContent').value = note.content;
    } else {
        document.getElementById('noteForm').reset();
    }
    
    document.getElementById('notesControls').classList.add('hidden');
    document.getElementById('notesList').classList.add('hidden');
    document.getElementById('noteEditor').classList.remove('hidden');
}

function hideNoteEditor() {
    document.getElementById('noteEditor').classList.add('hidden');
    document.getElementById('notesControls').classList.remove('hidden');
    document.getElementById('notesList').classList.remove('hidden');
}

function hideNoteViewer() {
    document.getElementById('noteViewer').classList.add('hidden');
    document.getElementById('notesControls').classList.remove('hidden');
    document.getElementById('notesList').classList.remove('hidden');
}

function saveNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const subject = document.getElementById('noteSubject').value;
    const content = document.getElementById('noteContent').value.trim();
    
    if (!title || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return;
    }
    
    const noteData = {
        title,
        subject,
        content,
        createdBy: currentUser.email,
        createdAt: new Date().toISOString()
    };
    
    if (isEditing) {
        noteData.id = currentNote.id;
        alert('Note editing functionality would be implemented here');
    } else {
        addNote(noteData).then(() => {
            // Update teacher stats
            if (currentUser.userType === 'teacher') {
                currentUser.notesShared = (currentUser.notesShared || 0) + 1;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            alert('Note saved successfully!');
            hideNoteEditor();
            loadNotes(document.getElementById('subjectFilter').value);
        }).catch(error => {
            console.error('Error saving note:', error);
            alert('Failed to save note. Please try again.');
        });
    }
}