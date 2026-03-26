from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ArticleBase(BaseModel):
    titre: str = Field(..., min_length=1)
    contenu: str = Field(..., min_length=1)
    auteur: str = Field(..., min_length=1)
    date: date
    categorie: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)


class ArticleCreate(ArticleBase):
    pass


class ArticleUpdate(BaseModel):
    titre: Optional[str] = Field(None, min_length=1)
    contenu: Optional[str] = Field(None, min_length=1)
    categorie: Optional[str] = Field(None, min_length=1)
    tags: Optional[List[str]] = None


class Article(ArticleBase):
    id: int
