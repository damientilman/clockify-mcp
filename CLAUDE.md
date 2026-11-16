<!-- camofox-cloud:start -->
## Accès aux sites protégés : Firecrawl, puis Camofox

Quand un site refuse l'accès direct (403, captcha, page vide, détection de bot, contenu rendu en JavaScript), passer par Firecrawl via le connecteur Porter, puis par Camofox si Firecrawl échoue. Tant qu'un accès direct fonctionne, ne pas utiliser plus lourd.

### 1. Firecrawl via Porter (premier choix, en local et en Cloud)

Outil : `execute_action` du connecteur « Porter Metrics ». Le préfixe du nom d'outil varie selon la surface (par exemple `mcp__claude_ai_...` ou `mcp__...`), donc chercher l'outil par son nom `execute_action`. Aucun compte à connecter. Il n'est pas toujours listé d'office : s'il n'apparaît pas, le charger avec ToolSearch (query `execute_action`) avant de conclure qu'il manque. Ce connecteur s'appelait auparavant « Google Search Analytics MCP » : si seul cet ancien nom existe dans la session, c'est le même outil. WebFetch ne contourne pas les anti-bots, ne pas s'y arrêter.

- Une page : action `web_scraping.firecrawl_scrape` avec `objective` (obligatoire, une phrase), `url`, `formats: ["markdown"]`, `onlyMainContent: true`.
- Plusieurs pages d'un site : action `web_scraping.firecrawl_crawl` (asynchrone), toujours avec `limit`. Le statut se suit avec l'action de statut de crawl, à trouver par `list_actions(task="check crawl status")`.
- Solde : `web_scraping.firecrawl_credit_usage` avec `{"view": "current"}`.

Coûts : 1 crédit par page scrapée ou crawlée, pas par crawl. Les options s'ajoutent (extraction JSON +4 par page, PDF +1 par page). Une page qui revient en 403 est facturée comme les autres : lire `metadata.statusCode` et ne pas réessayer en boucle. Le pool est de 100 000 crédits par mois, remis à zéro le 15 de chaque mois, sans report. Avant un crawl de plus de 100 pages, annoncer le coût estimé à Damien.

Un message qui commence par « Error: result (N characters) exceeds maximum allowed tokens » n'est pas un échec : l'appel a réussi et le contenu complet est dans le fichier dont le chemin est indiqué. Ne pas relancer le scrape. Lire le fichier par morceaux (python ou jq sur le JSON, champ `result.markdown`) et vérifier `result.metadata.statusCode`.

### 2. Camofox (recours)

Navigateur furtif hébergé sur le Mac de Damien. À utiliser quand Firecrawl renvoie une page vide ou un blocage. Il ne passe pas partout (échec constaté sur g2.com, que Firecrawl passe).

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
