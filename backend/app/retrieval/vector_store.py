import math
import os
import struct

import redis
from redis.exceptions import ResponseError
from redis.commands.search.field import (
    TextField,
    VectorField
)
from redis.commands.search.index_definition import (
    IndexDefinition,
    IndexType
)

from app.processing.chunker import SemanticChunk, is_indexable_chunk

INDEX_NAME = "resume_chunks"
VECTOR_DIM = 384
KEY_PREFIX = "resume:chunk:"

redis_client = redis.Redis.from_url(
    os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    decode_responses=False,
)


def create_index() -> None:
    schema = (
        TextField("resume_id"),
        TextField("chunk_id"),
        TextField("text"),
        TextField("section"),
        VectorField(
            "embedding",
            "FLAT",
            {
                "TYPE": "FLOAT32",
                "DIM": VECTOR_DIM,
                "DISTANCE_METRIC": "COSINE"
            }
        )
    )

    definition = IndexDefinition(
        prefix=[KEY_PREFIX],
        index_type=IndexType.HASH
    )

    index = redis_client.ft(INDEX_NAME)
    try:
        index.info()
    except ResponseError as error:
        if "unknown index" not in str(error).casefold():
            raise
        index.create_index(schema, definition=definition)


def store_resume_chunks(resume_id: str, chunks: list[SemanticChunk]) -> int:
    chunks = [chunk for chunk in chunks if is_indexable_chunk(chunk)]
    if not chunks:
        return 0
    create_index()

    for chunk in chunks:
        if len(chunk["embedding"]) != VECTOR_DIM:
            raise ValueError(
                f"Expected {VECTOR_DIM}-dimensional embedding for {chunk['chunk_id']}; "
                f"got {len(chunk['embedding'])}."
            )
        if not all(math.isfinite(value) for value in chunk["embedding"]):
            raise ValueError(f"Embedding for {chunk['chunk_id']} contains non-finite values.")

    pipeline = redis_client.pipeline(transaction=True)
    for chunk in chunks:
        key = f"{KEY_PREFIX}{resume_id}:{chunk['chunk_id']}"
        pipeline.hset(
            key,
            mapping={
                "resume_id": resume_id,
                "chunk_id": chunk["chunk_id"],
                "text": chunk["text"],
                "section": chunk["section"],
                "embedding": struct.pack(
                    f"{VECTOR_DIM}f",
                    *chunk["embedding"],
                ),
            },
        )
    pipeline.execute()
    return len(chunks)