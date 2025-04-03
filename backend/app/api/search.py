from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from ..services.serp_service import SerpService
import logging
import traceback
import httpx

# Set up logging with basic configuration for the module
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the API router instance
router = APIRouter()
# Instantiate the SerpService (note: methods like get_local_results and get_related_questions are not used here)
serp_service = SerpService()

@router.get("/search")
async def search(query: str) -> Dict[str, Any]:
    """
    Perform a comprehensive search using SerpAPI endpoints.
    
    This endpoint:
      - Logs the search request.
      - Calls the main search method from SerpService.
      - Handles various exceptions (HTTP errors, network issues, unexpected errors)
        and converts them into appropriate HTTPExceptions.
    """
    logger.info(f"Search request received for query: {query}")
    
    try:
        # Retrieve all search results via the SerpService
        results = await serp_service.search(query)
        logger.info(f"Search successful for query: {query}")
        return results
    
    except httpx.HTTPStatusError as e:
        # Handle HTTP errors from the external API
        status_code = e.response.status_code
        error_detail = f"SerpAPI HTTP Error: {status_code} - {str(e)}"
        logger.error(error_detail)
        logger.error(f"Response content: {e.response.text}")
        
        # Customize HTTP responses based on status code
        if status_code in [401, 403]:
            raise HTTPException(
                status_code=500,
                detail="API key authentication error. Please check your SerpAPI key."
            )
        elif status_code == 429:
            raise HTTPException(
                status_code=503,
                detail="Rate limit exceeded. Please try again later."
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"External API error: {str(e)}"
            )
            
    except httpx.RequestError as e:
        # Handle network or connection errors
        error_detail = f"Network error when connecting to SerpAPI: {str(e)}"
        logger.error(error_detail)
        raise HTTPException(
            status_code=503,
            detail="Connection error when reaching search provider. Please try again later."
        )
        
    except Exception as e:
        # Handle any other unexpected errors
        error_detail = f"Search failed: {str(e)}"
        logger.error(error_detail)
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=error_detail
        )
