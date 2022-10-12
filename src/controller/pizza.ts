import { addPizzaToppings, setPizzaName } from '../model';
import { PizzaTopping } from '../type';

import { SpotifyWebApi } from '../webApiHelpers';

const scopes = [
  'ugc-image-upload',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
  'app-remote-control',
  'user-read-email',
  'user-read-private',
  'playlist-read-collaborative',
  'playlist-modify-public',
  'playlist-read-private',
  'playlist-modify-private',
  'user-library-modify',
  'user-library-read',
  'user-top-read',
  'user-read-playback-position',
  'user-read-recently-played',
  'user-follow-read',
  'user-follow-modify'
];

export let spotifyWebApi: SpotifyWebApi;

export const makePizza = () => {
  return ((dispatch: any, getState: any): any => {

    dispatch(setPizzaName({ type: 'Pizza Bianco' }));

    const pizzaToppings: PizzaTopping[] = [
      { label: 'Pepperoni', meat: true },
      { label: 'Garlic', meat: false },
    ];

    dispatch(addPizzaToppings(pizzaToppings));

    console.log('pizzaState');
    console.log(getState());

    spotifyWebApi = new SpotifyWebApi({
      redirectUri: 'http://localhost:8888/callback',
      clientId: '039a29e66a4b49508dd6de7ae97a3435',
      clientSecret: '7e624b296e7c4a4f8b52d6e6d4531029',
    });

    console.log(spotifyWebApi);

    authenticateUser();

  });
};

export function authenticateUser() {
  const authorizationUrl: string = spotifyWebApi.createAuthorizeURL(scopes);
  console.log(authorizationUrl);
  // response.redirect(authorizationUrl);
}


