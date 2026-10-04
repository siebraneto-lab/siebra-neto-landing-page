"""Sincroniza lançamentos do artista no Spotify -> releases.json.
Credenciais vêm de variáveis de ambiente (GitHub Secrets): SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET.
Regra: mais recente primeiro."""
import base64, json, os, sys, urllib.parse, urllib.request

ARTIST_ID = "0bKK5d0pmO8aLjYmGjXeAn"

def http(url, data=None, headers=None):
    req = urllib.request.Request(url, data=data, headers=headers or {})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def main():
    cid, sec = os.environ.get("SPOTIFY_CLIENT_ID"), os.environ.get("SPOTIFY_CLIENT_SECRET")
    if not cid or not sec:
        sys.exit("Faltam SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET nos Secrets do GitHub.")
    auth = base64.b64encode(f"{cid}:{sec}".encode()).decode()
    tok = http("https://accounts.spotify.com/api/token",
               data=urllib.parse.urlencode({"grant_type": "client_credentials"}).encode(),
               headers={"Authorization": f"Basic {auth}", "Content-Type": "application/x-www-form-urlencoded"})["access_token"]
    H = {"Authorization": f"Bearer {tok}"}
    items, url = [], f"https://api.spotify.com/v1/artists/{ARTIST_ID}/albums?include_groups=single,album,appears_on&market=BR&limit=50"
    while url:
        d = http(url, headers=H); items += d["items"]; url = d.get("next")
    vistos, saida = set(), []
    for a in items:
        if a["id"] in vistos: continue
        vistos.add(a["id"])
        faixas = a.get("total_tracks", 1)
        saida.append({
            "id": a["id"],
            "tipo": "track" if (a["album_type"] == "single" and faixas == 1) else "album",
            "titulo": a["name"],
            "data_lancamento": (a["release_date"] + "-01-01")[:10] if len(a["release_date"]) == 4 else (a["release_date"] + "-01")[:10] if len(a["release_date"]) == 7 else a["release_date"],
            "compositor": "Siebra Neto",
            "genero": "MPB / Rock / Reggae",
            "capa_url": a["images"][0]["url"] if a.get("images") else None,
            "url_spotify": a["external_urls"]["spotify"],
            "faixas": faixas,
        })
    # singles de 1 faixa: usar o ID da faixa para o player de faixa
    for s in saida:
        if s["tipo"] == "track":
            t = http(f"https://api.spotify.com/v1/albums/{s['id']}/tracks?limit=1&market=BR", headers=H)
            if t["items"]: s["id"] = t["items"][0]["id"]
    saida.sort(key=lambda x: x["data_lancamento"], reverse=True)
    if not saida: sys.exit("Spotify retornou 0 lançamentos; mantendo releases.json atual.")
    with open("releases.json", "w", encoding="utf-8") as f:
        json.dump({"artista_id": ARTIST_ID, "total": len(saida), "lancamentos": saida}, f, ensure_ascii=False, indent=2)
    print(f"{len(saida)} lançamentos gravados. Mais recente: {saida[0]['titulo']} ({saida[0]['data_lancamento']})")

if __name__ == "__main__":
    main()
