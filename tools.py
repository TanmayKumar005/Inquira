from langchain.tools import tool
import requests
import os
from bs4 import BeautifulSoup
from tavily import TavilyClient
from rich import print
from dotenv import load_dotenv
load_dotenv()

tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

@tool
def web_search(query: str) -> str:
    """Search for the recent and reliable data on the internet on the topic. Returns Titles, URL, snippets"""
    results = tavily.search(query=query,max_results=5)

    out = []

    for r in results['results']:
        out.append(
        f"Title: {r['title']}\n URL: {r['url']}\n Snippet: {r['content'][:300]}\n"
        )

    return "\n---\n".join(out)

@tool
def scrape_url(url:str) -> str:
    """Scrape the data from the URL for furthur reading."""
    try:
        resp = requests.get(url,timeout=8,headers={"User-Agent": "Mozilla/5.0"})
        soup = BeautifulSoup(resp.text,"html.parser")
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()
        return soup.get_text(separator=" ",strip=True)[:3000]
    except Exception as e:
        return f"Could not scrape URL: {str(e)}"


