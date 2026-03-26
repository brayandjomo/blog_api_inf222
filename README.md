# Blog API (TAF 1 - CleeRoute)

API backend pour gerer un blog simple avec FastAPI + SQLite, conforme aux fonctionnalites demandees dans le PDF.

## Fonctionnalites

- Creer un article
- Lister les articles (filtres: categorie, auteur, date)
- Lire un article par ID
- Modifier un article (partiel)
- Supprimer un article
- Rechercher dans titre/contenu

## Technologies utilisees

- Python 3
- FastAPI
- SQLite
- Swagger (documentation auto via /docs)

## Installation et Lancement

### 1. Prerequis

- Python 3 installe
- Un terminal (Linux, macOS ou Windows)

### 2. Installation des dependances

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Lancement de l'application

```bash
uvicorn main:app --reload
```

- Swagger UI: `/docs`
- UI de test: `/static/index.html`

## Utilisation de l'API

Base URL par defaut: `http://127.0.0.1:8000`

Endpoints disponibles:
- `POST /api/articles`
- `GET /api/articles`
- `GET /api/articles/{id}`
- `PUT /api/articles/{id}`
- `DELETE /api/articles/{id}`
- `GET /api/articles/search?query=texte`

Format d'un article:

```json
{
  "titre": "Mon article",
  "contenu": "Texte...",
  "auteur": "Alice",
  "date": "2026-03-18",
  "categorie": "Tech",
  "tags": ["fastapi", "python"]
}
```

### Structure du Projet

- `main.py` : point d'entree FastAPI
- `routes.py` : definition des endpoints
- `controllers.py` : logique metier + acces SQLite
- `models.py` : schemas Pydantic
- `static/` : interface web de test
- `blog.db` : base SQLite (generee automatiquement)
