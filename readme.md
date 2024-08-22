# Multi-Vendor E-commerce Platform

The Multi-Vendor Ecommerce Platform is a scalable, microservices-based application designed to facilitate transactions between multiple vendors and customers. 
This platform offers two frontends: a Customer Panel and an Admin-Vendor Panel, both built using React.js. The backend consists of four microservices developed using Node.js and Express.js. These services communicate via RabbitMQ, and data is persisted in a Postgres database.


## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Clone the Repository](#clone-the-repository)
  - [Environment Variables](#environment-variables)
  - [RabbitMQ Installation](#rabbitmq-installation)
  - [Frontend Setup](#frontend-setup)
    - [Customer Panel](#customer-panel)
    - [Admin-Vendor Panel](#admin-vendor-panel)
    - [Troubleshooting](#troubleshooting)
  - [Microservices Setup](#microservices-setup)
    - [Admin Service](#admin-service)
    - [User Service](#user-service)
    - [Vendor-Product Service](#vendor-product-service)
    - [Order-Carts-Payment Service](#order-carts-payment-service)
    - [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)



## Features
- Multi-Vendor support with separate Admin-Vendor and Customer panels.
- Microservices architecture for scalability.
- Asynchronous inter-service communication using RabbitMQ.
- Persistent storage using Postgres.
- React.js for dynamic and responsive user interfaces.

## System Architecture

![System Architecture](https://github.com/project-aps/multivendor-ecommerce-platform/blob/main/system_architecture.png)

## Technologies Used

- **Frontend:** React.js, TailwindCSS, Redux
- **Backend:** Node.js, Express.js, PostgreSQL, RabbitMQ
- **Messaging:** RabbitMQ (for inter-service communication)
- **Database:** PostgreSQL

## Prerequisites

- Node.js (>=14.x)
- npm or Yarn
- PostgreSQL
- RabbitMQ
- Docker (optional, for running RabbitMQ using Docker)

## Installation

### Clone the Repository

```bash
git clone https://github.com/project-aps/multivendor-ecommerce-platform.git
cd multi-vendor-ecommerce-platform
```

### Environment Variables

Each microservice and frontend application requires specific environment variables. Create an .env file in each relevant directory and add the necessary environment variables.

### RabbitMQ Installation

RabbitMQ is used for messaging between microservices in this project. You can install RabbitMQ either using Docker or directly on your system.

**Using Docker**

If you prefer to use Docker, you can quickly set up RabbitMQ with the management console by running the following command:

1. **Pull and Run RabbitMQ Docker Image**

    Open a terminal and execute the following command to pull and run RabbitMQ with the management plugin:

    ```bash
    docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:management
    ```

    - `-d` runs the container in detached mode.
    - `--name rabbitmq` names the container "rabbitmq".
    - `-p 5672:5672` maps the default RabbitMQ port for messaging.
    - `-p 15672:15672` maps the port for the RabbitMQ management web interface.

2. **Access RabbitMQ Management Console**

    After running the container, you can access the RabbitMQ management console in your browser at:

    [http://localhost:15672](http://localhost:15672)

    The default username and password are both `guest`.

**Installing RabbitMQ Directly**

If you prefer to install RabbitMQ directly on your system without using Docker, follow these steps:

1. **Download RabbitMQ**

    Go to the [RabbitMQ download page](https://www.rabbitmq.com/download.html) and download the appropriate installer for your operating system.

2. **Install RabbitMQ**

    Follow the installation instructions for your operating system:

    - **Windows:** Run the installer executable and follow the setup wizard.
    - **macOS:** Use Homebrew to install RabbitMQ by running:
    
      ```bash
      brew install rabbitmq
      ```
    
    - **Linux:** Follow the installation instructions specific to your Linux distribution from the [RabbitMQ documentation](https://www.rabbitmq.com/install-debian.html) or [the official installation guide](https://www.rabbitmq.com/install-debian.html).

3. **Start RabbitMQ Service**

    After installation, start the RabbitMQ service:

    - **Windows:** RabbitMQ should start automatically as a service. You can manage it using the Windows Services manager.
    - **macOS:** Start RabbitMQ using Homebrew services:
    
      ```bash
      brew services start rabbitmq
      ```
    
    - **Linux:** Start RabbitMQ using the service manager:
    
      ```bash
      sudo systemctl start rabbitmq-server
      ```

4. **Access RabbitMQ Management Console**

    The management console should be available at:

    [http://localhost:15672](http://localhost:15672)

    The default username and password are both `guest`.


**Troubleshooting**

- **Port Conflicts:** Ensure that ports `5672` and `15672` are not being used by other services on your system.
- **Service Status:** Check the status of the RabbitMQ service if you encounter issues. Use the RabbitMQ management console or command-line tools to diagnose and resolve problems.

For further assistance, refer to the [RabbitMQ Troubleshooting Guide](https://www.rabbitmq.com/troubleshooting.html).


## Frontend Setup

This project includes two frontend applications built with React.js:

- **Customer Panel**: The interface for customers to browse products, manage their cart, and place orders.
- **Admin-Vendor Panel**: The interface for administrators and vendors to manage products, orders, and user accounts.

### Customer Panel

1. **Navigate to the Customer Panel Directory**

    Open a terminal and change to the `customer-panel` directory:

    ```bash
    cd frontend/customer-panel
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from .env file already stored in this folder.


4. **Start the Development Server**

    Use the following command to start the development server:

    ```bash
    npm start
    ```

    The Customer Panel will be accessible at [http://localhost:3001](http://localhost:3001) by default.

### Admin-Vendor Panel

1. **Navigate to the Admin-Vendor Panel Directory**

    Open a terminal and change to the `multivendor-admin-panel` directory:

    ```bash
    cd ../multivendor-admin-panel
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from .env file already stored in this folder.

4. **Start the Development Server**

    Use the following command to start the development server:

    ```bash
    npm start
    ```

    The Admin-Vendor Panel will be accessible at [http://localhost:3002](http://localhost:3002) by default.

### Troubleshooting

- **Port Conflicts**: Ensure that the ports `3001` and `3002` are available and not used by other services.
- **Network Issues**: Make sure that your backend services are running and accessible from the frontend applications. Verify the settings in the `.env` files.
- **Dependency Issues**: If you encounter errors related to package dependencies, try deleting the `node_modules` directory and reinstalling the dependencies with `npm install`.

For further assistance, consult the [React documentation](https://reactjs.org/docs/getting-started.html) or the [Create React App documentation](https://create-react-app.dev/docs/getting-started/).


## Microservices Setup

This project includes four microservices built with Node.js and Express.js. Each microservice has its own directory and requires individual setup. Below are the instructions for setting up and running each microservice.

### Admin Service

1. **Navigate to the Admin Service Directory**

    Open a terminal and change to the `admins_microservice` directory:

    ```bash
    cd backend/admins_microservice
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from `.env` file already stored in this folder. Update the values according to the setup.

4. **Start the Service**

    Use the following command to start the authentication service:

    ```bash
    node index.js
    ```
### User Service

1. **Navigate to the User Service Directory**

    Open a terminal and change to the `users_microservice` directory:

    ```bash
    cd backend/users_microservice
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from `.env` file already stored in this folder. Update the values according to the setup.

4. **Start the Service**

    Use the following command to start the authentication service:

    ```bash
    node index.js
    ```


### Vendor-Product Service

1. **Navigate to the Vendor-Product Service Directory**

    Open a terminal and change to the `vendors_products_microservice` directory:

    ```bash
    cd backend/vendors_products_microservice
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from `.env` file already stored in this folder. Update the values according to the setup.

4. **Start the Service**

    Use the following command to start the authentication service:

    ```bash
    node index.js
    ```

### Order-Carts-Payment Service

1. **Navigate to the Order-Carts-Payment Service Directory**

    Open a terminal and change to the `carts_orders_microservice` directory:

    ```bash
    cd backend/carts_orders_microservice
    ```

2. **Install Dependencies**

    Run the following command to install the required Node.js packages:

    ```bash
    npm install
    ```

3. **Set Up Environment Variables**

    Use Reference from `.env` file already stored in this folder. Update the values according to the setup.

4. **Start the Service**

    Use the following command to start the authentication service:

    ```bash
    node index.js
    ```

### Troubleshooting

- **Port Conflicts**: Ensure that the ports `3100`, `3200`, `3300`, and `3400` are available and not used by other services.
- **Network Issues**: Verify that RabbitMQ and PostgreSQL services are running and accessible. Ensure that the `RABBITMQ_URL` in the `.env` files is correctly set.
- **Dependency Issues**: If you encounter errors related to package dependencies, try deleting the `node_modules` directory and reinstalling the dependencies with `npm install`.

For further assistance, consult the [Node.js documentation](https://nodejs.org/en/docs/) or the [Express.js documentation](https://expressjs.com/en/starter/installing.html).

## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your ideas.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE)  file for details.





