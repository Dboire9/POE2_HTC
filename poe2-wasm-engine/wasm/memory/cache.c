#include "cache.h"
#include <stdlib.h>
#include <string.h>

static uint64_t hash_key(uint64_t key, int num_buckets) {
    return key % num_buckets;
}

Cache* create_cache(int num_buckets) {
    Cache* cache = malloc(sizeof(Cache));
    cache->num_buckets = num_buckets;
    cache->size = 0;
    cache->buckets = calloc(num_buckets, sizeof(CacheEntry*));
    pthread_mutex_init(&cache->mutex, NULL);
    return cache;
}

void* cache_get(Cache* cache, uint64_t key) {
    uint64_t bucket = hash_key(key, cache->num_buckets);
    
    pthread_mutex_lock(&cache->mutex);
    
    CacheEntry* entry = cache->buckets[bucket];
    while (entry) {
        if (entry->key == key) {
            void* value = entry->value;
            pthread_mutex_unlock(&cache->mutex);
            return value;
        }
        entry = entry->next;
    }
    
    pthread_mutex_unlock(&cache->mutex);
    return NULL;
}

void cache_put(Cache* cache, uint64_t key, void* value, size_t value_size) {
    uint64_t bucket = hash_key(key, cache->num_buckets);
    
    pthread_mutex_lock(&cache->mutex);
    
    // Check if key already exists
    CacheEntry* entry = cache->buckets[bucket];
    while (entry) {
        if (entry->key == key) {
            // Update existing entry
            free(entry->value);
            entry->value = malloc(value_size);
            memcpy(entry->value, value, value_size);
            entry->value_size = value_size;
            pthread_mutex_unlock(&cache->mutex);
            return;
        }
        entry = entry->next;
    }
    
    // Create new entry
    CacheEntry* new_entry = malloc(sizeof(CacheEntry));
    new_entry->key = key;
    new_entry->value = malloc(value_size);
    memcpy(new_entry->value, value, value_size);
    new_entry->value_size = value_size;
    new_entry->next = cache->buckets[bucket];
    cache->buckets[bucket] = new_entry;
    cache->size++;
    
    pthread_mutex_unlock(&cache->mutex);
}

bool cache_contains(Cache* cache, uint64_t key) {
    return cache_get(cache, key) != NULL;
}

void cache_clear(Cache* cache) {
    pthread_mutex_lock(&cache->mutex);
    
    for (int i = 0; i < cache->num_buckets; i++) {
        CacheEntry* entry = cache->buckets[i];
        while (entry) {
            CacheEntry* next = entry->next;
            free(entry->value);
            free(entry);
            entry = next;
        }
        cache->buckets[i] = NULL;
    }
    cache->size = 0;
    
    pthread_mutex_unlock(&cache->mutex);
}

void destroy_cache(Cache* cache) {
    cache_clear(cache);
    pthread_mutex_destroy(&cache->mutex);
    free(cache->buckets);
    free(cache);
}
