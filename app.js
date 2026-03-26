const API_BASE = '/api/articles';

function qs(id) {
    return document.getElementById(id);
}

function parseTags(raw) {
    if (!raw) return null;
    return raw
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
}

function setResponse(title, status, payload) {
    const box = qs('response-box');
    const header = `[${status}] ${title}`;
    const body = payload !== undefined && payload !== null
        ? JSON.stringify(payload, null, 2)
        : '';
    box.textContent = header + (body ? `\n\n${body}` : '');
}

async function apiRequest(method, url, body) {
    const options = {
        method,
        headers: {
            'Accept': 'application/json'
        }
    };
    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    let data = null;
    try {
        data = await response.json();
    } catch (e) {
        data = null;
    }
    return { response, data };
}

async function createArticle() {
    const titre = qs('create-titre').value.trim();
    const auteur = qs('create-auteur').value.trim();
    const categorie = qs('create-categorie').value.trim();
    const date = qs('create-date').value;
    const contenu = qs('create-contenu').value.trim();
    const tags = parseTags(qs('create-tags').value.trim()) || [];

    if (!titre || !auteur || !categorie || !date || !contenu) {
        setResponse('POST /api/articles', 400, { error: 'Tous les champs obligatoires doivent etre remplis.' });
        return;
    }

    const payload = { titre, contenu, auteur, date, categorie, tags };
    try {
        const { response, data } = await apiRequest('POST', API_BASE + '/', payload);
        setResponse('POST /api/articles', response.status, data);
        if (response.ok) {
            qs('create-titre').value = '';
            qs('create-contenu').value = '';
            qs('create-tags').value = '';
            loadArticles();
        }
    } catch (e) {
        setResponse('POST /api/articles', 500, { error: 'Serveur non joignable.' });
    }
}

function buildQuery(params) {
    const items = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
    return items.length ? `?${items.join('&')}` : '';
}

async function loadArticles() {
    const categorie = qs('filter-categorie').value.trim();
    const auteur = qs('filter-auteur').value.trim();
    const date = qs('filter-date').value;
    const query = buildQuery({ categorie, auteur, date });

    const container = qs('display-area');
    try {
        const { response, data } = await apiRequest('GET', API_BASE + '/' + query);
        if (!response.ok) {
            setResponse('GET /api/articles', response.status, data);
            container.innerHTML = '<p class="error">Erreur lors du chargement.</p>';
            return;
        }

        const articles = data || [];
        if (articles.length === 0) {
            container.innerHTML = '<p class="muted">Aucun article.</p>';
            setResponse('GET /api/articles', 200, []);
            return;
        }

        container.innerHTML = articles.map(a => `
            <div class="card" style="margin-top:12px;">
                <div class="card-head">
                    <span class="pill">${a.categorie}</span>
                    <button class="danger" onclick="deleteArticle(${a.id})">Supprimer</button>
                </div>
                <h3>${a.titre}</h3>
                <p class="muted">${a.contenu}</p>
                <p class="meta">ID ${a.id} | Par ${a.auteur} le ${a.date}</p>
            </div>
        `).join('');
        setResponse('GET /api/articles', 200, articles);
    } catch (e) {
        container.innerHTML = '<p class="error">Erreur de chargement des donnees.</p>';
        setResponse('GET /api/articles', 500, { error: 'Serveur non joignable.' });
    }
}

function clearFilters() {
    qs('filter-categorie').value = '';
    qs('filter-auteur').value = '';
    qs('filter-date').value = '';
}

async function getArticleById() {
    const id = qs('get-id').value;
    if (!id) {
        setResponse('GET /api/articles/{id}', 400, { error: 'ID requis.' });
        return;
    }

    try {
        const { response, data } = await apiRequest('GET', `${API_BASE}/${id}`);
        setResponse(`GET /api/articles/${id}`, response.status, data);
    } catch (e) {
        setResponse(`GET /api/articles/${id}`, 500, { error: 'Serveur non joignable.' });
    }
}

async function updateArticle() {
    const id = qs('update-id').value;
    if (!id) {
        setResponse('PUT /api/articles/{id}', 400, { error: 'ID requis.' });
        return;
    }

    const payload = {};
    const titre = qs('update-titre').value.trim();
    const contenu = qs('update-contenu').value.trim();
    const categorie = qs('update-categorie').value.trim();
    const tagsRaw = qs('update-tags').value.trim();

    if (titre) payload.titre = titre;
    if (contenu) payload.contenu = contenu;
    if (categorie) payload.categorie = categorie;
    if (tagsRaw) payload.tags = parseTags(tagsRaw) || [];

    if (Object.keys(payload).length === 0) {
        setResponse('PUT /api/articles/{id}', 400, { error: 'Aucune donnee a mettre a jour.' });
        return;
    }

    try {
        const { response, data } = await apiRequest('PUT', `${API_BASE}/${id}`, payload);
        setResponse(`PUT /api/articles/${id}`, response.status, data);
        if (response.ok) {
            loadArticles();
        }
    } catch (e) {
        setResponse(`PUT /api/articles/${id}`, 500, { error: 'Serveur non joignable.' });
    }
}

async function deleteArticle(id) {
    if (!confirm('Supprimer cet article ?')) return;
    try {
        const { response, data } = await apiRequest('DELETE', `${API_BASE}/${id}`);
        setResponse(`DELETE /api/articles/${id}`, response.status, data);
        if (response.ok) {
            loadArticles();
        }
    } catch (e) {
        setResponse(`DELETE /api/articles/${id}`, 500, { error: 'Serveur non joignable.' });
    }
}

async function deleteByIdInput() {
    const id = qs('delete-id').value;
    if (!id) {
        setResponse('DELETE /api/articles/{id}', 400, { error: 'ID requis.' });
        return;
    }
    await deleteArticle(id);
}

async function searchArticles() {
    const query = qs('search-query').value.trim();
    if (!query) {
        setResponse('GET /api/articles/search', 400, { error: 'Query requis.' });
        return;
    }

    try {
        const { response, data } = await apiRequest('GET', `${API_BASE}/search?query=${encodeURIComponent(query)}`);
        setResponse('GET /api/articles/search', response.status, data);
    } catch (e) {
        setResponse('GET /api/articles/search', 500, { error: 'Serveur non joignable.' });
    }
}

function setDefaultDate() {
    const dateInput = qs('create-date');
    if (dateInput && !dateInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

window.onload = () => {
    setDefaultDate();
    loadArticles();
};
