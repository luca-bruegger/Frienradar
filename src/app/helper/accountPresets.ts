export type AccountPreset = {
  key: string;
  name: string;
  icon: string;
  backgroundStyle: string;
  titleStyle: string;
  textStyle: string;
  profileUrl: string;
};

export class AccountPresets {
  static set: AccountPreset[] = [
    {
      key: 'discord',
      name: 'Discord',
      icon: 'logo-discord',
      backgroundStyle: 'background: linear-gradient(135deg, #7289DA 0%, #2C2F33 100%)',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://discord.com/users/'
    },
    {
      key: 'twitter',
      backgroundStyle: 'background-color: #1DA1F2; color: white;',
      name: 'Twitter',
      icon: 'logo-twitter',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://twitter.com/'
    },
    {
      key: 'instagram',
      backgroundStyle: 'background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); color: white;',
      name: 'Instagram',
      icon: 'logo-instagram',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.instagram.com/'
    },
    {
      key: 'snapchat',
      backgroundStyle: 'background: #FFFC00;',
      name: 'Snapchat',
      icon: 'logo-snapchat',
      titleStyle: 'color: #000',
      textStyle: 'color: #000',
      profileUrl: 'https://www.snapchat.com/add/'
    },
    {
      key: 'facebook',
      backgroundStyle: 'background-color: #4267B2; color: white;',
      name: 'Facebook',
      icon: 'logo-facebook',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.facebook.com/'
    },
    {
      key: 'linkedin',
      backgroundStyle: 'background-color: #0A66C2; color: white;',
      name: 'LinkedIn',
      icon: 'logo-linkedin',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.linkedin.com/in/'
    },
    {
      key: 'tiktok',
      backgroundStyle: 'background-color: #000000; color: white;',
      name: 'TikTok',
      icon: 'logo-tiktok',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.tiktok.com/@'
    },
    {
      key: 'youtube',
      backgroundStyle: 'background-color: #FF0000; color: white;',
      name: 'YouTube',
      icon: 'logo-youtube',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.youtube.com/channel/'
    },
    {
      key: 'twitch',
      backgroundStyle: 'background-color: #9146FF; color: white;',
      name: 'Twitch',
      icon: 'logo-twitch',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.twitch.tv/'
    },
    {
      key: 'reddit',
      backgroundStyle: 'background-color: #FF4500; color: white;',
      name: 'Reddit',
      icon: 'logo-reddit',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.reddit.com/user/'
    },
    {
      key: 'github',
      backgroundStyle: 'background-color: #333333; color: white;',
      name: 'GitHub',
      icon: 'logo-github',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.github.com/'
    },
    {
      key: 'pinterest',
      backgroundStyle: 'background-color: #E60023; color: white;',
      name: 'Pinterest',
      icon: 'logo-pinterest',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://www.pinterest.com/'
    },
    {
      key: 'tumblr',
      backgroundStyle: 'background-color: #35465C; color: white;',
      name: 'Tumblr',
      icon: 'logo-tumblr',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://'
    },
    {
      key: 'soundcloud',
      backgroundStyle: 'background-color: #FF3300; color: white;',
      name: 'SoundCloud',
      icon: 'logo-soundcloud',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://soundcloud.com/'
    },
    {
      key: 'spotify',
      backgroundStyle: 'background-color: #1DB954; color: white;',
      name: 'Spotify',
      icon: 'logo-spotify',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://open.spotify.com/user/'
    },
    {
      key: 'steam',
      backgroundStyle: 'background-color: #000000; color: white;',
      name: 'Steam',
      icon: 'logo-steam',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://steamcommunity.com/id/'
    },
    {
      key: 'xbox',
      backgroundStyle: 'background-color: #107C10; color: white;',
      name: 'Xbox',
      icon: 'logo-xbox',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://account.xbox.com/en-US/Profile?Gamertag='
    },
    {
      key: 'playstation',
      backgroundStyle: 'background-color: #003087; color: white;',
      name: 'PlayStation',
      icon: 'logo-playstation',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://my.playstation.com/profile/'
    },
    {
      key: 'nintendo',
      backgroundStyle: 'background-color: #E60012; color: white;',
      name: 'Nintendo',
      icon: 'logo-nintendo',
      titleStyle: 'color: #fff',
      textStyle: 'color: #fff',
      profileUrl: 'https://my.nintendo.com/profile/'
    },
  ];
}
