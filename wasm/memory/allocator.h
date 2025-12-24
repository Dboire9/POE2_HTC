#ifndef ALLOCATOR_H
#define ALLOCATOR_H

#include <stddef.h>

// Memory pool for fast allocation
typedef struct MemoryPool {
    void* memory;
    size_t size;
    size_t used;
    size_t alignment;
} MemoryPool;

// Create memory pool
MemoryPool* create_pool(size_t size, size_t alignment);

// Allocate from pool
void* pool_alloc(MemoryPool* pool, size_t size);

// Reset pool (keep memory, reset pointer)
void pool_reset(MemoryPool* pool);

// Destroy pool
void destroy_pool(MemoryPool* pool);

#endif // ALLOCATOR_H
