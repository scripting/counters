#### 9/16/23; 5:53:28 PM by DW

Looked for bugs for referer being passed via the HTTP call, but I didn't find any problems. 

I think Google considers it private info, but I'm sure they don't block their own access to the info. 

There's a lot of power and ownership that comes from having the dominant web browser.

Anyway if we get a referrer value, we now log it. 

#### 4/20/23; 4:23:10 PM by DW

Apparently decodeURIComponent can fail, so we catch the errs.

#### 2/2/23; 4:30:33 PM by DW

It's now running on https so it can be called from FeedLand. 

#### 1/30/23; 10:20:53 PM by DW

In addition to accepting /counter, we also accept /hello to work around some blocking

https://github.com/scripting/Scripting-News/issues/249

#### 11/4/22; 10:00:25 AM by DW

We were calling an old server on Bayside just to read a file on static.scripting.com. We can do that ourself, so I replaced the code, and it worked. 

#### 2/17/22; 5:07:28 PM by DW

It's been running on Palatka for a while. Making the build script reflect this. 

#### 4/21/20; 6:54:41 PM by DW

Moved from Hunter to Montana. It's the only app on Hunter that's doing anything for real. I decided to shut down the forever-server experiment. May be going in a different direction.

#### 11/16/19; 11:42:04 AM by DW

Complete rewrite using latest techniques.

group param is ignored, all hits go to the "scripting" group.

package.json

{

"name": "counters",

"description": "A simple node.js app to track referrers.",

"author": "Dave Winer <dave@smallpicture.com>",

"version": "0.4.0",

"scripts": {

"start": "node counters.js"

},

"repository": {

"type": "git",

"url": "https://github.com/scripting/counters.git"

},

"dependencies" : {

"aws-sdk": "*"

}, 

"license": "MIT",

"engines": {

"node": "0.6.x"

}

}

#### 10/6/19; 10:43:28 AM by DW

changed version from 0.57e to 0.5.8

logging was a mess. now we only log /counter events, and report the time, group and referer.

we weren't reporting the time before. 

#### 9/23/19; 12:16:29 PM by DW

moved to hunter, to run under forever-server. used to run on bayside at a different domain. 

also changed the script in utils.js, so call the server on hunter.

#### 10/16/16; 12:34:51 PM by DW

added blacklist, to get olynon.com out of my log.

#### 7/2/16; 9:57:13 AM by DW

moved from montauk to bayside

#### 2/3/14 by DW

The daily data structure has to be an array because JS can only sort arrays.

User can optionally set an environment variable, counterServerName. 

If it's defined we'll use that name instead of the IP address to name the folder for the counter logs.

export counterServerName=boston

