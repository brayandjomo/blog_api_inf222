from datetime import date
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from controllers import ArticleController
from models import Article, ArticleCreate, ArticleUpdate

router = APIRouter(prefix="/api/articles", tags=["Articles"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_article(article: ArticleCreate):
    art_id = ArticleController.create(article)
    return {"message": "Article créé avec succès", "id": art_id}


@router.get("/", response_model=List[Article])
async def read_articles(
    categorie: Optional[str] = None,
    auteur: Optional[str] = None,
    date: Optional[date] = None,
):
    return ArticleController.get_all(categorie, auteur, date)


@router.get("/search", response_model=List[Article])
async def search_articles(query: str = Query(..., min_length=1)):
    return ArticleController.search(query)


@router.get("/{id}", response_model=Article)
async def read_article(id: int):
    article = ArticleController.get_by_id(id)
    if not article:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return article


@router.put("/{id}")
async def update_article(id: int, article: ArticleUpdate):
    updated = ArticleController.update(id, article)
    if updated is None:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    if not updated:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"message": "Article mis à jour avec succès"}


@router.delete("/{id}")
async def delete_article(id: int):
    if not ArticleController.delete(id):
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return {"message": "Article supprimé avec succès"}
