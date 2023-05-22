export type AccountPreset = {
  key: string;
  name: string;
  icon?: string;
  backgroundStyle: string;
  profileUrl: string;
  color: string;
  providerKey: number;
};

export class AccountPresets {
  static set: AccountPreset[] = [
    {
      key: 'discord',
      name: 'Discord',
      icon: 'logo-discord',
      backgroundStyle: 'background: linear-gradient(135deg, #7289DA 0%, #545961 100%);',
      color: 'color: #fff',
      profileUrl: 'https://discord.com/users/',
      providerKey: 0
    },
    {
      key: 'twitter',
      backgroundStyle: 'background: #1DA1F2;',
      name: 'Twitter',
      icon: 'logo-twitter',
      color: 'color: #fff',
      profileUrl: 'https://twitter.com/',
      providerKey: 1
    },
    {
      key: 'instagram',
      backgroundStyle: 'background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white;',
      name: 'Instagram',
      icon: 'logo-instagram',
      color: 'color: #fff',
      profileUrl: 'https://www.instagram.com/',
      providerKey: 2
    },
    {
      key: 'snapchat',
      backgroundStyle: 'background: #FFFC00;',
      name: 'Snapchat',
      icon: 'logo-snapchat',
      color: 'color: #000',
      profileUrl: 'https://www.snapchat.com/add/',
      providerKey: 3
    },
    {
      key: 'facebook',
      backgroundStyle: 'background:linear-gradient(120deg, #3b5998, #FFFFFF);',
      name: 'Facebook',
      icon: 'logo-facebook',
      color: 'color: #fff',
      profileUrl: 'https://www.facebook.com/',
      providerKey: 4
    },
    {
      key: 'linkedin',
      backgroundStyle: 'background:linear-gradient(45deg, #000000, #0077b5, #00a0dc);',
      name: 'LinkedIn',
      icon: 'logo-linkedin',
      color: 'color: #fff',
      profileUrl: 'https://www.linkedin.com/in/',
      providerKey: 5
    },
    {
      key: 'tiktok',
      backgroundStyle: 'background: #000000;',
      name: 'TikTok',
      icon: 'logo-tiktok',
      color: 'color: #fff',
      profileUrl: 'https://www.tiktok.com/@',
      providerKey: 6
    },
    {
      key: 'youtube',
      backgroundStyle: 'background:linear-gradient(120deg, #ff0000, #282828);',
      name: 'YouTube',
      icon: 'logo-youtube',
      color: 'color: #fff',
      profileUrl: 'https://www.youtube.com/channel/',
      providerKey: 7
    },
    {
      key: 'twitch',
      backgroundStyle: 'background: #9146FF;',
      name: 'Twitch',
      icon: 'logo-twitch',
      color: 'color: #fff',
      profileUrl: 'https://www.twitch.tv/',
      providerKey: 8
    },
    {
      key: 'reddit',
      backgroundStyle: 'background:linear-gradient(-120deg, #ff4500, #5f99cf, #cee3f8);',
      name: 'Reddit',
      icon: 'logo-reddit',
      color: 'color: #fff',
      profileUrl: 'https://www.reddit.com/user/',
      providerKey: 9
    },
    {
      key: 'github',
      backgroundStyle: 'background: #333333;',
      name: 'GitHub',
      icon: 'logo-github',
      color: 'color: #fff',
      profileUrl: 'https://www.github.com/',
      providerKey: 10
    },
    {
      key: 'pinterest',
      backgroundStyle: 'background:linear-gradient(-120deg, #FFFFFF, #bd081c, #000000);',
      name: 'Pinterest',
      icon: 'logo-pinterest',
      color: 'color: #fff',
      profileUrl: 'https://www.pinterest.com/',
      providerKey: 11
    },
    {
      key: 'tumblr',
      backgroundStyle: 'background:linear-gradient(120deg, #35465c, #FFFFFF);',
      name: 'Tumblr',
      icon: 'logo-tumblr',
      color: 'color: #fff',
      profileUrl: 'https://tumblr.com/',
      providerKey: 12
    },
    {
      key: 'soundcloud',
      backgroundStyle: 'background:linear-gradient(120deg, #ff8800, #ff3300);',
      name: 'SoundCloud',
      icon: 'logo-soundcloud',
      color: 'color: #fff',
      profileUrl: 'https://soundcloud.com/',
      providerKey: 13
    },
    {
      key: 'spotify',
      backgroundStyle: 'background:linear-gradient(120deg, #1db954, #191414);',
      name: 'Spotify',
      color: 'color: #fff',
      profileUrl: 'https://open.spotify.com/user/',
      providerKey: 14
    },
    {
      key: 'steam',
      backgroundStyle: 'background:linear-gradient(120deg, #00adee, #000000);',
      name: 'Steam',
      icon: 'logo-steam',
      color: 'color: #fff',
      profileUrl: 'https://steamcommunity.com/id/',
      providerKey: 15
    },
    {
      key: 'xbox',
      backgroundStyle: 'background:linear-gradient(120deg, #52b043, #FFFFFF);',
      name: 'Xbox',
      icon: 'logo-xbox',
      color: 'color: #fff',
      profileUrl: 'https://account.xbox.com/en-US/Profile?Gamertag=',
      providerKey: 16
    },
    {
      key: 'playstation',
      backgroundStyle: 'background:linear-gradient(-170deg, #FFFFFF, #000080);',
      name: 'PlayStation',
      icon: 'logo-playstation',
      color: 'color: #fff',
      profileUrl: 'https://my.playstation.com/profile/',
      providerKey: 17
    },
    {
      key: 'nintendo',
      backgroundStyle: 'background: #E60012;',
      name: 'Nintendo',
      color: 'color: #fff',
      profileUrl: 'https://my.nintendo.com/profile/',
      providerKey: 18
    },
    {
      key: 'deezermusic',
      backgroundStyle: 'background:linear-gradient(56deg, rgba(255,237,0,1) 14%, rgba(255,0,146,1) 38%, rgba(0,199,242,1) 70%, rgba(193,241,252,1) 100%);',
      name: 'Deezer',
      icon: 'musical-notes',
      color: 'color: #fff',
      profileUrl: 'https://www.deezer.com/profile/',
      providerKey: 19
    }
  ];
}
