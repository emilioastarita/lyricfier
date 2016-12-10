# Lyricfier: Lyrics for the Desktop Spotify Client

Lyricfier is an electron app that communicates  with Spotify Desktop Client to get the current song and then looks for a matching lyric scraping the web.

## Download pre-release

Go to [Lyricfier releases page](https://github.com/emilioastarita/lyricfier/releases) and download the zip file for your platform.


## How it looks

![Lyricfier Screenshot](/screenshot.jpg?raw=true "Lyricfier Screenshot")


## Development setup 

```
# clone the repo
git clone https://github.com/emilioastarita/lyricfier.git

# change dir
cd lyricfier

# take some coffee and download all the internet with npm
npm install

```

## Run dev

```
npm start
```



## How it works

We retrieve the current song of spotify client using the spotify built-in web server that allow us to ask for the current status of the player.
The built-in web server could run in a range of ports starting at 4370. Lyricfier will launch multiple connections hoping find the actual port. 
You can read a more detailed explanation here: [Deconstructing Spotify's built-in HTTP server](http://cgbystrom.com/articles/deconstructing-spotifys-builtin-http-server/)

## Scraping plugins

You can easily write a new scraping plugin. Just look at the folder `render/plugins` for some inspiration. 




## Collaborators

Original Idea: [@fedeisas](https://github.com/fedeisas)

Bug fixes and lot of improvements [@mrkmndz](https://github.com/mrkmndz)

UI/Design: [@silvestreh](https://github.com/silvestreh) 

#### License [CC0 (Public Domain)](LICENSE.md)
