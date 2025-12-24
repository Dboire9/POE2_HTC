cmake_minimum_required(VERSION 3.15)
project(POE2_Crafting_Calculator C)

set(CMAKE_C_STANDARD 11)
set(CMAKE_C_STANDARD_REQUIRED ON)

# Source files
set(CORE_SOURCES
    core/items.c
    core/modifiers.c
    core/calculator.c
    core/probability.c
)

set(THREADING_SOURCES
    threading/thread_pool.c
)

set(MEMORY_SOURCES
    memory/cache.c
    memory/allocator.c
)

set(API_SOURCES
    api.c
)

set(ALL_SOURCES
    ${CORE_SOURCES}
    ${THREADING_SOURCES}
    ${MEMORY_SOURCES}
    ${API_SOURCES}
)

# Emscripten configuration
if(EMSCRIPTEN)
    add_executable(poe2-calc ${ALL_SOURCES})
    
    set_target_properties(poe2-calc PROPERTIES
        OUTPUT_NAME "poe2-calc"
        SUFFIX ".js"
    )
    
    target_compile_options(poe2-calc PRIVATE
        -O3
        -pthread
    )
    
    target_link_options(poe2-calc PRIVATE
        -pthread
        -s PTHREAD_POOL_SIZE=8
        -s EXPORTED_FUNCTIONS=['_init_module','_calculate','_get_module_info','_free_string']
        -s EXPORTED_RUNTIME_METHODS=['ccall','cwrap','UTF8ToString']
        -s ALLOW_MEMORY_GROWTH=1
        -s INITIAL_MEMORY=64MB
        -s MODULARIZE=1
        -s EXPORT_NAME='createPOE2Module'
    )
    
    # Install to public/wasm
    install(FILES
        ${CMAKE_CURRENT_BINARY_DIR}/poe2-calc.js
        ${CMAKE_CURRENT_BINARY_DIR}/poe2-calc.wasm
        DESTINATION ${CMAKE_SOURCE_DIR}/../public/wasm
    )
else()
    # Native build for testing
    add_executable(poe2-calc-native ${ALL_SOURCES})
    target_compile_definitions(poe2-calc-native PRIVATE TEST_NATIVE)
    target_link_libraries(poe2-calc-native pthread m)
endif()
