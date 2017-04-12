#!/bin/bash

echo "IMPORTANT: Make sure you updated the config branch and pushed to github, otherwise this might not do anything."

version=$(cat src/pkjs/index.js |& grep "stefanheule.com/graphite/config/[0-9]" | sed "s/.*config\/\([0-9]*\).*/\1/")

echo "Detected config version $version..."
echo "Resetting config $version on server."
ssh linode "sudo rm -rf /home/stefan/www/pages/common/data/graphite/config/$version"
echo "Done :)"
