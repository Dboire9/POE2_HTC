#include "allocator.h"
#include <stdlib.h>
#include <string.h>

MemoryPool* create_pool(size_t size, size_t alignment) {
    MemoryPool* pool = malloc(sizeof(MemoryPool));
    pool->size = size;
    pool->used = 0;
    pool->alignment = alignment;
    pool->memory = aligned_alloc(alignment, size);
    memset(pool->memory, 0, size);
    return pool;
}

void* pool_alloc(MemoryPool* pool, size_t size) {
    // Align size
    size_t aligned_size = (size + pool->alignment - 1) & ~(pool->alignment - 1);
    
    if (pool->used + aligned_size > pool->size) {
        return NULL;  // Pool exhausted
    }
    
    void* ptr = (char*)pool->memory + pool->used;
    pool->used += aligned_size;
    return ptr;
}

void pool_reset(MemoryPool* pool) {
    pool->used = 0;
    memset(pool->memory, 0, pool->size);
}

void destroy_pool(MemoryPool* pool) {
    free(pool->memory);
    free(pool);
}
