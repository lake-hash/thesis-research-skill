"""Match a downloaded public RSS item by GUID, never by title similarity."""
import argparse
import email.utils
import datetime
import json
from pathlib import Path
import xml.etree.ElementTree as ET

parser = argparse.ArgumentParser()
parser.add_argument("rss_file")
parser.add_argument("episode_guid")
parser.add_argument("--out-item")
args = parser.parse_args()
root = ET.parse(args.rss_file).getroot()
items = [item for item in ([root] if root.tag == "item" else root.findall("./channel/item"))
         if (item.findtext("guid") or "").strip() == args.episode_guid]
if len(items) != 1:
    raise SystemExit("Expected one exact episode GUID; this RSS window may not cover the episode")
item = items[0]
if args.out_item:
    with Path(args.out_item).open("x", encoding="utf-8") as output:
        output.write(ET.tostring(item, encoding="unicode"))
raw_date = item.findtext("pubDate") or ""
published = email.utils.parsedate_to_datetime(raw_date)
# RFC 5322: -0000 is Universal Time with an unknown original local zone.
if published.tzinfo is None and raw_date.strip().endswith("-0000"):
    published = published.replace(tzinfo=datetime.timezone.utc)
if published.tzinfo is None:
    raise SystemExit("RSS publication date has no timezone")
enclosure = item.find("enclosure")
print(json.dumps({
    "episode_id": args.episode_guid,
    "display_name": item.findtext("title"),
    "url": item.findtext("link"),
    "published_at": published.isoformat(),
    "publication_date_raw": raw_date,
    "audio_url": enclosure.get("url") if enclosure is not None else None,
    "duration": item.findtext("{http://www.itunes.com/dtds/podcast-1.0.dtd}duration"),
}, ensure_ascii=False, indent=2))
