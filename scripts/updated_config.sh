#!/bin/bash

echo "IMPORTANT: Make sure you updated the config branch and pushed to github, otherwise this might not do anything."

version=$(cat src/js/pebble-js-app.js |& grep "stefanheule.com/redshift/config/" | sed "s/.*config\/\([0-9]*\).*/\1/")

echo "Detected config version $version..."
echo "Resetting config $version on server."
ssh linode "sudo rm -rf /home/stefan/www/pages/common/data/redshift/config/$version"
echo "Done :)"
