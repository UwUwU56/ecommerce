# Product Filter Design

## 1. Contract Table

| Endpoint | Method | Query Parameters | Description | Success Response | Error Response |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/api/products` | GET | `category` (optional, string) | Fetches a list of products. If `category` is provided, filters the products to match the specified category. | `200 OK` <br> `{ "status": "Success", "data": [...] }` | `500 Internal Server Error` <br> `{ "status": "Fail", "message": "Failed to retrieve products" }` |

## 2. Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Server as Express Server
    participant Service as Products Service
    participant Database as Local JSON

    User->>Frontend: Clicks "Hat" category
    Frontend->>Server: HTTP GET /api/products?category=Hat (Trigger & Request Envelope)
    Server->>Server: Extract 'category' query parameter
    Server->>Service: getAllProducts() (Processing)
    Service->>Database: Read products.json
    Database-->>Service: Return raw data
    Service-->>Server: Return all products
    Server->>Server: Gatekeeper Logic: Filter products by category (Hat)
    Server-->>Frontend: 200 OK, JSON Package { status: "Success", data: [...] } (Response)
    Frontend-->>User: Display filtered products
```

## 3. GenAI Prompts

**Prompt 1: Implementing the Express Route and Controller**
> Write an Express.js route and controller to handle a GET request for `/api/products`.
> 1. Trigger: It should be accessible via `GET /api/products`.
> 2. Request: Accept an optional query parameter for `category`.
> 3. Processing: Implement "Gatekeeper" logic to fetch all products from a service layer, and if the `category` query parameter is present, filter the fetched data by that category (case-insensitive).
> 4. Response: Send back a JSON "Package" with a "Status" field (`"Success"` or `"Fail"`) and a "data" field containing the filtered products. In case of an error, send a 500 status code with an appropriate error message.
> Make sure to add comments explaining the logic flow (Trigger, Request, Processing, Response).
