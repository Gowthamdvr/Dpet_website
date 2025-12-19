document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';

    if (isLoggedIn) {
        initCMS();
    } else {
        // Init Login Modal logic if we are on index.html (or if the modal exists)
        initLoginModal();
    }

    // Always load content
    loadContent();
});

function initLoginModal() {
    const modal = document.getElementById('loginModal');
    const link = document.getElementById('adminLoginLink');
    const close = document.getElementById('closeModal');
    const form = document.getElementById('homeLoginForm');
    
    if (modal && link && close && form) {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });

        close.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('adminUser').value;
            const pass = document.getElementById('adminPass').value;

            if (user === 'admin' && pass === 'admin123') {
                sessionStorage.setItem('isAdminLoggedIn', 'true');
                modal.classList.remove('active');
                initCMS(); // Start CMS immediately
                alert('Logged in successfully! Editing enabled.');
            } else {
                document.getElementById('loginError').style.display = 'block';
            }
        });
    }
}

function initCMS() {
    // Create Floating Admin Panel
    const panel = document.createElement('div');
    panel.id = 'cms-panel';
    panel.innerHTML = `
        <div class="cms-header">Admin Mode</div>
        <div class="cms-controls">
            <button id="toggleEditBtn">Enable Editing</button>
            <button id="saveBtn" style="display:none; background: #28a745;">Save Changes</button>
            <button id="logoutBtn" style="background: #dc3545;">Logout</button>
        </div>
    `;
    document.body.appendChild(panel);

    // Style the panel
    const style = document.createElement('style');
    style.textContent = `
        #cms-panel {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: sans-serif;
            border: 2px solid #003366;
        }
        .cms-header {
            font-weight: bold;
            margin-bottom: 10px;
            color: #003366;
            text-align: center;
        }
        .cms-controls button {
            display: block;
            width: 100%;
            margin-bottom: 5px;
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            background: #003366;
            color: white;
            cursor: pointer;
            font-size: 14px;
        }
        .cms-controls button:hover {
            opacity: 0.9;
        }
        .cms-editable {
            outline: 2px dashed #d4a017;
            padding: 2px;
            min-height: 1em;
        }
        .cms-editable:focus {
            outline: 2px solid #28a745;
            background: rgba(40, 167, 69, 0.1);
        }
    `;
    document.head.appendChild(style);

    // Event Listeners
    let isEditing = false;
    const toggleBtn = document.getElementById('toggleEditBtn');
    const saveBtn = document.getElementById('saveBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    toggleBtn.addEventListener('click', () => {
        isEditing = !isEditing;
        if (isEditing) {
            enableEditHelpers();
            toggleBtn.textContent = 'Disable Editing';
            toggleBtn.style.background = '#6c757d';
            saveBtn.style.display = 'block';
        } else {
            disableEdit();
            toggleBtn.textContent = 'Enable Editing';
            toggleBtn.style.background = '#003366';
            saveBtn.style.display = 'none';
        }
    });

    saveBtn.addEventListener('click', () => {
        saveContent();
        alert('Changes saved!');
        isEditing = false;
        disableEdit();
        toggleBtn.textContent = 'Enable Editing';
        toggleBtn.style.background = '#003366';
        saveBtn.style.display = 'none';
    });

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('isAdminLoggedIn');
        window.location.reload();
    });
}

function enableEditHelpers() {
    // Find all elements with an ID that are likely content
    // We target common text tags. IF they have an ID.
    const editables = document.querySelectorAll('h1[id], h2[id], h3[id], p[id], span[id], div[id].editable, li[id]');

    editables.forEach(el => {
        el.contentEditable = 'true';
        el.classList.add('cms-editable');
    });
}

function disableEdit() {
    const editables = document.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
        el.contentEditable = 'false';
        el.classList.remove('cms-editable');
    });
}

function getStorageKey(elementId) {
    // Unique key: Page Name + Element ID
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return `cms_${page}_${elementId}`;
}

function saveContent() {
    const editables = document.querySelectorAll('.cms-editable');
    editables.forEach(el => {
        if (el.id) {
            const key = getStorageKey(el.id);
            localStorage.setItem(key, el.innerHTML);
        }
    });
}

function loadContent() {
    // Attempt to match every element with an ID to a saved value
    const allElements = document.querySelectorAll('[id]');

    allElements.forEach(el => {
        const key = getStorageKey(el.id);
        const savedContent = localStorage.getItem(key);
        if (savedContent) {
            el.innerHTML = savedContent;
        }
    });
}
