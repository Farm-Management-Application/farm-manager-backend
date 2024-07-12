# Farm Manager Backend

This repository contains the backend code for the Farm Manager Application. The Farm Manager Application helps farmers manage their livestock, including chickens, fish, and pigs. This backend is built using Node.js and Express, with MongoDB as the database.

## Features

- **Livestock Management**: CRUD operations for chickens, fish, and pigs.
- **Production Estimation**: Calculate and estimate production based on livestock data.
- **User Authentication**: Secure user authentication and authorization.
- **Database Integration**: Integration with MongoDB for persistent data storage.

## Technologies Used

- **Node.js**: Runtime environment for the backend logic.
- **Express**: Web framework for building the API.
- **MongoDB**: Database for storing livestock and user data.
- **JWT**: JSON Web Tokens for secure authentication.
- **Yarn**: Dependency management.

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Farm-Management-Application/farm-manager-backend.git
   cd farm-manager-backend
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Set up the database**:
   - Ensure MongoDB is running.
   - Update the database configuration in `.env` file.

4. **Run the application**:
   ```bash
   yarn start
   ```

### Using Docker

1. **Build the Docker image**:
   ```bash
   docker build -t farm-manager-backend .
   ```

2. **Run the Docker container**:
   ```bash
   docker run -p 3000:3000 farm-manager-backend
   ```

## API Endpoints

### Chicken

- **Create Chicken Group**
  - `POST /api/farm/chickens`
  - Request Body:
    ```json
    {
      "title": "Group 1",
      "totalCount": 100,
      "foodConsumption": {
        "sacks": 1,
        "pricePerSack": 20
      },
      "birthDate": "2024-01-01"
    }
    ```

- **Get Chicken Group by ID**
  - `GET /api/farm/chickens/:id`

- **Get Total Chickens**
  - `GET /api/farm/chickens/total`

- **Get All Chickens**
  - `GET /api/farm/chickens`

- **Calculate Egg Production for One Group**
  - `POST /api/farm/chickens/:id/egg-production`
  - Request Body:
    ```json
    {
      "timeFrame": "month",
      "value": 3
    }
    ```

- **Update Chicken Group**
  - `PUT /api/farm/chickens/:id`
  - Request Body:
    ```json
    {
      "title": "Updated Group",
      "totalCount": 150,
      "foodConsumption": {
        "sacks": 2,
        "pricePerSack": 25
      },
      "birthDate": "2024-01-01"
    }
    ```

- **Egg Production for All Chickens**
  - `POST /api/farm/chickens/egg-production`
  - Request Body:
    ```json
    {
      "timeFrame": "week",
      "value": 52
    }
    ```

### Fish

- **Create Fish Group**
  - `POST /api/farm/fishes`
  - Request Body:
    ```json
    {
      "name": "Groupe de Kanga 1",
      "totalCount": 100,
      "type": "Kanga",
      "foodConsumption": {
        "sacks": 10,
        "pricePerSack": 50
      },
      "birthDate": "2023-01-01"
    }
    ```

- **Update Fish Group**
  - `PUT /api/farm/fishes/:id`
  - Request Body:
    ```json
    {
      "name": "Groupe de Kanga 1 Modifié",
      "totalCount": 120,
      "foodConsumption": {
        "sacks": 12,
        "pricePerSack": 55
      }
    }
    ```

- **Get All Fish Groups**
  - `GET /api/farm/fishes`

- **Get Fish Group by ID**
  - `GET /api/farm/fishes/:id`

- **Estimate Price for Single Fish Group**
  - `POST /api/farm/fishes/:id/estimate-price`

- **Estimate Price for All Fish Groups**
  - `POST /api/farm/fishes/estimate-price`

- **Get Total Fish**
  - `GET /api/farm/fishes/total`

### Pig

- **Create Pig Group**
  - `POST /api/farm/pigs`
  - Request Body:
    ```json
    {
      "name": "Group 1",
      "totalCount": 10,
      "foodConsumption": {
        "sacks": 1,
        "pricePerSack": 30
      },
      "birthDate": "2024-01-01"
    }
    ```

- **Update Pig Group**
  - `PUT /api/farm/pigs/:id`
  - Request Body:
    ```json
    {
      "totalCount": 16,
      "foodConsumption": {
        "sacks": 2,
        "pricePerSack": 40
      },
      "birthDate": "2023-01-01"
    }
    ```

- **Get All Pig Groups**
  - `GET /api/farm/pigs`

- **Get Pig Group by ID**
  - `GET /api/farm/pigs/:id`

- **Get Total Pigs**
  - `GET /api/farm/pigs/total`

- **Estimate Price for Single Pig Group**
  - `POST /api/farm/pigs/:id/estimate-price`

- **Estimate Price for All Pig Groups**
  - `POST /api/farm/pigs/estimate-price`

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries or support, please open an issue on the repository or contact us at support@farmmanager.com.
