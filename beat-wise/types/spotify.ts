export interface SpotifyImage {
    url: string;
    height: number;
    width: number;
  }
  
  export interface SpotifyArtist {
    id: string;
    name: string;
  }
  
  export interface SpotifyAlbum {
    id: string;
    name: string;
    release_date: string;
    images: SpotifyImage[];
  }
  
  export interface SearchResult {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
  }
  
  export interface SpotifySearchResponse {
    tracks: {
      items: SearchResult[];
    };
  }