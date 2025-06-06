# Pdslib Firefox Extension

This Firefox extension implements a privacy dashboard that can be used to visualise the states of various privacy filters. It is meant to be used with the Firefox build at [columbia/pdslib-firefox](https://github.com/columbia/pdslib-firefox).

![image](https://github.com/user-attachments/assets/9c574dac-966b-4c00-8858-c9fb17973641)

# Installation steps

1. Compile and run the modified Firefox build at [columbia/pdslib-firefox](https://github.com/columbia/pdslib-firefox)
2. In Firefox settings, enable "Privacy-preserving ad measurement"
3. In `about:config`, set `dom.origin-trials.private-attribution.state` to `1`
4. Head to `about:debugging`, go to `This Firefox` > `Load Temporary Add-on`, and select any of the files in this repository

The extension should be accessible using the puzzle icon on the top-right of the browser.
