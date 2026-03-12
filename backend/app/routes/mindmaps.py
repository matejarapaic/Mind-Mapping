import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.mindmap import MindMap
from app.routes.auth import get_current_user_id

router = APIRouter(prefix="/api/mindmaps", tags=["mindmaps"])


class MindMapCreate(BaseModel):
    title: str = "Untitled Mind Map"
    graph_data: dict[str, Any] = {}


class MindMapUpdate(BaseModel):
    title: str | None = None
    graph_data: dict[str, Any] | None = None


class MindMapResponse(BaseModel):
    id: str
    title: str
    graph_data: dict[str, Any]
    created_at: str
    updated_at: str

    model_config = {"from_attributes": True}


@router.get("/")
async def list_mindmaps(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MindMap).where(MindMap.user_id == user_id).order_by(MindMap.updated_at.desc())
    )
    maps = result.scalars().all()
    return [
        {
            "id": str(m.id),
            "title": m.title,
            "created_at": m.created_at.isoformat(),
            "updated_at": m.updated_at.isoformat(),
        }
        for m in maps
    ]


@router.post("/", status_code=201)
async def create_mindmap(
    body: MindMapCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    mindmap = MindMap(user_id=user_id, title=body.title, graph_data=body.graph_data)
    db.add(mindmap)
    await db.flush()
    await db.refresh(mindmap)
    return {
        "id": str(mindmap.id),
        "title": mindmap.title,
        "graph_data": mindmap.graph_data,
        "created_at": mindmap.created_at.isoformat(),
        "updated_at": mindmap.updated_at.isoformat(),
    }


@router.get("/{mindmap_id}")
async def get_mindmap(
    mindmap_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MindMap).where(
            MindMap.id == uuid.UUID(mindmap_id),
            MindMap.user_id == user_id,
        )
    )
    mindmap = result.scalar_one_or_none()
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mind map not found")
    return {
        "id": str(mindmap.id),
        "title": mindmap.title,
        "graph_data": mindmap.graph_data,
        "created_at": mindmap.created_at.isoformat(),
        "updated_at": mindmap.updated_at.isoformat(),
    }


@router.patch("/{mindmap_id}")
async def update_mindmap(
    mindmap_id: str,
    body: MindMapUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MindMap).where(
            MindMap.id == uuid.UUID(mindmap_id),
            MindMap.user_id == user_id,
        )
    )
    mindmap = result.scalar_one_or_none()
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mind map not found")

    if body.title is not None:
        mindmap.title = body.title
    if body.graph_data is not None:
        mindmap.graph_data = body.graph_data

    await db.flush()
    return {"id": str(mindmap.id), "title": mindmap.title}


@router.delete("/{mindmap_id}", status_code=204)
async def delete_mindmap(
    mindmap_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MindMap).where(
            MindMap.id == uuid.UUID(mindmap_id),
            MindMap.user_id == user_id,
        )
    )
    mindmap = result.scalar_one_or_none()
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mind map not found")
    await db.delete(mindmap)
