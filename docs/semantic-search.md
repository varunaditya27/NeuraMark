# Semantic Search

NeuraMark's semantic search feature allows users to find similar proofs using natural language queries, providing a powerful tool for content discovery and analysis.

## AI-Powered Search

The semantic search functionality is powered by Jina AI and ChromaDB, which work together to understand the meaning of your content, not just the keywords.

### How It Works

1.  **Embeddings Generation**: Jina AI generates 1024-dimensional semantic embeddings for the content of each proof.
2.  **Vector Storage**: These vector representations are stored in a ChromaDB cloud-hosted database.
3.  **Similarity Ranking**: When you perform a search, the system uses cosine similarity to rank proofs by their semantic relevance to your query.

This approach allows for a more intuitive and powerful search experience, as it can identify related content even if it doesn't share the exact same keywords.

## Use Cases

-   **Content Discovery**: Find proofs that are conceptually similar to your own.
-   **Duplicate Detection**: Check for potential duplicates before registering a new proof.
-   **Content Analysis**: Analyze the similarity of content across your portfolio.

**Note**: This feature is optional and will be gracefully disabled if the necessary ChromaDB and Jina AI credentials are not configured in your `.env.local` file.