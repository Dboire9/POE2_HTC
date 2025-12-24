#ifndef CACHE_H
#define CACHE_H

#include <stdint.h>
#include <stdbool.h>
#include <pthread.h>

// Cache entry
typedef struct CacheEntry {
    uint64_t key;
    void* value;
    size_t value_size;
    struct CacheEntry* next;
} CacheEntry;

// Hash table cache (thread-safe)
typedef struct {
    CacheEntry** buckets;
    int num_buckets;
    int size;
    pthread_mutex_t mutex;
} Cache;

// Create cache
Cache* create_cache(int num_buckets);

// Get value from cache
void* cache_get(Cache* cache, uint64_t key);

// Put value in cache
void cache_put(Cache* cache, uint64_t key, void* value, size_t value_size);

// Check if key exists
bool cache_contains(Cache* cache, uint64_t key);

// Clear cache
void cache_clear(Cache* cache);

// Destroy cache
void destroy_cache(Cache* cache);

#endif // CACHE_H
