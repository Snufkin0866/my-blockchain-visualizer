# Blockchain Transaction Visualizer - System Patterns

## System Architecture

The Blockchain Transaction Visualizer follows a modern client-server architecture with clear separation of concerns:

```mermaid
graph TD
    Client[Frontend Client] <--> API[Backend API]
    API <--> DB[(Database)]
    API <--> BC[Blockchain APIs]
    
    subgraph Frontend
        React[React Application]
        D3[D3.js Visualization]
        MUI[Material UI Components]
        APIClient[API Client Service]
    end
    
    subgraph Backend
        FastAPI[FastAPI Framework]
        BlockchainAdapters[Blockchain Adapters]
        DataModels[Data Models]
        DBLayer[Database Layer]
    end
    
    subgraph External
        Etherscan[Etherscan API]
        BlockCypher[BlockCypher API]
    end
    
    Client --> Frontend
    API --> Backend
    BC --> External
```

## Key Technical Decisions

### 1. Containerized Deployment
- **Decision**: Use Docker and Docker Compose for deployment
- **Rationale**: Ensures consistent environment across development and production, simplifies setup process
- **Implementation**: Separate Dockerfiles for frontend and backend, orchestrated with docker-compose.yml

### 2. API Abstraction Layer
- **Decision**: Create blockchain-specific adapters that implement a common interface
- **Rationale**: Allows for consistent handling of different blockchain data sources
- **Implementation**: Base classes with blockchain-specific implementations (Bitcoin, Ethereum)

### 3. Database Caching
- **Decision**: Store retrieved blockchain data in a local database
- **Rationale**: Reduces API calls, improves performance, handles rate limits
- **Implementation**: SQLAlchemy ORM with PostgreSQL

### 4. Depth-Based Network Exploration
- **Decision**: Implement configurable "depth" for transaction network exploration
- **Rationale**: Balances between comprehensive data and performance/complexity
- **Implementation**: Recursive API calls with depth limiting

### 5. Frontend Framework
- **Decision**: Use React with Material UI
- **Rationale**: Component-based architecture, rich ecosystem, responsive design
- **Implementation**: Functional components with hooks for state management

### 6. Visualization Library
- **Decision**: Use D3.js for network visualization
- **Rationale**: Powerful, flexible visualization capabilities for complex network graphs
- **Implementation**: Custom D3 integration with React components

## Design Patterns

### 1. Adapter Pattern
- **Usage**: Blockchain API integrations
- **Implementation**: Base blockchain adapter class with specific implementations for each blockchain
- **Benefits**: Consistent interface for different data sources

```mermaid
classDiagram
    class BlockchainAdapter {
        <<abstract>>
        +get_transactions(address, start_date, end_date)
        +get_network(address, depth)
    }
    
    class BitcoinAdapter {
        +get_transactions(address, start_date, end_date)
        +get_network(address, depth)
    }
    
    class EthereumAdapter {
        +get_transactions(address, start_date, end_date)
        +get_network(address, depth)
    }
    
    BlockchainAdapter <|-- BitcoinAdapter
    BlockchainAdapter <|-- EthereumAdapter
```

### 2. Repository Pattern
- **Usage**: Database access
- **Implementation**: Database models and operations encapsulated in repository classes
- **Benefits**: Separation of data access logic from business logic

### 3. Service Pattern
- **Usage**: Business logic implementation
- **Implementation**: Service classes that coordinate between API adapters and repositories
- **Benefits**: Encapsulation of complex operations, reusability

### 4. Component Pattern
- **Usage**: Frontend UI organization
- **Implementation**: Reusable React components (SearchForm, TransactionList, NetworkGraph)
- **Benefits**: Modularity, reusability, maintainability

### 5. Dependency Injection
- **Usage**: Backend service configuration
- **Implementation**: FastAPI dependency injection system
- **Benefits**: Testability, flexibility, configuration management

## Component Relationships

### Backend Components

```mermaid
graph TD
    API[API Endpoints] --> Services[Services]
    Services --> Adapters[Blockchain Adapters]
    Services --> Repositories[Repositories]
    Repositories --> Models[Data Models]
    Adapters --> ExternalAPIs[External APIs]
    
    subgraph API Endpoints
        TransactionAPI[Transaction Endpoints]
        NetworkAPI[Network Endpoints]
    end
    
    subgraph Services
        TransactionService[Transaction Service]
        NetworkService[Network Service]
    end
    
    subgraph Adapters
        BitcoinAdapter[Bitcoin Adapter]
        EthereumAdapter[Ethereum Adapter]
    end
    
    subgraph Repositories
        TransactionRepo[Transaction Repository]
        AddressRepo[Address Repository]
    end
```

### Frontend Components

```mermaid
graph TD
    App[App] --> Router[Router]
    Router --> Pages[Pages]
    Pages --> Components[Components]
    Components --> Services[API Services]
    
    subgraph Pages
        Dashboard[Dashboard]
        NetworkVis[Network Visualization]
        TxExplorer[Transaction Explorer]
        About[About]
    end
    
    subgraph Components
        SearchForm[Search Form]
        TxList[Transaction List]
        NetworkGraph[Network Graph]
        NetworkInfo[Network Info]
        TxStats[Transaction Stats]
    end
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as Frontend UI
    participant API as Backend API
    participant DB as Database
    participant Blockchain as Blockchain APIs
    
    User->>UI: Enter address
    UI->>API: Request transactions
    API->>DB: Check cached data
    
    alt Data in cache
        DB->>API: Return cached data
    else No cached data
        API->>Blockchain: Request data
        Blockchain->>API: Return blockchain data
        API->>DB: Store data
        API->>UI: Return data
    end
    
    UI->>User: Display transactions
    
    User->>UI: Request network visualization
    UI->>API: Get network data
    API->>DB: Check network data
    
    alt Network data in cache
        DB->>API: Return cached network
    else No cached network
        API->>Blockchain: Request network data
        Blockchain->>API: Return network data
        API->>DB: Store network data
        API->>UI: Return network data
    end
    
    UI->>User: Display network visualization
```

## Technical Constraints and Considerations

1. **API Rate Limits**
   - Etherscan: 5 calls/second
   - BlockCypher: 3 calls/second and 200 calls/hour
   - Solution: Caching, rate limiting, and request batching

2. **Data Volume**
   - Challenge: Addresses with thousands of transactions
   - Solution: Pagination, filtering, and optimized database queries

3. **Visualization Performance**
   - Challenge: Rendering large network graphs
   - Solution: Limit depth, implement zooming/filtering, use WebGL for rendering

4. **Cross-Browser Compatibility**
   - Challenge: Ensuring consistent visualization across browsers
   - Solution: Browser testing, polyfills, and responsive design
