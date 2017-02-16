cmake_minimum_required(VERSION 3.2)
project(graphite)

set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -std=c++11")

set(SOURCE_FILES
        src/graphite.c
        src/graphite.h
        src/config.h
        src/widgets.c
        src/widgets.h
        src/settings.c
        src/settings.h
        src/ui-util.c
        src/ui-util.h
        src/ui.c
        src/ui.h)

add_executable(graphite ${SOURCE_FILES})

include_directories(~/.pebble-sdk/SDKs/current/sdk-core/pebble/basalt/include)
include_directories(~/dev/projects/graphite/node_modules/pebble-fctx/dist/include)
