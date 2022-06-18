_find_package(${ARGS})

if(ON)
    find_package(ZLIB)
endif()

if(ON)
    find_package(BZip2)
endif()

if(ON)
    find_package(PNG)
endif()

if(ON)
    find_library(BROTLIDEC_LIBRARY_RELEASE NAMES brotlidec brotlidec-static PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}" PATH_SUFFIXES lib NO_DEFAULT_PATH)
    find_library(BROTLIDEC_LIBRARY_DEBUG NAMES brotlidec brotlidec-static brotlidecd brotlidec-staticd PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/debug" PATH_SUFFIXES lib NO_DEFAULT_PATH)
    find_library(BROTLICOMMON_LIBRARY_RELEASE NAMES brotlicommon brotlicommon-static PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}" PATH_SUFFIXES lib NO_DEFAULT_PATH)
    find_library(BROTLICOMMON_LIBRARY_DEBUG NAMES brotlicommon brotlicommon-static brotlicommond brotlicommon-staticd PATHS "${_VCPKG_INSTALLED_DIR}/${VCPKG_TARGET_TRIPLET}/debug" PATH_SUFFIXES lib NO_DEFAULT_PATH)
    include(SelectLibraryConfigurations)
    select_library_configurations(BROTLIDEC)
    select_library_configurations(BROTLICOMMON)
endif(ON)

if(TARGET Freetype::Freetype)
    if(ON)
        set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES ZLIB::ZLIB)
    endif()

    if(ON)
        set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES BZip2::BZip2)
    endif()

    if(ON)
        set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES PNG::PNG)
    endif()
    if(ON)
        if(BROTLIDEC_LIBRARY_DEBUG)
            set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES $<$<CONFIG:DEBUG>:${BROTLIDEC_LIBRARY_DEBUG}>)
            set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES $<$<CONFIG:DEBUG>:${BROTLICOMMON_LIBRARY_DEBUG}>)
        endif()
        if(BROTLIDEC_LIBRARY_RELEASE)
            set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES $<$<NOT:$<CONFIG:DEBUG>>:${BROTLIDEC_LIBRARY_RELEASE}>)
            set_property(TARGET Freetype::Freetype APPEND PROPERTY INTERFACE_LINK_LIBRARIES $<$<NOT:$<CONFIG:DEBUG>>:${BROTLICOMMON_LIBRARY_RELEASE}>)
        endif()
    endif()
endif()

if(FREETYPE_LIBRARIES)
    if(ON)
        list(APPEND FREETYPE_LIBRARIES ${ZLIB_LIBRARIES})
    endif()

    if(ON)
        list(APPEND FREETYPE_LIBRARIES ${BZIP2_LIBRARIES})
    endif()

    if(ON)
        list(APPEND FREETYPE_LIBRARIES ${PNG_LIBRARIES})
    endif()

    if(ON)
        list(APPEND FREETYPE_LIBRARIES ${BROTLIDEC_LIBRARIES} ${BROTLICOMMON_LIBRARIES})
    endif()
endif()
