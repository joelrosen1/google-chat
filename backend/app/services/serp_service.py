import os
import re
import asyncio
import logging
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse, parse_qs

import httpx
import backoff

from dotenv import load_dotenv
load_dotenv()

# Configure logger for the module
logger = logging.getLogger(__name__)

class SerpService:
    """
    A service class for interacting with the SerpAPI to perform search queries,
    retrieve local results, and generate AI-based responses.
    """
    def __init__(self):
        # Retrieve API key from environment variables
        self.api_key = os.getenv("SERPAPI_KEY")
        if not self.api_key:
            raise ValueError("SERPAPI_KEY environment variable is not set")
        
        # Base URL and timeout settings for API requests
        self.base_url = "https://serpapi.com/search.json"
        self.timeout = 30.0
        
        logger.info("SerpService initialized with API key")

    @backoff.on_exception(
        backoff.expo,
        (httpx.HTTPError, httpx.TimeoutException),
        max_tries=3,
        # Give up retrying for HTTP status errors 401 or 403
        giveup=lambda e: isinstance(e, httpx.HTTPStatusError) and e.response.status_code in [401, 403]
    )
    async def _make_api_request(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """
        Internal method to make an API request using given parameters with retry logic.
        Uses an asynchronous HTTP client and raises an exception for any HTTP errors.
        """
        logger.info(f"Making API request with params: {params}")
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(self.base_url, params=params)
            response.raise_for_status()
            return response.json()

    async def _get_ai_overview_by_token(self, page_token: str) -> str:
        """
        Internal method to fetch an AI overview using a page token.
        Constructs the appropriate parameters and retrieves the response.
        """
        params = {
            "engine": "google_ai_overview",
            "page_token": page_token,
            "api_key": self.api_key,
        }
        try:
            data = await self._make_api_request(params)
            # Check if the response contains the AI overview and its text blocks
            if "ai_overview" in data and "text_blocks" in data["ai_overview"]:
                text_blocks = data["ai_overview"]["text_blocks"]
                # Join available snippets from text blocks into a single answer
                ai_answer = "\n\n".join(
                    block.get("snippet", "") for block in text_blocks if block.get("snippet")
                )
                logger.info("AI overview generated using page token.")
                return ai_answer
            return ""
        except Exception as e:
            logger.error(f"Error fetching AI overview by token: {e}")
            return ""

    async def generate_ai_response(
        self, 
        query: str, 
        organic_results: List[Dict[str, Any]], 
        knowledge_graph: Optional[Dict[str, Any]] = None,
        ai_overview_token: Optional[str] = None
    ) -> str:
        """
        Generate a concise AI response based on search results.
        
        Priority:
        1. Use the knowledge graph if available.
        2. Use the AI overview via the provided token.
        3. Fall back to organic search results.
        4. If no information is available, prompt the user to rephrase.
        """
        # Use the knowledge graph if it contains a title and description
        if knowledge_graph and knowledge_graph.get("title") and knowledge_graph.get("description"):
            return (
                f"**{knowledge_graph['title']}** is {knowledge_graph['description']} "
                f"[[1]](https://www.google.com/search?q={query.replace(' ', '+')})\n\n"
            )

        # Use AI overview if token is provided
        if ai_overview_token:
            ai_answer = await self._get_ai_overview_by_token(ai_overview_token)
            if ai_answer:
                return ai_answer

        # use organic search results
        if organic_results:
            response = f"Here's what I found about **{query}**:\n\n"
            for i, result in enumerate(organic_results[:3], 1):
                snippet = result.get("snippet", "")
                if snippet:
                    clean_snippet = self._clean_snippet(snippet)
                    response += f"* {clean_snippet} [[{i}]]({result.get('link')})\n\n"
            return response

        # Default message if no results were found
        return f"I couldn't find any relevant information for **{query}**. Please try rephrasing your query."

    def _clean_snippet(self, snippet: str) -> str:
        """
        Clean up a snippet for better readability in the AI response.
        - Removes extra whitespace.
        - Splits the snippet on source markers (e.g., [1], [2]) and formats them as bullet points.
        """
        clean = re.sub(r'\s+', ' ', snippet).strip()
        # Split snippet based on source markers and remove any empty strings
        sources = [s for s in re.split(r'\s*\[\d+\]\s*', clean) if s]
        bullet_list = []
        for source in sources:
            source = source.strip()
            # Append a period if the snippet does not end with punctuation
            if source and not source.endswith(('.', '!', '?')):
                source += '.'
            bullet_list.append(f"• {source}")
        return "\n".join(bullet_list)

    async def search(self, query: str) -> Dict[str, Any]:
        """
        Main method to perform a search query using SerpAPI.
        - Validates the query.
        - Constructs parameters for different search engines (general, local, images).
        - Uses asynchronous requests to fetch data in parallel.
        - Processes and formats the results.
        """
        if not query.strip():
            logger.warning("Empty query provided")
            return {
                "organic_results": [],
                "knowledge_graph": None,
                "related_questions": [],
                "related_searches": [],
                "ai_response": "Please provide a search query."
            }
        
        logger.info(f"Processing search for query: {query}")
        
        # Define parameters for different search endpoints
        params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google",
            "google_domain": "google.com",
            "gl": "us",
            "hl": "en",
            "num": 10,
        }
        local_params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google_local",
            "google_domain": "google.com",
            "gl": "us",
            "hl": "en",
            "location": "United States",
        }
        image_params = {
            "q": query,
            "api_key": self.api_key,
            "engine": "google_images",
            "google_domain": "google.com",
            "gl": "us",
            "hl": "en",
            "num": 10,
        }

        try:
            # Make parallel API requests for general search, local results, and images
            search_data, local_data, images_data = await asyncio.gather(
                self._make_api_request(params),
                self._make_api_request(local_params),
                self._make_api_request(image_params)
            )
            logger.info(f"Successfully fetched search results for query: {query}")

            # Attach image results to the knowledge graph if available
            if "knowledge_graph" in search_data:
                search_data["knowledge_graph"]["images"] = images_data.get("images_results", [])[:10]

            # Process and format search results
            processed_results = {
                "organic_results": [
                    {
                        "title": result.get("title", ""),
                        "link": result.get("link", ""),
                        "snippet": result.get("snippet", "")
                    }
                    for result in search_data.get("organic_results", [])
                ],
                "knowledge_graph": {
                    "title": search_data.get("knowledge_graph", {}).get("title"),
                    "description": search_data.get("knowledge_graph", {}).get("description"),
                    "image": search_data.get("knowledge_graph", {}).get("image"),
                    "images": search_data.get("knowledge_graph", {}).get("images", [])
                } if "knowledge_graph" in search_data else None,
                "related_questions": search_data.get("related_questions", []),
                "related_searches": search_data.get("related_searches", []),
                "local_results": [
                    {
                        "title": result.get("title", ""),
                        "address": result.get("address", ""),
                        "rating": float(result.get("rating", 0)),
                        "reviews": int(result.get("reviews", 0)),
                        "gps_coordinates": {
                            "latitude": float(result.get("gps_coordinates", {}).get("latitude", 0)),
                            "longitude": float(result.get("gps_coordinates", {}).get("longitude", 0))
                        }
                    }
                    for result in local_data.get("local_results", [])[:3]
                    if isinstance(result, dict)
                ]
            }

            # Attempt to extract the AI overview token from the search response
            ai_overview = search_data.get("ai_overview", {})
            ai_overview_token = ai_overview.get("page_token")
            if not ai_overview_token and "serpapi_link" in ai_overview:
                parsed_url = urlparse(ai_overview["serpapi_link"])
                token_list = parse_qs(parsed_url.query).get("page_token")
                if token_list:
                    ai_overview_token = token_list[0]
                    logger.info("Extracted AI overview token from serpapi_link.")

            # Generate the AI response based on available information
            processed_results["ai_response"] = await self.generate_ai_response(
                query, 
                processed_results["organic_results"],
                processed_results["knowledge_graph"],
                ai_overview_token=ai_overview_token
            )
            return processed_results

        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error during search: {e}")
            if hasattr(e, 'response') and e.response:
                logger.error(f"Response details: {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Error during search: {e}")
            raise