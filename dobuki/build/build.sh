#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"



uglifyjs "$DIR/../setup.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../objectpool.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../turbosort.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../utils.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../gifhandler.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../audio.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../packer.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../turbosort.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../menu.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../loop.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../triggerloop.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../loader.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../camera.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../spritesheet.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../spriterenderer.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../collection.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../keyboard.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../mouse.js" -o "$DIR/../dobuki.min.js"
uglifyjs "$DIR/../dobuki.min.js" "$DIR/../editcontrol.js" -o "$DIR/../dobuki.min.js"
