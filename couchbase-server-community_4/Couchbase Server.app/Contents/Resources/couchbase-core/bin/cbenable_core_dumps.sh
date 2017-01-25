#!/bin/bash
#
# Enables core dump files.  The first required argument is an existing
# absolute directory where core files are dumped to (no trailing "/").
#
# Sorry, no windows support
#
# Example:
# ./cbenable_core_dumps.sh /tmp
#

path=$1
if [ $# -ne 1 ]; then
    echo "error: need directory arg of where to put core dumps (eg. cbenable_core_dumps.sh /tmp); please ensure there is enough space for core dumps"
    exit 1
fi

if [[ $path != /* ]]; then
    echo "error: directory must be an absolute path"
    exit 1
fi

# If directory has a trailing / then remove it
if [[ "/" == ${path:${#path}-1} ]]; then
    path=${path:0:${#path}-1}
fi

if [ -d $path ]; then
    /sbin/sysctl kernel.core_pattern=$path/core.%e.%p &> /dev/null
    if [[ $? -ne 0 ]]; then
        echo "error: kernel.core_pattern couldn't be set, tried: $path/core.%e.%p; perhaps you need to sudo for root level access?"
        exit 1
    fi
    /sbin/sysctl fs.suid_dumpable=2 &> /dev/null
    if [[ $? -ne 0 ]]; then
        echo "error: fs.suid_dumpable couldn't be set to 2"
        exit 1
    fi
    ulimit -S -c unlimited &> /dev/null
else
    echo "error: directory $path doesn't exist"
    exit 1
fi
