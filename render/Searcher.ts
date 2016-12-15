import {SearchLyrics} from './plugins/SearchLyrics';
import {SpotifyService} from "./SpotifyService";
const async = require('async');


interface AlbumResource {
    name: string,
    uri: string,
}

export class Song {
  readonly playing: boolean;
  readonly artist: string;
  readonly title: string;
  readonly album: string;
  readonly albumArt: URL;
  readonly lyricsSourceName: string;
  readonly lyricsSourceURL: string;
  readonly lyrics: string;

  private constructor(
    playing: boolean,
    artist: string,
    title: string,
    album: string,
    albumArt: URL,
    lyricsSourceName: string,
    lyricsSourceURL: string,
    lyrics: string,
  ) {
      this.playing = playing;
      this.artist = artist || 'Unknown';
      this.title = title || 'Unknown';
      this.album = album || 'Unknown';
      this.albumArt = albumArt;
      this.lyricsSourceName = lyricsSourceName;
      this.lyricsSourceURL = lyricsSourceURL;
      this.lyrics = lyrics;
  }

  static makeWithAlbumResource(
      playing: boolean,
      artist: string,
      title: string,
      albumResource: AlbumResource,
      spotifyService: SpotifyService,
      cb: (song: Song) => void,
  ) {
      if (albumResource) {
          spotifyService.getAlbumImages(
              albumResource.uri,
              (err, images) => {
                  let albumArt;
                  if (images) {
                    albumArt = images[0];
                  }
                  cb(new Song(
                      playing,
                      artist,
                      title,
                      albumResource.name,
                      albumArt,
                      null,
                      null,
                      'Loading Lyrics...',
                  ));
              }
          );
      } else {
          cb(new Song(
              playing,
              artist,
              title,
              'Unknown',
              null,
              null,
              null,
              'Loading Lyrics...',
          ));
      }
  }

  loadLyrics(plugins:SearchLyrics[], cb: (song: Song) => void) {
      if (plugins.length === 0) {
          cb(new Song(
              this.playing,
              this.artist,
              this.title,
              this.album,
              this.albumArt,
              null,
              null,
              'Sorry, couldn\'t find lyrics for this song!',
          ));
      } else {
          let plugin = plugins[0];
          let remaining = plugins.slice(1);
          plugin.search(
              this.title,
              this.artist,
              (err, result, sourceURL) => {
                  if (err) {
                      console.log('Plugin ' + plugin.getName() + ' error: ' + err);
                      this.loadLyrics(remaining, cb);
                  } else {
                      cb(new Song(
                          this.playing,
                          this.artist,
                          this.title,
                          this.album,
                          this.albumArt,
                          plugin.getName(),
                          sourceURL,
                          result,
                      ));
                  }
              }
          );
      }
  }

  isSameSong(other: Song): boolean {
      for (let k of ['artist', 'title']) {
          if (other[k] !== this[k]) {
              return false;
          }
      }
      return true;
  }
}
