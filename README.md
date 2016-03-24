# Sam Burdick

[Online Heroku app](https://stormy-everglades-97873.herokuapp.com/)  
Completed through Chapter 3 of Getting MEAN: I originally had some problems getting the app on to Heroku due to an error in the application pathway. Otherthan that, everything went smoothly.

Completed through Chapter 4 of Getting MEAN: Other than some minor typing issues everything felt fine. One typo I noticed firsthand was on line 25 of locations-list.jade: there is a pipe that is not supposed to be there that will cause the front page details of the restaurants to render incorrectly, though this problem was mainly a cosmetic one.
Also, on line 1 of layout.jade, "doctype 5" should be "doctype html" (the book's code is for a deprecated version of jade)

2/17: Completed through Ch. 5 of Getting MEAN: Most of my difficulty with this  assignment came with working in Mongo. It was a bit cumbersome having to go into the Windows command line and configure everything for mongodb from there, but after closely following the directions I was able to get all of the proper application code online and working correctly.

3/02: Completed through Ch. 7 of Getting MEAN: The main problems with the book were in the distance computation component (using meters ended up simplifying things), inconsistently using 'location/' vs 'locations/' and 'review/' vs 'reviews/' in the hard-coded URL methods, and the occasional typo (e.g., missing a comma on pg. 234, listing 7.22, line 2). Additionally, towards the beginning of chapter 6, it was unclear to me that I had to construct the methods in index.js in the controller files in order to get the program up and running. Additionally, there is still more work to be done in getting the main page to display the distances.

3/16: Previously, I was having some issues with mongorestore. I realized that I needed to be using mlab instead of mongolab due to the recent name change. Additionally, I was using the wrong 2dsphereindexVersion; I needed to be using version 1 or 2, instead the locations.json generated a version 3. For now, I could fix it by editing the .json, and managed to get the database updated just fine, but the version needs to be changed somewhere in code, I believe.

3/23: Completed through Ch. 9 of Getting MEAN: Going through the book I didn't encounter many problems, except that I forgot to include the angular dependencies in layout.jade. Currently, I need to fix the header (it doesn't have the Amelia font for some reason), and I'll add some more locations to the database. Working with Angular presented a few problems from the beginning, but was otherwise fine, aside from my own mistakes in updating the dependencies as needed.
