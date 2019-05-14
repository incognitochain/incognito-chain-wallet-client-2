#!/usr/bin/env bash
unameOut="$(uname -s)"
case "${unameOut}" in
    Linux*)     machine=Linux;;
    Darwin*)    machine=Mac;;
    CYGWIN*)    machine=Cygwin;;
    MINGW*)     machine=MinGw;;
    *)          machine="UNKNOWN:${unameOut}"
esac
echo "OS: ${machine}"

if which node > /dev/null
    then
        echo "node is installed, skipping..."
    else
        echo "node is not installed, ..."
        # add deb.nodesource repo commands
        # install node
        if which machine > 'Mac'
            then
                brew install node@11.2.0
            elseif
                apt install node@11.2.0
            fi

    fi

npm install

yarn electron-dev