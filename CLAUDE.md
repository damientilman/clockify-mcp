<!-- camofox-cloud:start -->
## Camofox : accès aux sites protégés

Quand un site refuse l'accès (403, captcha, page vide, détection de bot), passer par Camofox, un navigateur furtif hébergé sur le Mac de Damien. Ne l'essayer qu'après l'échec d'un accès direct.

- Session locale : outils MCP `camofox_fetch`, `camofox_search`, `camofox_screenshot`.
- Session Cloud : appel HTTP avec le jeton de la variable d'environnement `CAMOFOX_TOKEN`.

```bash
# Page en snapshot de texte
curl -s -H "Authorization: Bearer $CAMOFOX_TOKEN" \
  -d '{"url":"https://exemple.com/page"}' https://camofox.tilman.marketing/fetch

# Recherche (engine : google, youtube, amazon, reddit, reddit_subreddit, wikipedia, linkedin, instagram, tiktok, yelp, twitter)
curl -s -H "Authorization: Bearer $CAMOFOX_TOKEN" \
  -d '{"engine":"google","query":"ma requête"}' https://camofox.tilman.marketing/search

# Capture PNG
curl -s -H "Authorization: Bearer $CAMOFOX_TOKEN" \
  -d '{"url":"https://exemple.com"}' -o capture.png https://camofox.tilman.marketing/screenshot
```

La réponse de `/fetch` et `/search` est un JSON `{url, text, truncated, nextOffset}`. Si `truncated` est vrai, relancer avec `"offset": <nextOffset>`. Limite de 20 requêtes par minute. Sur un 401 ou une connexion impossible, le dire à Damien (le Mac est peut-être éteint) au lieu de chercher un contournement.
<!-- camofox-cloud:end -->
